const express = require('express');
const router = express.Router();
const { getDebrisList, getDebrisById, detectDebris, calculateRisk, predictMovement } = require('../controllers/debrisController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getDebrisList);
router.get('/:id', getDebrisById);
router.post('/detect', protect, detectDebris);
router.post('/risk', protect, calculateRisk);
router.post('/predict', protect, predictMovement);

module.exports = router;
