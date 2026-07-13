import jwt from 'jsonwebtoken';
import { firebaseAuth } from '../config/firebase.js';
import prisma from '../config/db.js';

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

/**
 * Shared logic for both Google and Mobile OTP login.
 * The frontend has already completed Firebase auth (Google popup or
 * OTP verification) and sends us the resulting Firebase ID token.
 * We verify it server-side, then find-or-create the user + their wallet.
 */
async function findOrCreateUser(decodedToken) {
  const { uid, email, phone_number, name, picture, firebase } = decodedToken;
  const provider = firebase?.sign_in_provider === 'google.com' ? 'GOOGLE' : 'PHONE';

  let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid: uid,
        email: email || null,
        phone: phone_number || null,
        name: name || (phone_number ? `Player_${phone_number.slice(-4)}` : email?.split('@')[0]) || 'Player',
        avatarUrl: picture || null,
        authProvider: provider,
        wallet: { create: { depositBalance: 0, winningsBalance: 0 } }, // fresh wallet
      },
      include: { wallet: true },
    });
  } else {
    user = await prisma.user.findUnique({
      where: { id: user.id },
      include: { wallet: true },
    });
  }

  return user;
}

/**
 * POST /api/auth/firebase-login
 * Body: { idToken }  — the Firebase ID token from the client SDK,
 * obtained after EITHER:
 *   - Google popup sign-in (signInWithPopup)
 *   - Phone OTP verification (signInWithPhoneNumber → confirmationResult.confirm(otp))
 * Works for both flows identically — Firebase tells us which provider was used.
 */
export const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    const decoded = await firebaseAuth.verifyIdToken(idToken);
    const user = await findOrCreateUser(decoded);

    const token = signToken({ userId: user.id, firebaseUid: user.firebaseUid });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        authProvider: user.authProvider,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      wallet: {
        depositBalance: user.wallet?.depositBalance ?? 0,
        winningsBalance: user.wallet?.winningsBalance ?? 0,
      },
    });
  } catch (err) {
  console.error("========== FIREBASE LOGIN ERROR ==========");
  console.error(err);

  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
}
};

/**
 * GET /api/auth/me
 * Returns the current logged-in user (requires our JWT via `protect` middleware).
 */
export const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { wallet: true },
  });
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    wallet: {
      depositBalance: user.wallet?.depositBalance ?? 0,
      winningsBalance: user.wallet?.winningsBalance ?? 0,
    },
  });
};

// PUT /api/auth/me   { name }
export const updateMe = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'Name cannot be empty' });

  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: { name: name.trim() },
  });
  res.json({ id: user.id, name: user.name });
};

// GET /api/auth/me/registrations
// Powers the Profile page's Match History — every tournament the user has
// joined, most recent first, with the tournament + game info needed to
// render each row (title, emoji, entry fee, rank, prize).
export const getMyRegistrations = async (req, res) => {
  const registrations = await prisma.registration.findMany({
    where: { userId: req.user.userId },
    include: { tournament: { include: { game: true } } },
    orderBy: { registeredAt: 'desc' },
  });
  res.json(registrations);
};
