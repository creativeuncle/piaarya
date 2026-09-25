const jwt = require('jsonwebtoken');

// A third, separate secret — distinct from both the customer JWT_SECRET and
// the store-admin ADMIN_JWT_SECRET — so a platform session can never be
// mistaken for (or forged from) either of the other two.
const PLATFORM_JWT_SECRET = process.env.PLATFORM_JWT_SECRET || 'dev-insecure-platform-secret-change-me';

function signPlatformToken(admin) {
  return jwt.sign({ platformAdminId: admin._id }, PLATFORM_JWT_SECRET, { expiresIn: '7d' });
}

function requirePlatformAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const payload = jwt.verify(token, PLATFORM_JWT_SECRET);
    req.platformAdminId = payload.platformAdminId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}

module.exports = { signPlatformToken, requirePlatformAuth, PLATFORM_JWT_SECRET };
