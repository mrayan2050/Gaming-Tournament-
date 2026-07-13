import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiX } from 'react-icons/fi';
import { listWithdrawals, processWithdrawal } from '../../services/adminService';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [processingId, setProcessingId] = useState(null);

  const load = () => {
    setLoading(true);
    listWithdrawals(filter === 'ALL' ? undefined : filter)
      .then(setWithdrawals)
      .catch(() => toast.error('Failed to load withdrawals'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleProcess = async (id, action) => {
    if (action === 'reject' && !confirm('Reject this withdrawal? The amount will be refunded to the user\'s winnings balance.')) return;
    setProcessingId(id);
    try {
      await processWithdrawal(id, action);
      toast.success(action === 'approve' ? 'Withdrawal marked as completed' : 'Withdrawal rejected & refunded');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const statusClass = {
    PENDING: 'bg-yellow-500/15 text-yellow-400',
    COMPLETED: 'bg-green-500/15 text-green-400',
    REJECTED: 'bg-red-500/15 text-red-400',
    PROCESSING: 'bg-blue-500/15 text-blue-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">Withdrawals</h1>
          <p className="text-gray-400 text-sm">Approve or reject payout requests</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
          <option value="ALL">All</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-dark-700 animate-pulse" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/5">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Payout To</th>
                <th className="p-3 font-medium">Requested</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id} className="border-b border-white/5 last:border-0">
                  <td className="p-3 text-white font-medium">{w.user?.name || 'Player'}<div className="text-xs text-gray-500">{w.user?.email || w.user?.phone}</div></td>
                  <td className="p-3 text-gray-300">₹{w.amount}</td>
                  <td className="p-3 text-gray-400">{w.upiId || (w.bankAccount ? `A/C ${w.bankAccount}` : '—')}</td>
                  <td className="p-3 text-gray-400">{new Date(w.requestedAt).toLocaleDateString('en-IN')}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${statusClass[w.status]}`}>{w.status}</span></td>
                  <td className="p-3">
                    {w.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button disabled={processingId === w.id} onClick={() => handleProcess(w.id, 'approve')} className="p-2 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-400 disabled:opacity-50" title="Mark completed">
                          <FiCheck className="w-4 h-4" />
                        </button>
                        <button disabled={processingId === w.id} onClick={() => handleProcess(w.id, 'reject')} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 disabled:opacity-50" title="Reject & refund">
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs block text-right">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">No withdrawals found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: "Mark completed" doesn't send real money — you still need to manually pay the user via UPI/bank transfer using the details shown, then click this to record it. Wiring an automated payout gateway is a separate step.
      </p>
    </div>
  );
}
