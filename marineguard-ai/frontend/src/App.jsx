import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import DebrisAnalysisPage from './pages/DebrisAnalysisPage';
import MovementPredictionPage from './pages/MovementPredictionPage';
import VesselIntelligencePage from './pages/VesselIntelligencePage';
import DashboardAnalyticsPage from './pages/DashboardAnalyticsPage';
import AboutPage from './pages/AboutPage';
import ReportModal from './components/ReportModal';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDebrisForPrediction, setSelectedDebrisForPrediction] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState('DEBRIS_1852_7291');

  // Marine Protected Area Boundaries
  const mpaPolygons = [
    {
      properties: {
        name: 'Pacific Garbage Patch Marine Reserve Corridor',
        designation: 'High Priority Ecological Sanctuary',
        strictness: 'Strict No-Take Zone'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72.70, 18.40],
          [73.10, 18.40],
          [73.10, 18.75],
          [72.70, 18.75],
          [72.70, 18.40]
        ]]
      }
    },
    {
      properties: {
        name: 'Coral Reef National Park Marine Protected Zone',
        designation: 'Sensitive Marine Habitat',
        strictness: 'No Commercial Fishing'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72.50, 18.20],
          [72.80, 18.20],
          [72.80, 18.45],
          [72.50, 18.45],
          [72.50, 18.20]
        ]]
      }
    }
  ];

  const handlePredictDebris = (debris) => {
    setSelectedDebrisForPrediction(debris);
    setActiveTab('prediction');
  };

  const handleOpenReport = (targetId) => {
    if (targetId) setReportTargetId(targetId);
    setIsReportOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ocean-950 text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'home' && <LandingPage onNavigate={setActiveTab} />}
        {activeTab === 'live' && (
          <LiveMonitoringPage
            onPredictDebris={handlePredictDebris}
            mpaPolygons={mpaPolygons}
          />
        )}
        {activeTab === 'analysis' && (
          <DebrisAnalysisPage onOpenReport={handleOpenReport} />
        )}
        {activeTab === 'prediction' && (
          <MovementPredictionPage
            selectedDebris={selectedDebrisForPrediction}
            mpaPolygons={mpaPolygons}
          />
        )}
        {activeTab === 'vessel' && (
          <VesselIntelligencePage onOpenReport={handleOpenReport} />
        )}
        {activeTab === 'dashboard' && <DashboardAnalyticsPage />}
        {activeTab === 'about' && <AboutPage />}
      </main>

      <Footer />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        defaultTargetId={reportTargetId}
      />
    </div>
  );
};

export default App;
