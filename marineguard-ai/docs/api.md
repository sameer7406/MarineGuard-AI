# MarineGuard AI - API Documentation

## REST API Endpoints (Node.js Express - `:5000`)

### Auth Endpoints
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate user & return JWT token

### Debris Detection & Analysis
- `GET /api/debris` - Retrieve all detected debris patches (with status & priority filters)
- `GET /api/debris/:id` - Retrieve single debris patch metadata and detailed trajectory
- `POST /api/debris/upload` - Upload Sentinel-2 GeoTIFF tile for analysis
- `POST /api/debris/detect` - Execute PyTorch detection pipeline on ROI / uploaded image
- `POST /api/debris/risk` - Recalculate relative environmental risk score with custom weights
- `POST /api/debris/predict` - Generate multi-horizon (6h-72h) movement trajectory

### Vessel Intelligence
- `GET /api/vessels` - Retrieve all detected marine vessels
- `GET /api/vessels/:id` - Retrieve vessel metadata, AIS telemetry, and risk factors
- `POST /api/vessels/detect` - Execute vessel visual & behavioral detection

### Monitoring & Analytics
- `GET /api/monitoring/live` - Retrieve live monitoring spatial layer GeoJSON payload
- `GET /api/dashboard/stats` - Retrieve aggregate statistics, metrics, and risk distributions
- `POST /api/reports/generate` - Generate Marine Environmental Intelligence Report

---

## FastAPI ML Inference Endpoints (Python - `:8000`)

- `GET /health` - Service health check and model version metadata
- `POST /ml/debris/detect` - Multispectral GeoTIFF segmentation & spectral index extraction
- `POST /ml/debris/risk` - Calculate weighted relative environmental risk
- `POST /ml/debris/predict` - Vector advection-diffusion trajectory prediction engine
- `POST /ml/vessel/detect` - Vessel CV classification
- `POST /ml/vessel/risk` - Behavioral anomaly & AIS gap risk calculation
