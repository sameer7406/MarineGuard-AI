# MarineGuard AI - Dataset Documentation

## Overview
MarineGuard AI utilizes multispectral satellite imagery, synthetic oceanographic drift telemetry, marine protected area (MPA) boundaries, and maritime AIS vessel data for ocean debris monitoring, movement prediction, and suspicious vessel detection.

---

## 1. Sentinel-2 Multispectral Marine Debris Dataset (MARIDA Benchmark Alignment)

### Primary Source & Format
- **Dataset Reference:** MARIDA (Marine Debris Archive - Sentinel-2 dataset for floating plastic and marine debris benchmark).
- **Satellite Constellation:** Sentinel-2A / Sentinel-2B Multi-Spectral Instrument (MSI).
- **Spatial Resolution:** 10m (B02, B03, B04, B08), 20m (B05, B06, B07, B8A, B11, B12).
- **Spectral Bands Used:**
  - **B02 (Blue - 490 nm):** Water clarity & atmospheric baseline.
  - **B03 (Green - 560 nm):** Chlorophyll & algal bloom discrimination.
  - **B04 (Red - 665 nm):** Water absorption baseline.
  - **B08 (NIR - 842 nm):** Floating vegetation / debris surface reflectance.
  - **B11 (SWIR-1 - 1610 nm):** Floating plastic spectral absorption dip & Floating Debris Index (FDI).
  - **B12 (SWIR-2 - 2190 nm):** Submerged vs. floating debris distinction.

### Preprocessing & Index Calculations
- **Floating Debris Index (FDI):**
  $$FDI = R_{NIR} - \left( R_{RED} + (R_{SWIR1} - R_{RED}) \cdot \frac{\lambda_{NIR} - \lambda_{RED}}{\lambda_{SWIR1} - \lambda_{RED}} \cdot 1.61 \right)$$
- **Normalized Difference Water Index (NDWI):**
  $$NDWI = \frac{R_{GREEN} - R_{NIR}}{R_{GREEN} + R_{NIR}}$$
- **Normalized Difference Vegetation Index (NDVI):**
  $$NDVI = \frac{R_{NIR} - R_{RED}}{R_{NIR} + R_{RED}}$$

---

## 2. Oceanographic Current & Wind Telemetry Data

### Data Source
- **Ocean Currents:** Copernicus Marine Environment Monitoring Service (CMEMS) Global Ocean Physics Analysis (U & V eastward/northward current components in m/s).
- **Surface Wind:** ECMWF ERA5 Reanalysis / Open-Meteo Weather API 10-meter wind vectors (U_wind & V_wind in m/s).

### Drift Dynamics Mechanics (Advection-Diffusion Model)
The total velocity vector $\vec{V}_{debris}$ for floating debris movement is calculated as:
$$\vec{V}_{debris} = \vec{V}_{current} + \alpha \cdot \vec{V}_{wind}$$
where $\alpha \approx 0.03$ (3% windage coefficient for floating debris/plastics).

---

## 3. Marine Protected Areas (MPA) & Ecological Zones

### Data Source
- **World Database on Protected Areas (WDPA) / Protected Planet GeoJSON datasets**.
- Core zones covered in demo:
  - Pacific Garbage Patch High-Risk Corridor (18.5°N - 24.2°N, 72.5°E - 73.5°E)
  - Coastal Marine Reserves & Coral Reef Marine Sanctuaries.

---

## 4. Maritime Vessel Detections & AIS Telemetry Dataset

### Data Source
- **xView3 Maritime Dataset / OpenAIS Telemetry Stream**.
- Features recorded:
  - `vessel_id` (Unique vessel identifier)
  - `lat`, `lon` (Geographic coordinates)
  - `vessel_type` (Cargo, Fishing, Tug, Tanker, Suspicious Unclassified)
  - `ais_status` (Active, Missing/Gap, Spoofed, Offline)
  - `speed_knots` & `heading_degrees`
  - `protected_zone_overlap` (Boolean intersection with MPA polygon)
  - `loitering_flag` (Anomalous stationary patterns in sensitive marine zones)

---

## 5. Dataset Reproducibility & Synthetic Pipeline
In the absence of live API keys, `scripts/generate_sample_data.py` generates valid multispectral GeoTIFF tiles, synthetic ocean drift fields, and GeoJSON files containing realistic spectral profiles adhering to the exact published Sentinel-2 MARIDA band statistics.
