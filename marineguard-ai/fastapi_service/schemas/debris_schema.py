from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RiskWeightConfig(BaseModel):
    w_area: Optional[float] = 0.25
    w_eco: Optional[float] = 0.30
    w_coast: Optional[float] = 0.20
    w_exposure: Optional[float] = 0.15
    w_conf: Optional[float] = 0.10

class DebrisRiskRequest(BaseModel):
    estimated_area_m2: float
    coastal_distance_km: float = 12.5
    protected_zone_distance_km: float = 8.0
    predicted_exposure_km: float = 15.0
    confidence: float = 0.90
    weights: Optional[RiskWeightConfig] = Field(default_factory=RiskWeightConfig)

class DebrisPredictRequest(BaseModel):
    latitude: float
    longitude: float
    ocean_u: Optional[float] = 0.25
    ocean_v: Optional[float] = 0.15
    wind_u: Optional[float] = 4.5
    wind_v: Optional[float] = 2.1
    time_horizons: Optional[List[int]] = [6, 12, 24, 48, 72]

class DebrisDetectRequest(BaseModel):
    latitude: Optional[float] = 18.5230
    longitude: Optional[float] = 72.9100
    tile_id: Optional[str] = "S2B_MSIL1C_20261004T054500"
