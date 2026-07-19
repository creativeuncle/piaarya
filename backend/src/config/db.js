const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/piaarya';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
  console.log('MongoDB connected');
}

module.exports = connectDB;
