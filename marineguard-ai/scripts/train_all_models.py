import os
import sys
import numpy as np

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from scripts.generate_sample_data import generate_sample_sentinel2_geotiff, generate_marine_protected_areas_geojson, generate_initial_samples_json
from ml.debris_detection.train import train_debris_model
from ml.vessel_detection.train import train_vessel_model
from ml.debris_prediction.train import train_prediction_model
from ml.common.logging import logger

def build_multispectral_training_dataset(num_samples=40):
    """
    Generates synthetic 6-band Sentinel-2 training patch samples with ground-truth segmentation masks.
    Adheres to MARIDA spectral reflectance distributions.
    """
    np.random.seed(42)
    samples = []
    for _ in range(num_samples):
        # 6 Bands: [B02, B03, B04, B08, B11, B12]
        bands = np.zeros((6, 256, 256), dtype=np.float32)
        bands[0] = np.random.uniform(0.04, 0.06, (256, 256)) # Blue
        bands[1] = np.random.uniform(0.03, 0.05, (256, 256)) # Green
        bands[2] = np.random.uniform(0.02, 0.04, (256, 256)) # Red
        bands[3] = np.random.uniform(0.01, 0.025, (256, 256)) # NIR
        bands[4] = np.random.uniform(0.005, 0.015, (256, 256)) # SWIR1
        bands[5] = np.random.uniform(0.003, 0.01, (256, 256)) # SWIR2
        
        mask = np.zeros((256, 256), dtype=np.float32)
        
        # Inject floating debris patch randomly
        has_debris = np.random.rand() > 0.3
        if has_debris:
            cy, cx = np.random.randint(60, 196, 2)
            r = np.random.randint(15, 35)
            y, x = np.ogrid[:256, :256]
            dist = np.sqrt((x - cx)**2 + (y - cy)**2)
            d_mask = dist <= r
            mask[d_mask] = 1.0
            
            # Debris spectral signature elevation
            bands[2, d_mask] += np.random.uniform(0.03, 0.06)
            bands[3, d_mask] += np.random.uniform(0.15, 0.25)
            bands[4, d_mask] += np.random.uniform(0.08, 0.12)
            
        samples.append({"bands": bands, "mask": mask})
    return samples

def main():
    logger.info("==================================================")
    logger.info("MARINEGUARD AI - MASTER MODEL TRAINING & EVALUATION")
    logger.info("==================================================")
    
    logger.info("Step 1: Generating Sample Datasets & GeoTIFF Tiles...")
    generate_sample_sentinel2_geotiff()
    generate_marine_protected_areas_geojson()
    generate_initial_samples_json()
    
    logger.info("Step 2: Training PyTorch DebrisUNet Model...")
    debris_samples = build_multispectral_training_dataset(num_samples=40)
    train_debris_model(debris_samples, epochs=5, lr=1e-3)
    
    logger.info("Step 3: Training PyTorch Maritime Vessel Detection Model...")
    train_vessel_model()
    
    logger.info("Step 4: Training Debris Trajectory Prediction Model...")
    train_prediction_model()
    
    logger.info("==================================================")
    logger.info("ALL ML MODELS TRAINED AND SAVED SUCCESSFULLY!")
    logger.info("Saved Models Directory: " + os.path.join(BASE_DIR, "models"))
    logger.info("==================================================")

if __name__ == "__main__":
    main()
