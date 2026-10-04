import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, LayerGroup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { getPriorityColor, formatCoordinates, formatArea } from '../services/mapUtils';
import { Shield, Navigation, AlertTriangle, Radio, Ship, Compass } from 'lucide-react';

// Custom Leaflet Markers with pulse rings
const createCustomMarker = (color, isVessel = false) => {
  const svgHtml = isVessel
    ? `<div style="position:relative; width:30px; height:30px;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${color}33; border:2px solid ${color}; animation:pulse 2s infinite;"></div>
        <div style="position:absolute; top:7px; left:7px; width:16px; height:16px; background:${color}; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#030814; font-weight:bold; font-size:10px;">🚢</div>
       </div>`
    : `<div style="position:relative; width:28px; height:28px;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${color}44; border:2px solid ${color};"></div>
        <div style="position:absolute; top:6px; left:6px; width:16px; height:16px; background:${color}; border-radius:50%; border:2px solid #030814;"></div>
       </div>`;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const InteractiveMap = ({
  debrisList = [],
  vesselList = [],
  selectedTrajectory = null,
  mpaPolygons = [],
  onSelectDebris,
  onSelectVessel,
  onPredictTrajectory,
  center = [18.523, 72.91],
  zoom = 10
}) => {
  const [mapCenter, setMapCenter] = useState(center);

  useEffect(() => {
    if (center) setMapCenter(center);
  }, [center]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Dark Tactical Map">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; Sentinel-2 Copernicus'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite Imagery">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri, Maxar, Earthstar Geographics'
            />
          </LayersControl.BaseLayer>

          {/* Marine Protected Areas Layer */}
          <LayersControl.Overlay checked name="Marine Protected Areas (MPA)">
            <LayerGroup>
              {mpaPolygons.map((mpa, idx) => (
                <Polygon
                  key={`mpa-${idx}`}
                  positions={mpa.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
                  pathOptions={{
                    color: '#00ffa3',
                    fillColor: '#00ffa3',
                    fillOpacity: 0.12,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                >
                  <Popup>
                    <div className="font-mono text-xs">
                      <div className="text-emerald-400 font-bold flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>{mpa.properties.name}</span>
                      </div>
                      <p className="text-slate-300 text-[10px] mt-1">{mpa.properties.designation}</p>
                      <span className="text-[10px] text-emerald-300 font-bold uppercase">{mpa.properties.strictness}</span>
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Debris Detections Layer */}
          <LayersControl.Overlay checked name="Floating Marine Debris">
            <LayerGroup>
              {debrisList.map((debris) => {
                const color = getPriorityColor(debris.priority);
                const polyCoords = debris.geometry?.coordinates?.[0]?.map(c => [c[1], c[0]]) || [];

                return (
                  <React.Fragment key={debris.detectionId}>
                    {polyCoords.length > 0 && (
                      <Polygon
                        positions={polyCoords}
                        pathOptions={{
                          color: color,
                          fillColor: color,
                          fillOpacity: 0.35,
                          weight: 2
                        }}
                      />
                    )}
                    <Marker
                      position={[debris.latitude, debris.longitude]}
                      icon={createCustomMarker(color, false)}
                      eventHandlers={{
                        click: () => onSelectDebris && onSelectDebris(debris)
                      }}
                    >
                      <Popup>
                        <div className="font-mono text-xs p-1 space-y-2">
                          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1">
                            <span className="font-bold text-cyan-300">{debris.detectionId}</span>
                            <span className="font-bold px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: `${color}33`, color: color }}>
                              {debris.priority} PRIORITY
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 space-y-1">
                            <div>Coordinates: <span className="text-white">{formatCoordinates(debris.latitude, debris.longitude)}</span></div>
                            <div>Estimated Area: <span className="text-cyan-300">{formatArea(debris.estimatedArea)}</span></div>
                            <div>Confidence: <span className="text-emerald-400">{(debris.confidence * 100).toFixed(1)}%</span></div>
                            <div>Relative Risk Score: <span className="text-amber-400 font-bold">{debris.riskScore} / 100</span></div>
                          </div>
                          <button
                            onClick={() => onPredictTrajectory && onPredictTrajectory(debris)}
                            className="w-full mt-2 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold border border-cyan-400/30 flex items-center justify-center gap-1"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Predict Drift Route</span>
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Marine Vessel Detections Layer */}
          <LayersControl.Overlay checked name="Marine Vessels & AIS Telemetry">
            <LayerGroup>
              {vesselList.map((vessel) => {
                const color = getPriorityColor(vessel.riskLevel);
                return (
                  <Marker
                    key={vessel.vesselId}
                    position={[vessel.latitude, vessel.longitude]}
                    icon={createCustomMarker(color, true)}
                    eventHandlers={{
                      click: () => onSelectVessel && onSelectVessel(vessel)
                    }}
                  >
                    <Popup>
                      <div className="font-mono text-xs p-1 space-y-2">
                        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1">
                          <span className="font-bold text-slate-100">{vessel.vesselId}</span>
                          <span className="font-bold px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: `${color}33`, color: color }}>
                            {vessel.riskLevel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 space-y-1">
                          <div>Vessel Class: <span className="text-white">{vessel.vesselType}</span></div>
                          <div>AIS Telemetry: <span className={vessel.aisStatus === 'Active' ? 'text-emerald-400' : 'text-red-400 font-bold'}>{vessel.aisStatus}</span></div>
                          <div>CV Confidence: <span className="text-cyan-300">{(vessel.confidence * 100).toFixed(1)}%</span></div>
                          <div>Verification Status: <span className="text-amber-400">{vessel.verificationStatus}</span></div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Predicted Debris Trajectory Animated Layer */}
          {selectedTrajectory && selectedTrajectory.trajectory && (
            <LayersControl.Overlay checked name="Predicted Debris Drift Route">
              <LayerGroup>
                <Polyline
                  positions={selectedTrajectory.trajectory.map(pt => [pt.latitude, pt.longitude])}
                  pathOptions={{
                    color: '#00f0ff',
                    weight: 3,
                    dashArray: '8, 8'
                  }}
                />
                {selectedTrajectory.trajectory.map((pt, idx) => (
                  <Marker
                    key={`traj-step-${idx}`}
                    position={[pt.latitude, pt.longitude]}
                    icon={L.divIcon({
                      html: `<div style="background:#00f0ff; color:#030814; font-size:9px; font-weight:bold; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; border:2px solid #030814;">${pt.horizon_hours}h</div>`,
                      className: 'traj-marker',
                      iconSize: [18, 18],
                      iconAnchor: [9, 9]
                    })}
                  >
                    <Popup>
                      <div className="font-mono text-xs">
                        <div className="text-cyan-400 font-bold">{pt.step_name} PREDICTION</div>
                        <p className="text-slate-300 text-[10px]">Cumulative Distance: {pt.cumulative_distance_km} km</p>
                        <p className="text-slate-400 text-[10px]">{formatCoordinates(pt.latitude, pt.longitude)}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          )}

        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
