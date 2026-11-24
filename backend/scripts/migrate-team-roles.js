// One-time migration for the team-role revamp: the old 'manager' and
// 'support_staff' roles are replaced by Shopify-style roles
// ('store_administrator', 'customer_support', etc.) — remaps any existing
// TeamMember with the old values to their closest new equivalent.
//
// Safe to re-run: only touches documents still holding an old role value.
//
// Usage:
//   node scripts/migrate-team-roles.js

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const TeamMember = require('../src/models/TeamMember');

const ROLE_MAP = {
  manager: 'store_administrator',
  support_staff: 'customer_support',
};

async function run() {
  await connectDB();

  let total = 0;
  for (const [oldRole, newRole] of Object.entries(ROLE_MAP)) {
    const result = await TeamMember.updateMany({ role: oldRole }, { role: newRole });
    console.log(`${oldRole} -> ${newRole}: ${result.modifiedCount} updated`);
    total += result.modifiedCount;
  }

  console.log(total ? `Done — ${total} team member(s) updated.` : 'Done — nothing to update.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
