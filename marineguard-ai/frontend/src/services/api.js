import axios from 'axios';

const API_BASE = '/api';

export const fetchDashboardStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/stats`);
    return res.data;
  } catch (err) {
    console.warn('Dashboard stats fallback:', err);
    return {
      summary: {
        activeDebrisPatches: 24,
        highRiskDebrisPatches: 7,
        totalDebrisAreaM2: 48250.0,
        vesselsDetectedCount: 18,
        suspiciousVesselsCount: 4
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
      ]
    };
  }
};

export const fetchDebrisDetections = async (filters = {}) => {
  try {
    const res = await axios.get(`${API_BASE}/debris`, { params: filters });
    return res.data;
  } catch (err) {
    console.warn('Debris fetch fallback:', err);
    return { count: 0, data: [] };
  }
};

export const triggerDebrisDetection = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE}/debris/detect`, payload);
    return res.data;
  } catch (err) {
    console.error('Debris detect error:', err);
    throw err;
  }
};

export const calculateDebrisRisk = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE}/debris/risk`, payload);
    return res.data;
  } catch (err) {
    console.error('Risk score error:', err);
    throw err;
  }
};

export const predictDebrisMovement = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE}/debris/predict`, payload);
    return res.data;
  } catch (err) {
    console.error('Trajectory prediction error:', err);
    throw err;
  }
};

export const fetchVessels = async (filters = {}) => {
  try {
    const res = await axios.get(`${API_BASE}/vessels`, { params: filters });
    return res.data;
  } catch (err) {
    console.warn('Vessels fetch fallback:', err);
    return { count: 0, data: [] };
  }
};

export const detectVessel = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE}/vessels/detect`, payload);
    return res.data;
  } catch (err) {
    console.error('Vessel detect error:', err);
    throw err;
  }
};

export const generateIntelligenceReport = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE}/reports/generate`, payload);
    return res.data;
  } catch (err) {
    console.error('Report generation error:', err);
    throw err;
  }
};
