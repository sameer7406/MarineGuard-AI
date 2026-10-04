const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const debrisRoutes = require('./routes/debrisRoutes');
const vesselRoutes = require('./routes/vesselRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'MarineGuard AI - Node.js Express Core API Gateway',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/debris', debrisRoutes);
app.use('/api/vessels', vesselRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/dashboard', analyticsRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorHandler);

module.exports = app;
