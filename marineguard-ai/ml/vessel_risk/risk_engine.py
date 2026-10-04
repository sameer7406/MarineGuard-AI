import numpy as np

def calculate_debris_risk_score(
    estimated_area_m2,
    coastal_distance_km,
    protected_zone_distance_km,
    predicted_exposure_km,
    confidence,
    weights=None
):
    """
    Calculates transparent Relative Environmental Risk Score (0-100) for floating marine debris.
    """
    if weights is None:
        weights = {
            "w_area": 0.25,
            "w_eco": 0.30,
            "w_coast": 0.20,
            "w_exposure": 0.15,
            "w_conf": 0.10
        }
        
    # Sub-scores (0 - 100)
    # 1. Size score: larger area = higher risk
    area_score = min(100.0, (estimated_area_m2 / 5000.0) * 100.0)
    
    # 2. Ecological Proximity score: closer to protected area = higher risk
    eco_score = max(0.0, 100.0 - (protected_zone_distance_km / 50.0) * 100.0)
    
    # 3. Coastal Proximity score: closer to coast = higher risk
    coast_score = max(0.0, 100.0 - (coastal_distance_km / 50.0) * 100.0)
    
    # 4. Predicted Exposure score: greater drift distance towards sensitive zones = higher risk
    exposure_score = min(100.0, (predicted_exposure_km / 30.0) * 100.0)
    
    # 5. Detection Confidence score
    conf_score = float(confidence) * 100.0
    
    risk_score = (
        weights["w_area"] * area_score +
        weights["w_eco"] * eco_score +
        weights["w_coast"] * coast_score +
        weights["w_exposure"] * exposure_score +
        weights["w_conf"] * conf_score
    )
    
    risk_score = round(float(np.clip(risk_score, 0.0, 100.0)), 1)
    
    if risk_score >= 70.0:
        priority = "HIGH"
    elif risk_score >= 40.0:
        priority = "MEDIUM"
    else:
        priority = "LOW"
        
    return {
        "risk_score": risk_score,
        "priority": priority,
        "score_breakdown": {
            "area_score": round(area_score, 1),
            "ecological_proximity_score": round(eco_score, 1),
            "coastal_proximity_score": round(coast_score, 1),
            "predicted_exposure_score": round(exposure_score, 1),
            "confidence_score": round(conf_score, 1)
        },
        "weights_used": weights
    }

def calculate_vessel_suspicion_risk(
    vessel_class,
    confidence,
    ais_status,
    inside_protected_zone,
    loitering_detected=False,
    speed_knots=0.0
):
    """
    Calculates Suspicious Marine Vessel Risk Score (0-100) based on visual CV and AIS behavioral telemetry.
    Terminology: Suspicious Vessel / Potential Illegal Activity / Requires Verification.
    """
    risk_score = 0.0
    risk_factors = []
    
    # Factor 1: Visual Confidence & Vessel Class
    if vessel_class == "Suspicious/Unclassified":
        risk_score += 30.0
        risk_factors.append("Unidentified visual profile absent from standard vessel registry")
    elif confidence < 0.65:
        risk_score += 15.0
        risk_factors.append("Low visual detection confidence - requires secondary validation")
        
    # Factor 2: AIS Signal Availability / Consistency
    if ais_status in ["Missing", "Gap", "Offline"]:
        risk_score += 35.0
        risk_factors.append("AIS transponder signal gap or unexpected transmission failure")
    elif ais_status == "Spoofed":
        risk_score += 45.0
        risk_factors.append("Inconsistent AIS broadcast location vs visual satellite observation")
        
    # Factor 3: Protected Marine Zone Intrusion
    if inside_protected_zone:
        risk_score += 25.0
        risk_factors.append("Vessel operating within designated Marine Protected Area (MPA) boundary")
        
    # Factor 4: Behavioral Anomaly (Loitering / Stationary)
    if loitering_detected or (inside_protected_zone and speed_knots < 1.5):
        risk_score += 20.0
        risk_factors.append("Unusual loitering or stationary drift pattern in regulated waters")
        
    final_score = round(float(np.clip(risk_score, 0.0, 100.0)), 1)
    
    if final_score >= 70.0:
        risk_level = "HIGH RISK"
        recommendation = "Requires Immediate Verification by Coast Guard / Maritime Patrol"
    elif final_score >= 40.0:
        risk_level = "MEDIUM RISK"
        recommendation = "Recommended Secondary Satellite Observation & AIS Tracking"
    else:
        risk_level = "LOW RISK"
        recommendation = "Standard Automated Monitoring"
        
    return {
        "vessel_risk_score": final_score,
        "risk_level": risk_level,
        "suspicion_flag": final_score >= 40.0,
        "risk_factors": risk_factors,
        "recommendation": recommendation,
        "disclaimer": "Risk scores are decision-support flags for verification and do not constitute formal legal determination of illegal activity."
    }
