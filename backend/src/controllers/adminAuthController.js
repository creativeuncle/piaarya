const bcrypt = require('bcryptjs');
const TeamMember = require('../models/TeamMember');
const { signAdminToken } = require('../middleware/adminAuth');

function toPublicMember(member) {
  return {
    id: member._id,
    name: member.name,
    email: member.email,
    role: member.role,
    store: member.store,
  };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const member = await TeamMember.findOne({ email: (email || '').toLowerCase().trim() });
    if (!member) return res.status(401).json({ message: 'Invalid email or password' });
    if (!member.isActive) return res.status(403).json({ message: 'This account has been deactivated' });

    const matches = await bcrypt.compare(password || '', member.passwordHash);
    if (!matches) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ token: signAdminToken(member), member: toPublicMember(member) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const member = await TeamMember.findById(req.teamMemberId);
    if (!member) return res.status(404).json({ message: 'Team member not found' });
    res.json({ member: toPublicMember(member) });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me };
