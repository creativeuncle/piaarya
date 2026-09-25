const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';

function signToken(customerId) {
  return jwt.sign({ customerId }, JWT_SECRET, { expiresIn: '30d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.customerId = payload.customerId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}

module.exports = { signToken, requireAuth, JWT_SECRET };
