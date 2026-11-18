// One-time migration for phone+OTP login (new or existing customer):
//
// 1. Rebuilds the Customer indexes so email/phone uniqueness is "sparse"
//    (a customer missing one of them no longer collides with every other
//    customer missing it) — required before name/email/passwordHash became
//    optional, otherwise phone-only signups fail with a duplicate-key error.
// 2. Normalizes every existing customer's `phone` to a bare 10-digit string
//    (however it was originally typed — with a country code, spaces,
//    dashes, etc.), since the OTP endpoints now look it up by exact match
//    instead of a suffix regex.
//
// Safe to re-run.
//
// Usage:
//   node scripts/migrate-customer-phone-otp.js

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Customer = require('../src/models/Customer');

async function run() {
  await connectDB();

  console.log('Syncing Customer indexes...');
  const syncResult = await Customer.syncIndexes();
  console.log('Indexes synced:', syncResult);

  const customers = await Customer.find({ phone: { $exists: true, $ne: null, $ne: '' } });
  let fixed = 0;
  let conflicts = [];

  for (const customer of customers) {
    const normalized = String(customer.phone).replace(/\D/g, '').slice(-10);
    if (normalized === customer.phone || !normalized) continue;

    const clash = await Customer.findOne({ store: customer.store, phone: normalized, _id: { $ne: customer._id } });
    if (clash) {
      conflicts.push({ customerId: customer._id, phone: customer.phone, normalized, clashesWith: clash._id });
      continue;
    }

    customer.phone = normalized;
    await customer.save();
    fixed++;
  }

  console.log(`Normalized phone on ${fixed} customer(s).`);
  if (conflicts.length) {
    console.log(`${conflicts.length} customer(s) left unchanged due to a phone-number clash after normalizing:`);
    conflicts.forEach((c) => console.log(`  customer ${c.customerId}: "${c.phone}" -> "${c.normalized}" clashes with customer ${c.clashesWith}`));
    console.log('Resolve these manually (likely duplicate accounts for the same person).');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
