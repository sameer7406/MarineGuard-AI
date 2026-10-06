"""
MarineGuard AI - Central Geospatial & GIS Analysis Engine
Provides GeoPandas/Shapely geodesic & projected distance operations (EPSG:3857)
against Marine Protected Areas (MPAs) and Natural Earth Coastline geometry.
"""

import os
import geopandas as gpd
from shapely.geometry import Point, LineString
from shapely.ops import transform
import pyproj

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MPA_GEOJSON_PATH = os.path.join(BASE_DIR, "data", "sample", "marine_protected_areas.geojson")
COASTLINE_GEOJSON_PATH = os.path.join(BASE_DIR, "data", "sample", "coastline_50m.geojson")

_MPA_GDF_WGS84 = None
_MPA_GDF_PROJ = None
_MPA_PROJECTION_READY = False

_COASTLINE_GDF_WGS84 = None
_COASTLINE_GDF_PROJ = None
_COASTLINE_READY = False

# Setup coordinate transform: EPSG:4326 (WGS84 lon, lat) -> EPSG:3857 (Spherical Mercator, metres)
_WGS84 = pyproj.CRS("EPSG:4326")
_MERCATOR = pyproj.CRS("EPSG:3857")
_TRANSFORMER = pyproj.Transformer.from_crs(_WGS84, _MERCATOR, always_xy=True).transform


def load_mpa_layers(custom_path=None):
    """Loads and caches the MPA GeoDataFrames."""
    global _MPA_GDF_WGS84, _MPA_GDF_PROJ, _MPA_PROJECTION_READY
    target_path = custom_path or MPA_GEOJSON_PATH

    if os.path.exists(target_path):
        try:
            gdf = gpd.read_file(target_path)
            gdf = gdf[gdf.geometry.notna()].copy()
            _MPA_GDF_WGS84 = gdf
            _MPA_GDF_PROJ = gdf.to_crs(epsg=3857)
            _MPA_PROJECTION_READY = True
            print(f"[GIS Engine] Loaded {len(gdf)} MPA zones from {target_path} (Projected EPSG:3857)")
            return True
        except Exception as e:
            print(f"[GIS Engine] Error loading MPA GeoJSON: {e}")
            _MPA_PROJECTION_READY = False
            return False
    else:
        print(f"[GIS Engine] Warning: MPA file not found at {target_path}")
        _MPA_PROJECTION_READY = False
        return False


def load_coastline_layers(custom_path=None):
    """
    Loads and caches the Natural Earth 50m Physical Coastline GeoDataFrame.
    Dataset: Natural Earth 1:50m Physical Coastline (ne_50m_coastline)
    License: Public Domain (CC0 dedication)
    """
    global _COASTLINE_GDF_WGS84, _COASTLINE_GDF_PROJ, _COASTLINE_READY
    target_path = custom_path or COASTLINE_GEOJSON_PATH

    if os.path.exists(target_path):
        try:
            gdf = gpd.read_file(target_path)
            gdf = gdf[gdf.geometry.notna()].copy()
            _COASTLINE_GDF_WGS84 = gdf
            _COASTLINE_GDF_PROJ = gdf.to_crs(epsg=3857)
            _COASTLINE_READY = True
            print(f"[GIS Engine] Loaded {len(gdf)} coastline features from {target_path} (Projected EPSG:3857)")
            return True
        except Exception as e:
            print(f"[GIS Engine] Error loading Coastline GeoJSON: {e}")
            _COASTLINE_READY = False
            return False
    else:
        print(f"[GIS Engine] Warning: Coastline file not found at {target_path}")
        _COASTLINE_READY = False
        return False


# Initialize layers on import
load_mpa_layers()
load_coastline_layers()


