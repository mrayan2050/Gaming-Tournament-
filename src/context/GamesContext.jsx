import { createContext, useContext, useEffect, useState } from 'react';
import { fetchGames } from '../services/contentService';

const GamesContext = createContext(null);

export function GamesProvider({ children }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch(() => setError('Could not load games. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  const getGameBySlug = (slug) => games.find((g) => g.id === slug);

  return (
    <GamesContext.Provider value={{ games, loading, error, getGameBySlug }}>
      {children}
    </GamesContext.Provider>
  );
}

export const useGames = () => {
  const ctx = useContext(GamesContext);
  if (!ctx) throw new Error('useGames must be used within GamesProvider');
  return ctx;
};
