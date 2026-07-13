import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTrendingUp, FiAward, FiShield } from 'react-icons/fi';
import { BsLightningChargeFill } from 'react-icons/bs';
import GameCard from '../components/GameCard';
import TournamentCard from '../components/TournamentCard';
import { whyChooseUs } from '../data/tournaments';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../context/GamesContext';
import { fetchTournaments } from '../services/contentService';

// Fixed configs (not randomized per render) so particle positions stay stable
// across re-renders — only their animation timing creates movement.
const HERO_PARTICLES = [
  { left: '4%',  size: 4, duration: 9,  delay: 0,   opacity: 0.6, drift: '10px' },
  { left: '11%', size: 3, duration: 12, delay: 1.5, opacity: 0.5, drift: '-15px' },
  { left: '18%', size: 5, duration: 10, delay: 3,   opacity: 0.7, drift: '20px' },
  { left: '27%', size: 3, duration: 14, delay: 0.5, opacity: 0.4, drift: '-10px' },
  { left: '35%', size: 4, duration: 11, delay: 2.2, opacity: 0.6, drift: '15px' },
  { left: '44%', size: 3, duration: 13, delay: 4,   opacity: 0.5, drift: '-20px' },
  { left: '53%', size: 5, duration: 9,  delay: 1,   opacity: 0.7, drift: '10px' },
  { left: '61%', size: 4, duration: 12, delay: 3.5, opacity: 0.5, drift: '-15px' },
  { left: '69%', size: 3, duration: 10, delay: 0.8, opacity: 0.6, drift: '20px' },
  { left: '77%', size: 4, duration: 14, delay: 2.8, opacity: 0.4, drift: '-10px' },
  { left: '85%', size: 5, duration: 11, delay: 1.8, opacity: 0.7, drift: '15px' },
  { left: '92%', size: 3, duration: 9,  delay: 3.2, opacity: 0.5, drift: '-20px' },
  { left: '23%', size: 3, duration: 15, delay: 5,   opacity: 0.4, drift: '10px' },
  { left: '58%', size: 4, duration: 13, delay: 4.5, opacity: 0.6, drift: '-15px' },
];

export default function HomePage() {
  const { user } = useAuth();
  const { games, loading: gamesLoading } = useGames();
  const [tournaments, setTournaments] = useState([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);

  useEffect(() => {
    fetchTournaments()
      .then(setTournaments)
      .catch(() => setTournaments([]))
      .finally(() => setTournamentsLoading(false));
  }, []);

  const upcomingTournaments = tournaments.filter(t => t.status !== 'full').slice(0, 4);
  const liveTournament = tournaments.find(t => t.status === 'live');

  return (
    <div className="animate-fade-in">
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden">
        {/* Slowly zooming background layer (blobs + glow) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hero-zoom">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
          {/* Soft blue/purple glow specifically behind the heading */}
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-500/10 via-purple-500/15 to-blue-500/10 rounded-full blur-3xl" />
        </div>

        {/* Floating ember particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {HERO_PARTICLES.map((p, i) => (
            <span
              key={i}
              className="hero-particle"
              style={{
                left: p.left,
                bottom: '-10px',
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--particle-opacity': p.opacity,
                '--particle-drift': p.drift,
              }}
            />
          ))}
        </div>

        {/* Diagonal orange light streaks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-streak w-1/3 h-full top-0" style={{ animationDuration: '9s', animationDelay: '0s' }} />
          <div className="hero-streak w-1/4 h-full top-0" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        </div>

        {/* Dark overlay so text stays crisp over all the effects above */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-36 text-center">
          {/* Live badge */}
          {liveTournament && (
            <Link
              to={`/tournament/${liveTournament.id}`}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-sm text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <BsLightningChargeFill className="w-3 h-3" />
              Live Now: {liveTournament.title} · Prize ₹{liveTournament.prize}
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            India's Biggest
            <br />
            <span className="text-gradient">Gaming Arena</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Compete in daily tournaments for BGMI, Free Fire, Ludo & more.
            <br className="hidden sm:block" />
            Win real cash — credited directly to your wallet.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/games" className="btn-primary text-base px-8 py-3.5 pulse-glow">
              <BsLightningChargeFill /> Play Now
            </Link>
            {user ? (
              <Link to="/profile" className="btn-outline text-base px-8 py-3.5">
                My Profile
              </Link>
            ) : (
              <Link to="/login" className="btn-outline text-base px-8 py-3.5">
                Create Free Account
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-10 border-t border-white/5">
            {[
              { value: '₹1 Cr+', label: 'Paid Out' },
              { value: '2L+', label: 'Players' },
              { value: '500+', label: 'Daily Tournaments' },
              { value: '6', label: 'Games' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-3xl font-bold text-gradient">{value}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR GAMES ──────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/banners/games-section-hex.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '560px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label">Choose your game</p>
            <h2 className="section-title">Popular <span className="text-gradient">Games</span></h2>
          </div>
          <Link to="/games" className="hidden sm:flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium">
            View all <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {gamesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-dark-700 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
        </div>
      </section>

      {/* ── UPCOMING TOURNAMENTS ───────────────────────────────── */}
      <section className="relative py-20 bg-dark-800/50 overflow-hidden">
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/banners/games-section-hex.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '560px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label">Don't miss out</p>
              <h2 className="section-title">Upcoming <span className="text-gradient">Tournaments</span></h2>
            </div>
            <Link to="/games" className="hidden sm:flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium">
              See all <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {tournamentsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-dark-700 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {upcomingTournaments.map(t => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US ──────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-label">Built for players</p>
          <h2 className="section-title">Why <span className="text-gradient">BattleArena?</span></h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyChooseUs.map((item) => (
            <div key={item.title} className="bg-dark-800 border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-colors">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA BANNER ───────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-orange-900/20 via-dark-800 to-purple-900/20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
            Ready to <span className="text-gradient">Win?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join 2 lakh+ players and start winning cash prizes today. Free to sign up.
          </p>
          <Link to={user ? '/games' : '/login'} className="btn-primary text-base px-10 py-4">
            {user ? 'Start Playing' : 'Start Playing Free'} <FiArrowRight />
          </Link>
          <p className="text-xs text-gray-600 mt-4">18+ only · Must be resident of India · Play responsibly</p>
        </div>
      </section>
    </div>
  );
}
