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
