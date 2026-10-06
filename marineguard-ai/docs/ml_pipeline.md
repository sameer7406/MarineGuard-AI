# MarineGuard AI - ML & Geospatial Pipeline Specification

## 1. Near Real-Time Debris Detection Pipeline
- **Input:** 6-band Sentinel-2 multispectral raster arrays (`B02`, `B03`, `B04`, `B08`, `B11`, `B12`).
- **Spectral Feature Extraction:**
  - Floating Debris Index (FDI, Biermann et al. 2020)
  - Normalized Difference Water Index (NDWI, McFeeters 1996)
  - Normalized Difference Vegetation Index (NDVI, Rouse et al. 1974)
- **Model Architecture:** Custom 6-channel PyTorch U-Net (`DebrisUNet`) with Residual Double-Convolution blocks and Skip Connections.
- **Output:** Binary segmentation mask and bounding polygons, area in m², mean confidence score, spectral index diagnostics.
- **Dataset & Provenance:** Evaluated on a 40-sample synthetic Sentinel-2 benchmark aligned to published MARIDA spectral statistics (train: 32, val: 4, test: 4).
- **Verified Hold-Out Test Metrics (Synthetic Data):**
  - **IoU:** 0.8921 (89.2%)
  - **Dice Score (F1):** 0.9430
  - **Precision:** 0.8921
  - **Recall:** 1.0000
  - **Pixel Accuracy:** 0.9984
- **Operational Reality:** Operates on tile ingest ("Near Real-Time"). Resolution is 10m/pixel (macroscopic debris patches/windrows, not individual pieces).

---

## 2. Risk Prioritization & Geospatial Engine
- **Geospatial Processing Engine:** `ml/common/gis.py` using GeoPandas, Shapely, and PyProj.
- **Projection:** Reprojects WGS84 coordinates to EPSG:3857 (Spherical Mercator, metres) to calculate true geodesic distances rather than degree approximations.
- **Scoring Function:**
  $$Score = w_1 \cdot S_{area} + w_2 \cdot S_{eco\_proximity} + w_3 \cdot S_{coast\_proximity} + w_4 \cdot S_{predicted\_exposure} + w_5 \cdot S_{confidence}$$
- **Default Weights:**
  - $w_1 = 0.25$ (Debris Patch Area)
  - $w_2 = 0.30$ (Ecological & MPA Proximity - calculated via Shapely projected distance)
  - $w_3 = 0.20$ (Coastal Distance - calculated via Natural Earth 1:50m coastline projected Euclidean distance in EPSG:3857)
  - $w_4 = 0.15$ (Predicted Exposure Horizon)
  - $w_5 = 0.10$ (Detection Confidence)
- **Priority Tier Classification:**
  - **HIGH PRIORITY:** Risk Score $\ge 70.0$
  - **MEDIUM PRIORITY:** $40.0 \le \text{Risk Score} < 70.0$
  - **LOW PRIORITY:** Risk Score $< 40.0$

---

## 3. Debris Route Movement Prediction
- **Physics Engine:** Runge-Kutta 2nd Order Ocean Vector Integrator combining U & V ocean current components with 3% windage leeway factor ($\alpha = 0.03$).
- **ML Displacement Engine:** Scikit-Learn `GradientBoostingRegressor` trained on 1,500 simulated advection vectors across horizons: 6h, 12h, 24h, 48h, 72h.
- **GIS Intersection:** Evaluates trajectory LineString against MPA polygons to identify if, when, and where a debris slick will enter a protected sanctuary.
- **Verified Hold-Out Metrics (Synthetic Simulation):**
  - **MAE:** 5.72 km
  - **Max Displacement Error:** 28.72 km
  - **Endpoint Error:** 10.97 km

---

## 4. Suspicious Vessel Detection & Behavioral Risk Engine
- **Visual Classifier:** PyTorch Deep CNN (`VesselClassifier`) with 3 convolutional stages, batch normalization, and dropout.
- **Vessel Classes (5):** Cargo, Fishing, Tanker, Tug, Suspicious/Unclassified.
- **Dataset & Prototype Status:** Vessel classifier trained on synthetic morphological benchmark patches as a computer-vision pipeline demonstration prototype (500 stratified patches, 80/20 train/test split). Does not claim to reliably classify real-world vessels from satellite imagery without real-world fine-tuning.
- **Verified Hold-Out Test Metrics (Synthetic Benchmark):**
  - **Accuracy:** 84.0%
  - **Macro-Precision:** 86.4%
  - **Macro-Recall:** 84.0%
  - **Macro-F1:** 83.9%
- **Multi-Sensor Behavioral Rules:**
  - AIS Signal Gap / Transmission Failure.
  - Loitering anomaly (speed < 1.5 knots in regulated waters).
  - Operating within designated Marine Protected Area (MPA) boundary (verified via GeoPandas/Shapely spatial intersection).
- **Output & Terminology:** Decision-support flag: LOW / MEDIUM / HIGH Risk ("Suspicious Vessel / Potential Illegal Activity / Requires Verification"). Does not constitute legal determination of illegal activity.
