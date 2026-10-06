import sys
import os
import unittest
import requests

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml.common.metrics import calculate_segmentation_metrics, calculate_classification_metrics, calculate_displacement_error
from ml.debris_prediction.drift_physics import advect_point, predict_trajectory
from ml.vessel_risk.risk_engine import calculate_debris_risk_score, calculate_vessel_suspicion_risk
from ml.common.gis import (
    compute_coastline_distance,
    compute_point_mpa_distance,
    check_trajectory_mpa_intersection,
    check_trajectory_coastline_intersection,
    load_coastline_layers
)

class TestMarineGuardSystem(unittest.TestCase):

    def test_metrics_calculation(self):
        y_true = [1, 1, 0, 0, 1]
        y_pred = [1, 0, 0, 0, 1]
        res = calculate_classification_metrics(y_true, y_pred)
        self.assertIn('accuracy', res)
        self.assertEqual(res['accuracy'], 0.8)

    def test_coordinate_advection(self):
        lat, lon, dist_km = advect_point(18.5230, 72.9100, u_ms=0.5, v_ms=0.5, duration_hours=6)
        self.assertGreater(lat, 18.5230)
        self.assertGreater(lon, 72.9100)
        self.assertGreater(dist_km, 0.0)

    def test_trajectory_prediction(self):
        res = predict_trajectory(18.5230, 72.9100, time_horizons=[6, 12, 24, 48, 72])
        self.assertEqual(len(res['trajectory']), 6)
        self.assertEqual(res['trajectory'][-1]['horizon_hours'], 72)

    def test_risk_prioritization(self):
        res = calculate_debris_risk_score(
            estimated_area_m2=5000.0,
            coastal_distance_km=5.0,
            protected_zone_distance_km=2.0,
            predicted_exposure_km=20.0,
            confidence=0.95
        )
        self.assertEqual(res['priority'], 'HIGH')
        self.assertGreaterEqual(res['risk_score'], 70.0)

    def test_vessel_suspicion_flag(self):
        res = calculate_vessel_suspicion_risk(
            vessel_class="Suspicious/Unclassified",
            confidence=0.85,
            ais_status="Missing",
            inside_protected_zone=True,
            loitering_detected=True
        )
        self.assertEqual(res['risk_level'], 'HIGH RISK')
        self.assertTrue(res['suspicion_flag'])

    # --- GIS & Coastline Tests ---

    def test_coastline_distance_known_coordinate(self):
        # Known coordinate in Arabian Sea near Mumbai coast (18.523N, 72.910E)
        res = compute_coastline_distance(18.523, 72.910)
        self.assertTrue(res['gis_calculated'])
        self.assertIsInstance(res['coastal_distance_km'], float)
        self.assertGreater(res['coastal_distance_km'], 0.0)
        # Should be within a realistic close range to the mainland shore (< 10 km)
        self.assertLess(res['coastal_distance_km'], 10.0)
        self.assertIn('Natural Earth', res['source'])

    def test_coastline_distance_open_ocean(self):
        # Point far out in international waters (18.523N, 65.000E)
        res = compute_coastline_distance(18.523, 65.000)
        self.assertTrue(res['gis_calculated'])
        # Deep ocean should be hundreds of kilometers from nearest coast
        self.assertGreater(res['coastal_distance_km'], 300.0)

    def test_coastline_distance_invalid_coordinates(self):
        # Latitude out of bounds (> 90)
        res_lat_oob = compute_coastline_distance(95.0, 72.910)
        self.assertFalse(res_lat_oob['gis_calculated'])
        self.assertEqual(res_lat_oob['coastal_distance_km'], 12.5)
        self.assertIn('error', res_lat_oob)

        # None values
        res_none = compute_coastline_distance(None, 72.910)
        self.assertFalse(res_none['gis_calculated'])
        self.assertEqual(res_none['coastal_distance_km'], 12.5)
        self.assertIn('error', res_none)

    def test_coastline_distance_missing_dataset_fallback(self):
        # Test loading from nonexistent path
        import ml.common.gis as gis
        old_ready = gis._COASTLINE_READY
        old_gdf = gis._COASTLINE_GDF_PROJ
        try:
            gis._COASTLINE_READY = False
            gis._COASTLINE_GDF_PROJ = None
            res = gis.compute_coastline_distance(18.523, 72.910)
            self.assertFalse(res['gis_calculated'])
            self.assertEqual(res['coastal_distance_km'], 12.5)
            self.assertIn('note', res)
        finally:
            gis._COASTLINE_READY = old_ready
            gis._COASTLINE_GDF_PROJ = old_gdf

    def test_mpa_distance_and_inclusion(self):
        # Known coordinate inside Pacific Garbage Patch Marine Reserve Corridor
        res = compute_point_mpa_distance(18.523, 72.910)
        self.assertTrue(res['gis_calculated'])
        self.assertTrue(res['inside_protected_zone'])
        self.assertEqual(res['protected_zone_distance_km'], 0.0)

    def test_trajectory_intersection(self):
        traj = [
            {"horizon_hours": 0, "latitude": 18.523, "longitude": 72.910},
            {"horizon_hours": 12, "latitude": 18.600, "longitude": 73.050}
        ]
        res = check_trajectory_mpa_intersection(traj)
        self.assertTrue(res['intersects_mpa'])
        self.assertGreater(res['exposure_distance_km'], 0.0)

    def test_trajectory_coastline_intersection_clamping(self):
        # Eastward trajectory crossing the Mumbai coastline
        eastward_traj = [
            {"horizon_hours": 0, "latitude": 18.5230, "longitude": 72.9100, "cumulative_distance_km": 0.0, "step_name": "T+0h (Detection)"},
            {"horizon_hours": 6, "latitude": 18.5800, "longitude": 73.0000, "cumulative_distance_km": 11.5, "step_name": "+6h (Immediate)"},
            {"horizon_hours": 12, "latitude": 18.6400, "longitude": 73.1000, "cumulative_distance_km": 23.0, "step_name": "+12h (Short-term)"},
            {"horizon_hours": 24, "latitude": 18.7500, "longitude": 73.3000, "cumulative_distance_km": 46.0, "step_name": "+24h (Mid-term)"},
        ]
        clamped, impact = check_trajectory_coastline_intersection(eastward_traj)
        self.assertTrue(impact['trajectory_reached_coast'])
        self.assertIsNotNone(impact['coastal_arrival_time_hours'])
        self.assertLess(impact['coastal_arrival_time_hours'], 6.0)
        self.assertIsNotNone(impact['coastal_arrival_latitude'])
        self.assertIsNotNone(impact['coastal_arrival_longitude'])
        # Trajectory must be clamped at the coastal arrival point: origin + arrival point
        self.assertEqual(len(clamped), 2)
        self.assertTrue(clamped[-1].get('is_coastal_arrival'))
        self.assertLess(clamped[-1]['longitude'], 73.0) # Halted before overland longitudes!

    def test_open_ocean_trajectory_no_landfall(self):
        # Westward trajectory drifting further out into deep ocean
        westward_traj = [
            {"horizon_hours": 0, "latitude": 18.5230, "longitude": 68.0000, "cumulative_distance_km": 0.0, "step_name": "T+0h"},
            {"horizon_hours": 6, "latitude": 18.5000, "longitude": 67.8000, "cumulative_distance_km": 21.0, "step_name": "+6h"},
            {"horizon_hours": 12, "latitude": 18.4800, "longitude": 67.6000, "cumulative_distance_km": 42.0, "step_name": "+12h"},
        ]
        clamped, impact = check_trajectory_coastline_intersection(westward_traj)
        self.assertFalse(impact['trajectory_reached_coast'])
        self.assertIsNone(impact['coastal_arrival_time_hours'])
        self.assertEqual(len(clamped), 3) # Entire trajectory preserved

    # --- Service Health Tests ---

    def test_fastapi_service_health(self):
        try:
            r = requests.get("http://127.0.0.1:8000/health", timeout=3)
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.json()["status"], "ONLINE")
        except Exception as e:
            self.skipTest(f"FastAPI server not reachable: {e}")

    def test_node_express_api_health(self):
        try:
            r = requests.get("http://127.0.0.1:5000/api/health", timeout=3)
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.json()["status"], "ONLINE")
        except Exception as e:
            self.skipTest(f"Node Express server not reachable: {e}")

if __name__ == "__main__":
    unittest.main()
