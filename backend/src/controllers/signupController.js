const bcrypt = require('bcryptjs');
const Store = require('../models/Store');
const TeamMember = require('../models/TeamMember');
const { signAdminToken } = require('../middleware/adminAuth');

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const RESERVED_SLUGS = new Set(['www', 'admin', 'api', 'app', 'default']);

function toPublicMember(member) {
  return { id: member._id, name: member.name, email: member.email, role: member.role, store: member.store };
}

async function checkSlug(req, res, next) {
  try {
    const slug = String(req.query.slug || '').toLowerCase().trim();
    if (!slug || !SLUG_PATTERN.test(slug) || RESERVED_SLUGS.has(slug)) {
      return res.json({ available: false });
    }
    const existing = await Store.findOne({ slug });
    res.json({ available: !existing });
  } catch (err) {
    next(err);
  }
}

async function signup(req, res, next) {
  try {
    const { owner, store, plan } = req.body || {};

    if (!owner?.name || !owner?.email || !owner?.password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (owner.password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!store?.name || !store?.slug) {
      return res.status(400).json({ message: 'Store name and URL are required' });
    }

    const slug = String(store.slug).toLowerCase().trim();
    if (!SLUG_PATTERN.test(slug) || RESERVED_SLUGS.has(slug)) {
      return res.status(400).json({ message: 'That store URL is not available' });
    }
    const existingStore = await Store.findOne({ slug });
    if (existingStore) {
      return res.status(409).json({ message: 'That store URL is already taken' });
    }

    const newStore = await Store.create({
      name: store.name,
      slug,
      category: store.category || '',
      plan: plan === 'super' ? 'super' : 'basic',
      owner: {
        name: owner.name,
        email: owner.email,
        phone: owner.phone || '',
        address: {
          line: owner.address?.line || '',
          city: owner.address?.city || '',
          state: owner.address?.state || '',
          pincode: owner.address?.pincode || '',
        },
      },
    });

    const passwordHash = await bcrypt.hash(owner.password, 10);
    const member = await TeamMember.create({
      store: newStore._id,
      name: owner.name,
      email: owner.email,
      passwordHash,
      role: 'super_admin',
    });

    res.status(201).json({
      token: signAdminToken(member),
      member: toPublicMember(member),
      store: { id: newStore._id, name: newStore.name, slug: newStore.slug },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'That store URL is already taken' });
    }
    next(err);
  }
}

module.exports = { checkSlug, signup };
