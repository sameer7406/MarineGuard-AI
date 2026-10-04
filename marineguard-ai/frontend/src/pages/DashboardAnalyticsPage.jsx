import React, { useState, useEffect } from 'react';
import { fetchDashboardStats } from '../services/api';
import MetricsDisplay from '../components/MetricsDisplay';
import { BarChart3, PieChart, TrendingUp, Shield, Activity, Cpu } from 'lucide-react';

const DashboardAnalyticsPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(console.error);
  }, []);

  const summary = stats?.summary || {
    activeDebrisPatches: 24,
    highRiskDebrisPatches: 7,
    totalDebrisAreaM2: 48250.0,
    vesselsDetectedCount: 18,
    suspiciousVesselsCount: 4
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Command Center Analytics & Intelligence</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Aggregate Environmental Risk Telemetry, Priority Distributions, and ML Model Metrics
            </p>
          </div>
        </div>
      </div>

      {/* Top Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20">
          <span className="text-slate-400 text-xs block mb-1">TOTAL DEBRIS PATCHES</span>
          <span className="text-3xl font-extrabold text-cyan-400">{summary.activeDebrisPatches}</span>
          <span className="text-[10px] text-cyan-400/70 block mt-1">Sentinel-2 Observations</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-red-500/30 bg-red-950/10">
          <span className="text-slate-400 text-xs block mb-1">HIGH-RISK THREATS</span>
          <span className="text-3xl font-extrabold text-red-400">0{summary.highRiskDebrisPatches}</span>
          <span className="text-[10px] text-red-400/70 block mt-1">MPA Sanctuary Intrusion</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20">
          <span className="text-slate-400 text-xs block mb-1">VESSELS MONITORED</span>
          <span className="text-3xl font-extrabold text-emerald-400">{summary.vesselsDetectedCount}</span>
          <span className="text-[10px] text-emerald-400/70 block mt-1">SAR & Visual Detections</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
          <span className="text-slate-400 text-xs block mb-1">SUSPICIOUS FLAGS</span>
          <span className="text-3xl font-extrabold text-amber-400">0{summary.suspiciousVesselsCount}</span>
          <span className="text-[10px] text-amber-400/70 block mt-1">AIS Transmission Gap</span>
        </div>
      </div>

      {/* Analytics Distributions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Debris Priority Distribution Card */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
            <PieChart className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Debris Environmental Risk Priority Distribution
            </h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-red-400 font-bold">HIGH PRIORITY (Risk Score ≥ 70)</span>
                <span className="text-slate-300 font-bold">7 patches (29.2%)</span>
              </div>
              <div className="w-full h-3 bg-ocean-950 rounded-full overflow-hidden border border-red-500/30">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '29.2%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-amber-400 font-bold">MEDIUM PRIORITY (40 ≤ Risk Score &lt; 70)</span>
                <span className="text-slate-300 font-bold">11 patches (45.8%)</span>
              </div>
              <div className="w-full h-3 bg-ocean-950 rounded-full overflow-hidden border border-amber-500/30">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '45.8%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-emerald-400 font-bold">LOW PRIORITY (Risk Score &lt; 40)</span>
                <span className="text-slate-300 font-bold">6 patches (25.0%)</span>
              </div>
              <div className="w-full h-3 bg-ocean-950 rounded-full overflow-hidden border border-emerald-500/30">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25.0%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Vessel Suspicion Risk Distribution Card */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
            <TrendingUp className="w-5 h-5 text-red-400" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Marine Vessel Behavioral Risk Distribution
            </h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-red-400 font-bold">HIGH RISK (AIS Gap + MPA Intrusion)</span>
                <span className="text-slate-300 font-bold">4 vessels (22.2%)</span>
              </div>
              <div className="w-full h-3 bg-ocean-950 rounded-full overflow-hidden border border-red-500/30">
                <div className="h-full bg-red-600 rounded-full" style={{ width: '22.2%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-amber-400 font-bold">MEDIUM RISK (Loitering Pattern)</span>
                <span className="text-slate-300 font-bold">5 vessels (27.8%)</span>
              </div>
              <div className="w-full h-3 bg-ocean-950 rounded-full overflow-hidden border border-amber-500/30">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '27.8%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-emerald-400 font-bold">LOW RISK (Verified Commercial Cargo)</span>
                <span className="text-slate-300 font-bold">9 vessels (50.0%)</span>
              </div>
              <div className="w-full h-3 bg-ocean-950 rounded-full overflow-hidden border border-emerald-500/30">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '50.0%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <MetricsDisplay metrics={stats?.mlModelPerformance} />
    </div>
  );
};

export default DashboardAnalyticsPage;
