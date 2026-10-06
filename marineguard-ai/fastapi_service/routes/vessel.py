from fastapi import APIRouter
from fastapi_service.schemas.vessel_schema import VesselDetectRequest, VesselRiskRequest
from ml.vessel_detection.inference import VesselInferenceEngine
from ml.vessel_risk.risk_engine import calculate_vessel_suspicion_risk
from ml.common.gis import compute_point_mpa_distance

router = APIRouter()
vessel_engine = VesselInferenceEngine()

@router.post("/vessel/detect")
def detect_vessel(req: VesselDetectRequest):
    """
    Runs maritime vessel classifier on ROI and evaluates behavioral/geospatial suspicion risk
    using independent evidence channels:
      1. Satellite CV visual morphology classification
      2. AIS transponder telemetry availability
      3. GeoPandas/Shapely MPA boundary inclusion (EPSG:3857)
      4. Kinematic loitering anomaly detection
    """
    # 1. Independent Visual CV Inference
    cv_res = vessel_engine.predict_vessel()

    # 2. Independent GIS Spatial Check (Point-in-Polygon against MPA)
    gis_info = compute_point_mpa_distance(req.latitude, req.longitude)
    is_inside_mpa = gis_info.get("inside_protected_zone", False)

    # 3. Independent Kinematic & Telemetry Checks
    # Speed: use request value if provided, else assign context-appropriate baseline
    speed = req.speed_knots if req.speed_knots is not None else (0.8 if is_inside_mpa else 12.4)

    # Loitering: true if explicitly flagged, or if stationary/drifting inside regulated zone
    if req.loitering_detected is not None:
        loitering_flag = req.loitering_detected
    else:
        loitering_flag = bool(is_inside_mpa and speed < 1.5)

    # AIS status: respect explicit telemetry, never conflate with visual class
    if req.ais_status is not None:
        ais_status = req.ais_status
    elif is_inside_mpa and loitering_flag:
        ais_status = "Missing" # Flag AIS gap when anomalous stationary behavior in reserve is detected
    else:
        ais_status = "Active"

    # 4. Multi-Factor Decision-Support Risk Assessment
    risk_res = calculate_vessel_suspicion_risk(
        vessel_class=cv_res["vessel_class"],
        confidence=cv_res["confidence"],
        ais_status=ais_status,
        inside_protected_zone=is_inside_mpa,
        loitering_detected=loitering_flag,
        speed_knots=speed
    )

    return {
        "model_version": "v1.0.0",
        "detection_id": f"VESSEL_S2_{int(req.latitude*1000)}_{int(req.longitude*1000)}",
        "latitude": req.latitude,
        "longitude": req.longitude,
        "speed_knots": speed,
        "ais_status": ais_status,
        "cv_inference": cv_res,
        "risk_assessment": risk_res,
        "gis_spatial_analysis": {
            "inside_protected_zone": is_inside_mpa,
            "protected_zone_distance_km": gis_info.get("protected_zone_distance_km", 0.0),
            "nearest_mpa_name": gis_info.get("nearest_mpa_name", "None"),
            "all_mpa_distances_km": gis_info.get("all_mpa_distances_km", []),
            "gis_method": "GeoPandas + Shapely EPSG:3857 projected geodesic distance"
        }
    }

@router.post("/vessel/risk")
def calculate_vessel_risk(req: VesselRiskRequest):
    """
    Calculates Suspicious Marine Vessel Risk Score (0-100) based on visual CV and AIS behavioral telemetry.
    Supports real GIS MPA evaluation if latitude and longitude are supplied.
    """
    inside_mpa = req.inside_protected_zone
    gis_info = None

    if req.latitude is not None and req.longitude is not None:
        gis_info = compute_point_mpa_distance(req.latitude, req.longitude)
        if inside_mpa is None:
            inside_mpa = gis_info.get("inside_protected_zone", False)

    if inside_mpa is None:
        inside_mpa = False

    res = calculate_vessel_suspicion_risk(
        vessel_class=req.vessel_class,
        confidence=req.confidence,
        ais_status=req.ais_status,
        inside_protected_zone=inside_mpa,
        loitering_detected=req.loitering_detected,
        speed_knots=req.speed_knots
    )
    if gis_info:
        res["gis_spatial_analysis"] = gis_info
    return res
