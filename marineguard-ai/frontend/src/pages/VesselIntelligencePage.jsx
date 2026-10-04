import React, { useState, useEffect } from 'react';
import VesselCard from '../components/VesselCard';
import { fetchVessels, detectVessel } from '../services/api';
import { Ship, ShieldAlert, Radio, AlertOctagon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { formatCoordinates } from '../services/mapUtils';

const VesselIntelligencePage = ({ onOpenReport }) => {
  const [vesselList, setVesselList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [selectedVessel, setSelectedVessel] = useState(null);

  const loadVessels = async () => {
    setLoading(true);
    try {
      const res = await fetchVessels(filterRisk !== 'ALL' ? { riskLevel: filterRisk } : {});
      setVesselList(res.data || []);
      if (res.data?.length > 0 && !selectedVessel) {
        setSelectedVessel(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVessels();
  }, [filterRisk]);

  const handleSimulateVesselDetect = async () => {
    setLoading(true);
    try {
      const res = await detectVessel({ latitude: 18.5500, longitude: 72.8500 });
      if (res.vessel) {
        setVesselList([res.vessel, ...vesselList]);
        setSelectedVessel(res.vessel);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-2xl border border-red-500/30 bg-red-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-400">
            <Ship className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Suspicious Marine Vessel Intelligence</h1>
            <p className="text-xs text-red-300/80 font-mono mt-1">
              Visual Satellite Computer Vision Cross-Referenced against AIS Telemetry & Behavioral Anomaly Engine
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateVesselDetect}
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,0,85,0.4)] flex items-center gap-2"
        >
          <Radio className="w-4 h-4" />
          <span>{loading ? 'Scanning Radar...' : 'Scan Radar for Vessels'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vessel Cards Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between p-3 glass-panel rounded-xl border border-cyan-500/20 font-mono text-xs">
            <span className="text-slate-300 font-bold uppercase">FLAGGED MARITIME TARGETS ({vesselList.length})</span>
            <div className="flex gap-1">
              {['ALL', 'HIGH RISK', 'MEDIUM RISK', 'LOW RISK'].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRisk(r)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    filterRisk === r ? 'bg-red-500/20 text-red-300 border border-red-400/30' : 'text-slate-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vesselList.map((v) => (
              <VesselCard
                key={v.vesselId}
                vessel={v}
                onSelect={(target) => setSelectedVessel(target)}
              />
            ))}
          </div>
        </div>

        {/* Selected Vessel Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {selectedVessel ? (
            <div className="glass-panel-glow p-6 rounded-2xl border border-red-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
                <div>
                  <span className="font-mono text-xs text-red-400 font-bold">{selectedVessel.vesselId}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">Maritime Risk & Behavioral Profile</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono font-bold">
                  {selectedVessel.riskLevel}
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-ocean-950/80 border border-cyan-500/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Class:</span>
                    <span className="text-white font-bold">{selectedVessel.vesselType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="text-cyan-300 font-bold">{formatCoordinates(selectedVessel.latitude, selectedVessel.longitude)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">AIS Status:</span>
                    <span className={selectedVessel.aisStatus === 'Active' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {selectedVessel.aisStatus} {selectedVessel.aisStatus !== 'Active' && '⚠️ (Transmission Gap)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MPA Boundary Intrusion:</span>
                    <span className={selectedVessel.insideProtectedZone ? 'text-red-400 font-bold' : 'text-slate-300'}>
                      {selectedVessel.insideProtectedZone ? 'YES (Prohibited Zone)' : 'NO'}
                    </span>
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 space-y-2">
                  <span className="text-red-300 font-bold block flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    RISK FACTORS & BEHAVIORAL ANOMALIES:
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-red-200">
                    {selectedVessel.riskFactors?.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
                  <b>RECOMMENDATION:</b> Requires Secondary Coast Guard / Marine Patrol Verification. Risk flags provide decision support and do not constitute formal legal determination.
                </div>
              </div>

              <button
                onClick={() => onOpenReport && onOpenReport(selectedVessel.vesselId)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,0,85,0.4)]"
              >
                Generate Vessel Intelligence Report
              </button>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-cyan-500/20 text-center font-mono text-xs text-slate-400">
              Select a vessel target to view risk factors and AIS telemetry.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VesselIntelligencePage;
