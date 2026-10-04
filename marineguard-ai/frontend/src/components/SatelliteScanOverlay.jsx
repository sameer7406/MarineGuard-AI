import React from 'react';

const SatelliteScanOverlay = ({ active = true }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10 border border-cyan-500/30">
      {/* Scanner Sweep Line */}
      <div className="scanner-line"></div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-15" 
        style={{ 
          backgroundImage: `radial-gradient(#00f0ff 1px, transparent 1px), linear-gradient(to right, rgba(0,240,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,240,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      ></div>
      
      {/* Corner HUD Reticles */}
      <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[10px] text-cyan-400/80 bg-ocean-950/80 px-2.5 py-1 rounded border border-cyan-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
        <span>SENTINEL-2 MSI // B02-B12 ACQUISITION</span>
      </div>

      <div className="absolute bottom-3 right-3 font-mono text-[10px] text-cyan-400/80 bg-ocean-950/80 px-2.5 py-1 rounded border border-cyan-500/30">
        LAT: 18.523°N | LON: 72.910°E
      </div>
    </div>
  );
};

export default SatelliteScanOverlay;
