import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_SAVE_DIR = os.path.join(BASE_DIR, "models", "debris")
DATA_DIR = os.path.join(BASE_DIR, "data", "sample")

SENTINEL2_BANDS = ["B02", "B03", "B04", "B08", "B11", "B12"]
NUM_CHANNELS = 6
IMAGE_SIZE = 256
BATCH_SIZE = 4
EPOCHS = 10
LEARNING_RATE = 1e-3

# Sentinel-2 Band Wavelengths in nm for FDI Calculation
LAMBDA_RED = 665.0
LAMBDA_NIR = 842.0
LAMBDA_SWIR1 = 1610.0
