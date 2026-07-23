require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Review = require('./models/Review');
const PaymentTransaction = require('./models/PaymentTransaction');
const Cart = require('./models/Cart');
const TeamMember = require('./models/TeamMember');
const Wishlist = require('./models/Wishlist');
const bcrypt = require('bcryptjs');

async function seed() {
  await connectDB();

  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Customer.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    PaymentTransaction.deleteMany({}),
    Cart.deleteMany({}),
    TeamMember.deleteMany({}),
    Wishlist.deleteMany({}),
  ]);

  const [apparel, electronics, accessories] = await Category.insertMany([
    { name: 'Apparel', slug: 'apparel', image: 'https://picsum.photos/seed/apparel/400/400' },
    { name: 'Electronics', slug: 'electronics', image: 'https://picsum.photos/seed/electronics/400/400' },
    { name: 'Accessories', slug: 'accessories', image: 'https://picsum.photos/seed/accessories/400/400' },
  ]);
  const category = apparel;

  function media(seed, alt) {
    return [{ url: `https://picsum.photos/seed/${seed}/600/600`, type: 'image', altText: alt }];
  }

  const products = await Product.insertMany([
    {
      name: 'Classic T-Shirt',
      slug: 'classic-t-shirt',
      sku: 'TSHIRT-001',
      category: apparel._id,
      price: 499,
      compareAtPrice: 699,
      stock: 100,
      tags: ['bestseller'],
      media: media('tshirt', 'Classic T-Shirt'),
    },
    {
      name: 'Denim Jacket',
      slug: 'denim-jacket',
      sku: 'JACKET-001',
      category: apparel._id,
      price: 1999,
      stock: 40,
      tags: ['bestseller', 'new'],
      media: media('jacket', 'Denim Jacket'),
    },
    {
      name: 'Wireless Earbuds',
      slug: 'wireless-earbuds',
      sku: 'AUDIO-001',
      category: electronics._id,
      price: 2499,
      compareAtPrice: 2999,
      stock: 60,
      tags: ['bestseller'],
      media: media('earbuds', 'Wireless Earbuds'),
    },
    {
      name: 'Smart Fitness Band',
      slug: 'smart-fitness-band',
      sku: 'WEAR-001',
      category: electronics._id,
      price: 1799,
      stock: 25,
      tags: ['new'],
      media: media('fitnessband', 'Smart Fitness Band'),
    },
    {
      name: 'Leather Wallet',
      slug: 'leather-wallet',
      sku: 'WALLET-001',
      category: accessories._id,
      price: 899,
      stock: 80,
      tags: ['new'],
      media: media('wallet', 'Leather Wallet'),
    },
    {
      name: 'Canvas Backpack',
      slug: 'canvas-backpack',
      sku: 'BAG-001',
      category: accessories._id,
      price: 1599,
      stock: 35,
      tags: ['bestseller'],
      media: media('backpack', 'Canvas Backpack'),
    },
    {
      name: 'Starter Combo Pack',
      slug: 'starter-combo-pack',
      sku: 'BUNDLE-001',
      category: apparel._id,
      price: 2299,
      compareAtPrice: 2997,
      stock: 20,
      tags: ['bundle'],
      media: media('combopack', 'Starter Combo Pack'),
    },
    {
      name: 'Travel Essentials Bundle',
      slug: 'travel-essentials-bundle',
      sku: 'BUNDLE-002',
      category: accessories._id,
      price: 2999,
      compareAtPrice: 3599,
      stock: 15,
      tags: ['bundle'],
      media: media('travelbundle', 'Travel Essentials Bundle'),
    },
  ]);

  const customers = await Customer.insertMany([
    { name: 'Aditi Sharma', email: 'aditi@example.com', passwordHash: 'seed-placeholder' },
    { name: 'Rahul Verma', email: 'rahul@example.com', passwordHash: 'seed-placeholder' },
    { name: 'Priya Singh', email: 'priya@example.com', passwordHash: 'seed-placeholder' },
    { name: 'Karan Mehta', email: 'karan@example.com', passwordHash: 'seed-placeholder' },
  ]);

  const statuses = Order.ORDER_STATUSES;
  const orders = statuses.map((status, i) => ({
    orderNumber: `ORD-${1000 + i}`,
    customer: customers[i % customers.length]._id,
    items: [
      { product: products[i % products.length]._id, quantity: 1 + (i % 3), price: products[i % products.length].price },
    ],
    totalAmount: products[i % products.length].price * (1 + (i % 3)),
    status,
  }));

  const createdOrders = await Order.insertMany(orders);

  const transactions = await PaymentTransaction.insertMany(
    createdOrders.map((order, i) => ({
      order: order._id,
      type: 'charge',
      amount: order.totalAmount,
      status: order.status === 'cancelled' ? 'failed' : 'success',
      method: i % 2 === 0 ? 'card' : 'upi',
    }))
  );

  const reviews = await Review.insertMany([
    {
      product: products[0]._id,
      customer: customers[0]._id,
      rating: 5,
      comment: 'Great quality fabric, fits perfectly!',
      status: 'approved',
      isFeatured: true,
    },
    {
      product: products[0]._id,
      customer: customers[1]._id,
      rating: 3,
      comment: 'Decent, but runs a bit small.',
      status: 'pending',
    },
    {
      product: products[1]._id,
      customer: customers[1]._id,
      rating: 1,
      comment: 'Received a damaged item.',
      status: 'pending',
    },
    {
      product: products[2]._id,
      customer: customers[2]._id,
      rating: 5,
      comment: 'Sound quality is amazing for the price!',
      status: 'approved',
      isFeatured: true,
    },
    {
      product: products[5]._id,
      customer: customers[3]._id,
      rating: 4,
      comment: 'Sturdy and spacious, great for daily commute.',
      status: 'approved',
      isFeatured: true,
    },
    {
      product: products[6]._id,
      customer: customers[2]._id,
      rating: 5,
      comment: 'Best value bundle I have bought this year.',
      status: 'approved',
      isFeatured: true,
    },
  ]);

  const carts = await Cart.insertMany([
    {
      customer: customers[0]._id,
      items: [{ product: products[1]._id, quantity: 1, price: products[1].price }],
      status: 'abandoned',
      lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      customer: customers[1]._id,
      items: [
        { product: products[0]._id, quantity: 2, price: products[0].price },
        { product: products[1]._id, quantity: 1, price: products[1].price },
      ],
      status: 'abandoned',
      lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  const seedPasswordHash = await bcrypt.hash('seed-placeholder', 10);
  const teamMembers = await TeamMember.insertMany([
    { name: 'Tanvir', email: 'tanvir@piaarya.com', passwordHash: seedPasswordHash, role: 'super_admin' },
    { name: 'Sharan', email: 'sharan@piaarya.com', passwordHash: seedPasswordHash, role: 'manager' },
  ]);

  const wishlistEntries = await Wishlist.insertMany([
    { customer: customers[0]._id, product: products[1]._id },
    { customer: customers[1]._id, product: products[1]._id },
    { customer: customers[1]._id, product: products[0]._id },
  ]);

  console.log(
    `Seeded: ${products.length} products, ${customers.length} customers, ${orders.length} orders, ${reviews.length} reviews, ${transactions.length} payment transactions, ${carts.length} abandoned carts, ${teamMembers.length} team members, ${wishlistEntries.length} wishlist entries`
  );
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
