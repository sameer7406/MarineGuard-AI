import React, { useState } from 'react';
import BeforeAfterViewer from '../components/BeforeAfterViewer';
import RiskWeightControls from '../components/RiskWeightControls';
import RiskBadge from '../components/RiskBadge';
import MetricsDisplay from '../components/MetricsDisplay';
import { triggerDebrisDetection, calculateDebrisRisk } from '../services/api';
import { Compass, Upload, Play, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { formatCoordinates, formatArea } from '../services/mapUtils';

const DebrisAnalysisPage = ({ onOpenReport }) => {
  const [lat, setLat] = useState('18.5230');
  const [lon, setLon] = useState('72.9100');
  const [loading, setLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [weights, setWeights] = useState({
    w_area: 0.25,
    w_eco: 0.30,
    w_coast: 0.20,
    w_exposure: 0.15,
    w_conf: 0.10
  });

  const handleRunDetection = async () => {
    setLoading(true);
    try {
      const res = await triggerDebrisDetection({
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        tile_id: 'S2B_MSIL1C_20261004T054500'
      });
      setDetectionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateRisk = async () => {
    if (!detectionResult || !detectionResult.detections?.[0]) return;
    const det = detectionResult.detections[0];
    try {
      const riskRes = await calculateDebrisRisk({
        estimated_area_m2: det.estimated_area_m2,
        coastal_distance_km: 12.5,
        protected_zone_distance_km: 8.0,
        predicted_exposure_km: 15.0,
        confidence: det.confidence,
        weights: weights
      });
      
      const updated = { ...detectionResult };
      updated.detections[0].risk_score = riskRes.risk_score;
      updated.detections[0].priority = riskRes.priority;
      updated.detections[0].risk_breakdown = riskRes.score_breakdown;
      setDetectionResult(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const activeDet = detectionResult?.detections?.[0];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Sentinel-2 Debris Detection Pipeline</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Multispectral PyTorch U-Net Segmentation & Relative Environmental Risk Scoring
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Controls & Parameter Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
              Region of Interest (ROI) & Imagery Input
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">LATITUDE (°N)</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-ocean-950 border border-cyan-500/30 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">LONGITUDE (°E)</label>
                <input
                  type="text"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full bg-ocean-950 border border-cyan-500/30 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-ocean-950/60 border border-cyan-500/10 text-xs font-mono text-slate-300 space-y-1">
              <span className="text-cyan-400 font-bold block">SATELLITE CONSTELATION</span>
              <p className="text-[11px] text-slate-400">Sentinel-2B MSI (Tile: S2B_MSIL1C_20261004T054500)</p>
            </div>

            <button
              onClick={handleRunDetection}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-ocean-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{loading ? 'Running PyTorch Model Inference...' : 'Execute Debris Detection'}</span>
            </button>
          </div>

          {/* Configurable Risk Weights */}
          <RiskWeightControls
            weights={weights}
            onChange={setWeights}
            onRecalculate={handleRecalculateRisk}
          />
        </div>

        {/* Right Inference & Overlay Display Panel (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <BeforeAfterViewer diagnostics={detectionResult?.diagnostics} />

          {/* Detection Results Breakdown Card */}
          {activeDet ? (
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div>
                  <span className="font-mono text-xs text-cyan-400 font-bold">{activeDet.detection_id}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">Multispectral Floating Plastic Detection</h3>
                </div>
                <RiskBadge priority={activeDet.priority} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono p-3 rounded-xl bg-ocean-950/80 border border-cyan-500/10">
                <div>
                  <span className="text-slate-400 text-[10px] block">LOCATION</span>
                  <span className="text-white font-bold">{formatCoordinates(activeDet.latitude, activeDet.longitude)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">ESTIMATED AREA</span>
                  <span className="text-cyan-300 font-bold">{formatArea(activeDet.estimated_area_m2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">MODEL CONFIDENCE</span>
                  <span className="text-emerald-400 font-bold">{(activeDet.confidence * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">RELATIVE RISK SCORE</span>
                  <span className="text-amber-400 font-bold">{activeDet.risk_score} / 100</span>
                </div>
              </div>

              {/* Risk Breakdown Component Bar */}
              {activeDet.risk_breakdown && (
                <div className="space-y-2 font-mono text-xs pt-2">
                  <span className="text-cyan-300 font-bold block">RISK FACTOR BREAKDOWN:</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-300">
                    <div className="bg-ocean-950 p-2 rounded border border-cyan-500/10">Area Score: <b className="text-cyan-400">{activeDet.risk_breakdown.area_score}</b></div>
                    <div className="bg-ocean-950 p-2 rounded border border-cyan-500/10">MPA Eco Proximity: <b className="text-cyan-400">{activeDet.risk_breakdown.ecological_proximity_score}</b></div>
                    <div className="bg-ocean-950 p-2 rounded border border-cyan-500/10">Coastal Proximity: <b className="text-cyan-400">{activeDet.risk_breakdown.coastal_proximity_score}</b></div>
                    <div className="bg-ocean-950 p-2 rounded border border-cyan-500/10">Confidence Score: <b className="text-cyan-400">{activeDet.risk_breakdown.confidence_score}</b></div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => onOpenReport && onOpenReport(activeDet.detection_id)}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/30 hover:from-cyan-500/30 text-cyan-300 text-xs font-mono font-bold border border-cyan-400/30 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Debris Intelligence Report</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-cyan-500/20 text-center font-mono text-xs text-slate-400">
              Click <b className="text-cyan-400">"Execute Debris Detection"</b> to process Sentinel-2 multispectral imagery through the PyTorch U-Net model.
            </div>
          )}
        </div>

      </div>

      <MetricsDisplay />
    </div>
  );
};

export default DebrisAnalysisPage;
