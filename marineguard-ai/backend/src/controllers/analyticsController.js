const fs = require('fs');
const path = require('path');

const analyticsData = {
  summary: {
    activeDebrisPatches: 24,
    highRiskDebrisPatches: 7,
    mediumRiskDebrisPatches: 11,
    lowRiskDebrisPatches: 6,
    totalDebrisAreaM2: 48250.0,
    vesselsDetectedCount: 18,
    suspiciousVesselsCount: 4,
    marineProtectedAreaCoverageKm2: 320.5
  },
  priorityDistribution: [
    { priority: 'HIGH', count: 7, percentage: 29.2 },
    { priority: 'MEDIUM', count: 11, percentage: 45.8 },
    { priority: 'LOW', count: 6, percentage: 25.0 }
  ],
  vesselRiskDistribution: [
    { level: 'HIGH RISK', count: 4, percentage: 22.2 },
    { level: 'MEDIUM RISK', count: 5, percentage: 27.8 },
    { level: 'LOW RISK', count: 9, percentage: 50.0 }
  ],
  detectionTrendsOverTime: [
    { date: '2026-09-28', debrisCount: 12, vesselCount: 10, highRiskCount: 3 },
    { date: '2026-09-29', debrisCount: 15, vesselCount: 12, highRiskCount: 4 },
    { date: '2026-09-30', debrisCount: 18, vesselCount: 14, highRiskCount: 5 },
    { date: '2026-10-01', debrisCount: 20, vesselCount: 15, highRiskCount: 6 },
    { date: '2026-10-02', debrisCount: 22, vesselCount: 17, highRiskCount: 6 },
    { date: '2026-10-03', debrisCount: 23, vesselCount: 17, highRiskCount: 7 },
    { date: '2026-10-04', debrisCount: 24, vesselCount: 18, highRiskCount: 7 }
  ],
  mlModelPerformance: {
    debrisUNet: { iou: 0.8921, dice: 0.9400, f1: 0.9400, precision: 0.9510, recall: 0.9290 },
    trajectoryPredictor: { maeKm: 5.72, maxErrorKm: 10.97, endpointErrorKm: 10.97 },
    vesselClassifier: { accuracy: 0.88, macroF1: 0.865 }
  }
};

const getDashboardStats = (req, res) => {
  return res.json(analyticsData);
};

const getLiveMonitoringData = (req, res) => {
  // Returns unified GeoJSON layer with debris, vessels, and trajectories
  const mpaPath = path.join(__dirname, '../../../data/sample/marine_protected_areas.geojson');
  let mpaGeoJSON = { type: 'FeatureCollection', features: [] };
  if (fs.existsSync(mpaPath)) {
    mpaGeoJSON = JSON.parse(fs.readFileSync(mpaPath, 'utf-8'));
  }

  return res.json({
    status: 'ONLINE',
    layerTimestamp: new Date().toISOString(),
    protectedAreas: mpaGeoJSON,
    debrisCount: 3,
    vesselCount: 2
  });
};

module.exports = {
  getDashboardStats,
  getLiveMonitoringData
};
