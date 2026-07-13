import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';
import { getTournamentRegistrations, submitResults } from '../../services/adminService';

export default function AdminTournamentResults() {
  const { id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [results, setResults] = useState({}); // registrationId -> { rank, prizeWon }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTournamentRegistrations(id)
      .then(data => {
        setRegistrations(data);
        const initial = {};
        data.forEach(r => { initial[r.id] = { rank: r.rank ?? '', prizeWon: r.prizeWon ?? '' }; });
        setResults(initial);
      })
      .catch(() => toast.error('Failed to load registrations'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateField = (regId, field, value) => {
    setResults(prev => ({ ...prev, [regId]: { ...prev[regId], [field]: value } }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(results).map(([registrationId, v]) => ({
        registrationId,
        rank: v.rank === '' ? null : Number(v.rank),
        prizeWon: v.prizeWon === '' ? 0 : Number(v.prizeWon),
      }));
      await submitResults(id, payload);
      toast.success('Results saved — winnings credited & tournament marked completed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit results');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-24 bg-dark-700 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500/50";

  return (
    <div>
      <Link to="/admin/tournaments" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 mb-4 transition-colors">
        <FiArrowLeft /> Back to Tournaments
      </Link>
      <h1 className="text-2xl font-display font-bold text-white mb-1">Enter Results</h1>
      <p className="text-gray-400 text-sm mb-6">
        Set each player's rank and prize amount, then submit. Submitting credits winnings and marks the tournament COMPLETED.
      </p>

      {loading ? (
        <div className="h-64 rounded-2xl bg-dark-700 animate-pulse" />
      ) : registrations.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">No one has registered for this tournament yet.</div>
      ) : (
        <>
          <div className="card overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/5">
                  <th className="p-3 font-medium">Player</th>
                  <th className="p-3 font-medium">Contact</th>
                  <th className="p-3 font-medium">Entry Paid</th>
                  <th className="p-3 font-medium">Rank</th>
                  <th className="p-3 font-medium">Prize (₹)</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(r => (
                  <tr key={r.id} className="border-b border-white/5 last:border-0">
                    <td className="p-3 text-white font-medium">{r.user?.name || 'Player'}</td>
                    <td className="p-3 text-gray-400">{r.user?.email || r.user?.phone || '—'}</td>
                    <td className="p-3 text-gray-300">₹{r.entryFeePaid}</td>
                    <td className="p-3">
                      <input type="number" min="1" className={inputClass} value={results[r.id]?.rank ?? ''} onChange={e => updateField(r.id, 'rank', e.target.value)} />
                    </td>
                    <td className="p-3">
                      <input type="number" min="0" className={inputClass} value={results[r.id]?.prizeWon ?? ''} onChange={e => updateField(r.id, 'prizeWon', e.target.value)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handleSubmit} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
            {saving ? 'Submitting…' : 'Submit Results & Credit Winnings'}
          </button>
        </>
      )}
    </div>
  );
}
