import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiUsers, FiAward, FiShield, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { BsLightningChargeFill } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../context/GamesContext';
import { fetchTournamentById, fetchRoomDetails, joinTournament as joinTournamentApi } from '../services/contentService';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, wallet, refreshWallet } = useAuth();
  const { getGameBySlug } = useGames();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [room, setRoom] = useState(null); // null = not checked/not joined; { released, roomId?, roomPassword?, scheduledDate? }

  // A successful /room response IS proof of registration (it 403s otherwise),
  // so this single call both detects "am I already joined" (fixes that state
  // not persisting across visits) and fetches the match room info.
  const checkJoinedAndRoom = async (tournamentId) => {
    try {
      const data = await fetchRoomDetails(tournamentId);
      setJoined(true);
      setRoom(data);
    } catch {
      setJoined(false);
      setRoom(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setJoined(false);
    setRoom(null);
    fetchTournamentById(id)
      .then((t) => {
        setTournament(t);
        if (user) checkJoinedAndRoom(t.id);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, user]);

  const game = tournament ? getGameBySlug(tournament.gameId) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="spinner" />
      </div>
    );
  }

  if (notFound || !tournament || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-6xl mb-4">🏆</p>
          <h2 className="text-2xl font-bold text-white mb-2">Tournament not found</h2>
          <Link to="/games" className="btn-primary mt-4">Browse Tournaments</Link>
        </div>
      </div>
    );
  }

  const fillPercent = Math.round((tournament.filledSlots / tournament.slots) * 100);
  const slotsLeft = tournament.slots - tournament.filledSlots;

  const NOT_JOINABLE = new Set(['full', 'completed', 'cancelled']);

  const totalBalance = wallet.balance + wallet.winnings;

  const handleJoin = async () => {
    if (!user) {
      toast.error('Please login to join tournaments');
      navigate('/login', { state: { from: `/tournament/${id}` } });
      return;
    }
    if (NOT_JOINABLE.has(tournament.status)) {
      toast.error(
        tournament.status === 'full' ? 'This tournament is full'
        : tournament.status === 'completed' ? 'This tournament has already ended'
        : 'This tournament was cancelled'
      );
      return;
    }
    if (totalBalance < tournament.entryFee) {
      toast.error(`Insufficient balance. Add ₹${tournament.entryFee - totalBalance} more.`);
      navigate('/wallet');
      return;
    }

    setJoining(true);
    try {
      await joinTournamentApi(tournament.id);
      // Entry fee may have been split across Deposit + Winnings server-side,
      // so pull the real numbers back rather than guessing which bucket
      // was debited.
      await refreshWallet();
      setTournament(prev => ({ ...prev, filledSlots: prev.filledSlots + 1 }));
      setJoined(true);
      checkJoinedAndRoom(tournament.id);
      toast.success(`You've joined ${tournament.title}! Good luck! 🎮`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join tournament');
    } finally {
      setJoining(false);
    }
  };

  const statusConfig = {
    live:      { label: 'LIVE NOW',  class: 'bg-red-500/20 text-red-400 border-red-500/40' },
    upcoming:  { label: 'Upcoming',  class: 'bg-green-500/20 text-green-400 border-green-500/40' },
    full:      { label: 'Full',      class: 'bg-gray-500/20 text-gray-400 border-gray-500/40' },
    completed: { label: 'Completed', class: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    cancelled: { label: 'Cancelled', class: 'bg-gray-500/20 text-gray-500 border-gray-500/40' },
  };
  const status = statusConfig[tournament.status] || statusConfig.upcoming;

  return (
    <div className="min-h-screen pb-20">
      {/* Top banner */}
      <div className="relative py-16 overflow-hidden">
        {tournament.image && (
          <img
            src={tournament.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, #0a0a0fee 0%, #0a0a0fcc 55%, ${game.color}20 100%)` }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: game.color }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to {game.name}
          </button>

          <div className="flex flex-wrap items-start gap-4 mb-4">
            <span className="text-4xl">{game.emoji}</span>
            <div className="flex-1">
              <p className="text-gray-400 text-sm mb-1">{game.name} · {tournament.type}</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                {tournament.title}
              </h1>
            </div>
            <span className={`self-start text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${status.class}`}>
              {tournament.status === 'live' && <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5 animate-pulse" />}
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── LEFT: details ── */}
        <div className="md:col-span-2 space-y-6">
          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '💰', label: 'Entry Fee', value: `₹${tournament.entryFee}`, color: 'text-orange-400' },
              { icon: '🏆', label: 'Prize Pool', value: `₹${tournament.prize}`, color: 'text-yellow-400' },
              { icon: '📅', label: 'Date', value: tournament.date, color: 'text-blue-400' },
              { icon: '⏰', label: 'Time', value: tournament.time, color: 'text-purple-400' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="bg-dark-800 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-2xl block mb-2">{icon}</span>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`font-display font-bold text-lg ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Slots progress */}
          <div className="bg-dark-800 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FiUsers className="text-orange-400" /> Slot Status
              </h3>
              <span className={`text-sm font-bold ${slotsLeft <= 10 ? 'text-red-400' : 'text-gray-400'}`}>
                {slotsLeft} slots left
              </span>
            </div>
            <div className="h-3 bg-dark-600 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${fillPercent}%`,
                  background: fillPercent >= 80 ? '#ef4444' : game.color,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{tournament.filledSlots} joined</span>
              <span>{tournament.slots} total</span>
            </div>
          </div>

          {/* Match Room — only visible once joined; content gated server-side too */}
          {joined && (
            <div className="bg-dark-800 border border-orange-500/20 rounded-2xl p-5">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                🔑 Match Room
              </h3>
              {!room || !room.released ? (
                <p className="text-sm text-gray-400">
                  Room ID & Password will be shared here shortly before the match starts
                  ({tournament.date} · {tournament.time}). Check back closer to the start time.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {[
                    { label: 'Room ID', value: room.roomId },
                    { label: 'Password', value: room.roomPassword },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 px-4 bg-dark-700 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="font-mono font-bold text-white">{value || '—'}</p>
                      </div>
                      {value && (
                        <button
                          onClick={() => { navigator.clipboard.writeText(value); toast.success(`${label} copied`); }}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 pt-1">Open {game.name} yourself and join this custom room before it starts.</p>
                </div>
              )}
            </div>
          )}

          {/* Prize breakdown */}
          <div className="bg-dark-800 border border-white/5 rounded-2xl p-5">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <FiAward className="text-yellow-400" /> Prize Breakdown
            </h3>
            <div className="space-y-3">
              {tournament.prizeBreakdown.map(({ rank, amount }) => (
                <div key={rank} className="flex items-center justify-between py-2.5 px-4 bg-dark-700 rounded-xl">
                  <span className="text-sm text-gray-300">{rank}</span>
                  <span className="font-display font-bold text-yellow-400 text-lg">₹{amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-dark-800 border border-white/5 rounded-2xl p-5">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <FiShield className="text-blue-400" /> Tournament Rules
            </h3>
            <ul className="space-y-2.5">
              {tournament.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                  <FiCheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── RIGHT: join card ── */}
        <div className="space-y-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-5 sticky top-24">
            <h3 className="font-display font-bold text-white text-xl mb-5">Join Tournament</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Entry Fee</span>
                <span className="font-bold text-white">₹{tournament.entryFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Prize Pool</span>
                <span className="font-bold text-yellow-400">₹{tournament.prize}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Format</span>
                <span className="font-bold text-white">{tournament.type}</span>
              </div>
              {user && (
                <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                  <span className="text-gray-400">Your Balance</span>
                  <span className={`font-bold ${totalBalance >= tournament.entryFee ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{totalBalance}
                  </span>
                </div>
              )}
            </div>

            {joined ? (
              <div className="w-full py-3 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 font-semibold text-center flex items-center justify-center gap-2">
                <FiCheckCircle /> Joined! Good luck 🎮
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining || NOT_JOINABLE.has(tournament.status)}
                className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: NOT_JOINABLE.has(tournament.status)
                    ? 'rgba(255,255,255,0.05)'
                    : `linear-gradient(135deg, ${game.color}, ${game.accentColor})`,
                  boxShadow: !NOT_JOINABLE.has(tournament.status) ? `0 8px 24px ${game.color}40` : 'none',
                }}
              >
                {joining ? (
                  <><span className="spinner !w-5 !h-5 !border-2" /> Joining…</>
                ) : tournament.status === 'full' ? (
                  'Registration Closed'
                ) : tournament.status === 'completed' ? (
                  'Tournament Ended'
                ) : tournament.status === 'cancelled' ? (
                  'Tournament Cancelled'
                ) : (
                  <><BsLightningChargeFill /> Join for ₹{tournament.entryFee}</>
                )}
              </button>
            )}

            {!user && !joined && (
              <p className="text-xs text-gray-500 text-center mt-3">
                <Link to="/login" className="text-orange-400 hover:underline">Login</Link> to join this tournament
              </p>
            )}

            {user && totalBalance < tournament.entryFee && !joined && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                Insufficient balance.{' '}
                <Link to="/wallet" className="underline ml-0.5">Add money →</Link>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500 text-center">
              🔒 Secure · Instant results · Fair play guaranteed
            </div>
          </div>

          {/* Other tournaments for same game */}
          <div className="bg-dark-800 border border-white/5 rounded-2xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">More {game.name}</p>
            <Link
              to={`/games/${game.id}`}
              className="flex items-center gap-2 text-sm font-medium hover:text-orange-400 transition-colors"
              style={{ color: game.color }}
            >
              {game.emoji} View all {game.name} tournaments →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
