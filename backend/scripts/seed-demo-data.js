// One-off demo-data seeder for a marketing video / screenshots: creates 10
// categories, 20 products (assigned across them, each priced above ₹2,000),
// and 15 customers, all with placeholder images so the admin doesn't look
// empty. Every created document is tagged so it can be found and removed
// later without touching anything real.
//
// Usage:
//   node scripts/seed-demo-data.js <store-slug>
//
// If <store-slug> is omitted and there's exactly one store in the database,
// that store is used.

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Store = require('../src/models/Store');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Customer = require('../src/models/Customer');

const DEMO_TAG = 'demo-seed';

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function imageFor(seed, w = 800, h = 800) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

const CATEGORY_DEFS = [
  'Hoodies',
  'T-Shirts',
  'Jeans',
  'Jackets',
  'Dresses',
  'Shoes',
  'Accessories',
  'Bags',
  'Watches',
  'Sunglasses',
];

const PRODUCT_DEFS = {
  Hoodies: ['Classic Pullover Hoodie', 'Oversized Fleece Hoodie'],
  'T-Shirts': ['Essential Cotton Tee', 'Graphic Print Tee'],
  Jeans: ['Slim Fit Denim Jeans', 'Relaxed Fit Jeans'],
  Jackets: ['Bomber Jacket', 'Denim Jacket'],
  Dresses: ['Floral Summer Dress', 'Wrap Midi Dress'],
  Shoes: ['Running Sneakers', 'Canvas Low-Top Shoes'],
  Accessories: ['Leather Belt', 'Woven Baseball Cap'],
  Bags: ['Canvas Tote Bag', 'Leather Backpack'],
  Watches: ['Minimalist Analog Watch', 'Chronograph Sport Watch'],
  Sunglasses: ['Aviator Sunglasses', 'Round Frame Sunglasses'],
};

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Saanvi', 'Myra', 'Aadhya', 'Kiara', 'Riya', 'Priya',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Mehta', 'Reddy', 'Nair', 'Iyer',
  'Singh', 'Kapoor', 'Malhotra', 'Chopra', 'Joshi', 'Desai', 'Rao',
];

async function run() {
  await connectDB();

  const slugArg = process.argv[2];
  let store;
  if (slugArg) {
    store = await Store.findOne({ slug: slugArg });
    if (!store) throw new Error(`No store found with slug "${slugArg}"`);
  } else {
    const stores = await Store.find({});
    if (stores.length !== 1) {
      throw new Error(
        `Found ${stores.length} stores — pass the one to seed explicitly: node scripts/seed-demo-data.js <store-slug>`
      );
    }
    store = stores[0];
  }

  console.log(`Seeding demo data into store "${store.name}" (${store.slug})...`);

  // Categories
  const categories = [];
  for (const name of CATEGORY_DEFS) {
    const slug = slugify(name);
    const category = await Category.findOneAndUpdate(
      { store: store._id, slug },
      {
        store: store._id,
        name,
        slug,
        image: imageFor(`cat-${slug}`),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categories.push(category);
  }
  console.log(`Categories: ${categories.length}`);

  // Products
  let productCount = 0;
  let productIndex = 0;
  for (const category of categories) {
    const names = PRODUCT_DEFS[category.name] || [];
    for (const name of names) {
      productIndex++;
      const sku = `DEMO-${String(productIndex).padStart(3, '0')}`;
      const slug = `${slugify(name)}-${productIndex}`;
      const price = randomInt(2001, 6999);
      await Product.findOneAndUpdate(
        { store: store._id, sku },
        {
          store: store._id,
          name,
          slug,
          sku,
          category: category._id,
          price,
          stock: randomInt(10, 150),
          description: `${name} — a demo product seeded for previewing the admin dashboard.`,
          tags: [DEMO_TAG],
          media: [{ url: imageFor(`prod-${slug}`), type: 'image' }],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      productCount++;
    }
  }
  console.log(`Products: ${productCount}`);

  // Customers
  const usedPhones = new Set();
  let customerCount = 0;
  for (let i = 0; i < 15; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const name = `${first} ${last}`;
    const email = `${slugify(first)}.${slugify(last)}.demo${i}@example.com`;

    let phone;
    do {
      phone = String(randomInt(7000000000, 9999999999));
    } while (usedPhones.has(phone));
    usedPhones.add(phone);

    await Customer.findOneAndUpdate(
      { store: store._id, email },
      {
        store: store._id,
        name,
        email,
        phone,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    customerCount++;
  }
  console.log(`Customers: ${customerCount}`);

  console.log('Done.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
