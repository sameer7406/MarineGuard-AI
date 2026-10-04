const axios = require('axios');
const { FASTAPI_URL } = require('../config/env');

const client = axios.create({
  baseURL: FASTAPI_URL,
  timeout: 10000
});

const detectDebrisML = async (payload) => {
  try {
    const res = await client.post('/ml/debris/detect', payload);
    return res.data;
  } catch (err) {
    console.warn(`[FASTAPI CLIENT] ML endpoint unreachable (${err.message}). Returning formatted inference.`);
    return null;
  }
};

const predictDebrisTrajectoryML = async (payload) => {
  try {
    const res = await client.post('/ml/debris/predict', payload);
    return res.data;
  } catch (err) {
    console.warn(`[FASTAPI CLIENT] Prediction endpoint fallback: ${err.message}`);
    return null;
  }
};

const calculateDebrisRiskML = async (payload) => {
  try {
    const res = await client.post('/ml/debris/risk', payload);
    return res.data;
  } catch (err) {
    console.warn(`[FASTAPI CLIENT] Risk calculation fallback: ${err.message}`);
    return null;
  }
};

const detectVesselsML = async (payload) => {
  try {
    const res = await client.post('/ml/vessel/detect', payload);
    return res.data;
  } catch (err) {
    console.warn(`[FASTAPI CLIENT] Vessel detection fallback: ${err.message}`);
    return null;
  }
};

module.exports = {
  detectDebrisML,
  predictDebrisTrajectoryML,
  calculateDebrisRiskML,
  detectVesselsML
};
