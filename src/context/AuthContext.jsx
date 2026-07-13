import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { logoutLocal } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0, winnings: 0 });
  const [loading, setLoading] = useState(true);

  // On app load, if a JWT exists, fetch the current user from the backend.
  useEffect(() => {
    const token = localStorage.getItem('battlearena_token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser({ id: data.id, name: data.name, email: data.email, phone: data.phone, avatarUrl: data.avatarUrl, isAdmin: data.isAdmin, createdAt: data.createdAt });
        setWallet({ balance: data.wallet.depositBalance, winnings: data.wallet.winningsBalance });
      })
      .catch(() => localStorage.removeItem('battlearena_token'))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Called after a successful Firebase login (Google or Phone OTP) — the
   * authService already exchanged the Firebase token for our JWT and saved
   * it to localStorage. This just hydrates React state from that response.
   */
  const login = ({ user: backendUser, wallet: backendWallet }) => {
    setUser(backendUser);
    setWallet({ balance: backendWallet.depositBalance, winnings: backendWallet.winningsBalance });
  };

  // Re-fetches the real balance from the backend — use after any action that
  // hits a real wallet endpoint (withdrawals, verified deposits) so the UI
  // reflects the server's numbers rather than an optimistic guess.
  const refreshWallet = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setWallet({ balance: data.wallet.depositBalance, winnings: data.wallet.winningsBalance });
    } catch {
      // silently ignore — UI keeps its last known values
    }
  };

  // Merge partial updates (e.g. a new name) into the current user object.
  const updateUser = (partialUser) => {
    setUser(prev => (prev ? { ...prev, ...partialUser } : prev));
  };

  const logout = async () => {
    await logoutLocal();
    setUser(null);
    setWallet({ balance: 0, winnings: 0 });
  };

  // Optimistic local update; real balance comes from backend on each wallet action.
  const addMoney = (amount) => setWallet(prev => ({ ...prev, balance: prev.balance + amount }));
  const deductMoney = (amount) => {
    if (wallet.balance < amount) return false;
    setWallet(prev => ({ ...prev, balance: prev.balance - amount }));
    return true;
  };
  const withdraw = (amount) => {
    if (wallet.winnings < amount) return false;
    setWallet(prev => ({ ...prev, winnings: prev.winnings - amount }));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, wallet, loading, login, logout, updateUser, addMoney, deductMoney, withdraw, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
