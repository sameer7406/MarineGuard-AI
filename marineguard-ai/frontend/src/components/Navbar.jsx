import React from 'react';
import { Waves, Shield, Radio, Activity, Compass, Ship, BarChart3, FileText, Info } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Waves },
    { id: 'live', label: 'Live Monitoring', icon: Radio },
    { id: 'analysis', label: 'Debris Analysis', icon: Compass },
    { id: 'prediction', label: 'Movement Route', icon: Activity },
    { id: 'vessel', label: 'Vessel Intelligence', icon: Ship },
    { id: 'dashboard', label: 'Command Dashboard', icon: BarChart3 },
    { id: 'about', label: 'About & ML', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Shield className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-white">MARINEGUARD</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/40">AI</span>
            </div>
            <p className="text-[10px] text-cyan-400/70 tracking-widest font-mono uppercase">Detect • Predict • Prioritize • Protect</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center gap-1 bg-ocean-900/60 p-1.5 rounded-xl border border-cyan-500/15">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/30 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Satellite Connection Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SENTINEL-2 MSI ONLINE</span>
          </div>
          <button 
            onClick={() => setActiveTab('live')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-ocean-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-95"
          >
            Explore Map
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
