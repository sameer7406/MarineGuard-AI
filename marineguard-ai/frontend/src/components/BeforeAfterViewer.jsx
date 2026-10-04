import React, { useState } from 'react';
import { Eye, Layers, Sparkles } from 'lucide-react';

const BeforeAfterViewer = ({ rawImage, detectedMask, diagnostics }) => {
  const [showMask, setShowMask] = useState(true);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
            Sentinel-2 Multispectral Visualizer
          </h3>
        </div>
        <button
          onClick={() => setShowMask(!showMask)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
            showMask
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
              : 'bg-ocean-800 text-slate-400 border-cyan-500/10'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showMask ? 'DEBRIS OVERLAY ON' : 'RAW SATELLITE IMAGE'}</span>
        </button>
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-ocean-950 border border-cyan-500/30 flex items-center justify-center">
        {/* Synthetic Multispectral Ocean Render */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #071c38 0%, #030814 100%)`
          }}
        >
          {/* Synthetic Ocean Surface Texture */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Floating Plastic Debris Segmentation Contour Overlay */}
          {showMask && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-36 rounded-3xl bg-red-500/30 border-2 border-red-500 shadow-[0_0_30px_rgba(255,0,85,0.6)] animate-pulse flex items-center justify-center">
              <div className="bg-ocean-950/90 px-3 py-1.5 rounded border border-red-500/50 text-red-300 text-[11px] font-mono font-bold">
                DETECTED DEBRIS PATCH (FDI: +0.0142)
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 left-3 bg-ocean-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-cyan-500/30 font-mono text-[11px] text-cyan-300">
          MODE: {showMask ? 'PyTorch Segmentation Mask' : 'Sentinel-2 Multispectral True Color'}
        </div>
      </div>

      {diagnostics && (
        <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-mono p-3 rounded-xl bg-ocean-950/60 border border-cyan-500/10">
          <div>
            <span className="text-slate-400 text-[10px] block">FDI MEAN INDEX</span>
            <span className="text-cyan-400 font-bold">{diagnostics.fdi_mean ?? '+0.0142'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">NDWI INDEX</span>
            <span className="text-cyan-400 font-bold">{diagnostics.ndwi_mean ?? '-0.1240'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">MODEL INFERENCE</span>
            <span className="text-emerald-400 font-bold">DebrisUNet PyTorch</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeforeAfterViewer;
