import React from 'react';
import RiskBadge from './RiskBadge';
import { formatCoordinates, formatArea } from '../services/mapUtils';
import { MapPin, Navigation, AlertTriangle, Layers, Calendar } from 'lucide-react';

const DebrisCard = ({ debris, onSelect, onPredict }) => {
  return (
    <div className="glass-panel rounded-xl p-4 hover:border-cyan-400/50 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cyan-400 font-bold">{debris.detectionId}</span>
            {debris.isDemo && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">DEMO DATA</span>
            )}
          </div>
          <p className="text-slate-400 text-[11px] font-mono flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3 text-cyan-400/70" />
            <span>{new Date(debris.timestamp).toLocaleString()}</span>
          </p>
        </div>
        <RiskBadge priority={debris.priority} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono my-3 p-2.5 rounded-lg bg-ocean-950/60 border border-cyan-500/10">
        <div>
          <span className="text-slate-400 text-[10px] block">COORDINATES</span>
          <span className="text-slate-200 font-semibold">{formatCoordinates(debris.latitude, debris.longitude)}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">ESTIMATED AREA</span>
          <span className="text-cyan-300 font-semibold">{formatArea(debris.estimatedArea)}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">DETECTION CONF</span>
          <span className="text-emerald-400 font-semibold">{(debris.confidence * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">RISK SCORE</span>
          <span className="text-amber-400 font-bold">{debris.riskScore} / 100</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-cyan-500/10">
        <button
          onClick={() => onSelect && onSelect(debris)}
          className="flex-1 py-1.5 px-3 rounded-lg bg-ocean-800/80 hover:bg-ocean-700 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-cyan-500/20 transition-all"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Locate</span>
        </button>
        <button
          onClick={() => onPredict && onPredict(debris)}
          className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/30 hover:from-cyan-500/30 hover:to-blue-600/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-cyan-400/40 transition-all"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Predict Drift</span>
        </button>
      </div>
    </div>
  );
};

export default DebrisCard;
