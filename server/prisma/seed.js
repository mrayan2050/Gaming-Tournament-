// Seed script — populates Games + Tournaments so the DB isn't empty.
// Run with: npx prisma db seed
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const games = [
  { slug: 'bgmi', name: 'BGMI', fullName: 'Battlegrounds Mobile India', emoji: '🔫', color: '#f97316', description: "India's most popular battle royale — 100 players, one winner." },
  { slug: 'freefire', name: 'Free Fire', fullName: 'Garena Free Fire', emoji: '🔥', color: '#ef4444', description: 'Fast-paced survival shooter with intense 10-minute matches.' },
  { slug: 'ludo', name: 'Ludo', fullName: 'Ludo King', emoji: '🎲', color: '#8b5cf6', description: 'Classic board game reimagined — outsmart rivals and win big.' },
  { slug: 'cod', name: 'COD Mobile', fullName: 'Call of Duty: Mobile', emoji: '💥', color: '#22c55e', description: 'Iconic FPS franchise goes mobile — squad up and dominate.' },
  { slug: 'chess', name: 'Chess', fullName: 'Online Chess', emoji: '♟️', color: '#eab308', description: 'The ultimate mind sport — outwit your opponent in 64 squares.' },
  { slug: 'carrom', name: 'Carrom', fullName: 'Online Carrom', emoji: '🎯', color: '#06b6d4', description: "India's favourite board game goes digital — pocket and win!" },
];

async function main() {
  console.log('🌱 Seeding games...');
  const created = {};
  for (const g of games) {
    const game = await prisma.game.upsert({
      where: { slug: g.slug },
      update: g,
      create: g,
    });
    created[g.slug] = game.id;
  }

  console.log('🌱 Seeding tournaments...');
  const tournaments = [
    { gameSlug: 'bgmi', title: 'Solo Battle Royale', type: 'Solo', entryFee: 50, prizePool: 500, totalSlots: 100, filledSlots: 87, scheduledDate: new Date('2025-07-15T19:30:00'), status: 'UPCOMING', rules: ['Classic mode only – Erangel map', 'Ranking by kills + survival time', 'No emulators allowed', 'Hacking/cheating = permanent ban'], prizeBreakdown: [{ rank: '🥇 1st Place', amount: 250 }, { rank: '🥈 2nd Place', amount: 150 }, { rank: '🥉 3rd Place', amount: 100 }] },
    { gameSlug: 'bgmi', title: 'Duo Clash', type: 'Duo', entryFee: 100, prizePool: 1000, totalSlots: 50, filledSlots: 32, scheduledDate: new Date('2025-07-18T21:00:00'), status: 'UPCOMING', rules: ['Duo mode – Miramas map', 'Both players must register together', 'Prize split equally between team'], prizeBreakdown: [{ rank: '🥇 1st Place', amount: 500 }, { rank: '🥈 2nd Place', amount: 300 }, { rank: '🥉 3rd Place', amount: 200 }] },
    { gameSlug: 'bgmi', title: 'Squad Championship', type: 'Squad', entryFee: 200, prizePool: 5000, totalSlots: 25, filledSlots: 25, scheduledDate: new Date('2025-07-20T20:00:00'), status: 'FULL', rules: ['Squad of 4 players required', 'All India open – any tier welcome'], prizeBreakdown: [{ rank: '🥇 1st Place', amount: 2500 }, { rank: '🥈 2nd Place', amount: 1500 }, { rank: '🥉 3rd Place', amount: 1000 }] },
    { gameSlug: 'freefire', title: 'Solo Survival Cup', type: 'Solo', entryFee: 30, prizePool: 300, totalSlots: 50, filledSlots: 21, scheduledDate: new Date('2025-07-16T18:00:00'), status: 'UPCOMING', rules: ['Battle Royale mode – Bermuda map', 'Minimum FF level 30 required'], prizeBreakdown: [{ rank: '🥇 1st Place', amount: 150 }, { rank: '🥈 2nd Place', amount: 90 }, { rank: '🥉 3rd Place', amount: 60 }] },
    { gameSlug: 'ludo', title: 'Daily Ludo Blitz', type: '1v1', entryFee: 10, prizePool: 18, totalSlots: 200, filledSlots: 156, scheduledDate: new Date('2025-07-14T10:00:00'), status: 'LIVE', rules: ['1v1 format – Classic Ludo rules', 'Timed match: 15 minutes max'], prizeBreakdown: [{ rank: '🥇 Winner', amount: 18 }] },
    { gameSlug: 'freefire', title: 'Squad Fire League', type: 'Squad', entryFee: 150, prizePool: 2000, totalSlots: 30, filledSlots: 14, scheduledDate: new Date('2025-07-22T20:30:00'), status: 'UPCOMING', rules: ['Squad of 4 required', 'Clash Squad final round', 'Points: 5 per kill + placement bonus'], prizeBreakdown: [{ rank: '🥇 1st Place', amount: 1000 }, { rank: '🥈 2nd Place', amount: 600 }, { rank: '🥉 3rd Place', amount: 400 }] },
    { gameSlug: 'ludo', title: 'Ludo Mega Championship', type: '4 Players', entryFee: 50, prizePool: 800, totalSlots: 100, filledSlots: 72, scheduledDate: new Date('2025-07-19T19:00:00'), status: 'UPCOMING', rules: ['Classic 4-player Ludo', 'Knockout format with group stages', 'Mobile app required (Ludo King)'], prizeBreakdown: [{ rank: '🥇 1st Place', amount: 400 }, { rank: '🥈 2nd Place', amount: 250 }, { rank: '🥉 3rd Place', amount: 150 }] },
    { gameSlug: 'cod', title: 'Battle Royale Blitz', type: 'Solo', entryFee: 75, prizePool: 750, totalSlots: 60, filledSlots: 38, scheduledDate: new Date('2025-07-17T21:30:00'), status: 'UPCOMING', rules: ['Battle Royale – Isolated map', 'Solo ranked mode', 'Minimum level 50 required'], prizeBreakdown: [{ rank: '🥇 1st Place', amount: 375 }, { rank: '🥈 2nd Place', amount: 225 }, { rank: '🥉 3rd Place', amount: 150 }] },
    { gameSlug: 'chess', title: 'Bullet Chess Open', type: '1v1', entryFee: 25, prizePool: 500, totalSlots: 128, filledSlots: 96, scheduledDate: new Date('2025-07-15T17:00:00'), status: 'UPCOMING', rules: ['1+0 bullet time control', 'Swiss format – 7 rounds', 'Online via Chess.com or Lichess'], prizeBreakdown: [{ rank: '🥇 1st Place', amount: 250 }, { rank: '🥈 2nd Place', amount: 150 }, { rank: '🥉 3rd Place', amount: 100 }] },
    { gameSlug: 'carrom', title: 'Carrom Kings League', type: '1v1', entryFee: 20, prizePool: 360, totalSlots: 100, filledSlots: 43, scheduledDate: new Date('2025-07-21T18:30:00'), status: 'UPCOMING', rules: ['1v1 classical carrom rules', 'First to 25 points wins', 'Queen must be covered'], prizeBreakdown: [{ rank: '🥇 1st Place', amount: 200 }, { rank: '🥈 2nd Place', amount: 110 }, { rank: '🥉 3rd Place', amount: 50 }] },
  ];

  for (const t of tournaments) {
    const { gameSlug, ...data } = t;
    await prisma.tournament.create({
      data: { ...data, gameId: created[gameSlug] },
    });
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
