require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

async function seed() {
  await connectDB();

  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Customer.deleteMany({}),
    Order.deleteMany({}),
  ]);

  const category = await Category.create({ name: 'Apparel', slug: 'apparel' });

  const products = await Product.insertMany([
    { name: 'Classic T-Shirt', slug: 'classic-t-shirt', sku: 'TSHIRT-001', category: category._id, price: 499, stock: 100 },
    { name: 'Denim Jacket', slug: 'denim-jacket', sku: 'JACKET-001', category: category._id, price: 1999, stock: 40 },
  ]);

  const customers = await Customer.insertMany([
    { name: 'Aditi Sharma', email: 'aditi@example.com', passwordHash: 'seed-placeholder' },
    { name: 'Rahul Verma', email: 'rahul@example.com', passwordHash: 'seed-placeholder' },
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

  await Order.insertMany(orders);

  console.log(`Seeded: ${products.length} products, ${customers.length} customers, ${orders.length} orders`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
