const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

// Disable command buffering so queries fail fast if DB is offline instead of hanging for 30s
mongoose.set('bufferCommands', false);

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500
    });
    isConnected = true;
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`[DATABASE] Local MongoDB offline (${err.message}). Instant memory demo fallback active.`);
    return false;
  }
};

const isDBConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDBConnected };
