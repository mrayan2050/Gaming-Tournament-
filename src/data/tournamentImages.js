// ─────────────────────────────────────────────────────────────────────────
// Banner image per tournament — the database doesn't store an image column,
// so we look it up client-side by the tournament's exact title. Update this
// whenever a new tournament is added in prisma/seed.js (or the admin panel,
// once that exists) with a title that isn't listed here yet.
// ─────────────────────────────────────────────────────────────────────────
export const tournamentImages = {
  'Solo Battle Royale': '/images/tournaments/solo_battle_royale.png',
  'Duo Clash': '/images/tournaments/duo_clash.png',
  'Squad Championship': '/images/tournaments/squad_championship.png',
  'Solo Survival Cup': '/images/tournaments/solo_survival_cup.png',
  'Squad Fire League': '/images/tournaments/squad_fire_league.png',
  'Daily Ludo Blitz': '/images/tournaments/ludo.png',
  'Ludo Mega Championship': '/images/tournaments/ludo.png',
  'Battle Royale Blitz': '/images/tournaments/battle_royale_blitz.png',
  'Bullet Chess Open': '/images/tournaments/chess.png',
  'Carrom Kings League': '/images/tournaments/carrom.png',
};

// Fallback banner for any future tournament title not yet mapped above.
export const defaultTournamentImage = '/images/tournaments/carrom.png';
