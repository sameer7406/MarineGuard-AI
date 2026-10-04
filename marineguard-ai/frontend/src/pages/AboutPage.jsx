import React from 'react';
import { Info, Shield, Cpu, Database, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-8 rounded-2xl border border-cyan-500/20 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 text-xs font-mono">
          <Info className="w-3.5 h-3.5" />
          <span>TECHNICAL ARCHITECTURE & DOCUMENTATION</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">About MarineGuard AI</h1>
        <p className="text-slate-400 text-sm font-mono max-w-2xl mx-auto">
          Production-style AI platform for satellite floating debris detection, ocean current movement prediction, relative environmental risk matrix, and suspicious vessel behavioral tracking.
        </p>
      </div>

      {/* Tech Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold border-b border-cyan-500/20 pb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI / ML INFERENCE SERVICE</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 text-[11px]">
            <li>• FastAPI (Python 3.13)</li>
            <li>• PyTorch 6-Channel DebrisUNet</li>
            <li>• PyTorch VesselClassifier CNN</li>
            <li>• Scikit-Learn GradientBoosting Drift</li>
            <li>• Rasterio & GeoPandas Engine</li>
          </ul>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold border-b border-cyan-500/20 pb-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>BACKEND REST API</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 text-[11px]">
            <li>• Node.js + Express.js API Gateway</li>
            <li>• MongoDB + Mongoose Persistence</li>
            <li>• JWT Authentication & Security</li>
            <li>• GeoJSON Layer Services</li>
            <li>• Intelligence Report Generator</li>
          </ul>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold border-b border-cyan-500/20 pb-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>REACT COMMAND CENTER</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 text-[11px]">
            <li>• React 18 + Vite</li>
            <li>• Tailwind CSS Dark Cyber Theme</li>
            <li>• Leaflet Interactive Satellite Maps</li>
            <li>• Real-Time Risk Weight Controls</li>
            <li>• Responsive Command Layout</li>
          </ul>
        </div>
      </div>

      {/* Floating Debris Index Math Formulation */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
        <h3 className="font-mono text-sm font-bold text-cyan-300 uppercase tracking-wider">
          Sentinel-2 Floating Debris Index (FDI) Formulation
        </h3>
        <p className="text-slate-300 text-xs leading-relaxed">
          The Floating Debris Index (FDI) exploits spectral reflectance variations in the Near-Infrared (NIR) and Short-Wave Infrared (SWIR1) bands to detect floating microplastics and macro-debris against sea water:
        </p>
        <div className="p-4 rounded-xl bg-ocean-950 border border-cyan-500/30 text-cyan-300 font-mono text-xs overflow-x-auto">
          FDI = R_NIR - [ R_RED + (R_SWIR1 - R_RED) × ((λ_NIR - λ_RED) / (λ_SWIR1 - λ_RED)) × 1.61 ]
        </div>
      </div>

      {/* Important Technical Limitations Disclaimer */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <AlertTriangle className="w-5 h-5" />
          <span>TECHNICAL LIMITATIONS & DECISION-SUPPORT DISCLAIMER</span>
        </div>
        <ul className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
          <li>1. <b>Near Real-Time Terminology:</b> Sentinel-2 satellite observations operate on a revisit schedule rather than live continuous video.</li>
          <li>2. <b>Detection Scope:</b> Satellite imagery detects floating plastic and debris patches above spatial resolution thresholds; individual micro-particles require field sampling.</li>
          <li>3. <b>Decision-Support Verification:</b> Vessel risk flags highlight potential anomalies (AIS transponder gaps, MPA intrusions) for human verification and do not constitute legal proof of illegal activity.</li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
