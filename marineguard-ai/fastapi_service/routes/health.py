import os
import json
from fastapi import APIRouter
from fastapi_service.config import MODELS_DIR

router = APIRouter()

@router.get("/health")
def health_check():
    debris_meta_path = os.path.join(MODELS_DIR, "debris", "debris_metadata.json")
    vessel_meta_path = os.path.join(MODELS_DIR, "vessel", "vessel_metadata.json")
    prediction_meta_path = os.path.join(MODELS_DIR, "prediction", "prediction_metadata.json")
    
    debris_meta = json.load(open(debris_meta_path)) if os.path.exists(debris_meta_path) else {}
    vessel_meta = json.load(open(vessel_meta_path)) if os.path.exists(vessel_meta_path) else {}
    prediction_meta = json.load(open(prediction_meta_path)) if os.path.exists(prediction_meta_path) else {}
    
    return {
        "status": "ONLINE",
        "service": "MarineGuard AI - FastAPI ML Inference Service",
        "models": {
            "debris_detection": debris_meta.get("model_name", "DebrisUNet_v1.0"),
            "debris_iou_score": debris_meta.get("metrics", {}).get("iou", None),
            "vessel_classifier": vessel_meta.get("model_name", "VesselClassifier_v1.0"),
            "vessel_accuracy": vessel_meta.get("metrics", {}).get("accuracy", None),
            "drift_prediction": prediction_meta.get("model_name", "GradientBoosting_Drift"),
            "prediction_mae_km": prediction_meta.get("metrics", {}).get("mae_km", None)
        }
    }
