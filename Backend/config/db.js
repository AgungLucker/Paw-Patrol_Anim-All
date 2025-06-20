// backend/config/db.js
const mongoose = require('mongoose');

let cachedDB = null;
const connectDB = async () => {
  if (cachedDB && mongoose.connection.readyState == 1) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const db = await  mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    cachedDB = db;
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;