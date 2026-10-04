import React from 'react';
import { Shield, Github, Database, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass-panel border-t border-cyan-500/20 py-10 px-6 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white tracking-wider text-base">MARINEGUARD AI</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            AI-powered marine intelligence platform designed to monitor floating marine debris, predict movement, prioritize environmental risk, and flag suspicious vessel activity.
          </p>
        </div>

        <div>
          <h4 className="font-mono text-cyan-300 font-bold uppercase tracking-wider mb-3">Satellite Telemetry</h4>
          <ul className="space-y-1.5 text-slate-400 font-mono text-[11px]">
            <li>Sentinel-2 MSI (10m Resolution)</li>
            <li>Bands: B02, B03, B04, B08, B11, B12</li>
            <li>Floating Debris Index (FDI) Spectral Analysis</li>
            <li>Copernicus CMEMS U/V Drift Vectors</li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-cyan-300 font-bold uppercase tracking-wider mb-3">AI / ML Pipeline</h4>
          <ul className="space-y-1.5 text-slate-400 font-mono text-[11px]">
            <li>PyTorch 6-Channel Multispectral U-Net</li>
            <li>PyTorch Vessel Classifier & Feature Extractor</li>
            <li>Vector Physics + Gradient Boosting Drift Engine</li>
            <li>Decision-Support Risk Matrix Engine</li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-cyan-300 font-bold uppercase tracking-wider mb-3">Decision Support Disclaimer</h4>
          <p className="text-[11px] leading-relaxed text-slate-400">
            MarineGuard AI provides relative environmental risk flags and decision-support intelligence for verification. Risk scores do not constitute formal legal or environmental certification.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-cyan-500/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-400">
        <div>© 2026 MARINEGUARD AI — Production-Style Hackathon Platform</div>
        <div className="flex items-center gap-6">
          <span className="text-emerald-400">STATUS: ALL ML ENGINES OPERATIONAL</span>
          <span>FASTAPI :8000</span>
          <span>NODE :5000</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
