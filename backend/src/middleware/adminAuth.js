const jwt = require('jsonwebtoken');

// Deliberately a different secret from the customer-facing JWT_SECRET (see
// middleware/auth.js) so a customer's token can never be mistaken for an
// admin session, and vice versa.
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev-insecure-admin-secret-change-me';

function signAdminToken(teamMember) {
  return jwt.sign(
    { teamMemberId: teamMember._id, storeId: teamMember.store, role: teamMember.role },
    ADMIN_JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyAdminToken(token) {
  return jwt.verify(token, ADMIN_JWT_SECRET);
}

function requireAdminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const payload = verifyAdminToken(token);
    req.teamMemberId = payload.teamMemberId;
    req.adminRole = payload.role;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.adminRole)) {
      return res.status(403).json({ message: 'You do not have permission to do this' });
    }
    next();
  };
}

// For endpoints a route shares with storefront-next's public traffic (an
// endpoint can't require login and stay public at the same time), but whose
// controller still needs to know "is this call coming from a logged-in
// store admin, or the public" to decide what to return. Never rejects.
function optionalAdminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = verifyAdminToken(token);
      req.teamMemberId = payload.teamMemberId;
      req.adminRole = payload.role;
      req.isAdmin = true;
    } catch {
      // Not a valid admin token — treat the request as public.
    }
  }
  next();
}

module.exports = {
  signAdminToken,
  verifyAdminToken,
  requireAdminAuth,
  requireRole,
  optionalAdminAuth,
  ADMIN_JWT_SECRET,
};
