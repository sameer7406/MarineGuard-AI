import React, { useState } from 'react';
import { FileText, Download, X, CheckCircle2, Shield } from 'lucide-react';
import { generateIntelligenceReport } from '../services/api';

const ReportModal = ({ isOpen, onClose, defaultTargetId }) => {
  const [reportType, setReportType] = useState('Debris Intelligence');
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateIntelligenceReport({
        reportType,
        targetId: defaultTargetId || 'DEBRIS_1852_7291',
        title: `Marine Environmental Intelligence Report - ${reportType}`
      });
      setGeneratedReport(res.report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!generatedReport) return;
    const blob = new Blob([JSON.stringify(generatedReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.reportId}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/80 backdrop-blur-md">
      <div className="glass-panel-glow w-full max-w-2xl rounded-2xl p-6 border border-cyan-400/40 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-ocean-900 border border-cyan-500/20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
            <FileText className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Generate Marine Intelligence Report</h2>
            <p className="text-xs text-slate-400 font-mono">Formal Decision-Support Environmental Report Generator</p>
          </div>
        </div>

        {!generatedReport ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-cyan-300 font-bold mb-2">SELECT REPORT TYPE</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-ocean-950 border border-cyan-500/30 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Debris Intelligence">Marine Debris Risk & Trajectory Assessment</option>
                <option value="Vessel Risk Intelligence">Suspicious Marine Vessel Verification Alert</option>
                <option value="Comprehensive Marine Summary">Comprehensive Ocean Monitoring Summary</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-ocean-950/60 border border-cyan-500/10 text-xs font-mono text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Identifier:</span>
                <span className="text-cyan-400 font-bold">{defaultTargetId || 'DEBRIS_1852_7291'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Satellite Sensor:</span>
                <span>Sentinel-2 MSI (10m Resolution)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Classification Level:</span>
                <span className="text-amber-400 font-bold">DECISION SUPPORT / VERIFICATION</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-ocean-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              {loading ? 'Processing ML Telemetry Report...' : 'Generate Official Intelligence Report'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Report Generated Successfully! Report ID: {generatedReport.reportId}</span>
            </div>

            <div className="p-4 rounded-xl bg-ocean-950 border border-cyan-500/20 text-xs font-mono space-y-3 max-h-60 overflow-y-auto">
              <h3 className="text-cyan-300 font-bold border-b border-cyan-500/20 pb-2">{generatedReport.title}</h3>
              <p className="text-slate-300">{generatedReport.details.riskPrioritization}</p>
              <p className="text-slate-300">{generatedReport.details.predictedMovement}</p>
              <p className="text-slate-300">{generatedReport.details.vesselTelemetryCorrelation}</p>
              <div className="pt-2 border-t border-cyan-500/20 text-emerald-400 font-bold">
                RECOMMENDATION: {generatedReport.details.recommendation}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadJSON}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-ocean-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <Download className="w-4 h-4" />
                <span>Download Report (JSON)</span>
              </button>
              <button
                onClick={() => setGeneratedReport(null)}
                className="py-2.5 px-4 rounded-xl bg-ocean-800 text-slate-300 font-bold text-xs uppercase border border-cyan-500/20"
              >
                Back
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportModal;
