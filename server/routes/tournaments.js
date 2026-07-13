import { Router } from 'express';
import { getAllTournaments, getTournamentById, joinTournament, getRoomDetails } from '../controllers/tournamentsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/', getAllTournaments);
router.get('/:id', getTournamentById);
router.post('/:id/join', protect, joinTournament);
router.get('/:id/room', protect, getRoomDetails);
export default router;
