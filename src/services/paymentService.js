import api from './api';

export const createDepositOrder = (amount) => api.post('/wallet/deposit/order', { amount }).then(r => r.data);
export const verifyDeposit = (payload) => api.post('/wallet/deposit/verify', payload).then(r => r.data);
export const getTransactions = () => api.get('/wallet/transactions').then(r => r.data);
export const requestWithdrawal = (payload) => api.post('/wallet/withdraw', payload).then(r => r.data);

// Opens the Razorpay Checkout modal for a wallet top-up and resolves once
// the payment is created & verified server-side, or rejects on failure/close.
// `amountPaise` is what Razorpay's widget needs (must match the order);
// `amountRupees` is the real rupee value we credit to the wallet on verify.
export function payWithRazorpay({ amountPaise, amountRupees, user, keyId, orderId, currency }) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Payment SDK failed to load. Check your internet connection.'));
      return;
    }

    const rzp = new window.Razorpay({
      key: keyId,
      amount: amountPaise,
      currency,
      order_id: orderId,
      name: 'BattleArena',
      description: 'Wallet Top-up',
      prefill: { name: user?.name, email: user?.email, contact: user?.phone },
      theme: { color: '#f97316' },
      handler: async (response) => {
        try {
          const result = await verifyDeposit({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: amountRupees,
          });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });

    rzp.on('payment.failed', (resp) => {
      reject(new Error(resp.error?.description || 'Payment failed'));
    });

    rzp.open();
  });
}
