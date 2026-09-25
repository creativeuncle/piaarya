const bcrypt = require('bcryptjs');
const Store = require('../models/Store');
const TeamMember = require('../models/TeamMember');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

function toPublicStore(store) {
  return {
    id: store._id,
    name: store.name,
    slug: store.slug,
    customDomain: store.customDomain,
    owner: store.owner,
    status: store.status,
    plan: store.plan,
    createdAt: store.createdAt,
  };
}

async function listStores(req, res, next) {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.json(stores.map(toPublicStore));
  } catch (err) {
    next(err);
  }
}

async function getStore(req, res, next) {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(toPublicStore(store));
  } catch (err) {
    next(err);
  }
}

// Onboards a new tenant: creates the Store record and its first team member
// (store-level super_admin) in one step, so the owner can log into
// admin-next immediately — a Store with nobody able to log into it isn't
// useful on its own.
async function createStore(req, res, next) {
  try {
    const { name, slug, ownerName, ownerEmail, ownerPassword, plan } = req.body;
    if (!name || !slug || !ownerName || !ownerEmail || !ownerPassword) {
      return res.status(400).json({
        message: 'name, slug, ownerName, ownerEmail, and ownerPassword are required',
      });
    }
    if (ownerPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const cleanSlug = slug.toLowerCase().trim();
    const existing = await Store.findOne({ slug: cleanSlug });
    if (existing) return res.status(409).json({ message: 'A store with this slug already exists' });

    const store = await Store.create({
      name,
      slug: cleanSlug,
      plan: plan || 'free',
      status: 'active',
      owner: { name: ownerName, email: ownerEmail },
    });

    const passwordHash = await bcrypt.hash(ownerPassword, 10);
    await TeamMember.create({
      store: store._id,
      name: ownerName,
      email: ownerEmail,
      passwordHash,
      role: 'super_admin',
    });

    res.status(201).json(toPublicStore(store));
  } catch (err) {
    next(err);
  }
}

// Platform-wide stats. These models are queried with no tenant context
// active (platform routes are mounted ahead of resolveStore), so the
// tenant-scoping plugin leaves them unfiltered — exactly what a
// cross-store view needs.
async function getDashboard(req, res, next) {
  try {
    const [totalStores, activeStores, suspendedStores, totalOrders, totalCustomers, revenueResult] =
      await Promise.all([
        Store.countDocuments(),
        Store.countDocuments({ status: 'active' }),
        Store.countDocuments({ status: 'suspended' }),
        Order.countDocuments(),
        Customer.countDocuments(),
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
      ]);

    res.json({
      totalStores,
      activeStores,
      suspendedStores,
      totalOrders,
      totalCustomers,
      totalRevenue: revenueResult[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listStores, getStore, createStore, getDashboard };
