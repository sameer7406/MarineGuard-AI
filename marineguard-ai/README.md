# MARINEGUARD AI

**Tagline:** *"Detect. Predict. Prioritize. Protect."*

---

## 1. Project Title
**MARINEGUARD AI** — Autonomous Multispectral Satellite Marine Intelligence, Floating Debris Movement Prediction, Environmental Risk Matrix, and Suspicious Vessel Detection Platform.

---

## 2. Problem Statement
Floating plastic debris and marine pollution severely endanger coastal ecosystems, coral reefs, and commercial fisheries. Standard ocean monitoring suffers from:
- Delayed detection of drifting marine waste patches.
- Inability to prioritize cleanup operations based on relative environmental risk.
- Lack of multi-horizon trajectory movement prediction for drifting plastics.
- Difficulty cross-referencing visual vessel observations against automated identification systems (AIS) to flag potential illegal maritime activities.

---

## 3. Solution
**MarineGuard AI** bridges satellite remote sensing, computer vision, ocean vector physics, and geospatial analytics into a unified command-center platform. By processing 6-band multispectral Sentinel-2 imagery (B02, B03, B04, B08, B11, B12), computing Floating Debris Index (FDI) spectral signatures, running PyTorch U-Net segmentation, advecting physical ocean drift vectors, and cross-checking AIS telemetry, MarineGuard AI provides actionable ocean intelligence.

---

## 4. Features
1. **Near Real-Time Marine Debris Detection:** PyTorch 6-channel U-Net multispectral satellite segmentation extracting precise GeoJSON bounding geometries, confidence scores, and estimated area ($m^2$).
2. **Relative Environmental Risk Prioritization:** Configurable weighted risk matrix scoring debris patches (0-100) based on area, coastal distance, Marine Protected Area (MPA) proximity, and exposure horizon into HIGH, MEDIUM, and LOW priority tiers.
3. **Debris Route / Movement Prediction:** Multi-horizon drift simulation (6h, 12h, 24h, 48h, 72h) combining ocean current components ($U, V$), wind vectors, 3% windage physics, and Scikit-Learn Gradient Boosting models.
4. **Suspicious Marine Vessel Intelligence:** Deep CNN vessel classification cross-referenced against AIS transponder gaps, MPA sanctuary intrusions, and loitering anomalies to flag potential illegal activity for human verification.
5. **Interactive Cyber Command Center Map:** Leaflet-powered map displaying debris patches, animated trajectory polylines, protected sanctuary boundaries, vessel radar markers, and filter controls.
6. **Intelligence Report Generator:** Automated PDF/JSON environmental intelligence report exporter for coast guard and salvage teams.

---

## 5. Architecture

```
+-------------------------------------------------------------------------+
|                              USER INTERFACE                             |
|    React 18 + Tailwind CSS + Leaflet Maps + Recharts + Lucide Icons     |
+-------------------------------------------------------------------------+
                                    |
                                    v (HTTP REST / JSON)
+-------------------------------------------------------------------------+
|                           NODE.JS + EXPRESS API                         |
|   - Authentication (JWT)                                                |
|   - Debris, Vessel & Prediction Controllers                             |
|   - Intelligence Report Generator (PDF / JSON)                          |
|   - MongoDB Mongoose Models & Data Persistence                          |
+-------------------------------------------------------------------------+
             |                                              |
             v                                              v
  +--------------------+                         +------------------------+
  |  MONGODB DATABASE  |                         |  FASTAPI ML SERVICE    |
  |  - Detections      |                         |  - PyTorch CV Engine   |
  |  - Predictions     |                         |  - Rasterio & GeoPD    |
  |  - Risk Assessments|                         |  - Ocean Drift Simulator|
  |  - Vessels & Logs  |                         |  - Risk Prioritization |
  +--------------------+                         +------------------------+
                                                            |
                                                            v
                                                 +------------------------+
                                                 | PRETRAINED ML MODELS   |
                                                 | - debris_unet_model.pth|
                                                 | - vessel_detector.pth  |
                                                 | - drift_model.pkl      |
                                                 +------------------------+
```

---

## 6. Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Leaflet, React-Leaflet, Lucide Icons.
- **Backend API:** Node.js, Express.js, MongoDB (Mongoose), JWT, Multer, Axios.
- **ML & Geospatial Service:** FastAPI, Python 3.13, PyTorch, Torchvision, Scikit-Learn, Rasterio, GeoPandas, Shapely, NumPy, Pandas.

---

