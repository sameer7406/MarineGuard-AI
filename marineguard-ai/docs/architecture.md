# MarineGuard AI - Architecture Specification

## System Architecture Diagram

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
|   - Debris, Vessel & Prediction Controller                              |
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

## Service Communication & Flow
1. **Frontend Request:** The React client sends user actions (image upload, region selection, prediction request, filter modification) to Node.js backend (`:5000`).
2. **Backend Proxy & Business Logic:** Express validates input, checks JWT tokens, logs operations, and forwards geospatial and image payloads to FastAPI (`:8000`).
3. **FastAPI ML Inference:** FastAPI loads PyTorch models once at startup, executes multispectral tensor processing, calculates GeoPandas/Shapely spatial overlays, runs physical drift models, and returns structured JSON responses.
4. **Database Sync:** Express persists inference results into MongoDB collections (`debris_detections`, `debris_predictions`, `vessel_detections`, `risk_assessments`) for continuous historical tracking.
