const express = require('express');
const router = express.Router();
const { getLiveMonitoringData } = require('../controllers/analyticsController');

router.get('/live', getLiveMonitoringData);

module.exports = router;
