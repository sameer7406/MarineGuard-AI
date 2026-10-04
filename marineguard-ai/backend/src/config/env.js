const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  FASTAPI_URL: process.env.FASTAPI_URL || 'http://localhost:8000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/marineguard_db',
  JWT_SECRET: process.env.JWT_SECRET || 'marineguard_super_secret_jwt_key_2026',
  DEMO_MODE: process.env.DEMO_MODE === 'true' || true
};
