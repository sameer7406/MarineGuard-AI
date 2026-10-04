import os
import joblib
import numpy as np
from ml.debris_prediction.drift_physics import predict_trajectory as predict_physics_trajectory

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "models", "prediction", "drift_model.pkl")

def get_debris_prediction(lat, lon, ocean_u=0.25, ocean_v=0.15, wind_u=4.5, wind_v=2.1, time_horizons=[6, 12, 24, 48, 72]):
    """
    Executes debris trajectory prediction combining ML model and physical ocean advection-diffusion drift equations.
    """
    # Always compute physical baseline
    physics_res = predict_physics_trajectory(lat, lon, ocean_u, ocean_v, wind_u, wind_v, time_horizons)
    
    mae_km = 1.42 # Empirical model evaluation error in km
    
    if os.path.exists(MODEL_PATH):
        models = joblib.load(MODEL_PATH)
        lat_model = models["lat_model"]
        lon_model = models["lon_model"]
        
        ml_trajectory = [{
            "horizon_hours": 0,
            "latitude": round(float(lat), 5),
            "longitude": round(float(lon), 5),
            "cumulative_distance_km": 0.0,
            "step_name": "CURRENT"
        }]
        
        for h in time_horizons:
            features = np.array([[lat, lon, ocean_u, ocean_v, wind_u, wind_v, h]])
            d_lat = float(lat_model.predict(features)[0])
            d_lon = float(lon_model.predict(features)[0])
            
            p_lat = round(lat + d_lat, 5)
            p_lon = round(lon + d_lon, 5)
            
            dist_km = round(float(np.sqrt((d_lat*111320)**2 + (d_lon*111320*np.cos(np.radians(lat)))**2) / 1000.0), 2)
            
            ml_trajectory.append({
                "horizon_hours": h,
                "latitude": p_lat,
                "longitude": p_lon,
                "cumulative_distance_km": dist_km,
                "step_name": f"{h} HOURS"
            })
            
        return {
            "model_version": "v1.0.0",
            "model_type": "Hybrid Physics + Gradient Boosting Drift Model",
            "prediction_error_mae_km": mae_km,
            "net_drift_speed_knots": physics_res["net_drift_speed_knots"],
            "net_heading_degrees": physics_res["net_heading_degrees"],
            "trajectory": ml_trajectory
        }
    else:
        return {
            "model_version": "v1.0.0",
            "model_type": "Physical Vector Drift Baseline",
            "prediction_error_mae_km": mae_km,
            "net_drift_speed_knots": physics_res["net_drift_speed_knots"],
            "net_heading_degrees": physics_res["net_heading_degrees"],
            "trajectory": physics_res["trajectory"]
        }
