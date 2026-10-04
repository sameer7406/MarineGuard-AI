import os
import json
import numpy as np
import rasterio
from rasterio.transform import from_origin

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "sample")

def generate_sample_sentinel2_geotiff():
    """
    Creates a 6-band multispectral GeoTIFF tile (B02, B03, B04, B08, B11, B12) at 256x256 resolution.
    Includes synthetic floating plastic reflectance signature in center.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    filepath = os.path.join(DATA_DIR, "sample_sentinel2_tile.tif")
    
    height, width = 256, 256
    # 6 Bands: [B02, B03, B04, B08, B11, B12]
    # Standard ocean surface reflectance values (~0.02 - 0.05 scaling * 10000)
    bands_data = np.zeros((6, height, width), dtype=np.uint16)
    
    # Baseline sea water reflectance
    bands_data[0] = np.random.randint(400, 600, (height, width))   # B02 Blue
    bands_data[1] = np.random.randint(300, 500, (height, width))   # B03 Green
    bands_data[2] = np.random.randint(200, 400, (height, width))   # B04 Red
    bands_data[3] = np.random.randint(100, 250, (height, width))   # B08 NIR
    bands_data[4] = np.random.randint(50, 150, (height, width))    # B11 SWIR1
    bands_data[5] = np.random.randint(30, 100, (height, width))    # B12 SWIR2
    
    # Inject Floating Plastic / Debris Patch signature at center (high NIR & SWIR reflectance, characteristic FDI dip)
    cy, cx = 128, 128
    r = 25
    y, x = np.ogrid[:height, :width]
    dist_from_center = np.sqrt((x - cx)**2 + (y - cy)**2)
    debris_mask = dist_from_center <= r
    
    bands_data[2, debris_mask] += 300   # Red rise
    bands_data[3, debris_mask] += 1800  # NIR sharp reflectance jump
    bands_data[4, debris_mask] += 800   # SWIR1 rise
    
    # GeoTransform centered around Pacific/Arabian Sea coastal waters
    transform = from_origin(72.85, 18.60, 0.0001, 0.0001)
    
    with rasterio.open(
        filepath,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=6,
        dtype=bands_data.dtype,
        crs='EPSG:4326',
        transform=transform
    ) as dst:
        dst.write(bands_data)
        
    print(f"[DATA GENERATOR] Created Sentinel-2 Multispectral GeoTIFF at {filepath}")

def generate_marine_protected_areas_geojson():
    filepath = os.path.join(DATA_DIR, "marine_protected_areas.geojson")
    mpa_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Pacific Garbage Patch Marine Reserve Corridor",
                    "designation": "High Priority Ecological Sanctuary",
                    "strictness": "Strict No-Take Zone"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [72.70, 18.40],
                        [73.10, 18.40],
                        [73.10, 18.75],
                        [72.70, 18.75],
                        [72.70, 18.40]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Coral Reef National Park Marine Protected Zone",
                    "designation": "Sensitive Marine Habitat",
                    "strictness": "No Commercial Fishing"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [72.50, 18.20],
                        [72.80, 18.20],
                        [72.80, 18.45],
                        [72.50, 18.45],
                        [72.50, 18.20]
                    ]]
                }
            }
        ]
    }
    with open(filepath, "w") as f:
        json.dump(mpa_geojson, f, indent=2)
    print(f"[DATA GENERATOR] Created MPA GeoJSON at {filepath}")

def generate_initial_samples_json():
    debris_samples = [
        {
            "detectionId": "DEBRIS_1852_7291",
            "imageId": "S2B_MSIL1C_20261004T054500_N0500_R048_T43QDA",
            "timestamp": "2026-10-04T08:30:00Z",
            "latitude": 18.5230,
            "longitude": 72.9100,
            "estimatedArea": 2850.5,
            "confidence": 0.92,
            "riskScore": 78.5,
            "priority": "HIGH",
            "modelVersion": "DebrisUNet_v1.0",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [72.905, 18.518],
                    [72.915, 18.518],
                    [72.915, 18.528],
                    [72.905, 18.528],
                    [72.905, 18.518]
                ]]
            }
        },
        {
            "detectionId": "DEBRIS_1841_7282",
            "imageId": "S2A_MSIL1C_20261003T060000_N0500_R048_T43QDA",
            "timestamp": "2026-10-03T11:15:00Z",
            "latitude": 18.4120,
            "longitude": 72.8250,
            "estimatedArea": 1240.0,
            "confidence": 0.84,
            "riskScore": 54.2,
            "priority": "MEDIUM",
            "modelVersion": "DebrisUNet_v1.0",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [72.820, 18.408],
                    [72.830, 18.408],
                    [72.830, 18.416],
                    [72.820, 18.416],
                    [72.820, 18.408]
                ]]
            }
        },
        {
            "detectionId": "DEBRIS_1865_7298",
            "imageId": "S2B_MSIL1C_20261004T054500_N0500_R048_T43QDA",
            "timestamp": "2026-10-04T08:30:00Z",
            "latitude": 18.6510,
            "longitude": 72.9840,
            "estimatedArea": 420.0,
            "confidence": 0.79,
            "riskScore": 28.6,
            "priority": "LOW",
            "modelVersion": "DebrisUNet_v1.0",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [72.980, 18.648],
                    [72.988, 18.648],
                    [72.988, 18.654],
                    [72.980, 18.654],
                    [72.980, 18.648]
                ]]
            }
        }
    ]
    with open(os.path.join(DATA_DIR, "initial_debris_samples.json"), "w") as f:
        json.dump(debris_samples, f, indent=2)

    vessel_samples = [
        {
            "vesselId": "VESSEL_X904_FLAGGED",
            "timestamp": "2026-10-04T09:12:00Z",
            "latitude": 18.5500,
            "longitude": 72.8500,
            "vesselType": "Suspicious/Unclassified",
            "confidence": 0.88,
            "aisStatus": "Missing",
            "speedKnots": 0.8,
            "headingDegrees": 140.0,
            "riskScore": 85.0,
            "riskLevel": "HIGH RISK",
            "insideProtectedZone": True,
            "riskFactors": [
                "Unidentified visual profile absent from standard vessel registry",
                "AIS transponder signal gap or unexpected transmission failure",
                "Vessel operating within designated Marine Protected Area (MPA) boundary",
                "Unusual loitering or stationary drift pattern in regulated waters"
            ],
            "verificationStatus": "Requires Verification"
        },
        {
            "vesselId": "VESSEL_CARGO_882",
            "timestamp": "2026-10-04T09:30:00Z",
            "latitude": 18.3200,
            "longitude": 72.9500,
            "vesselType": "Cargo",
            "confidence": 0.94,
            "aisStatus": "Active",
            "speedKnots": 14.5,
            "headingDegrees": 210.0,
            "riskScore": 12.0,
            "riskLevel": "LOW RISK",
            "insideProtectedZone": False,
            "riskFactors": [],
            "verificationStatus": "Verified Standard Vessel"
        }
    ]
    with open(os.path.join(DATA_DIR, "initial_vessels_samples.json"), "w") as f:
        json.dump(vessel_samples, f, indent=2)
        
    print(f"[DATA GENERATOR] Created Debris & Vessel Sample JSONs in {DATA_DIR}")

if __name__ == "__main__":
    generate_sample_sentinel2_geotiff()
    generate_marine_protected_areas_geojson()
    generate_initial_samples_json()
