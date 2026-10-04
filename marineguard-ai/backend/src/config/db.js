const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`[DATABASE] Local MongoDB connection skipped (${err.message}). System operating in hybrid memory-persistent mode.`);
    return false;
  }
};

module.exports = connectDB;
