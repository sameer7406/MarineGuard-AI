const mongoose = require('mongoose');

const debrisDetectionSchema = new mongoose.Schema({
  detectionId: { type: String, required: true, unique: true },
  imageId: { type: String, default: 'S2B_MSIL1C_20261004T054500' },
  timestamp: { type: Date, default: Date.now },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  estimatedArea: { type: Number, required: true }, // in m^2
  confidence: { type: Number, required: true }, // 0 - 1
  riskScore: { type: Number, required: true }, // 0 - 100
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
  geometry: {
    type: { type: String, default: 'Polygon' },
    coordinates: [[[Number]]]
  },
  spectralIndices: {
    fdi: Number,
    ndwi: Number,
    ndvi: Number
  },
  modelVersion: { type: String, default: 'DebrisUNet_v1.0' },
  isDemo: { type: Boolean, default: true }
});

module.exports = mongoose.model('DebrisDetection', debrisDetectionSchema);
