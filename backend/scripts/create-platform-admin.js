// One-time CLI to create a platform (Super Admin) account. There's no
// signup endpoint for these on purpose — platform operators shouldn't be
// self-registerable from the internet.
//
// Usage:
//   node scripts/create-platform-admin.js "Full Name" email@example.com somePassword
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const PlatformAdmin = require('../src/models/PlatformAdmin');

async function run() {
  const [, , name, email, password] = process.argv;
  if (!name || !email || !password) {
    console.error('Usage: node scripts/create-platform-admin.js "<name>" <email> <password>');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('Password must be at least 6 characters');
    process.exit(1);
  }

  await connectDB();

  const cleanEmail = email.toLowerCase().trim();
  const existing = await PlatformAdmin.findOne({ email: cleanEmail });
  if (existing) {
    console.log(`A platform admin with this email already exists: ${existing.email}`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await PlatformAdmin.create({ name, email: cleanEmail, passwordHash });
    console.log(`Created platform admin: ${admin.email}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to create platform admin:', err);
  process.exit(1);
});
