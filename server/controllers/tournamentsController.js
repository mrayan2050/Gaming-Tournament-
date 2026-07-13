import prisma from '../config/db.js';

// Fields safe to expose to ANY visitor — deliberately excludes roomId/roomPassword.
// Room access details are only ever returned by getRoomDetails() below, which
// checks the requester actually has a Registration for the tournament first.
const PUBLIC_TOURNAMENT_SELECT = {
  id: true, gameId: true, title: true, type: true, entryFee: true, prizePool: true,
  totalSlots: true, filledSlots: true, scheduledDate: true, rules: true,
  prizeBreakdown: true, status: true, createdAt: true, updatedAt: true,
  game: true,
};

export const getAllTournaments = async (req, res) => {
  const where = {};
  if (req.query.gameId) where.game = { slug: req.query.gameId };
  if (req.query.status) where.status = req.query.status.toUpperCase();

  const tournaments = await prisma.tournament.findMany({
    where,
    select: PUBLIC_TOURNAMENT_SELECT,
    orderBy: { scheduledDate: 'asc' },
  });
  res.json(tournaments);
};

export const getTournamentById = async (req, res) => {
  const t = await prisma.tournament.findUnique({
    where: { id: req.params.id },
    select: PUBLIC_TOURNAMENT_SELECT,
  });
  if (!t) return res.status(404).json({ message: 'Tournament not found' });
  res.json(t);
};

// GET /api/tournaments/:id/room — requires auth (protect middleware)
// The actual access-control check: only returns the Room ID/Password if
// the logged-in user has a real Registration row for this tournament AND
// an admin has flipped roomReleased on. This is checked server-side —
// there is no way to get this data without both conditions being true,
// regardless of what the frontend does or doesn't show.
export const getRoomDetails = async (req, res) => {
  const tournamentId = req.params.id;
  const userId = req.user.userId;

  const registration = await prisma.registration.findUnique({
    where: { userId_tournamentId: { userId, tournamentId } },
  });
  if (!registration) {
    return res.status(403).json({ message: 'You have not joined this tournament' });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { roomId: true, roomPassword: true, roomReleased: true, scheduledDate: true },
  });
  if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

  if (!tournament.roomReleased) {
    return res.json({ released: false, scheduledDate: tournament.scheduledDate });
  }

  res.json({ released: true, roomId: tournament.roomId, roomPassword: tournament.roomPassword });
};

// POST /api/tournaments/:id/join — requires auth (protect middleware)
// Deducts entry fee from deposit balance and creates a Registration row.
export const joinTournament = async (req, res) => {
  const tournamentId = req.params.id;
  const userId = req.user.userId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
      if (!tournament) throw { status: 404, message: 'Tournament not found' };
      if (tournament.filledSlots >= tournament.totalSlots) throw { status: 400, message: 'Tournament is full' };

      const existing = await tx.registration.findUnique({
        where: { userId_tournamentId: { userId, tournamentId } },
      });
      if (existing) throw { status: 400, message: 'Already joined this tournament' };

      const wallet = await tx.wallet.findUnique({ where: { userId } });
      const totalAvailable = (wallet?.depositBalance ?? 0) + (wallet?.winningsBalance ?? 0);
      if (!wallet || totalAvailable < tournament.entryFee)
        throw { status: 400, message: 'Insufficient balance' };

      // Pay from Deposit Balance first, then dip into Winnings Balance for
      // any remainder — so players can enter tournaments using their total
      // balance, not just what they've deposited.
      const fromDeposit = Math.min(wallet.depositBalance, tournament.entryFee);
      const fromWinnings = tournament.entryFee - fromDeposit;

      await tx.wallet.update({
        where: { userId },
        data: {
          depositBalance: { decrement: fromDeposit },
          winningsBalance: { decrement: fromWinnings },
          transactions: {
            create: { type: 'ENTRY_FEE', amount: tournament.entryFee, refId: tournamentId, note: `Joined ${tournament.title}` },
          },
        },
      });

      await tx.tournament.update({
        where: { id: tournamentId },
        data: { filledSlots: { increment: 1 } },
      });

      return tx.registration.create({
        data: { userId, tournamentId, entryFeePaid: tournament.entryFee },
      });
    });

    res.json({ success: true, registration: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Failed to join tournament' });
  }
};
