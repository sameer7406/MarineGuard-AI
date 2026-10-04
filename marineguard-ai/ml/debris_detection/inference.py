import os
import torch
import numpy as np
from shapely.geometry import Polygon, MultiPolygon
import shapely.geometry

from ml.debris_detection.config import MODEL_SAVE_DIR
from ml.debris_detection.model import DebrisUNet
from ml.debris_detection.preprocessing import preprocess_sentinel2_bands

class DebrisInferenceEngine:
    def __init__(self, model_path=None):
        if model_path is None:
            model_path = os.path.join(MODEL_SAVE_DIR, "debris_unet_model.pth")
            
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = DebrisUNet(in_channels=6, out_channels=1).to(self.device)
        
        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.eval()
            self.loaded = True
        else:
            self.model.eval()
            self.loaded = False

    def predict_tile(self, bands_array, center_lat=18.523, center_lon=72.91, spatial_resolution_m=10.0):
        """
        Runs PyTorch inference on a 6-band multispectral array.
        Returns detected debris patches with coordinates, estimated area, confidence, and diagnostic metrics.
        """
        tensor_img, diagnostic = preprocess_sentinel2_bands(bands_array)
        input_tensor = tensor_img.unsqueeze(0).to(self.device) # (1, 6, H, W)
        
        with torch.no_grad():
            prob_map = self.model(input_tensor).squeeze().cpu().numpy() # (H, W)
            
        binary_mask = (prob_map >= 0.45).astype(np.uint8)
        
        # Calculate pixel-level area
        H, W = binary_mask.shape
        pixel_area_m2 = spatial_resolution_m * spatial_resolution_m
        
        detections = []
        if np.any(binary_mask):
            # Extract clusters
            debris_pixel_count = int(np.sum(binary_mask))
            total_area_m2 = debris_pixel_count * pixel_area_m2
            avg_confidence = float(np.mean(prob_map[binary_mask == 1]))
            
            # Generate representative bounding geometry around center lat/lon
            lat_offset = (debris_pixel_count**0.5 * spatial_resolution_m / 111320.0) / 2.0
            lon_offset = (debris_pixel_count**0.5 * spatial_resolution_m / (111320.0 * np.cos(np.radians(center_lat)))) / 2.0
            
            bbox_coords = [
                [center_lon - lon_offset, center_lat - lat_offset],
                [center_lon + lon_offset, center_lat - lat_offset],
                [center_lon + lon_offset, center_lat + lat_offset],
                [center_lon - lon_offset, center_lat + lat_offset],
                [center_lon - lon_offset, center_lat - lat_offset]
            ]
            
            geometry = {
                "type": "Polygon",
                "coordinates": [bbox_coords]
            }
            
            detections.append({
                "detection_id": f"DEBRIS_{int(center_lat*1000)}_{int(center_lon*1000)}",
                "latitude": round(center_lat, 5),
                "longitude": round(center_lon, 5),
                "estimated_area_m2": round(total_area_m2, 1),
                "confidence": round(avg_confidence, 4),
                "geometry": geometry,
                "fdi_spectral_index": round(diagnostic["fdi_mean"], 4),
                "ndwi_index": round(diagnostic["ndwi_mean"], 4),
                "pixel_count": debris_pixel_count
            })
            
        return {
            "model_version": "v1.0.0",
            "model_type": "DebrisUNet_Multispectral",
            "detections": detections,
            "diagnostics": diagnostic,
            "has_debris": len(detections) > 0
        }
