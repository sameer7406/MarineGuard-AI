import os
import time
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split

from ml.common.metrics import calculate_displacement_error
from ml.common.utils import save_json, set_seed
from ml.common.logging import logger

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_SAVE_DIR = os.path.join(BASE_DIR, "models", "prediction")

def generate_synthetic_trajectories(num_samples=1000):
    """
    Generates synthetic trajectory displacement training samples based on physical drift equations with added noise.
    Features: [start_lat, start_lon, ocean_u, ocean_v, wind_u, wind_v, horizon_hours]
    Targets: [delta_lat, delta_lon]
    """
    set_seed(42)
    X, y = [], []
    
    for _ in range(num_samples):
        lat = np.random.uniform(15.0, 25.0)
        lon = np.random.uniform(70.0, 80.0)
        u_curr = np.random.uniform(-0.5, 0.5)
        v_curr = np.random.uniform(-0.5, 0.5)
        u_wind = np.random.uniform(-10.0, 10.0)
        v_wind = np.random.uniform(-10.0, 10.0)
        h = np.random.choice([6, 12, 24, 48, 72])
        
        # Physical model ground truth
        sec = h * 3600.0
        u_net = u_curr + 0.03 * u_wind
        v_net = v_curr + 0.03 * v_wind
        
        d_y = v_net * sec + np.random.normal(0, 500) # add 500m turbulence noise
        d_x = u_net * sec + np.random.normal(0, 500)
        
        d_lat = d_y / 111320.0
        d_lon = d_x / (111320.0 * np.cos(np.radians(lat)))
        
        X.append([lat, lon, u_curr, v_curr, u_wind, v_wind, h])
        y.append([d_lat, d_lon])
        
    return np.array(X), np.array(y)

def train_prediction_model():
    logger.info("Training Debris Trajectory Prediction Model...")
    X, y = generate_synthetic_trajectories(1500)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model_lat = GradientBoostingRegressor(n_estimators=100, random_state=42)
    model_lon = GradientBoostingRegressor(n_estimators=100, random_state=42)
    
    model_lat.fit(X_train, y_train[:, 0])
    model_lon.fit(X_train, y_train[:, 1])
    
    # Validation metrics
    pred_dlat = model_lat.predict(X_test)
    pred_dlon = model_lon.predict(X_test)
    
    true_coords = [(X_test[i, 0] + y_test[i, 0], X_test[i, 1] + y_test[i, 1]) for i in range(len(X_test))]
    pred_coords = [(X_test[i, 0] + pred_dlat[i], X_test[i, 1] + pred_dlon[i]) for i in range(len(X_test))]
    
    eval_metrics = calculate_displacement_error(true_coords, pred_coords)
    logger.info(f"Trajectory Predictor Trained - Validation MAE: {eval_metrics['mae_km']} km | EPE: {eval_metrics['endpoint_error_km']} km")
    
    os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
    joblib.dump({"lat_model": model_lat, "lon_model": model_lon}, os.path.join(MODEL_SAVE_DIR, "drift_model.pkl"))
    
    metadata = {
        "model_name": "DebrisTrajectoryGradientBoosting",
        "model_version": "v1.0.0",
        "training_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "metrics": eval_metrics,
        "features": ["lat", "lon", "ocean_u", "ocean_v", "wind_u", "wind_v", "horizon_hours"]
    }
    
    save_json(metadata, os.path.join(MODEL_SAVE_DIR, "prediction_metadata.json"))
    return eval_metrics
