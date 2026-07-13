// ─────────────────────────────────────────────────────────────────────────
// Talks to the real backend (Express + Prisma) for games & tournaments,
// and normalizes each response into the shape the existing UI components
// were already built against (so GameCard / TournamentCard / pages don't
// need to change their JSX, just where the data comes from).
// ─────────────────────────────────────────────────────────────────────────
import api from './api';
import { gameMeta } from '../data/gameMeta';
import { tournamentImages, defaultTournamentImage } from '../data/tournamentImages';

function normalizeGame(g) {
  const meta = gameMeta[g.slug] || {};
  return {
    id: g.slug,               // components use the slug as the id (used in URLs)
    dbId: g.id,                // real DB uuid, kept in case it's ever needed
    name: g.name,
    fullName: g.fullName,
    emoji: g.emoji,
    color: g.color,
    description: g.description,
    image: meta.image,
    bannerImage: meta.bannerImage,
    bannerPosition: meta.bannerPosition,
    icon: meta.icon,
    accentColor: meta.accentColor,
    activePlayers: meta.activePlayers,
    totalTournaments: g._count?.tournaments ?? g.tournaments?.length ?? 0,
  };
}

function normalizeTournament(t) {
  const date = new Date(t.scheduledDate);
  return {
    id: t.id,                                   // real DB uuid
    gameId: t.game?.slug,
    title: t.title,
    type: t.type,
    entryFee: t.entryFee,
    prize: t.prizePool,
    slots: t.totalSlots,
    filledSlots: t.filledSlots,
    date: date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
    status: t.status.toLowerCase(),              // UPCOMING -> upcoming, etc.
    rules: t.rules,
    prizeBreakdown: t.prizeBreakdown,
    image: tournamentImages[t.title] || defaultTournamentImage,
  };
}

export async function fetchGames() {
  const { data } = await api.get('/games');
  return data.map(normalizeGame);
}

export async function fetchGameBySlug(slug) {
  const { data } = await api.get(`/games/${slug}`);
  return {
    ...normalizeGame(data),
    tournaments: (data.tournaments || []).map(normalizeTournament),
  };
}

export async function fetchTournaments(filters = {}) {
  const { data } = await api.get('/tournaments', { params: filters });
  return data.map(normalizeTournament);
}

export async function fetchTournamentById(id) {
  const { data } = await api.get(`/tournaments/${id}`);
  return normalizeTournament(data);
}

// Only succeeds if the logged-in user actually joined this tournament —
// enforced server-side, not just hidden in the UI.
export async function fetchRoomDetails(id) {
  const { data } = await api.get(`/tournaments/${id}/room`);
  return data; // { released: false, scheduledDate } | { released: true, roomId, roomPassword }
}

// Joins a tournament for the logged-in user — deducts entry fee & creates
// a registration row on the backend. Requires the auth JWT (attached
// automatically by the api interceptor).
export async function joinTournament(id) {
  const { data } = await api.post(`/tournaments/${id}/join`);
  return data;
}
