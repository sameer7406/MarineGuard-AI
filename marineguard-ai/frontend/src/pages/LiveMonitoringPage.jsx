import React, { useState, useEffect } from 'react';
import InteractiveMap from '../maps/InteractiveMap';
import DebrisCard from '../components/DebrisCard';
import VesselCard from '../components/VesselCard';
import { fetchDebrisDetections, fetchVessels } from '../services/api';
import { Filter, Radio, RefreshCw, Shield, Layers } from 'lucide-react';

const LiveMonitoringPage = ({ onPredictDebris, mpaPolygons }) => {
  const [debrisList, setDebrisList] = useState([]);
  const [vesselList, setVesselList] = useState([]);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [activeTab, setActiveTab] = useState('debris'); // 'debris' or 'vessels'
  const [selectedCenter, setSelectedCenter] = useState([18.523, 72.91]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const dRes = await fetchDebrisDetections(filterPriority !== 'ALL' ? { priority: filterPriority } : {});
      const vRes = await fetchVessels();
      setDebrisList(dRes.data || []);
      setVesselList(vRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterPriority]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h1 className="text-2xl font-bold text-white tracking-wide">Live Ocean Monitoring Center</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Near Real-Time Sentinel-2 Satellite & AIS Telemetry Command Center
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl glass-panel hover:bg-ocean-800 text-cyan-400 border border-cyan-500/30 transition-all"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex bg-ocean-950 p-1 rounded-xl border border-cyan-500/20 font-mono text-xs">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterPriority === p
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map & Side Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[72vh]">
        
        {/* Left/Main Leaflet Map (8 Cols) */}
        <div className="lg:col-span-8 h-full">
          <InteractiveMap
            debrisList={debrisList}
            vesselList={vesselList}
            mpaPolygons={mpaPolygons}
            center={selectedCenter}
            zoom={10}
            onSelectDebris={(d) => setSelectedCenter([d.latitude, d.longitude])}
            onSelectVessel={(v) => setSelectedCenter([v.latitude, v.longitude])}
            onPredictTrajectory={onPredictDebris}
          />
        </div>

        {/* Right Telemetry List (4 Cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 flex flex-col h-full border border-cyan-500/20">
          
          {/* Tab Selector */}
          <div className="flex items-center gap-2 mb-4 p-1 bg-ocean-950 rounded-xl border border-cyan-500/20 font-mono text-xs">
            <button
              onClick={() => setActiveTab('debris')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'debris'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Debris Patches ({debrisList.length})
            </button>
            <button
              onClick={() => setActiveTab('vessels')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'vessels'
                  ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vessels ({vesselList.length})
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activeTab === 'debris' ? (
              debrisList.length > 0 ? (
                debrisList.map((debris) => (
                  <DebrisCard
                    key={debris.detectionId}
                    debris={debris}
                    onSelect={(d) => setSelectedCenter([d.latitude, d.longitude])}
                    onPredict={onPredictDebris}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 font-mono text-xs">
                  No debris patches matching priority filter.
                </div>
              )
            ) : (
              vesselList.length > 0 ? (
                vesselList.map((vessel) => (
                  <VesselCard
                    key={vessel.vesselId}
                    vessel={vessel}
                    onSelect={(v) => setSelectedCenter([v.latitude, v.longitude])}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 font-mono text-xs">
                  No vessels detected.
                </div>
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default LiveMonitoringPage;
