const bcrypt = require('bcryptjs');
const TeamMember = require('../models/TeamMember');
const { signAdminToken } = require('../middleware/adminAuth');

function toPublicMember(member) {
  return {
    id: member._id,
    name: member.name,
    email: member.email,
    role: member.role,
    // Populated to a {_id, slug} doc wherever the caller needs the store's
    // slug (e.g. admin-next building the storefront preview URL for the
    // Theme Editor) — see .populate('store', 'slug') below.
    store: member.store?._id
      ? { id: member.store._id, slug: member.store.slug }
      : member.store,
  };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const member = await TeamMember.findOne({ email: (email || '').toLowerCase().trim() }).populate('store', 'slug');
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
    const member = await TeamMember.findById(req.teamMemberId).populate('store', 'slug');
    if (!member) return res.status(404).json({ message: 'Team member not found' });
    res.json({ member: toPublicMember(member) });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me };
