import crypto from 'crypto';
import prisma from '../config/db.js';
import razorpay from '../config/razorpay.js';

// GET /api/wallet/balance
export const getBalance = async (req, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.userId } });
  if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
  res.json({ depositBalance: wallet.depositBalance, winningsBalance: wallet.winningsBalance });
};

// POST /api/wallet/deposit/order  { amount }
// Step 1 of a real deposit: create a Razorpay order. No money moves yet —
// the wallet is only credited after /deposit/verify confirms a signed
// payment response from Razorpay (see below).
export const createDepositOrder = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount < 10) return res.status(400).json({ message: 'Minimum amount is ₹10' });
  if (amount > 50000) return res.status(400).json({ message: 'Maximum amount is ₹50,000 per transaction' });

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `dep_${Date.now()}`, // must be <= 40 chars per Razorpay's API
      notes: { userId: req.user.userId },
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Razorpay order creation failed:', err); // full error, printed server-side
    const description = err.error?.description || err.message || 'Failed to create payment order';
    res.status(500).json({ message: description });
  }
};

// POST /api/wallet/deposit/verify
// { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount }
// Step 2: verify the HMAC signature Razorpay returns after checkout. Only
// on a valid signature do we actually credit the wallet — this is what
// stops someone from crediting themselves by calling the API directly.
export const verifyDeposit = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
    return res.status(400).json({ message: 'Missing payment verification fields' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed — signature mismatch' });
  }

  const wallet = await prisma.wallet.update({
    where: { userId: req.user.userId },
    data: {
      depositBalance: { increment: Number(amount) },
      transactions: {
        create: { type: 'DEPOSIT', amount: Number(amount), refId: razorpay_payment_id, note: 'Wallet top-up via Razorpay' },
      },
    },
  });

  res.json({ success: true, depositBalance: wallet.depositBalance });
};

// GET /api/wallet/transactions
export const getTransactions = async (req, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.userId } });
  if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

  const transactions = await prisma.transaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  res.json(transactions);
};

// POST /api/wallet/withdraw  { amount, upiId? , bankAccount?, ifsc? }
export const withdraw = async (req, res) => {
  const { amount, upiId, bankAccount, ifsc } = req.body;
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.userId } });

  if (!amount || amount < 50) return res.status(400).json({ message: 'Minimum withdrawal is ₹50' });
  if (!wallet || wallet.winningsBalance < amount)
    return res.status(400).json({ message: 'Insufficient winnings balance' });

  await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId: req.user.userId },
      data: { winningsBalance: { decrement: amount } },
    });

    const withdrawRequest = await tx.withdrawRequest.create({
      data: { userId: req.user.userId, amount, upiId, bankAccount, ifsc, status: 'PENDING' },
    });

    // refId links this log entry to the WithdrawRequest, so its label can
    // be updated later once an admin approves/rejects it (see adminController).
    await tx.transaction.create({
      data: { walletId: wallet.id, type: 'WITHDRAWAL', amount, refId: withdrawRequest.id, note: 'Withdrawal requested' },
    });
  });

  res.json({ success: true, message: 'Withdrawal request submitted' });
};