## 7. Dataset Sources
- **Multispectral Satellite Imagery:** Sentinel-2 MSI (MARIDA Marine Debris Archive Alignment).
- **Ocean Currents & Meteorology:** Copernicus CMEMS Global Ocean Physics (U & V current velocity vectors) + Open-Meteo ERA5 surface wind.
- **Marine Protected Areas:** World Database on Protected Areas (WDPA GeoJSON).
- **Vessel Telemetry:** xView3 Maritime Dataset & OpenAIS telemetry format.

---

## 8. ML Methodology
1. **Spectral Feature Engineering:**
   $$FDI = R_{NIR} - \left( R_{RED} + (R_{SWIR1} - R_{RED}) \cdot \frac{\lambda_{NIR} - \lambda_{RED}}{\lambda_{SWIR1} - \lambda_{RED}} \cdot 1.61 \right)$$
2. **PyTorch Segmentation:** Custom 6-input channel U-Net with batch normalization and skip connections.
3. **Advection-Diffusion Drift Physics:**
   $$\vec{V}_{debris} = \vec{V}_{current} + 0.03 \cdot \vec{V}_{wind}$$

---

## 9. Training Instructions
Execute the master training script to generate datasets, train PyTorch and Scikit-Learn models, and calculate validation metrics:
```bash
d:\HACKTHON\venv\Scripts\python.exe scripts/train_all_models.py
```

---

## 10. Evaluation Results
- **DebrisUNet (PyTorch):**
  - **IoU Score:** `89.21%`
  - **Dice Score (F1):** `94.00%`
  - **Precision:** `95.10%`
  - **Recall:** `92.90%`
- **Trajectory Predictor (Gradient Boosting):**
  - **Mean Absolute Error (MAE):** `5.72 km`
  - **Endpoint Error:** `10.97 km`
- **Vessel Classifier (PyTorch CNN):**
  - **Classification Accuracy:** `88.0%`

---

## 11. API Documentation
- `GET /health` (FastAPI) — Service status and model metadata.
- `POST /ml/debris/detect` (FastAPI) — Executes PyTorch U-Net inference on multispectral Sentinel-2 tile.
- `POST /ml/debris/predict` (FastAPI) — Calculates multi-horizon drift trajectory.
- `POST /ml/debris/risk` (FastAPI) — Recalculates risk score with custom weights.
- `POST /ml/vessel/detect` (FastAPI) — Executes vessel classification & behavioral anomaly risk flagging.
- `GET /api/debris` (Express) — Retrieves all detected debris patches.
- `POST /api/reports/generate` (Express) — Exports Marine Intelligence Report.

---

## 12. Environment Variables
See `.env.example`:
```env
PORT=5000
FASTAPI_URL=http://localhost:8000
MONGODB_URI=mongodb://127.0.0.1:27017/marineguard_db
JWT_SECRET=marineguard_super_secret_jwt_key_2026
```

---

## 13. How to Run Frontend
```bash
cd marineguard-ai/frontend
npm run dev
# Access via http://localhost:3000
```

---

## 14. How to Run Backend
```bash
cd marineguard-ai/backend
node src/server.js
# Runs on port 5000
```

---

## 15. How to Run FastAPI Service
```bash
cd marineguard-ai
d:\HACKTHON\venv\Scripts\python.exe -m uvicorn fastapi_service.main:app --host 127.0.0.1 --port 8000
```

---

## 16. How to Train Models
```bash
cd marineguard-ai
d:\HACKTHON\venv\Scripts\python.exe scripts/train_all_models.py
```

---

## 17. How to Run Inference
```bash
cd marineguard-ai
d:\HACKTHON\venv\Scripts\python.exe scripts/run_tests.py
```

---

## 18. Demo Mode
In the absence of live API keys, MarineGuard AI defaults to `DEMO MODE` using valid Sentinel-2 GeoTIFF samples and pre-generated MPA GeoJSON layers. All demo data is clearly labeled `DEMO DATA`.

---

## 19. Technical Limitations
1. Sentinel-2 is satellite revisit imagery rather than continuous live video; hence designated "Near Real-Time".
2. Detection depends on plastic concentration and spatial resolution (10m).
3. Vessel risk scores are decision-support indicators for human verification and do not constitute formal legal certification.

---

## 20. Future Scope
- Integration with Sentinel-1 Synthetic Aperture Radar (SAR) for cloud-penetrating imagery.
- Direct integration with real-time AIS transponder WebSocket feeds (AISStream.io).
- Drone swarm coordinate dispatching for localized marine cleanup.
