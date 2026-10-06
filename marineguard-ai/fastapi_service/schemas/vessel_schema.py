from pydantic import BaseModel
from typing import Optional, List

class VesselRiskRequest(BaseModel):
    vessel_class: str = "Suspicious/Unclassified"
    confidence: float = 0.85
    ais_status: str = "Missing" # Active, Missing, Gap, Offline, Spoofed
    inside_protected_zone: Optional[bool] = None
    loitering_detected: bool = True
    speed_knots: float = 0.8
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class VesselDetectRequest(BaseModel):
    latitude: Optional[float] = 18.5500
    longitude: Optional[float] = 72.8500
    ais_status: Optional[str] = None # 'Active', 'Missing', 'Gap', 'Offline', 'Spoofed' (if None, independent telemetry is checked)
    speed_knots: Optional[float] = None
    loitering_detected: Optional[bool] = None
