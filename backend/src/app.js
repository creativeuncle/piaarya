const express = require('express');
const cors = require('cors');
const dashboardRoutes = require('./routes/dashboardRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const customerRoutes = require('./routes/customerRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const returnRoutes = require('./routes/returnRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const teamRoutes = require('./routes/teamRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const navigationRoutes = require('./routes/navigationRoutes');
const authRoutes = require('./routes/authRoutes');
const meRoutes = require('./routes/meRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const pageRoutes = require('./routes/pageRoutes');
const errorHandler = require('./middleware/errorHandler');
const { UPLOAD_DIR } = require('./middleware/upload');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pages', pageRoutes);

app.use(errorHandler);

module.exports = app;