def compute_point_mpa_distance(latitude: float, longitude: float) -> dict:
    """
    Computes real geodesic distance from (latitude, longitude) to the nearest MPA polygon.
    Uses EPSG:3857 projection (metres) for accurate spatial distance calculation.
    """
    fallback = {
        "protected_zone_distance_km": 8.0,
        "nearest_mpa_name": "Unspecified Marine Sanctuary",
        "inside_protected_zone": False,
        "all_mpa_distances_km": [],
        "gis_calculated": False
    }

    # Validate coordinate boundaries
    if latitude is None or longitude is None:
        fallback["error"] = "Coordinates cannot be None"
        return fallback

    try:
        lat = float(latitude)
        lon = float(longitude)
        if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
            fallback["error"] = f"Coordinates out of bounds: lat={lat}, lon={lon}"
            return fallback
    except (ValueError, TypeError) as e:
        fallback["error"] = f"Invalid coordinate types: {e}"
        return fallback

    if not _MPA_PROJECTION_READY or _MPA_GDF_PROJ is None or len(_MPA_GDF_PROJ) == 0:
        fallback["note"] = "MPA layer not available; standard fallback used."
        return fallback

    try:
        point_wgs84 = Point(lon, lat)
        point_proj = transform(_TRANSFORMER, point_wgs84)

        distances_m = _MPA_GDF_PROJ.geometry.distance(point_proj)
        distances_km = [round(float(d) / 1000.0, 3) for d in distances_m]

        nearest_idx = int(distances_m.idxmin())
        nearest_dist_km = distances_km[nearest_idx]

        name_col = "name" if "name" in _MPA_GDF_WGS84.columns else None
        nearest_name = str(_MPA_GDF_WGS84.iloc[nearest_idx][name_col]) if name_col else f"MPA_{nearest_idx}"

        inside_any = any(d == 0.0 for d in distances_m)

        return {
            "protected_zone_distance_km": nearest_dist_km,
            "nearest_mpa_name": nearest_name,
            "inside_protected_zone": inside_any,
            "all_mpa_distances_km": distances_km,
            "gis_calculated": True
        }
    except Exception as e:
        print(f"[GIS Engine] MPA distance calc error for ({latitude}, {longitude}): {e}")
        fallback["error"] = str(e)
        return fallback


def compute_coastline_distance(latitude: float, longitude: float) -> dict:
    """
    Computes real geodesic distance from (latitude, longitude) to the nearest coastline geometry.
    Uses EPSG:3857 projection (metres) against Natural Earth 1:50m Physical Coastline.

    Returns:
      coastal_distance_km: distance in kilometers (float)
      gis_calculated: bool indicating if real GIS geometry was used
      source: dataset provenance description
    """
    fallback = {
        "coastal_distance_km": 12.5,
        "gis_calculated": False,
        "source": "Baseline Fallback (Coastline layer unavailable)"
    }

    # Validate coordinate boundaries
    if latitude is None or longitude is None:
        fallback["error"] = "Coordinates cannot be None"
        return fallback

    try:
        lat = float(latitude)
        lon = float(longitude)
        if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
            fallback["error"] = f"Coordinates out of bounds: lat={lat}, lon={lon}"
            return fallback
    except (ValueError, TypeError) as e:
        fallback["error"] = f"Invalid coordinate types: {e}"
        return fallback

    if not _COASTLINE_READY or _COASTLINE_GDF_PROJ is None or len(_COASTLINE_GDF_PROJ) == 0:
        fallback["note"] = "Coastline dataset not loaded; static 12.5 km fallback maintained."
        return fallback

    try:
        point_wgs84 = Point(lon, lat)
        point_proj = transform(_TRANSFORMER, point_wgs84)

        # Distance to all coastline segments in metres
        distances_m = _COASTLINE_GDF_PROJ.geometry.distance(point_proj)
        min_dist_m = float(distances_m.min())
        min_dist_km = round(min_dist_m / 1000.0, 3)

        nearest_idx = int(distances_m.idxmin())

        return {
            "coastal_distance_km": min_dist_km,
            "gis_calculated": True,
            "crs_used": "EPSG:3857 (Spherical Mercator)",
            "source": "Natural Earth 1:50m Physical Coastline (Public Domain)",
            "nearest_feature_idx": nearest_idx
        }
    except Exception as e:
        print(f"[GIS Engine] Coastline distance calc error for ({latitude}, {longitude}): {e}")
        fallback["error"] = str(e)
        return fallback


def check_trajectory_mpa_intersection(trajectory_points: list) -> dict:
    """
    Evaluates whether a predicted drift trajectory enters or crosses an MPA boundary.
    trajectory_points: list of dicts with 'latitude', 'longitude', 'horizon_hours'
    """
    result = {
        "intersects_mpa": False,
        "first_intersection_horizon_hours": None,
        "intersected_mpas": [],
        "exposure_distance_km": 0.0
    }

    if not _MPA_PROJECTION_READY or _MPA_GDF_WGS84 is None or len(trajectory_points) < 2:
        return result

    try:
        coords = [(pt["longitude"], pt["latitude"]) for pt in trajectory_points]
        traj_line = LineString(coords)

        intersected_names = []
        first_horizon = None

        for idx, row in _MPA_GDF_WGS84.iterrows():
            mpa_geom = row.geometry
            if mpa_geom.intersects(traj_line):
                name = row.get("name", f"MPA_{idx}")
                intersected_names.append(str(name))

        for pt in trajectory_points:
            pt_geom = Point(pt["longitude"], pt["latitude"])
            for idx, row in _MPA_GDF_WGS84.iterrows():
                if row.geometry.contains(pt_geom) or row.geometry.touches(pt_geom):
                    if first_horizon is None:
                        first_horizon = pt.get("horizon_hours", 0)

        line_proj = transform(_TRANSFORMER, traj_line)
        exposure_dist_km = round(line_proj.length / 1000.0, 2)

        result["intersects_mpa"] = len(intersected_names) > 0
        result["first_intersection_horizon_hours"] = first_horizon
        result["intersected_mpas"] = list(set(intersected_names))
        result["exposure_distance_km"] = exposure_dist_km
        return result
    except Exception as e:
        print(f"[GIS Engine] Trajectory intersection check error: {e}")
        return result


