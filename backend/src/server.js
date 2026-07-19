require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection failed, starting server without DB:', err.message);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
