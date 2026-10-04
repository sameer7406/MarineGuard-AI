# MarineGuard AI - ML Pipeline Specification

## 1. Near Real-Time Debris Detection Pipeline
- **Input:** 6-band Sentinel-2 multispectral raster arrays (`B02`, `B03`, `B04`, `B08`, `B11`, `B12`).
- **Feature Extraction:**
  - Floating Debris Index (FDI) calculation.
  - Normalized Difference Water Index (NDWI) masking.
- **Model Architecture:** Custom 6-channel PyTorch U-Net (`DebrisUNet`) with Residual Skip Connections.
- **Output:** Binary segmentation mask and bounding polygons, area in m², mean confidence score, spectral index diagnostics.
- **Evaluation Metrics:**
  - Intersection over Union (IoU)
  - Dice Score (F1)
  - Precision & Recall
  - Pixel Accuracy

## 2. Risk Prioritization Engine
- **Scoring Function:**
  $$Score = w_1 \cdot S_{area} + w_2 \cdot S_{eco\_proximity} + w_3 \cdot S_{coast\_proximity} + w_4 \cdot S_{predicted\_exposure} + w_5 \cdot S_{confidence}$$
- **Default Weights:**
  - $w_1 = 0.25$ (Debris Patch Area)
  - $w_2 = 0.30$ (Ecological & MPA Proximity)
  - $w_3 = 0.20$ (Coastal Distance)
  - $w_4 = 0.15$ (Predicted Exposure Horizon)
  - $w_5 = 0.10$ (Detection Confidence)
- **Priority Tier Classification:**
  - **HIGH PRIORITY:** Risk Score $\ge 70.0$
  - **MEDIUM PRIORITY:** $40.0 \le \text{Risk Score} < 70.0$
  - **LOW PRIORITY:** Risk Score $< 40.0$

## 3. Debris Route Movement Prediction
- **Physics Engine:** Runge-Kutta 2nd Order Ocean Vector Integrator combining U & V ocean current components with 3% windage coefficient.
- **Prediction Horizons:** 6h, 12h, 24h, 48h, 72h.
- **Evaluation Metrics:**
  - Mean Absolute Error (MAE in km)
  - Mean Displacement Error (MDE)
  - Endpoint Error (EPE)

## 4. Suspicious Vessel Detection & Behavioral Risk Engine
- **Visual Detector:** PyTorch Deep CNN Classifier for maritime vessel bounding boxes and classification.
- **Behavioral Anomaly Rules:**
  - AIS Signal Gap / Transmission Failure inside MPA boundaries.
  - Loitering anomaly (speed < 1.5 knots inside prohibited fishing zone).
  - Course deviation relative to designated shipping channels.
- **Output:** LOW / MEDIUM / HIGH Risk Flag with recommended action ("Requires Verification").
