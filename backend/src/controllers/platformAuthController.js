const bcrypt = require('bcryptjs');
const PlatformAdmin = require('../models/PlatformAdmin');
const { signPlatformToken } = require('../middleware/platformAuth');

function toPublicAdmin(admin) {
  return { id: admin._id, name: admin.name, email: admin.email };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const admin = await PlatformAdmin.findOne({ email: (email || '').toLowerCase().trim() });
    if (!admin) return res.status(401).json({ message: 'Invalid email or password' });
    if (!admin.isActive) return res.status(403).json({ message: 'This account has been deactivated' });

    const matches = await bcrypt.compare(password || '', admin.passwordHash);
    if (!matches) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ token: signPlatformToken(admin), admin: toPublicAdmin(admin) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const admin = await PlatformAdmin.findById(req.platformAdminId);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ admin: toPublicAdmin(admin) });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me };
