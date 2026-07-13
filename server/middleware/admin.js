import prisma from '../config/db.js';

// Must run AFTER `protect` — relies on req.user.userId being set.
// Checks isAdmin fresh from the DB on every request rather than trusting
// the JWT payload, so toggling a user's admin flag off takes effect
// immediately without waiting for their token to expire.
export async function requireAdmin(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify admin access' });
  }
}
