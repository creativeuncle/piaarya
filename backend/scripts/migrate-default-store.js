// One-time migration for the multi-tenant switch: creates a single "default"
// Store record for the data that already exists (this client's store, from
// before multi-tenancy existed), then backfills the new required `store`
// field on every tenant-scoped collection so nothing breaks once the schemas
// enforce `store` as required.
//
// Safe to re-run: it only creates the default store once (matched by slug)
// and only backfills documents that don't already have a `store` set.
//
// Usage:
//   node scripts/migrate-default-store.js
//
// Optional env vars to customize the default store's identity:
//   DEFAULT_STORE_NAME, DEFAULT_STORE_SLUG, DEFAULT_STORE_OWNER_NAME,
//   DEFAULT_STORE_OWNER_EMAIL

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Store = require('../src/models/Store');

// Every tenant-scoped model that now has a `store` field.
const TENANT_MODELS = [
  require('../src/models/Cart'),
  require('../src/models/Category'),
  require('../src/models/Coupon'),
  require('../src/models/Customer'),
  require('../src/models/EmailCampaign'),
  require('../src/models/GiftCard'),
  require('../src/models/InstalledApp'),
  require('../src/models/InventoryLog'),
  require('../src/models/NavigationItem'),
  require('../src/models/NotificationLog'),
  require('../src/models/Order'),
  require('../src/models/Page'),
  require('../src/models/PaymentTransaction'),
  require('../src/models/Product'),
  require('../src/models/ReturnRequest'),
  require('../src/models/Review'),
  require('../src/models/RewardPointsLog'),
  require('../src/models/Settings'),
  require('../src/models/ShippingZone'),
  require('../src/models/StoreCreditLog'),
  require('../src/models/TeamMember'),
  require('../src/models/Warehouse'),
  require('../src/models/WhatsAppCampaign'),
  require('../src/models/Wishlist'),
];

async function getOrCreateDefaultStore() {
  const slug = process.env.DEFAULT_STORE_SLUG || 'default';
  let store = await Store.findOne({ slug });
  if (store) return store;

  store = await Store.create({
    name: process.env.DEFAULT_STORE_NAME || 'Piaarya',
    slug,
    status: 'active',
    plan: 'pro',
    owner: {
      name: process.env.DEFAULT_STORE_OWNER_NAME || 'Store Owner',
      email: process.env.DEFAULT_STORE_OWNER_EMAIL || 'owner@example.com',
    },
  });
  console.log(`Created default store "${store.name}" (${store._id})`);
  return store;
}

async function backfillModel(Model, storeId) {
  const result = await Model.updateMany(
    { store: { $exists: false } },
    { $set: { store: storeId } }
  );
  const matched = result.matchedCount ?? result.n ?? 0;
  const modified = result.modifiedCount ?? result.nModified ?? 0;
  if (matched > 0) {
    console.log(`  ${Model.modelName}: backfilled ${modified}/${matched} document(s)`);
  } else {
    console.log(`  ${Model.modelName}: nothing to backfill`);
  }
}

async function run() {
  await connectDB();

  const store = await getOrCreateDefaultStore();
  console.log(`Using default store: ${store.name} (${store._id})\n`);

  for (const Model of TENANT_MODELS) {
    await backfillModel(Model, store._id);
  }

  console.log('\nMigration complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
