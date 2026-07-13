import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiCheck, FiX,
  FiCreditCard, FiTarget, FiTrendingUp,
} from 'react-icons/fi';
import { BsTrophyFill, BsLightningChargeFill } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProfilePage() {
  const { user, wallet, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [registrations, setRegistrations] = useState([]);
  const [regsLoading, setRegsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/auth/me/registrations')
      .then(({ data }) => setRegistrations(data))
      .catch(() => toast.error('Could not load match history'))
      .finally(() => setRegsLoading(false));
  }, [user]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) { toast.error('Name cannot be empty'); return; }
    setSavingName(true);
    try {
      const { data } = await api.put('/auth/me', { name: trimmed });
      updateUser({ name: data.name });
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingName(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-6xl mb-4">🎮</p>
          <h2 className="text-2xl font-bold text-white mb-2">Login to view your profile</h2>
          <p className="text-gray-400 mb-6">Track your matches, winnings, and account details.</p>
          <Link to="/login" state={{ from: '/profile' }} className="btn-primary">Login / Sign Up</Link>
        </div>
      </div>
    );
  }

  const totalMatches = registrations.length;
  const totalSpent = registrations.reduce((sum, r) => sum + (r.entryFeePaid || 0), 0);
  const totalWon = registrations.reduce((sum, r) => sum + (r.prizeWon || 0), 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative border-b border-white/5 py-14 sm:py-16 overflow-hidden">
        <img
          src="/images/banners/profile-banner.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/80 to-dark-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/60" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <p className="section-label">My Account</p>
          <h1 className="section-title">Profile</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Profile card */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar */}
            <div className="shrink-0 mx-auto sm:mx-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-orange-500/40"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-orange-500/15 border-2 border-orange-500/40 flex items-center justify-center">
                  <FiUser className="w-10 h-10 text-orange-400" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              {editing ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={40}
                    className="px-3 py-2 bg-dark-700 border border-white/10 rounded-lg text-white text-lg font-display font-bold focus:outline-none focus:border-orange-500/60 w-full max-w-xs"
                  />
                  <button
                    type="submit"
                    disabled={savingName}
                    className="p-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-white transition-colors disabled:opacity-60"
                    title="Save"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setNameInput(user.name || ''); }}
                    className="p-2 bg-dark-600 hover:bg-dark-500 rounded-lg text-gray-300 transition-colors"
                    title="Cancel"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <h2 className="font-display text-2xl font-bold text-white">{user.name}</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 text-gray-500 hover:text-orange-400 transition-colors"
                    title="Edit name"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 justify-center sm:justify-start text-sm text-gray-400">
                {user.email && (
                  <span className="flex items-center gap-1.5"><FiMail className="w-3.5 h-3.5" /> {user.email}</span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1.5"><FiPhone className="w-3.5 h-3.5" /> {user.phone}</span>
                )}
                <span className="flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5" /> Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>

            <Link to="/wallet" className="btn-outline shrink-0 mx-auto sm:mx-0">
              <FiCreditCard /> ₹{wallet.balance + wallet.winnings} Wallet
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-900/30 to-dark-800 border border-orange-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <FiTarget className="text-orange-400 w-4 h-4" />
              </div>
              <p className="text-sm text-gray-400">Matches Played</p>
            </div>
            <p className="font-display text-4xl font-bold text-white">{totalMatches}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/30 to-dark-800 border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <BsTrophyFill className="text-yellow-400 w-3.5 h-3.5" />
              </div>
              <p className="text-sm text-gray-400">Total Won</p>
            </div>
            <p className="font-display text-4xl font-bold text-yellow-400">₹{totalWon}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-dark-800 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="text-purple-400 w-4 h-4" />
              </div>
              <p className="text-sm text-gray-400">Total Entry Fees</p>
            </div>
            <p className="font-display text-4xl font-bold text-white">₹{totalSpent}</p>
          </div>
        </div>

        {/* Match history */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="font-semibold text-white">Match History</h3>
          </div>

          {regsLoading ? (
            <div className="flex justify-center py-10"><span className="spinner" /></div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-4xl mb-3">🎯</p>
              <p className="text-gray-400 mb-4">You haven't joined any tournaments yet.</p>
              <Link to="/games" className="btn-primary">
                <BsLightningChargeFill /> Browse Tournaments
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {registrations.map((r) => (
                <Link
                  key={r.id}
                  to={`/tournament/${r.tournamentId}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors"
                >
                  <div className="w-9 h-9 bg-dark-700 rounded-xl flex items-center justify-center text-lg shrink-0">
                    {r.tournament?.game?.emoji || '🎮'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{r.tournament?.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(r.registeredAt)} · Entry ₹{r.entryFeePaid}
                      {r.rank ? ` · Rank #${r.rank}` : ''}
                    </p>
                  </div>
                  {r.prizeWon > 0 ? (
                    <span className="text-sm font-bold text-green-400 shrink-0">+₹{r.prizeWon}</span>
                  ) : (
                    <span className="text-xs text-gray-500 shrink-0">—</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}