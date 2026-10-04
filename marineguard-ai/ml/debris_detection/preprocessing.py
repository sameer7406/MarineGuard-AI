import rasterio
import numpy as np
import torch
from ml.debris_detection.config import LAMBDA_RED, LAMBDA_NIR, LAMBDA_SWIR1

def compute_fdi(b04_red, b08_nir, b11_swir1):
    """
    Computes Floating Debris Index (FDI) for Sentinel-2 bands.
    FDI = R_NIR - (R_RED + (R_SWIR1 - R_RED) * ((lambda_NIR - lambda_RED)/(lambda_SWIR1 - lambda_RED)) * 1.61)
    """
    wavelength_factor = ((LAMBDA_NIR - LAMBDA_RED) / (LAMBDA_SWIR1 - LAMBDA_RED)) * 1.61
    r_prime_nir = b04_red + (b11_swir1 - b04_red) * wavelength_factor
    fdi = b08_nir - r_prime_nir
    return fdi

def compute_ndwi(b03_green, b08_nir):
    """
    Normalized Difference Water Index (NDWI) = (Green - NIR) / (Green + NIR)
    """
    denom = b03_green + b08_nir + 1e-7
    return (b03_green - b08_nir) / denom

def compute_ndvi(b04_red, b08_nir):
    """
    Normalized Difference Vegetation Index (NDVI) = (NIR - Red) / (NIR + Red)
    """
    denom = b08_nir + b04_red + 1e-7
    return (b08_nir - b04_red) / denom

def preprocess_sentinel2_bands(bands_array):
    """
    Preprocesses 6-channel Sentinel-2 array (B02, B03, B04, B08, B11, B12).
    Shape: (6, H, W)
    Returns normalized tensor of shape (6, H, W) along with diagnostic indices (FDI, NDWI, NDVI).
    """
    bands = bands_array.astype(np.float32)
    if bands.max() > 1.0:
        bands = bands / 10000.0  # Sentinel-2 TOA/BOA reflectance scaling
        
    b02_blue = bands[0]
    b03_green = bands[1]
    b04_red = bands[2]
    b08_nir = bands[3]
    b11_swir1 = bands[4]
    b12_swir2 = bands[5]
    
    fdi = compute_fdi(b04_red, b08_nir, b11_swir1)
    ndwi = compute_ndwi(b03_green, b08_nir)
    ndvi = compute_ndvi(b04_red, b08_nir)
    
    # Min-max normalization for network input
    normalized_bands = np.zeros_like(bands)
    for c in range(6):
        b_min = np.min(bands[c])
        b_max = np.max(bands[c])
        if b_max - b_min > 1e-7:
            normalized_bands[c] = (bands[c] - b_min) / (b_max - b_min)
        else:
            normalized_bands[c] = bands[c]
            
    tensor = torch.from_numpy(normalized_bands).float()
    
    return tensor, {
        "fdi_mean": float(np.mean(fdi)),
        "fdi_max": float(np.max(fdi)),
        "ndwi_mean": float(np.mean(ndwi)),
        "ndvi_mean": float(np.mean(ndvi))
    }

def read_geotiff_tile(filepath):
    """
    Reads a multispectral GeoTIFF file using Rasterio and returns bands & geotransform metadata.
    """
    with rasterio.open(filepath) as src:
        bands = src.read()
        crs = str(src.crs)
        bounds = list(src.bounds)
        transform = src.transform
        width = src.width
        height = src.height
        
    return bands, {
        "crs": crs,
        "bounds": bounds,
        "transform": transform,
        "width": width,
        "height": height
    }
