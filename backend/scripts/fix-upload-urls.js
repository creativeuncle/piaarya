// One-time fix for a bug where uploaded file URLs were stored as
// `http://<internal-host>/uploads/<file>` (e.g. http://localhost:5000/...)
// instead of a relative `/uploads/<file>` path. Those absolute URLs are
// unreachable from the browser, so any image uploaded before the fix shows
// broken. This walks every document in the collections that can hold an
// uploaded file URL and rewrites any `http(s)://.../uploads/...` string to
// `/uploads/...`, wherever it's nested.
//
// Safe to re-run: documents with nothing to fix are left untouched.
//
// Usage:
//   node scripts/fix-upload-urls.js

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

const MODELS = [
  require('../src/models/Product'),
  require('../src/models/Category'),
  require('../src/models/PageLayout'),
  require('../src/models/Review'),
  require('../src/models/Settings'),
  require('../src/models/Page'),
];

const UPLOAD_URL = /^https?:\/\/[^/]+(\/uploads\/.*)$/;

function fixValue(value) {
  if (typeof value === 'string') {
    const match = value.match(UPLOAD_URL);
    return match ? match[1] : value;
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((v) => {
      const fixed = fixValue(v);
      if (fixed !== v) changed = true;
      return fixed;
    });
    return changed ? next : value;
  }
  if (value && typeof value === 'object') {
    let changed = false;
    const next = {};
    for (const [key, v] of Object.entries(value)) {
      const fixed = fixValue(v);
      if (fixed !== v) changed = true;
      next[key] = fixed;
    }
    return changed ? next : value;
  }
  return value;
}

async function run() {
  await connectDB();

  let totalFixed = 0;

  for (const Model of MODELS) {
    const docs = await Model.find({});
    let fixedInModel = 0;

    for (const doc of docs) {
      const plain = doc.toObject();
      const fixed = fixValue(plain);
      if (fixed !== plain) {
        doc.set(fixed);
        await doc.save();
        fixedInModel++;
      }
    }

    if (fixedInModel) {
      console.log(`${Model.modelName}: fixed ${fixedInModel} document(s)`);
      totalFixed += fixedInModel;
    }
  }

  console.log(totalFixed ? `Done — ${totalFixed} document(s) fixed.` : 'Done — nothing to fix.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
