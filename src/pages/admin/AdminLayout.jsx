import { NavLink, Outlet, Link } from 'react-router-dom';
import { FiGrid, FiAward, FiDollarSign, FiArrowLeft } from 'react-icons/fi';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/tournaments', label: 'Tournaments', icon: FiAward },
  { to: '/admin/withdrawals', label: 'Withdrawals', icon: FiDollarSign },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-dark-900 flex">
      <aside className="w-60 shrink-0 border-r border-white/5 bg-dark-800/50 min-h-screen p-4 hidden md:flex md:flex-col">
        <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 mb-6 transition-colors">
          <FiArrowLeft /> Back to site
        </Link>
        <h2 className="text-lg font-display font-bold text-white mb-6 px-2">Admin Panel</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-orange-500/15 text-orange-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
