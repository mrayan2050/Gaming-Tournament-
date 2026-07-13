import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiArrowDownLeft, FiArrowUpRight, FiLock, FiClock } from 'react-icons/fi';
import { BsLightningChargeFill } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { createDepositOrder, payWithRazorpay, getTransactions, requestWithdrawal } from '../services/paymentService';

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

const TX_ICON = { DEPOSIT: '💳', ENTRY_FEE: '🎮', PRIZE_CREDIT: '🏆', WITHDRAWAL: '🏦', REFUND: '↩️' };
const TX_LABEL = { DEPOSIT: 'Added to wallet', ENTRY_FEE: 'Tournament entry', PRIZE_CREDIT: 'Prize won', WITHDRAWAL: 'Withdrawal', REFUND: 'Refund' };
const TX_DEBIT_TYPES = new Set(['ENTRY_FEE', 'WITHDRAWAL']);

export default function WalletPage() {
  const { user, wallet, addMoney, refreshWallet } = useAuth();
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' | 'withdraw'
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    if (!user) { setTxLoading(false); return; }
    refreshWallet();
    getTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setTxLoading(false));
  }, [user]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const amt = Number(addAmount);
    if (!amt || amt < 10) { toast.error('Minimum add amount is ₹10'); return; }
    if (amt > 50000) { toast.error('Maximum add amount is ₹50,000 per transaction'); return; }

    setAddLoading(true);
    try {
      const order = await createDepositOrder(amt);
      const result = await payWithRazorpay({
        amountPaise: order.amount,
        amountRupees: amt,
        user,
        keyId: order.keyId,
        orderId: order.orderId,
        currency: order.currency,
      });
      addMoney(amt); // optimistic UI update
      toast.success(`₹${amt} added to your wallet! 💰`);
      setAddAmount('');
      refreshWallet();
      getTransactions().then(setTransactions).catch(() => {});
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        toast.error(err.response?.data?.message || err.message || 'Payment failed');
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt < 50) { toast.error('Minimum withdrawal is ₹50'); return; }
    if (amt > wallet.winnings) { toast.error('Insufficient winnings balance'); return; }
    if (!upiId.trim()) { toast.error('Enter a UPI ID to receive your withdrawal'); return; }

    setWithdrawLoading(true);
    try {
      await requestWithdrawal({ amount: amt, upiId: upiId.trim() });
      toast.success(`Withdrawal of ₹${amt} requested! Our team will process it within 24 hrs 🏦`);
      setWithdrawAmount('');
      setUpiId('');
      refreshWallet();
      getTransactions().then(setTransactions).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal request failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-6xl mb-4">💰</p>
          <h2 className="text-2xl font-bold text-white mb-2">Login to access Wallet</h2>
          <p className="text-gray-400 mb-6">Add money, track winnings, and withdraw cash.</p>
          <Link to="/login" state={{ from: '/wallet' }} className="btn-primary">Login / Sign Up</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-dark-800/60 border-b border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="section-label">My Account</p>
          <h1 className="section-title">Wallet</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Deposit balance */}
          <div className="bg-gradient-to-br from-orange-900/30 to-dark-800 border border-orange-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <FiArrowDownLeft className="text-orange-400 w-4 h-4" />
              </div>
              <p className="text-sm text-gray-400">Deposit Balance</p>
            </div>
            <p className="font-display text-4xl font-bold text-white">₹{wallet.balance}</p>
            <p className="text-xs text-gray-500 mt-2">Use to join tournaments</p>
          </div>

          {/* Winnings */}
          <div className="bg-gradient-to-br from-yellow-900/30 to-dark-800 border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-sm">🏆</span>
              </div>
              <p className="text-sm text-gray-400">Winnings</p>
            </div>
            <p className="font-display text-4xl font-bold text-yellow-400">₹{wallet.winnings}</p>
            <p className="text-xs text-gray-500 mt-2">Withdrawable to bank</p>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-br from-purple-900/30 to-dark-800 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BsLightningChargeFill className="text-purple-400 w-4 h-4" />
              </div>
              <p className="text-sm text-gray-400">Total Balance</p>
            </div>
            <p className="font-display text-4xl font-bold text-white">₹{wallet.balance + wallet.winnings}</p>
            <p className="text-xs text-gray-500 mt-2">Deposit + Winnings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Add / Withdraw form ── */}
          <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {[
                { key: 'deposit', label: '+ Add Money' },
                { key: 'withdraw', label: '↑ Withdraw' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/5'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'deposit' ? (
                <form onSubmit={handleAddMoney} className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-medium">Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={addAmount}
                        onChange={e => setAddAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-7 pr-4 py-3 bg-dark-700 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/60"
                      />
                    </div>
                  </div>

                  {/* Quick amounts */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Quick Select</p>
                    <div className="grid grid-cols-3 gap-2">
                      {QUICK_AMOUNTS.map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAddAmount(String(amt))}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                            addAmount === String(amt)
                              ? 'bg-orange-500 text-white'
                              : 'bg-dark-600 text-gray-400 hover:text-white hover:bg-dark-500 border border-white/5'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment methods */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Pay via</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['UPI', 'Paytm', 'Card'].map(method => (
                        <div key={method} className="py-2 px-3 bg-dark-600 border border-white/5 rounded-lg text-center text-xs text-gray-400">
                          {method}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={addLoading}
                    className="btn-primary w-full justify-center py-3.5 disabled:opacity-60"
                  >
                    {addLoading ? (
                      <span className="spinner !w-5 !h-5 !border-2" />
                    ) : (
                      <><FiPlus /> Add Money</>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    <FiLock className="w-3 h-3" /> 100% secure · Instant credit
                  </p>
                </form>
              ) : (
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-400">
                    Available to withdraw: <span className="font-bold">₹{wallet.winnings}</span>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-medium">Withdrawal Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                      <input
                        type="number"
                        min="50"
                        max={wallet.winnings}
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder="Min ₹50"
                        className="w-full pl-7 pr-4 py-3 bg-dark-700 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-medium">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full px-4 py-3 bg-dark-700 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/60"
                    />
                    <p className="text-xs text-gray-500 mt-2">We'll transfer your withdrawal to this UPI ID within 24 hours.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={withdrawLoading || wallet.winnings < 50}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {withdrawLoading ? (
                      <span className="spinner !w-5 !h-5 !border-2" />
                    ) : (
                      <><FiArrowUpRight /> Withdraw to Bank</>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    <FiClock className="w-3 h-3" /> Typically credited within 24 hours
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* ── Transaction history ── */}
          <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Recent Transactions</h3>
            </div>
            {txLoading ? (
              <div className="p-5 space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-dark-700 animate-pulse" />)}
              </div>
            ) : transactions.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No transactions yet.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-9 h-9 bg-dark-700 rounded-xl flex items-center justify-center text-lg shrink-0">
                      {TX_ICON[tx.type] || '💰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{tx.note || TX_LABEL[tx.type] || tx.type}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${TX_DEBIT_TYPES.has(tx.type) ? 'text-red-400' : 'text-green-400'}`}>
                      {TX_DEBIT_TYPES.has(tx.type) ? '-' : '+'}₹{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA to play */}
        <div className="bg-gradient-to-r from-orange-900/30 to-purple-900/30 border border-white/5 rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">Ready to compete?</p>
          <p className="text-gray-400 text-sm mb-4">You have ₹{wallet.balance} in your deposit balance. Join a tournament and win big!</p>
          <Link to="/games" className="btn-primary">
            <BsLightningChargeFill /> Browse Tournaments
          </Link>
        </div>
      </div>
    </div>
  );
}
