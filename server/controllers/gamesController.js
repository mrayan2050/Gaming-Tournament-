import prisma from '../config/db.js';

export const getAllGames = async (req, res) => {
  const games = await prisma.game.findMany({
    where: { isActive: true },
    include: { _count: { select: { tournaments: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(games);
};

export const getGameById = async (req, res) => {
  const game = await prisma.game.findUnique({
    where: { slug: req.params.id },
    include: {
      tournaments: {
        orderBy: { scheduledDate: 'asc' },
        select: {
          id: true, gameId: true, title: true, type: true, entryFee: true, prizePool: true,
          totalSlots: true, filledSlots: true, scheduledDate: true, rules: true,
          prizeBreakdown: true, status: true, createdAt: true, updatedAt: true,
        },
      },
    },
  });
  if (!game) return res.status(404).json({ message: 'Game not found' });
  res.json(game);
};
