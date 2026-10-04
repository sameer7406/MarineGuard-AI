from fastapi import APIRouter
from fastapi_service.schemas.vessel_schema import VesselDetectRequest, VesselRiskRequest
from ml.vessel_detection.inference import VesselInferenceEngine
from ml.vessel_risk.risk_engine import calculate_vessel_suspicion_risk

router = APIRouter()
vessel_engine = VesselInferenceEngine()

@router.post("/vessel/detect")
def detect_vessel(req: VesselDetectRequest):
    cv_res = vessel_engine.predict_vessel()
    
    risk_res = calculate_vessel_suspicion_risk(
        vessel_class=cv_res["vessel_class"],
        confidence=cv_res["confidence"],
        ais_status="Missing" if cv_res["vessel_class"] == "Suspicious/Unclassified" else "Active",
        inside_protected_zone=True if cv_res["vessel_class"] == "Suspicious/Unclassified" else False,
        loitering_detected=True if cv_res["vessel_class"] == "Suspicious/Unclassified" else False
    )
    
    return {
        "model_version": "v1.0.0",
        "detection_id": f"VESSEL_S2_{int(req.latitude*1000)}_{int(req.longitude*1000)}",
        "latitude": req.latitude,
        "longitude": req.longitude,
        "cv_inference": cv_res,
        "risk_assessment": risk_res
    }

@router.post("/vessel/risk")
def calculate_vessel_risk(req: VesselRiskRequest):
    res = calculate_vessel_suspicion_risk(
        vessel_class=req.vessel_class,
        confidence=req.confidence,
        ais_status=req.ais_status,
        inside_protected_zone=req.inside_protected_zone,
        loitering_detected=req.loitering_detected,
        speed_knots=req.speed_knots
    )
    return res
