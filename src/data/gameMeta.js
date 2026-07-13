// ─────────────────────────────────────────────────────────────────────────
// Cosmetic, non-relational metadata per game — things the database doesn't
// (and shouldn't) store: card artwork, gradient accent, marketing stats.
// Keyed by the Game's `slug` (e.g. "bgmi"), which the backend also uses as
// its URL-friendly identifier.
// Everything else (name, emoji, color, description, live tournament counts)
// comes straight from the API — see services/contentService.js.
// ─────────────────────────────────────────────────────────────────────────
export const gameMeta = {
  bgmi: {
    image: '/images/games/bgmi.jpg',
    bannerImage: '/images/games/bgmi-banner.jpg',
    icon: '/images/games/bgmi-icon.png',
    accentColor: '#ea580c',
    activePlayers: '12.4L',
  },
  freefire: {
    image: '/images/games/free_fire.jpg',
    bannerImage: '/images/games/freefire-banner.jpg',
    bannerPosition: 'center 25%',
    icon: '/images/games/freefire-icon.png',
    accentColor: '#dc2626',
    activePlayers: '8.7L',
  },
  ludo: {
  image: '/images/games/ludo.jpg',
  bannerImage: '/images/games/ludo-banner.jpg',
  icon: '/images/games/ludo-icon.png',
  accentColor: '#7c3aed',
  activePlayers: '20L+',
},
  cod: {
  image: '/images/games/cod.jpg',
  bannerImage: '/images/games/cod-banner.jpg',
  icon: '/images/games/cod-icon.png',
  accentColor: '#16a34a',
  activePlayers: '5.2L',
},
  chess: {
  image: '/images/games/chess.jpg',
  bannerImage: '/images/games/chess-banner.jpg',
  icon: '/images/games/chess-icon.png',
  accentColor: '#ca8a04',
  activePlayers: '3.8L',
},
  carrom: {
  image: '/images/games/carrom.jpg',
  bannerImage: '/images/games/carrom-banner.jpg',
  icon: '/images/games/carrom-icon.png',
  accentColor: '#0891b2',
  activePlayers: '6.1L',
},
};
