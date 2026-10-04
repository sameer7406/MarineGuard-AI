import React from 'react';
import { Waves, Shield, Radio, Activity, Compass, Ship, ArrowRight, CheckCircle2, Cpu, Database, Eye } from 'lucide-react';
import SatelliteScanOverlay from '../components/SatelliteScanOverlay';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center rounded-3xl overflow-hidden glass-panel-glow border border-cyan-500/30 p-8 lg:p-16 my-4">
        <SatelliteScanOverlay />

        {/* Ambient Glowing Background Orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-20 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>NEXT-GEN SATELLITE OCEAN INTELLIGENCE PLATFORM</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
            MARINEGUARD <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="font-mono text-lg md:text-xl text-cyan-400/90 font-medium tracking-wide">
            "Detect. Predict. Prioritize. Protect."
          </p>

          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Autonomous marine intelligence platform powered by multispectral Sentinel-2 satellite computer vision, ocean vector drift dynamics, relative environmental risk prioritization, and suspicious vessel behavioral tracking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('live')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-ocean-950 font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center gap-2 active:scale-95"
            >
              <Radio className="w-4 h-4" />
              <span>Explore Live Map</span>
            </button>
            <button
              onClick={() => onNavigate('analysis')}
              className="px-6 py-3.5 rounded-xl glass-panel hover:bg-ocean-800 text-cyan-300 font-bold text-sm tracking-wider uppercase border border-cyan-500/30 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Analysis</span>
            </button>
            <button
              onClick={() => onNavigate('vessel')}
              className="px-6 py-3.5 rounded-xl glass-panel hover:bg-ocean-800 text-slate-200 font-bold text-sm tracking-wider uppercase border border-cyan-500/30 transition-all flex items-center gap-2"
            >
              <Ship className="w-4 h-4 text-red-400" />
              <span>Vessel Intelligence</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real-Time Live Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 text-center">
          <span className="text-slate-400 font-mono text-xs uppercase block mb-1">Active Debris Patches</span>
          <span className="font-extrabold text-3xl md:text-4xl text-cyan-400 font-mono">24</span>
          <span className="text-[10px] text-cyan-400/70 font-mono block mt-1">Sentinel-2 Detected</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-red-500/30 text-center bg-red-950/10">
          <span className="text-slate-400 font-mono text-xs uppercase block mb-1">High-Risk Patches</span>
          <span className="font-extrabold text-3xl md:text-4xl text-red-400 font-mono">07</span>
          <span className="text-[10px] text-red-400/70 font-mono block mt-1">MPA Sanctuary Threat</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 text-center">
          <span className="text-slate-400 font-mono text-xs uppercase block mb-1">Vessels Tracked</span>
          <span className="font-extrabold text-3xl md:text-4xl text-emerald-400 font-mono">18</span>
          <span className="text-[10px] text-emerald-400/70 font-mono block mt-1">xView3 CV & AIS Active</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 text-center bg-amber-950/10">
          <span className="text-slate-400 font-mono text-xs uppercase block mb-1">Suspicious Vessels</span>
          <span className="font-extrabold text-3xl md:text-4xl text-amber-400 font-mono">04</span>
          <span className="text-[10px] text-amber-400/70 font-mono block mt-1">AIS Gap / Loitering Flag</span>
        </div>
      </section>

      {/* Core Intelligence Modules Showcase */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            Four Core Intelligence Modules
          </h2>
          <p className="text-slate-400 text-sm font-mono max-w-xl mx-auto">
            Combining multispectral remote sensing, deep learning, ocean physics, and geospatial analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Module 1 */}
          <div 
            onClick={() => onNavigate('analysis')}
            className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer group space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
                <Compass className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-400/20">MODULE 01</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Near Real-Time Marine Debris Detection
              </h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Processes Sentinel-2 multispectral satellite imagery (B02, B03, B04, B08, B11, B12). Computes Floating Debris Index (FDI) and executes PyTorch 6-Channel U-Net segmentation.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 pt-2 border-t border-cyan-500/10">
              <span>PyTorch U-Net (IoU: 89.2%)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 2 */}
          <div 
            onClick={() => onNavigate('analysis')}
            className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer group space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400">
                <Shield className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-400/20">MODULE 02</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Relative Environmental Risk Prioritization
              </h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Calculates transparent decision-support risk scores (0-100) combining debris size, coastal distance, Marine Protected Area (MPA) proximity, and exposure horizons.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-amber-400 pt-2 border-t border-cyan-500/10">
              <span>Configurable Weight Matrix</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 3 */}
          <div 
            onClick={() => onNavigate('prediction')}
            className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer group space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-400">
                <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-mono text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded border border-blue-400/20">MODULE 03</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                Debris Route Movement Prediction
              </h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Simulates multi-horizon drift trajectories (6h, 12h, 24h, 48h, 72h) using ocean current U/V vectors and 3% windage physics integrated with Gradient Boosting models.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-blue-400 pt-2 border-t border-cyan-500/10">
              <span>MAE: 5.72 km Drift Model</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 4 */}
          <div 
            onClick={() => onNavigate('vessel')}
            className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer group space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-400">
                <Ship className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-mono text-red-400 font-bold bg-red-500/10 px-2.5 py-1 rounded border border-red-400/20">MODULE 04</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-red-300 transition-colors">
                Suspicious Marine Vessel Intelligence
              </h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Flags potential illegal maritime activity using satellite visual detection cross-referenced against AIS signal gaps, MPA intrusions, and loitering behavioral anomalies.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-red-400 pt-2 border-t border-cyan-500/10">
              <span>Behavioral Risk Flags</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
