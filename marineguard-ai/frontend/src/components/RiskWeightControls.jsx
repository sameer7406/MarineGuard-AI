import React, { useState } from 'react';
import { Sliders, RotateCcw } from 'lucide-react';

const DEFAULT_WEIGHTS = {
  w_area: 0.25,
  w_eco: 0.30,
  w_coast: 0.20,
  w_exposure: 0.15,
  w_conf: 0.10
};

const RiskWeightControls = ({ weights, onChange, onRecalculate }) => {
  const currentWeights = weights || DEFAULT_WEIGHTS;

  const handleSliderChange = (key, val) => {
    const newWeights = { ...currentWeights, [key]: parseFloat(val) };
    onChange(newWeights);
  };

  const handleReset = () => {
    onChange(DEFAULT_WEIGHTS);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
            Configurable Relative Risk Matrix
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Weights</span>
        </button>
      </div>

      <div className="space-y-4 text-xs font-mono">
        <div>
          <div className="flex justify-between mb-1 text-slate-300">
            <span>Debris Estimated Area Weight (w1)</span>
            <span className="text-cyan-400 font-bold">{(currentWeights.w_area * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={currentWeights.w_area}
            onChange={(e) => handleSliderChange('w_area', e.target.value)}
            className="w-full accent-cyan-400 bg-ocean-950 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 text-slate-300">
            <span>Ecological / MPA Proximity Weight (w2)</span>
            <span className="text-cyan-400 font-bold">{(currentWeights.w_eco * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={currentWeights.w_eco}
            onChange={(e) => handleSliderChange('w_eco', e.target.value)}
            className="w-full accent-cyan-400 bg-ocean-950 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 text-slate-300">
            <span>Coastal Distance Weight (w3)</span>
            <span className="text-cyan-400 font-bold">{(currentWeights.w_coast * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={currentWeights.w_coast}
            onChange={(e) => handleSliderChange('w_coast', e.target.value)}
            className="w-full accent-cyan-400 bg-ocean-950 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 text-slate-300">
            <span>Predicted Drift Exposure Horizon (w4)</span>
            <span className="text-cyan-400 font-bold">{(currentWeights.w_exposure * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={currentWeights.w_exposure}
            onChange={(e) => handleSliderChange('w_exposure', e.target.value)}
            className="w-full accent-cyan-400 bg-ocean-950 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 text-slate-300">
            <span>Detection Confidence Weight (w5)</span>
            <span className="text-cyan-400 font-bold">{(currentWeights.w_conf * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={currentWeights.w_conf}
            onChange={(e) => handleSliderChange('w_conf', e.target.value)}
            className="w-full accent-cyan-400 bg-ocean-950 rounded cursor-pointer"
          />
        </div>
      </div>

      <button
        onClick={onRecalculate}
        className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-ocean-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
      >
        Recalculate Relative Environmental Risk
      </button>
    </div>
  );
};

export default RiskWeightControls;
