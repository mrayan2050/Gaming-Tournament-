import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiCreditCard, FiLogOut, FiUser, FiShield } from 'react-icons/fi';
import { GiGamepad } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, wallet, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/games', label: 'Tournaments' },
    { to: '/wallet', label: 'Wallet' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMenuOpen(false)}>
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-shadow">
            <GiGamepad className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-wide">
            Battle<span className="text-gradient">Arena</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm text-purple-300 hover:bg-purple-500/20 transition-colors"
                  title="Admin Panel"
                >
                  <FiShield className="w-4 h-4" /> Admin
                </Link>
              )}
              <Link
                to="/wallet"
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 border border-white/10 rounded-lg text-sm text-gray-300 hover:border-orange-500/40 transition-colors"
              >
                <FiCreditCard className="text-orange-400" />
                <span className="font-semibold text-white">₹{wallet.balance + wallet.winnings}</span>
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center hover:bg-orange-500/30 transition-colors"
                  title="My Profile"
                >
                  <FiUser className="w-4 h-4 text-orange-400" />
                </Link>
                <Link
  to="/profile"
  className="text-sm text-gray-300 hover:text-orange-400 transition-colors"
>
  {user.name}
</Link>
                <button
                  onClick={handleLogout}
                  className="ml-1 p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2">
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-white/5 px-4 py-4 flex flex-col gap-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-white/5 pt-3 mt-1">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
  to="/profile"
  className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center cursor-pointer hover:bg-orange-500/30 transition"
>
  <FiUser className="w-4 h-4 text-orange-400" />
</Link>
                  <div>
                    <p className="text-sm text-white font-medium">{user.name}</p>
                    <p className="text-xs text-orange-400">₹{wallet.balance + wallet.winnings} in wallet</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm text-purple-300 flex items-center gap-1">
                      <FiShield className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-sm text-red-400 flex items-center gap-1">
                    <FiLogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-primary w-full justify-center text-sm"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
