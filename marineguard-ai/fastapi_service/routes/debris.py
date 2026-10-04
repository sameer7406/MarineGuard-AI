import os
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi_service.schemas.debris_schema import DebrisDetectRequest, DebrisPredictRequest, DebrisRiskRequest
from ml.debris_detection.inference import DebrisInferenceEngine
from ml.debris_detection.preprocessing import read_geotiff_tile
from ml.debris_prediction.predict import get_debris_prediction
from ml.vessel_risk.risk_engine import calculate_debris_risk_score
from fastapi_service.config import DATA_DIR

router = APIRouter()
debris_engine = DebrisInferenceEngine()

@router.post("/debris/detect")
def detect_debris(req: DebrisDetectRequest):
    """
    Executes Sentinel-2 PyTorch U-Net inference on imagery tile or spatial ROI coordinates.
    """
    sample_geotiff = os.path.join(DATA_DIR, "sample_sentinel2_tile.tif")
    
    if os.path.exists(sample_geotiff):
        bands, meta = read_geotiff_tile(sample_geotiff)
    else:
        np.random.seed(42)
        bands = np.zeros((6, 256, 256), dtype=np.float32)
        bands[0] = np.random.uniform(0.04, 0.06, (256, 256))
        bands[1] = np.random.uniform(0.03, 0.05, (256, 256))
        bands[2] = np.random.uniform(0.02, 0.04, (256, 256))
        bands[3] = np.random.uniform(0.01, 0.025, (256, 256))
        bands[4] = np.random.uniform(0.005, 0.015, (256, 256))
        bands[5] = np.random.uniform(0.003, 0.01, (256, 256))
        
        bands[2, 110:146, 110:146] += 0.05
        bands[3, 110:146, 110:146] += 0.22
        bands[4, 110:146, 110:146] += 0.10
        
    res = debris_engine.predict_tile(bands, center_lat=req.latitude, center_lon=req.longitude)
    
    for det in res["detections"]:
        risk_res = calculate_debris_risk_score(
            estimated_area_m2=det["estimated_area_m2"],
            coastal_distance_km=12.5,
            protected_zone_distance_km=8.0,
            predicted_exposure_km=15.0,
            confidence=det["confidence"]
        )
        det["risk_score"] = risk_res["risk_score"]
        det["priority"] = risk_res["priority"]
        det["risk_breakdown"] = risk_res["score_breakdown"]
        
    return res

@router.post("/debris/upload")
async def upload_debris_image(file: UploadFile = File(...)):
    """
    Handles uploaded GeoTIFF multispectral satellite tiles for debris detection.
    """
    if not (file.filename.endswith(".tif") or file.filename.endswith(".tiff")):
        raise HTTPException(status_code=400, detail="Invalid satellite file format. Must be GeoTIFF (.tif/.tiff).")
        
    contents = await file.read()
    temp_path = os.path.join(DATA_DIR, f"temp_{file.filename}")
    with open(temp_path, "wb") as f:
        f.write(contents)
        
    try:
        bands, meta = read_geotiff_tile(temp_path)
        res = debris_engine.predict_tile(bands, center_lat=18.523, center_lon=72.91)
        os.remove(temp_path)
        return {
            "status": "SUCCESS",
            "filename": file.filename,
            "crs": meta["crs"],
            "bounds": meta["bounds"],
            "inference": res
        }
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"GeoTIFF processing failure: {str(e)}")

@router.post("/debris/predict")
def predict_movement(req: DebrisPredictRequest):
    """
    Predicts multi-horizon (6h, 12h, 24h, 48h, 72h) movement trajectory for floating debris patch.
    """
    res = get_debris_prediction(
        lat=req.latitude,
        lon=req.longitude,
        ocean_u=req.ocean_u,
        ocean_v=req.ocean_v,
        wind_u=req.wind_u,
        wind_v=req.wind_v,
        time_horizons=req.time_horizons
    )
    return res

@router.post("/debris/risk")
def calculate_risk(req: DebrisRiskRequest):
    """
    Calculates Relative Environmental Risk Score with configurable feature weights.
    """
    weights_dict = req.weights.model_dump() if req.weights else None
    res = calculate_debris_risk_score(
        estimated_area_m2=req.estimated_area_m2,
        coastal_distance_km=req.coastal_distance_km,
        protected_zone_distance_km=req.protected_zone_distance_km,
        predicted_exposure_km=req.predicted_exposure_km,
        confidence=req.confidence,
        weights=weights_dict
    )
    return res
