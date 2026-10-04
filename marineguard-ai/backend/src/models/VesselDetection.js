const mongoose = require('mongoose');

const vesselDetectionSchema = new mongoose.Schema({
  vesselId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  vesselType: { type: String, required: true },
  confidence: { type: Number, required: true },
  aisStatus: { type: String, enum: ['Active', 'Missing', 'Gap', 'Offline', 'Spoofed'], default: 'Active' },
  speedKnots: { type: Number, default: 0.0 },
  headingDegrees: { type: Number, default: 0.0 },
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, enum: ['HIGH RISK', 'MEDIUM RISK', 'LOW RISK'], required: true },
  insideProtectedZone: { type: Boolean, default: false },
  riskFactors: [String],
  verificationStatus: { type: String, default: 'Requires Verification' },
  isDemo: { type: Boolean, default: true }
});

module.exports = mongoose.model('VesselDetection', vesselDetectionSchema);
