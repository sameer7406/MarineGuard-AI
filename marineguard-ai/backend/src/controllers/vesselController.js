const fs = require('fs');
const path = require('path');
const VesselDetection = require('../models/VesselDetection');
const { detectVesselsML } = require('../services/fastapiClient');
const { isDBConnected } = require('../config/db');

const SAMPLE_VESSEL_PATH = path.join(__dirname, '../../../data/sample/initial_vessels_samples.json');

const getSampleVessels = () => {
  if (fs.existsSync(SAMPLE_VESSEL_PATH)) {
    return JSON.parse(fs.readFileSync(SAMPLE_VESSEL_PATH, 'utf-8'));
  }
  return [
    {
      vesselId: 'VESSEL_X904_FLAGGED',
      timestamp: new Date().toISOString(),
      latitude: 18.5500,
      longitude: 72.8500,
      vesselType: 'Suspicious/Unclassified',
      confidence: 0.88,
      aisStatus: 'Missing',
      speedKnots: 0.8,
      headingDegrees: 140.0,
      riskScore: 85.0,
      riskLevel: 'HIGH RISK',
      insideProtectedZone: true,
      riskFactors: [
        'Unidentified visual profile absent from standard vessel registry',
        'AIS transponder signal gap or unexpected transmission failure',
        'Vessel operating within designated Marine Protected Area (MPA) boundary',
        'Unusual loitering or stationary drift pattern in regulated waters'
      ],
      verificationStatus: 'Requires Verification'
    }
  ];
};

let inMemoryVesselsStore = getSampleVessels();

const getVesselList = async (req, res) => {
  const { riskLevel, aisStatus } = req.query;

  if (isDBConnected()) {
    try {
      let query = {};
      if (riskLevel) query.riskLevel = riskLevel.toUpperCase();
      if (aisStatus) query.aisStatus = aisStatus;

      const docs = await VesselDetection.find(query);
      if (docs && docs.length > 0) return res.json({ count: docs.length, data: docs });
    } catch (err) {}
  }

  let filtered = [...inMemoryVesselsStore];
  if (riskLevel) {
    filtered = filtered.filter(v => v.riskLevel.toUpperCase().includes(riskLevel.toUpperCase()));
  }
  if (aisStatus) {
    filtered = filtered.filter(v => v.aisStatus.toLowerCase() === aisStatus.toLowerCase());
  }

  return res.json({ count: filtered.length, data: filtered, source: 'DEMO DATA' });
};

const getVesselById = async (req, res) => {
  const { id } = req.params;

  if (isDBConnected()) {
    try {
      const doc = await VesselDetection.findOne({ vesselId: id });
      if (doc) return res.json(doc);
    } catch (err) {}
  }

  const found = inMemoryVesselsStore.find(v => v.vesselId === id);
  if (found) return res.json(found);

  return res.status(404).json({ error: 'Vessel record not found.' });
};

const detectVessel = async (req, res) => {
  const { latitude, longitude, ais_status, speed_knots, loitering_detected } = req.body;
  const lat = latitude ? parseFloat(latitude) : 18.5500;
  const lon = longitude ? parseFloat(longitude) : 72.8500;

  const mlRes = await detectVesselsML({
    latitude: lat,
    longitude: lon,
    ais_status: ais_status || undefined,
    speed_knots: speed_knots !== undefined ? parseFloat(speed_knots) : undefined,
    loitering_detected: loitering_detected !== undefined ? Boolean(loitering_detected) : undefined
  });

  if (mlRes) {
    const isInsideMPA = mlRes.gis_spatial_analysis ? Boolean(mlRes.gis_spatial_analysis.inside_protected_zone) : false;
    const vDoc = {
      vesselId: mlRes.detection_id || `VESSEL_${Date.now()}`,
      timestamp: new Date().toISOString(),
      latitude: lat,
      longitude: lon,
      vesselType: mlRes.cv_inference.vessel_class,
      confidence: mlRes.cv_inference.confidence,
      aisStatus: ais_status || mlRes.ais_status || (mlRes.risk_assessment.risk_factors.some(f => f.includes('AIS')) ? 'Missing' : 'Active'),
      speedKnots: speed_knots !== undefined ? parseFloat(speed_knots) : (mlRes.speed_knots ?? (isInsideMPA ? 0.8 : 12.4)),
      headingDegrees: 140.0,
      riskScore: mlRes.risk_assessment.vessel_risk_score,
      riskLevel: mlRes.risk_assessment.risk_level,
      insideProtectedZone: isInsideMPA,
      riskFactors: mlRes.risk_assessment.risk_factors,
      verificationStatus: mlRes.risk_assessment.risk_level === 'HIGH RISK' ? 'Requires Verification' : 'Verified Standard Vessel'
    };

    try {
      if (isDBConnected()) {
        await VesselDetection.create(vDoc);
      } else {
        inMemoryVesselsStore.unshift(vDoc);
      }
    } catch (e) {
      inMemoryVesselsStore.unshift(vDoc);
    }
    return res.status(201).json({ status: 'SUCCESS', vessel: vDoc });
  }

  // Fallback demo vessel detection
  const demoIsInsideMPA = (lat >= 18.4 && lat <= 18.75 && lon >= 72.7 && lon <= 73.1);
  const demoVessel = {
    vesselId: `VESSEL_DETECTED_${Math.floor(lat*100)}_${Math.floor(lon*100)}`,
    timestamp: new Date().toISOString(),
    latitude: lat,
    longitude: lon,
    vesselType: 'Suspicious/Unclassified',
    confidence: 0.89,
    aisStatus: ais_status || (demoIsInsideMPA ? 'Missing' : 'Active'),
    speedKnots: speed_knots !== undefined ? parseFloat(speed_knots) : (demoIsInsideMPA ? 0.8 : 12.0),
    headingDegrees: 120.0,
    riskScore: demoIsInsideMPA ? 82.0 : 45.0,
    riskLevel: demoIsInsideMPA ? 'HIGH RISK' : 'MEDIUM RISK',
    insideProtectedZone: demoIsInsideMPA,
    riskFactors: demoIsInsideMPA ? [
      'Unidentified visual profile absent from standard vessel registry',
      'AIS transponder signal gap or unexpected transmission failure',
      'Vessel operating within designated Marine Protected Area (MPA) boundary'
    ] : [
      'Unidentified visual profile absent from standard vessel registry'
    ],
    verificationStatus: 'Requires Verification'
  };

  inMemoryVesselsStore.unshift(demoVessel);
  return res.status(201).json({ status: 'SUCCESS', vessel: demoVessel });
};

module.exports = {
  getVesselList,
  getVesselById,
  detectVessel
};
