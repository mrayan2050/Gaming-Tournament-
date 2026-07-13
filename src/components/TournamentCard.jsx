import { Link } from 'react-router-dom';
import { FiClock, FiUsers, FiZap } from 'react-icons/fi';
import { useGames } from '../context/GamesContext';

export default function TournamentCard({ tournament }) {
  const { getGameBySlug } = useGames();
  const game = getGameBySlug(tournament.gameId);
  const fillPercent = Math.round((tournament.filledSlots / tournament.slots) * 100);
  const isAlmostFull = fillPercent >= 80;

  const statusConfig = {
    live: { label: 'LIVE', class: 'bg-red-500/20 text-red-400 border-red-500/40' },
    upcoming: { label: 'Upcoming', class: 'bg-green-500/20 text-green-400 border-green-500/40' },
    full: { label: 'Full', class: 'bg-gray-500/20 text-gray-400 border-gray-500/40' },
    completed: { label: 'Completed', class: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    cancelled: { label: 'Cancelled', class: 'bg-gray-500/20 text-gray-500 border-gray-500/40' },
  };
  const status = statusConfig[tournament.status] || statusConfig.upcoming;

  return (
    <Link to={`/tournament/${tournament.id}`} className="block group">
      <div className="card h-full overflow-hidden">
        {/* Image banner */}
        <div className="relative h-28 overflow-hidden bg-dark-900">
          <img
            src={tournament.image}
            alt={tournament.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, ${game?.color}22 0%, transparent 40%, rgba(10,10,15,0.85) 100%)` }}
          />
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.class} ${tournament.status === 'live' ? 'live-badge' : ''}`}>
            {tournament.status === 'live' && <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full mr-1 animate-pulse" />}
            {status.label}
          </span>
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{game?.emoji}</span>
              <div>
                <p className="text-xs text-gray-500">{game?.name}</p>
                <h3 className="font-display font-bold text-white text-lg leading-tight group-hover:text-orange-400 transition-colors">
                  {tournament.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-dark-700 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Entry</p>
              <p className="font-display font-bold text-orange-400 text-lg">₹{tournament.entryFee}</p>
            </div>
            <div className="bg-dark-700 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Prize</p>
              <p className="font-display font-bold text-yellow-400 text-lg">₹{tournament.prize}</p>
            </div>
            <div className="bg-dark-700 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <p className="font-display font-bold text-white text-sm mt-0.5">{tournament.type}</p>
            </div>
          </div>

          {/* Slots progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1 text-gray-400">
                <FiUsers className="w-3 h-3" /> Slots
              </span>
              <span className={isAlmostFull ? 'text-red-400 font-semibold' : 'text-gray-400'}>
                {tournament.filledSlots}/{tournament.slots} {isAlmostFull && '🔥 Almost full!'}
              </span>
            </div>
            <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isAlmostFull ? 'bg-red-500' : 'bg-orange-500'}`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <FiClock className="w-3 h-3" />
            <span>{tournament.date} · {tournament.time}</span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-4">
          <div
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all duration-200"
            style={{
              background: tournament.status === 'full' ? 'rgba(255,255,255,0.05)' : `${game?.color}22`,
              color: tournament.status === 'full' ? '#6b7280' : game?.color,
              border: `1px solid ${tournament.status === 'full' ? 'rgba(255,255,255,0.05)' : `${game?.color}44`}`,
            }}
          >
            {tournament.status === 'full' ? 'Tournament Full'
              : tournament.status === 'completed' ? 'View Results →'
              : tournament.status === 'cancelled' ? 'Tournament Cancelled'
              : 'View & Join →'}
          </div>
        </div>
      </div>
    </Link>
  );
}
