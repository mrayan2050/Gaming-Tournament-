import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCheckSquare, FiX } from 'react-icons/fi';
import { useGames } from '../../context/GamesContext';
import { adminListTournaments, createTournament, updateTournament, deleteTournament } from '../../services/adminService';

const emptyForm = {
  gameId: '',
  title: '',
  type: 'Solo',
  entryFee: '',
  prizePool: '',
  totalSlots: '',
  filledSlots: '0',
  scheduledDate: '',
  status: 'UPCOMING',
  rulesText: '',
  prizeBreakdownText: '',
  roomId: '',
  roomPassword: '',
  roomReleased: false,
};

export default function AdminTournaments() {
  const { games } = useGames();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminListTournaments()
      .then(setTournaments)
      .catch(() => toast.error('Failed to load tournaments'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, gameId: games[0]?.dbId || '' });
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      gameId: t.gameId,
      title: t.title,
      type: t.type,
      entryFee: t.entryFee,
      prizePool: t.prizePool,
      totalSlots: t.totalSlots,
      filledSlots: t.filledSlots,
      scheduledDate: new Date(t.scheduledDate).toISOString().slice(0, 16),
      status: t.status,
      rulesText: (t.rules || []).join('\n'),
      prizeBreakdownText: t.prizeBreakdown ? JSON.stringify(t.prizeBreakdown, null, 2) : '',
      roomId: t.roomId || '',
      roomPassword: t.roomPassword || '',
      roomReleased: t.roomReleased || false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let prizeBreakdown;
      if (form.prizeBreakdownText.trim()) {
        try { prizeBreakdown = JSON.parse(form.prizeBreakdownText); }
        catch { toast.error('Prize breakdown must be valid JSON'); setSaving(false); return; }
      }

      const payload = {
        gameId: form.gameId,
        title: form.title,
        type: form.type,
        entryFee: Number(form.entryFee),
        prizePool: Number(form.prizePool),
        totalSlots: Number(form.totalSlots),
        filledSlots: Number(form.filledSlots),
        scheduledDate: form.scheduledDate,
        status: form.status,
        rules: form.rulesText.split('\n').map(r => r.trim()).filter(Boolean),
        prizeBreakdown,
        roomId: form.roomId.trim() || null,
        roomPassword: form.roomPassword.trim() || null,
        roomReleased: form.roomReleased,
      };

      if (editingId) {
        await updateTournament(editingId, payload);
        toast.success('Tournament updated');
      } else {
        await createTournament(payload);
        toast.success('Tournament created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save tournament');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteTournament(id);
      toast.success('Tournament deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete (it may already have registrations)');
    }
  };

  const inputClass = "w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50";
  const labelClass = "block text-xs font-medium text-gray-400 mb-1.5";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">Tournaments</h1>
          <p className="text-gray-400 text-sm">Create, edit, and manage all tournaments</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <FiPlus /> New Tournament
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">{editingId ? 'Edit Tournament' : 'New Tournament'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><FiX /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Game</label>
              <select className={inputClass} value={form.gameId} onChange={e => setForm({ ...form, gameId: e.target.value })} required>
                <option value="" disabled>Select a game</option>
                {games.map(g => <option key={g.dbId} value={g.dbId}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Title</label>
              <input className={inputClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <input className={inputClass} placeholder="Solo / Duo / Squad / 1v1" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live</option>
                <option value="FULL">Full</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Entry Fee (₹)</label>
              <input type="number" min="0" className={inputClass} value={form.entryFee} onChange={e => setForm({ ...form, entryFee: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Prize Pool (₹)</label>
              <input type="number" min="0" className={inputClass} value={form.prizePool} onChange={e => setForm({ ...form, prizePool: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Total Slots</label>
              <input type="number" min="1" className={inputClass} value={form.totalSlots} onChange={e => setForm({ ...form, totalSlots: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Filled Slots</label>
              <input type="number" min="0" className={inputClass} value={form.filledSlots} onChange={e => setForm({ ...form, filledSlots: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Scheduled Date & Time</label>
              <input type="datetime-local" className={inputClass} value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Rules (one per line)</label>
              <textarea rows={3} className={inputClass} value={form.rulesText} onChange={e => setForm({ ...form, rulesText: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Prize Breakdown (JSON, optional) — e.g. {`[{"rank":"🥇 1st","amount":500}]`}</label>
              <textarea rows={3} className={inputClass} value={form.prizeBreakdownText} onChange={e => setForm({ ...form, prizeBreakdownText: e.target.value })} />
            </div>

            <div className="sm:col-span-2 border-t border-white/10 pt-4 mt-1">
              <p className="text-sm font-semibold text-white mb-1">Match Room (BGMI / Free Fire / COD)</p>
              <p className="text-xs text-gray-500 mb-3">Only players who joined can see this, and only once you check "Release" below.</p>
            </div>
            <div>
              <label className={labelClass}>Room ID</label>
              <input className={inputClass} value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} placeholder="e.g. 123456789" />
            </div>
            <div>
              <label className={labelClass}>Room Password</label>
              <input className={inputClass} value={form.roomPassword} onChange={e => setForm({ ...form, roomPassword: e.target.value })} placeholder="e.g. arena123" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="roomReleased" checked={form.roomReleased} onChange={e => setForm({ ...form, roomReleased: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="roomReleased" className="text-sm text-gray-300">Release room details to joined players now</label>
            </div>
            <div className="sm:col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Tournament'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-dark-700 animate-pulse" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/5">
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Game</th>
                <th className="p-3 font-medium">Entry / Prize</th>
                <th className="p-3 font-medium">Slots</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map(t => (
                <tr key={t.id} className="border-b border-white/5 last:border-0">
                  <td className="p-3 text-white font-medium">{t.title}</td>
                  <td className="p-3 text-gray-400">{t.game?.emoji} {t.game?.name}</td>
                  <td className="p-3 text-gray-300">₹{t.entryFee} / ₹{t.prizePool}</td>
                  <td className="p-3 text-gray-300">{t.filledSlots}/{t.totalSlots}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-300">{t.status}</span>
                  </td>
                  <td className="p-3 text-gray-400">{new Date(t.scheduledDate).toLocaleDateString('en-IN')}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/tournaments/${t.id}/results`} title="Enter Results" className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-green-400">
                        <FiCheckSquare className="w-4 h-4" />
                      </Link>
                      <button onClick={() => openEdit(t)} title="Edit" className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-orange-400">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id, t.title)} title="Delete" className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tournaments.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-gray-400">No tournaments yet — create one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
