import { Router } from 'express';
import { getBalance, createDepositOrder, verifyDeposit, getTransactions, withdraw } from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/balance', protect, getBalance);
router.get('/transactions', protect, getTransactions);
router.post('/deposit/order', protect, createDepositOrder);
router.post('/deposit/verify', protect, verifyDeposit);
router.post('/withdraw', protect, withdraw);
export default router;
