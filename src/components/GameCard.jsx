import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function GameCard({ game }) {
  return (
    <Link to={`/games/${game.id}`} className="block group">
      <div className="card h-full">
        {/* Card visual */}
        <div className="relative h-40 overflow-hidden bg-dark-900">
          {/* Game image */}
          <img
            src={game.image}
            alt={game.fullName}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Cinematic gradient overlay for text legibility + brand tint */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, ${game.color}22 0%, transparent 35%, rgba(10,10,15,0.55) 75%, rgba(10,10,15,0.92) 100%)` }}
          />

          {/* Accent glow on hover */}
          <div
            className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
            style={{ background: game.color }}
          />

          {/* Emoji badge */}
          <span className="absolute bottom-3 left-3 text-3xl drop-shadow-lg transform transition-transform duration-300 group-hover:scale-110">
            {game.emoji}
          </span>

          {/* Tournament count badge */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-white/10">
            {game.totalTournaments} live
          </div>
        </div>

        {/* Card body */}
        <div className="p-4">
          <h3 className="font-display text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
            {game.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">{game.fullName}</p>
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{game.description}</p>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-4 mb-4">
            <span className="stat-pill">🏆 {game.totalTournaments} tournaments</span>
            <span className="stat-pill">👥 {game.activePlayers}</span>
          </div>

          {/* CTA */}
          <div
            className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-2.5"
            style={{ color: game.color }}
          >
            Play Now <FiArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
