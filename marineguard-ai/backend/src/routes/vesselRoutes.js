const express = require('express');
const router = express.Router();
const { getVesselList, getVesselById, detectVessel } = require('../controllers/vesselController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getVesselList);
router.get('/:id', getVesselById);
router.post('/detect', protect, detectVessel);

module.exports = router;
