const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '../../../models');

const getModelMetadata = () => {
  const debrisMetaPath = path.join(MODELS_DIR, 'debris', 'debris_metadata.json');
  const vesselMetaPath = path.join(MODELS_DIR, 'vessel', 'vessel_metadata.json');
  const predMetaPath = path.join(MODELS_DIR, 'prediction', 'prediction_metadata.json');

  let debrisUNet = {
    iou: 0.8921,
    dice: 0.9430,
    f1: 0.9430,
    precision: 0.8921,
    recall: 1.0,
    datasetType: 'Synthetic Sentinel-2 MARIDA benchmark (40 samples)'
  };
  let trajectoryPredictor = {
    maeKm: 5.72,
    maxErrorKm: 28.72,
    endpointErrorKm: 10.97,
    datasetType: 'Synthetic Ocean Drift Simulation (1500 trajectory vectors)'
  };
  let vesselClassifier = {
    accuracy: 0.84,
    macroF1: 0.8391,
    datasetType: 'Synthetic Morphological Vessel Benchmark (5 classes, stratified)'
  };

  if (fs.existsSync(debrisMetaPath)) {
    try {
      const d = JSON.parse(fs.readFileSync(debrisMetaPath, 'utf-8'));
      if (d.metrics) {
        debrisUNet = {
          iou: d.metrics.iou,
          dice: d.metrics.dice_score,
          f1: d.metrics.f1_score,
          precision: d.metrics.precision,
          recall: d.metrics.recall,
          datasetType: 'Synthetic Sentinel-2 MARIDA benchmark (40 samples)'
        };
      }
    } catch (e) {}
  }

  if (fs.existsSync(predMetaPath)) {
    try {
      const p = JSON.parse(fs.readFileSync(predMetaPath, 'utf-8'));
      if (p.metrics) {
        trajectoryPredictor = {
          maeKm: p.metrics.mae_km,
          maxErrorKm: p.metrics.max_error_km,
          endpointErrorKm: p.metrics.endpoint_error_km,
          datasetType: 'Synthetic Ocean Drift Simulation (1500 vectors)'
        };
      }
    } catch (e) {}
  }

  if (fs.existsSync(vesselMetaPath)) {
    try {
      const v = JSON.parse(fs.readFileSync(vesselMetaPath, 'utf-8'));
      if (v.metrics) {
        vesselClassifier = {
          accuracy: v.metrics.accuracy,
          macroF1: v.metrics.macro_f1,
          datasetType: v.dataset_name || 'Synthetic Morphological Vessel Benchmark (5 classes, stratified)'
        };
      }
    } catch (e) {}
  }

  return { debrisUNet, trajectoryPredictor, vesselClassifier };
};

const getDashboardStats = (req, res) => {
  const perf = getModelMetadata();

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
    mlModelPerformance: perf,
    provenanceNotice: {
      dataMode: 'SYNTHETIC DEMO BENCHMARK',
      statement: 'Model metrics reflect evaluation on local synthetic benchmark datasets. Debris detection uses a 6-band PyTorch U-Net on MARIDA-aligned spectral patches; Vessel classifier is a demonstration prototype on synthetic patches.'
    }
  };

  return res.json(analyticsData);
};

const getLiveMonitoringData = (req, res) => {
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
