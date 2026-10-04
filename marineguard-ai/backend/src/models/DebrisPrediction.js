const mongoose = require('mongoose');

const debrisPredictionSchema = new mongoose.Schema({
  debrisId: { type: String, required: true },
  startLocation: [Number], // [lat, lon]
  trajectory: [{
    horizon_hours: Number,
    latitude: Number,
    longitude: Number,
    cumulative_distance_km: Number,
    step_name: String
  }],
  modelVersion: { type: String, default: 'GradientBoosting_Drift_v1.0' },
  predictionError: { type: Number, default: 1.42 }, // MAE in km
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DebrisPrediction', debrisPredictionSchema);
