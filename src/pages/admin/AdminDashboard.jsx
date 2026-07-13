import { useEffect, useState } from 'react';
import { FiUsers, FiAward, FiZap, FiDollarSign } from 'react-icons/fi';
import { getDashboardStats } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Users', value: stats.userCount, icon: FiUsers, color: '#f97316' },
    { label: 'Total Tournaments', value: stats.tournamentCount, icon: FiAward, color: '#8b5cf6' },
    { label: 'Live Now', value: stats.liveCount, icon: FiZap, color: '#ef4444' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: FiDollarSign, color: '#eab308' },
    { label: 'Total Deposits', value: `₹${stats.totalDeposits.toLocaleString('en-IN')}`, icon: FiDollarSign, color: '#22c55e' },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-1">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-6">Overview of your platform</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-dark-700 animate-pulse" />)}
        </div>
      ) : !stats ? (
        <p className="text-gray-400">Could not load dashboard stats. Is the server running?</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}22` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
