const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[SERVER] MarineGuard AI Node.js Express server running on port ${PORT}`);
  });
});
