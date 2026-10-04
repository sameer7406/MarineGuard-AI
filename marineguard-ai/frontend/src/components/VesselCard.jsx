import React from 'react';
import RiskBadge from './RiskBadge';
import { formatCoordinates } from '../services/mapUtils';
import { Ship, Radio, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

const VesselCard = ({ vessel, onSelect }) => {
  const isHighRisk = vessel.riskLevel === 'HIGH RISK' || vessel.riskScore >= 70;

  return (
    <div className={`glass-panel rounded-xl p-4 transition-all duration-300 group border ${
      isHighRisk ? 'border-red-500/40 bg-red-950/10' : 'border-cyan-500/20'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Ship className={`w-4 h-4 ${isHighRisk ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className="font-mono text-xs font-bold text-slate-100">{vessel.vesselId}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">Class: {vessel.vesselType}</span>
        </div>
        <RiskBadge priority={vessel.riskLevel} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono my-3 p-2.5 rounded-lg bg-ocean-950/60 border border-cyan-500/10">
        <div>
          <span className="text-slate-400 text-[10px] block">LOCATION</span>
          <span className="text-slate-200 font-semibold">{formatCoordinates(vessel.latitude, vessel.longitude)}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">AIS TELEMETRY</span>
          <span className={`font-semibold ${vessel.aisStatus === 'Active' ? 'text-emerald-400' : 'text-red-400 font-bold'}`}>
            {vessel.aisStatus} {vessel.aisStatus !== 'Active' && '⚠️'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">CV CONFIDENCE</span>
          <span className="text-cyan-300 font-semibold">{(vessel.confidence * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">VESSEL RISK</span>
          <span className="text-red-400 font-bold">{vessel.riskScore} / 100</span>
        </div>
      </div>

      {vessel.riskFactors && vessel.riskFactors.length > 0 && (
        <div className="my-2.5 p-2 rounded-lg bg-red-950/20 border border-red-500/20">
          <span className="text-[10px] text-red-300 font-mono font-bold block mb-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-400" />
            SUSPICION RISK FACTORS:
          </span>
          <ul className="space-y-1">
            {vessel.riskFactors.map((factor, idx) => (
              <li key={idx} className="text-[10px] text-red-200/80 font-mono flex items-start gap-1">
                <span className="text-red-400">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10 text-[11px] font-mono">
        <span className="text-amber-400/90 font-semibold">{vessel.verificationStatus}</span>
        <button
          onClick={() => onSelect && onSelect(vessel)}
          className="px-3 py-1 rounded bg-ocean-800 hover:bg-ocean-700 text-cyan-300 text-xs font-semibold border border-cyan-500/20 transition-all"
        >
          Inspect Radar
        </button>
      </div>
    </div>
  );
};

export default VesselCard;
