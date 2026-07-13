import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import {
  getDashboardStats,
  adminListTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
  getTournamentRegistrations,
  submitResults,
  listWithdrawals,
  processWithdrawal,
} from '../controllers/adminController.js';

const router = Router();

// Every route here requires a valid JWT AND isAdmin === true.
router.use(protect, requireAdmin);

router.get('/stats', getDashboardStats);

router.get('/tournaments', adminListTournaments);
router.post('/tournaments', createTournament);
router.put('/tournaments/:id', updateTournament);
router.delete('/tournaments/:id', deleteTournament);

router.get('/tournaments/:id/registrations', getTournamentRegistrations);
router.post('/tournaments/:id/results', submitResults);

router.get('/withdrawals', listWithdrawals);
router.post('/withdrawals/:id/process', processWithdrawal);

export default router;
