import prisma from '../config/db.js';

// ─── DASHBOARD ──────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  const [userCount, tournamentCount, liveCount, pendingWithdrawals, deposits] = await Promise.all([
    prisma.user.count(),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: 'LIVE' } }),
    prisma.withdrawRequest.count({ where: { status: 'PENDING' } }),
    prisma.transaction.aggregate({ where: { type: 'DEPOSIT' }, _sum: { amount: true } }),
  ]);

  res.json({
    userCount,
    tournamentCount,
    liveCount,
    pendingWithdrawals,
    totalDeposits: deposits._sum.amount || 0,
  });
};

// ─── TOURNAMENTS (admin view/CRUD) ──────────────────────────────────────
export const adminListTournaments = async (req, res) => {
  const tournaments = await prisma.tournament.findMany({
    include: { game: true, _count: { select: { registrations: true } } },
    orderBy: { scheduledDate: 'desc' },
  });
  res.json(tournaments);
};

export const createTournament = async (req, res) => {
  try {
    const { gameId, title, type, entryFee, prizePool, totalSlots, scheduledDate, rules, prizeBreakdown, status } = req.body;
    if (!gameId || !title || !type || entryFee == null || prizePool == null || !totalSlots || !scheduledDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const tournament = await prisma.tournament.create({
      data: {
        gameId,
        title,
        type,
        entryFee: Number(entryFee),
        prizePool: Number(prizePool),
        totalSlots: Number(totalSlots),
        scheduledDate: new Date(scheduledDate),
        rules: rules || [],
        prizeBreakdown: prizeBreakdown || undefined,
        status: status || 'UPCOMING',
      },
      include: { game: true },
    });
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create tournament' });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const { title, type, entryFee, prizePool, totalSlots, filledSlots, scheduledDate, rules, prizeBreakdown, status, gameId, roomId, roomPassword, roomReleased } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (type !== undefined) data.type = type;
    if (entryFee !== undefined) data.entryFee = Number(entryFee);
    if (prizePool !== undefined) data.prizePool = Number(prizePool);
    if (totalSlots !== undefined) data.totalSlots = Number(totalSlots);
    if (filledSlots !== undefined) data.filledSlots = Number(filledSlots);
    if (scheduledDate !== undefined) data.scheduledDate = new Date(scheduledDate);
    if (rules !== undefined) data.rules = rules;
    if (prizeBreakdown !== undefined) data.prizeBreakdown = prizeBreakdown;
    if (status !== undefined) data.status = status;
    if (gameId !== undefined) data.gameId = gameId;
    if (roomId !== undefined) data.roomId = roomId;
    if (roomPassword !== undefined) data.roomPassword = roomPassword;
    if (roomReleased !== undefined) data.roomReleased = Boolean(roomReleased);

    const tournament = await prisma.tournament.update({
      where: { id: req.params.id },
      data,
      include: { game: true },
    });
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update tournament' });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    await prisma.tournament.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete tournament (it may have registrations)' });
  }
};

// ─── RESULTS ENTRY ───────────────────────────────────────────────────────
// GET registrations for a tournament, so the admin can assign ranks/prizes.
export const getTournamentRegistrations = async (req, res) => {
  const registrations = await prisma.registration.findMany({
    where: { tournamentId: req.params.id },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { registeredAt: 'asc' },
  });
  res.json(registrations);
};

// POST /api/admin/tournaments/:id/results
// Body: { results: [{ registrationId, rank, prizeWon }] }
// Credits each winner's winningsBalance and marks the tournament COMPLETED.
export const submitResults = async (req, res) => {
  const tournamentId = req.params.id;
  const { results } = req.body;
  if (!Array.isArray(results)) return res.status(400).json({ message: 'results must be an array' });

  try {
    await prisma.$transaction(async (tx) => {
      for (const r of results) {
        const registration = await tx.registration.findUnique({ where: { id: r.registrationId } });
        if (!registration || registration.tournamentId !== tournamentId) continue;

        await tx.registration.update({
          where: { id: r.registrationId },
          data: { rank: r.rank ?? null, prizeWon: r.prizeWon ?? 0 },
        });

        if (r.prizeWon && r.prizeWon > 0) {
          const wallet = await tx.wallet.findUnique({ where: { userId: registration.userId } });
          if (wallet) {
            await tx.wallet.update({
              where: { userId: registration.userId },
              data: {
                winningsBalance: { increment: r.prizeWon },
                transactions: {
                  create: { type: 'PRIZE_CREDIT', amount: r.prizeWon, refId: tournamentId, note: `Prize — rank ${r.rank ?? '-'}` },
                },
              },
            });
          }
        }
      }

      await tx.tournament.update({ where: { id: tournamentId }, data: { status: 'COMPLETED' } });
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to submit results' });
  }
};

// ─── WITHDRAWALS ─────────────────────────────────────────────────────────
export const listWithdrawals = async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status.toUpperCase();
  const withdrawals = await prisma.withdrawRequest.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { requestedAt: 'desc' },
  });
  res.json(withdrawals);
};

// POST /api/admin/withdrawals/:id/process   Body: { action: 'approve' | 'reject', remarks? }
export const processWithdrawal = async (req, res) => {
  const { action, remarks } = req.body;
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'action must be approve or reject' });
  }

  try {
    const withdrawal = await prisma.withdrawRequest.findUnique({ where: { id: req.params.id } });
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
    if (withdrawal.status !== 'PENDING') return res.status(400).json({ message: 'Already processed' });

    if (action === 'reject') {
      // Refund the winnings balance that was held when the request was made.
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: withdrawal.userId },
          data: {
            winningsBalance: { increment: withdrawal.amount },
            transactions: { create: { type: 'REFUND', amount: withdrawal.amount, refId: withdrawal.id, note: 'Withdrawal rejected — refunded' } },
          },
        }),
        prisma.withdrawRequest.update({
          where: { id: req.params.id },
          data: { status: 'REJECTED', processedAt: new Date(), remarks: remarks || null },
        }),
        // Relabel the original "Withdrawal requested" log entry so the
        // wallet history reflects the real outcome instead of staying stuck
        // on its initial pending-sounding text.
        prisma.transaction.updateMany({
          where: { refId: withdrawal.id, type: 'WITHDRAWAL' },
          data: { note: 'Withdrawal rejected' },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.withdrawRequest.update({
          where: { id: req.params.id },
          data: { status: 'COMPLETED', processedAt: new Date(), remarks: remarks || null },
        }),
        prisma.transaction.updateMany({
          where: { refId: withdrawal.id, type: 'WITHDRAWAL' },
          data: { note: 'Withdrawal completed' },
        }),
      ]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to process withdrawal' });
  }
};
