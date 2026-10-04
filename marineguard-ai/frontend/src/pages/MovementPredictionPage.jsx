import React, { useState } from 'react';
import InteractiveMap from '../maps/InteractiveMap';
import { predictDebrisMovement } from '../services/api';
import { Activity, Navigation, Wind, Waves, Clock, AlertTriangle } from 'lucide-react';
import { formatCoordinates } from '../services/mapUtils';

const MovementPredictionPage = ({ selectedDebris, mpaPolygons }) => {
  const [lat, setLat] = useState(selectedDebris?.latitude ? String(selectedDebris.latitude) : '18.5230');
  const [lon, setLon] = useState(selectedDebris?.longitude ? String(selectedDebris.longitude) : '72.9100');
  const [horizon, setHorizon] = useState(72);
  const [oceanU, setOceanU] = useState('0.25');
  const [oceanV, setOceanV] = useState('0.15');
  const [windU, setWindU] = useState('4.5');
  const [windV, setWindV] = useState('2.1');
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictDebrisMovement({
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        ocean_u: parseFloat(oceanU),
        ocean_v: parseFloat(oceanV),
        wind_u: parseFloat(windU),
        wind_v: parseFloat(windV),
        time_horizons: [6, 12, 24, 48, 72].filter(h => h <= horizon)
      });
      setPredictionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Debris Route & Movement Trajectory Predictor</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Multi-Horizon Advection-Diffusion Vector Model & Gradient Boosting Drift Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs & Parameters Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
              Drift Horizon & Environmental Parameters
            </h3>

            {/* Time Horizon Selector */}
            <div>
              <label className="text-slate-400 font-mono text-xs block mb-2">PREDICTION TIME HORIZON</label>
              <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                {[6, 12, 24, 48, 72].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      horizon === h
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                        : 'bg-ocean-950 text-slate-400 hover:text-white border border-cyan-500/10'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinates */}
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

            {/* Ocean Current Vectors */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Waves className="w-3 h-3 text-cyan-400" /> OCEAN U (m/s)
                </label>
                <input
                  type="text"
                  value={oceanU}
                  onChange={(e) => setOceanU(e.target.value)}
                  className="w-full bg-ocean-950 border border-cyan-500/30 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Waves className="w-3 h-3 text-cyan-400" /> OCEAN V (m/s)
                </label>
                <input
                  type="text"
                  value={oceanV}
                  onChange={(e) => setOceanV(e.target.value)}
                  className="w-full bg-ocean-950 border border-cyan-500/30 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Wind Vectors */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-cyan-400" /> WIND U (m/s)
                </label>
                <input
                  type="text"
                  value={windU}
                  onChange={(e) => setWindU(e.target.value)}
                  className="w-full bg-ocean-950 border border-cyan-500/30 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-cyan-400" /> WIND V (m/s)
                </label>
                <input
                  type="text"
                  value={windV}
                  onChange={(e) => setWindV(e.target.value)}
                  className="w-full bg-ocean-950 border border-cyan-500/30 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-ocean-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>{loading ? 'Simulating Ocean Drift Vectors...' : 'Predict Movement Trajectory'}</span>
            </button>
          </div>
        </div>

        {/* Right Trajectory Map & Step Breakdown (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[480px]">
            <InteractiveMap
              center={[parseFloat(lat), parseFloat(lon)]}
              zoom={10}
              mpaPolygons={mpaPolygons}
              selectedTrajectory={predictionResult}
            />
          </div>

          {/* Trajectory Step Details Table */}
          {predictionResult && (
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 font-mono text-xs">
                <span className="text-cyan-300 font-bold uppercase">PREDICTED DRIFT ROUTE STEPS</span>
                <span className="text-amber-400 font-bold">MAE Metric: {predictionResult.prediction_error_mae_km || 5.72} km</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
                {predictionResult.trajectory.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-ocean-950/80 border border-cyan-500/20 space-y-1">
                    <span className="text-cyan-400 font-bold text-[10px] block">{step.step_name}</span>
                    <span className="text-white font-bold block">{formatCoordinates(step.latitude, step.longitude)}</span>
                    <span className="text-slate-400 text-[10px] block">Dist: {step.cumulative_distance_km} km</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MovementPredictionPage;
