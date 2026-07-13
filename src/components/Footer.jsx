import { Link } from 'react-router-dom';
import { GiGamepad } from 'react-icons/gi';
import { FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <GiGamepad className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Battle<span className="text-gradient">Arena</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              India's fastest-growing online gaming tournament platform. Play, compete, and win real cash prizes every day.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { Icon: FiTwitter, href: 'https://x.com/AyanChandra2050', label: 'Twitter' },
                { Icon: FiInstagram, href: 'https://www.instagram.com/mr.ayan_________/', label: 'Instagram' },
                { Icon: FiYoutube, href: 'https://www.youtube.com/@MRAyan-ng2vu', label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/games', label: 'All Tournaments' },
                { to: '/wallet', label: 'My Wallet' },
                { to: '/login', label: 'Login / Sign Up' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              {[
                { to: '/privacy-policy', label: 'Privacy Policy' },
                { to: '/terms-of-service', label: 'Terms of Service' },
                { to: '/refund-policy', label: 'Refund Policy' },
                { to: '/fair-play-rules', label: 'Fair Play Rules' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© 2025 BattleArena. All rights reserved.</p>
          <p>🇮🇳 Made in India | 18+ only | Play responsibly</p>
        </div>
      </div>
    </footer>
  );
}
