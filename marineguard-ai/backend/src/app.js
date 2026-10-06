const express = require('express');
const cors = require('cors');
const axios = require('axios');
const authRoutes = require('./routes/authRoutes');
const debrisRoutes = require('./routes/debrisRoutes');
const vesselRoutes = require('./routes/vesselRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const { isDBConnected } = require('./config/db');
const { FASTAPI_URL } = require('./config/env');

const app = express();

app.use(cors());
app.use(express.json());

// API Health Check with Database and FastAPI Upstream Status
app.get('/api/health', async (req, res) => {
  const dbConnected = isDBConnected();
  let fastApiStatus = 'UNREACHABLE';
  let fastApiDetails = null;

  try {
    const mlHealth = await axios.get(`${FASTAPI_URL}/health`, { timeout: 1500 });
    if (mlHealth.status === 200) {
      fastApiStatus = 'ONLINE';
      fastApiDetails = mlHealth.data;
    }
  } catch (e) {
    fastApiStatus = 'OFFLINE';
  }

  res.json({
    status: 'ONLINE',
    service: 'MarineGuard AI - Node.js Express Core API Gateway',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnected,
      status: dbConnected ? 'CONNECTED' : 'OFFLINE',
      mode: dbConnected ? 'PERSISTENT_MONGODB' : 'IN_MEMORY_DEMO_STORE',
      fallbackActive: !dbConnected
    },
    upstreamServices: {
      fastapiML: {
        url: FASTAPI_URL,
        status: fastApiStatus,
        modelsLoaded: fastApiDetails ? fastApiDetails.models : null
      }
    }
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
