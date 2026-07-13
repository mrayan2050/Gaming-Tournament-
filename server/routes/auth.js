import { Router } from 'express';
import { firebaseLogin, getMe, updateMe, getMyRegistrations } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Single endpoint handles BOTH Google and Mobile OTP login —
// the frontend completes Firebase auth first, then sends us the ID token.
router.post('/firebase-login', firebaseLogin);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/me/registrations', protect, getMyRegistrations);

export default router;
