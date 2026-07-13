import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import TournamentCard from '../components/TournamentCard';
import GameCard from '../components/GameCard';
import { useGames } from '../context/GamesContext';
import { fetchTournaments } from '../services/contentService';

export default function GamesPage() {
  const [search, setSearch] = useState('');
  const [activeGame, setActiveGame] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const { games } = useGames();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments()
      .then(setTournaments)
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tournaments.filter(t => {
    const matchGame = activeGame === 'all' || t.gameId === activeGame;
    const matchStatus = activeStatus === 'all' || t.status === activeStatus;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchGame && matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative border-b border-white/5 py-16 sm:py-20 overflow-hidden">
        <img
          src="/images/banners/tournament_section_banner.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-right"
        />
        {/* Solid on the left (fully hides the image's own baked-in text),
            fading out toward the right so the soldier artwork stays visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 from-30% via-dark-900/55 via-55% to-dark-900/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <p className="section-label">All Available</p>
          <h1 className="section-title mb-1">
            Tournaments <span className="text-gradient">& Games</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {loading ? 'Loading…' : `${tournaments.length} tournaments across ${games.length} games`}
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Subtle tiled texture behind filters + results only */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/banners/hex-pattern.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '1650px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tournaments…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-dark-700 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            {['all', 'live', 'upcoming', 'full'].map(s => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  activeStatus === s
                    ? 'bg-orange-500 text-white'
                    : 'bg-dark-700 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {s === 'all' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Game filter pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setActiveGame('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeGame === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            All Games
          </button>
          {games.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGame(g.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeGame === g.id
                  ? 'text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white border border-white/10'
              }`}
              style={activeGame === g.id ? { background: g.color } : {}}
            >
              {g.emoji} {g.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-dark-700 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🎮</p>
            <p className="text-lg font-medium text-gray-400">No tournaments found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-5">{filtered.length} tournament{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(t => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </>
        )}
        </div>
      </div>

      <div className="relative border-t border-white/5">
        {/* Subtle tiled texture behind Browse by Game section */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/banners/hex-pattern.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '1650px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Browse by game section */}
          <div className="mt-4">
            <p className="section-label">Browse by Game</p>
            <h2 className="section-title mb-8">Pick Your <span className="text-gradient">Game</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {games.map(g => (
                <GameCard key={g.id} game={g} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
