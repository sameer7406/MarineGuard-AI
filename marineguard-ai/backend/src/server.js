const app = require('./app');
const { connectDB } = require('./config/db');
const { PORT } = require('./config/env');

// Start server regardless of MongoDB availability.
// connectDB() returns false (not throws) when MongoDB is offline.
// All controllers have isDBConnected() guards + in-memory fallback.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[SERVER] MarineGuard AI Node.js Express server running on port ${PORT}`);
  });
});
