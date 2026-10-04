const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  reportType: { type: String, enum: ['Debris Intelligence', 'Vessel Risk Intelligence', 'Comprehensive Marine Summary'], required: true },
  generatedAt: { type: Date, default: Date.now },
  summary: {
    totalDebrisPatches: Number,
    highRiskDebris: Number,
    totalVesselsDetected: Number,
    suspiciousVesselsCount: Number
  },
  details: mongoose.Schema.Types.Mixed,
  downloadUrl: String
});

module.exports = mongoose.model('Report', reportSchema);
