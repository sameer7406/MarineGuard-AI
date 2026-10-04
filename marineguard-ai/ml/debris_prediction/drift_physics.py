import numpy as np

def calculate_drift_velocity(u_current, v_current, u_wind, v_wind, windage_coeff=0.03):
    """
    Calculates net velocity vector (m/s) combining ocean currents and surface wind drift.
    V_total = V_current + alpha * V_wind
    """
    u_total = u_current + windage_coeff * u_wind
    v_total = v_current + windage_coeff * v_wind
    return u_total, v_total

def advect_point(lat, lon, u_ms, v_ms, duration_hours):
    """
    Advects a geographic point (lat, lon) given east/north velocities (m/s) over duration_hours.
    1 degree latitude approx = 111,320 meters.
    1 degree longitude approx = 111,320 * cos(lat) meters.
    """
    seconds = duration_hours * 3600.0
    delta_y_m = v_ms * seconds # Northward displacement in meters
    delta_x_m = u_ms * seconds # Eastward displacement in meters
    
    delta_lat = delta_y_m / 111320.0
    delta_lon = delta_x_m / (111320.0 * np.cos(np.radians(lat)))
    
    new_lat = lat + delta_lat
    new_lon = lon + delta_lon
    
    # Calculate distance travelled in km
    dist_km = np.sqrt(delta_x_m**2 + delta_y_m**2) / 1000.0
    
    return round(float(new_lat), 5), round(float(new_lon), 5), round(float(dist_km), 2)

def predict_trajectory(start_lat, start_lon, ocean_u=0.25, ocean_v=0.15, wind_u=4.5, wind_v=2.1, time_horizons=[6, 12, 24, 48, 72]):
    """
    Predicts multi-horizon trajectory points for floating debris.
    Returns structured trajectory points with timestamps, coordinates, and cumulative displacement.
    """
    u_net, v_net = calculate_drift_velocity(ocean_u, ocean_v, wind_u, wind_v)
    
    trajectory = [{
        "horizon_hours": 0,
        "latitude": round(float(start_lat), 5),
        "longitude": round(float(start_lon), 5),
        "cumulative_distance_km": 0.0,
        "step_name": "CURRENT"
    }]
    
    for h in time_horizons:
        lat, lon, dist_km = advect_point(start_lat, start_lon, u_net, v_net, h)
        trajectory.append({
            "horizon_hours": h,
            "latitude": lat,
            "longitude": lon,
            "cumulative_distance_km": dist_km,
            "step_name": f"{h} HOURS"
        })
        
    return {
        "start_location": [start_lat, start_lon],
        "net_drift_speed_knots": round(float(np.sqrt(u_net**2 + v_net**2) * 1.94384), 2),
        "net_heading_degrees": round(float((np.degrees(np.arctan2(u_net, v_net)) + 360) % 360), 1),
        "trajectory": trajectory
    }
