import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import TournamentCard from '../components/TournamentCard';
import { fetchGameBySlug } from '../services/contentService';

export default function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetchGameBySlug(gameId)
      .then(setGame)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="spinner" />
      </div>
    );
  }

  if (notFound || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-6xl mb-4">🎮</p>
          <h2 className="text-2xl font-bold text-white mb-2">Game not found</h2>
          <p className="text-gray-400 mb-6">That game doesn't exist on our platform.</p>
          <Link to="/games" className="btn-primary">Browse All Games</Link>
        </div>
      </div>
    );
  }

  const gameTournaments = game.tournaments;

  const live = gameTournaments.filter(t => t.status === 'live');
  const upcoming = gameTournaments.filter(t => t.status === 'upcoming');
  const full = gameTournaments.filter(t => t.status === 'full');

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div
        className="relative py-20 overflow-hidden"
        style={!game.bannerImage ? { background: `linear-gradient(135deg, ${game.color}18 0%, #0a0a0f 60%)` } : undefined}
      >
        {game.bannerImage && (
          <>
            <img
              src={game.bannerImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: game.bannerPosition || 'center' }}
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, #0a0a0fee 0%, #0a0a0fcc 40%, ${game.color}22 100%)` }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-32"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, #0a0a0f 100%)' }}
            />
          </>
        )}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: game.color }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
          >
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-5 mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-2xl overflow-hidden"
              style={{ background: `${game.color}22`, border: `1px solid ${game.color}44` }}
            >
              {game.icon ? (
                <img src={game.icon} alt={game.name} className="w-full h-full object-cover" />
              ) : (
                game.emoji
              )}
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{game.fullName}</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white">{game.name}</h1>
            </div>
          </div>

          <p className="text-gray-300 text-lg max-w-xl mb-8">{game.description}</p>

          <div className="flex flex-wrap gap-5">
            {[
              { label: 'Total Tournaments', value: game.totalTournaments },
              { label: 'Active Players', value: game.activePlayers },
              { label: 'Live Now', value: live.length },
              { label: 'Upcoming', value: upcoming.length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl px-5 py-3">
                <div className="font-display text-2xl font-bold" style={{ color: game.color }}>{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tournaments */}
      <div className="relative overflow-hidden">
        <img
          src="/images/banners/lava-texture.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
        />
        <div className="absolute inset-0 bg-dark-900/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Live */}
        {live.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="font-display text-2xl font-bold text-white">Live Now</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {live.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold text-white mb-6">Upcoming Tournaments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </div>
        )}

        {/* Full */}
        {full.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold text-gray-600 mb-6">Full – Registration Closed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
              {full.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </div>
        )}

        {gameTournaments.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">{game.emoji}</p>
            <p className="text-lg font-medium text-gray-400">No tournaments scheduled yet</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