def check_trajectory_coastline_intersection(trajectory_points: list) -> tuple:
    """
    Evaluates whether a predicted drift trajectory crosses any coastline geometry.
    If a coastline crossing is detected:
      - Determines the first coastline intersection point along the direction of travel
      - Halts/clamps the trajectory at that coastal arrival point
      - Drops any subsequent inland waypoints (preventing overland drift)
      - Computes arrival time (hours), arrival coordinates, and distance
    Returns:
      clamped_trajectory (list), coastal_impact (dict)
    """
    default_impact = {
        "trajectory_reached_coast": False,
        "coastal_arrival_time_hours": None,
        "coastal_arrival_latitude": None,
        "coastal_arrival_longitude": None,
        "coastal_intersection_distance_km": None,
        "beached": False,
        "status": "OPEN OCEAN DRIFT"
    }

    if not _COASTLINE_READY or _COASTLINE_GDF_WGS84 is None or len(trajectory_points) < 2:
        return trajectory_points, default_impact

    try:
        clamped_trajectory = [trajectory_points[0]]
        coastal_impact = dict(default_impact)

        for i in range(1, len(trajectory_points)):
            p_prev = trajectory_points[i - 1]
            p_curr = trajectory_points[i]
            p_prev_pt = Point(p_prev["longitude"], p_prev["latitude"])
            seg = LineString([(p_prev["longitude"], p_prev["latitude"]), (p_curr["longitude"], p_curr["latitude"])])

            # Spatial index query to find candidate intersecting coastline features
            match_indices = _COASTLINE_GDF_WGS84.sindex.query(seg, predicate="intersects")

            inter_pts = []
            if len(match_indices) > 0:
                for match_idx in match_indices:
                    geom = _COASTLINE_GDF_WGS84.geometry.iloc[match_idx]
                    if seg.intersects(geom):
                        inter = seg.intersection(geom)
                        if isinstance(inter, Point):
                            inter_pts.append(inter)
                        elif hasattr(inter, "geoms"):
                            for g in inter.geoms:
                                if isinstance(g, Point):
                                    inter_pts.append(g)

            if inter_pts:
                # Find the intersection closest to p_prev (first point crossed)
                inter_pts.sort(key=lambda pt: p_prev_pt.distance(pt))
                first_pt = inter_pts[0]

                seg_len = seg.length
                dist_to_inter = p_prev_pt.distance(first_pt)
                frac = (dist_to_inter / seg_len) if seg_len > 0 else 0.0

                h_prev = p_prev.get("horizon_hours", 0)
                h_curr = p_curr.get("horizon_hours", 0)
                d_prev = p_prev.get("cumulative_distance_km", 0.0)
                d_curr = p_curr.get("cumulative_distance_km", 0.0)

                h_arrival = round(float(h_prev + frac * (h_curr - h_prev)), 1)
                d_arrival = round(float(d_prev + frac * (d_curr - d_prev)), 2)

                arrival_waypoint = {
                    "horizon_hours": h_arrival,
                    "latitude": round(float(first_pt.y), 5),
                    "longitude": round(float(first_pt.x), 5),
                    "cumulative_distance_km": d_arrival,
                    "step_name": f"COASTAL ARRIVAL ({h_arrival}h)",
                    "is_coastal_arrival": True
                }
                clamped_trajectory.append(arrival_waypoint)
                coastal_impact = {
                    "trajectory_reached_coast": True,
                    "coastal_arrival_time_hours": h_arrival,
                    "coastal_arrival_latitude": round(float(first_pt.y), 5),
                    "coastal_arrival_longitude": round(float(first_pt.x), 5),
                    "coastal_intersection_distance_km": d_arrival,
                    "beached": True,
                    "status": f"COASTAL ARRIVAL / BEACHING ({h_arrival}h)"
                }
                break
            else:
                clamped_trajectory.append(p_curr)

        return clamped_trajectory, coastal_impact
    except Exception as e:
        print(f"[GIS Engine] Coastline trajectory check error: {e}")
        return trajectory_points, default_impact
