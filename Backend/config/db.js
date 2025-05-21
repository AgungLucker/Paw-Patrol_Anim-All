// backend/config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Pastikan dotenv dipanggil untuk membaca variabel lingkungan

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Opsi serverApi yang Anda lihat di kode driver native juga bisa ditambahkan di sini,
      // tetapi Mongoose biasanya menanganinya secara internal atau melalui opsi yang lebih tinggi.
      // Jika Anda ingin spesifik, Anda bisa menambahkan:
      // serverApi: ServerApiVersion.v1 // Perlu import ServerApiVersion dari 'mongodb' jika dipakai di sini
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;