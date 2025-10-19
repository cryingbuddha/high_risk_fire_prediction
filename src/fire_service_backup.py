"""
Fire Monitoring Service - Fetches real-time fire data with location names
"""

import os
import requests
import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dotenv import load_dotenv
from shapely.geometry import Point, shape
from shapely.errors import ShapelyError

load_dotenv()

FIRMS_API_KEY = os.getenv("FIRMS_API_KEY", "")
UK_BBOX = "77.5,28.5,81.0,31.5"
OUT_JSON = os.path.join(os.path.dirname(__file__), '..', 'webapp', 'public', 'active_fires.json')
BOUNDARY_JSON = os.path.join(os.path.dirname(__file__), '..', 'webapp', 'public', 'uttarakhand_boundary.geojson')
GEOCODE_CACHE = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'geocode_cache.json')

NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
HEADERS = {'User-Agent': 'high_risk_prediction/1.0 (ayush@example.com)'}

def _load_cache():
    try:
        with open(GEOCODE_CACHE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

def _save_cache(cache):
    os.makedirs(os.path.dirname(GEOCODE_CACHE), exist_ok=True)
    with open(GEOCODE_CACHE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

def load_uttarakhand_boundary():
    """Load Uttarakhand polygon with buffer"""
    try:
        with open(BOUNDARY_JSON, 'r', encoding='utf-8') as f:
            geojson = json.load(f)
            
            # Handle MultiPolygon or Polygon
            if geojson['features'][0]['geometry']['type'] == 'MultiPolygon':
                # Take the largest polygon
                polys = []
                for coords in geojson['features'][0]['geometry']['coordinates']:
                    poly = shape({'type': 'Polygon', 'coordinates': coords})
                    polys.append(poly)
                boundary = max(polys, key=lambda p: p.area)
            else:
                boundary = shape(geojson['features'][0]['geometry'])
            
            # Add 0.02 degree buffer (~2km) to include border areas
            boundary = boundary.buffer(0.02)
            
            print(f"✅ Boundary loaded: {boundary.geom_type}")
            print(f"   Bounds (lon_min, lat_min, lon_max, lat_max): {boundary.bounds}")
            print(f"   Area: {boundary.area:.2f} sq degrees")
            
            return boundary
    except Exception as e:
        print(f"❌ Error loading boundary: {e}")
        import traceback
        traceback.print_exc()
        return None

def is_in_uttarakhand(lat: float, lon: float, boundary) -> bool:
    """Check if point is inside Uttarakhand"""
    if boundary is None:
        print("⚠️ Warning: No boundary loaded, accepting all points")
        return True
    
    try:
        # Shapely uses (lon, lat) order!
        point = Point(lon, lat)
        return boundary.contains(point)
    except ShapelyError as e:
        print(f"Shapely error for ({lat}, {lon}): {e}")
        return False

def reverse_geocode(lat: float, lon: float, cache: dict) -> str:
    """Get location name from Nominatim"""
    key = f"{lat:.5f},{lon:.5f}"
    if key in cache:
        return cache[key]
    
    params = {
        'lat': lat,
        'lon': lon,
        'format': 'jsonv2',
        'zoom': 10,
        'addressdetails': 1
    }
    
    try:
        r = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=10)
        r.raise_for_status()
        resp = r.json()
        addr = resp.get('address', {})
        
        # Only accept if state is Uttarakhand
        state = addr.get('state', '').lower()
        if 'uttarakhand' not in state and 'uttaranchal' not in state:
            # This point is NOT in Uttarakhand according to OSM
            cache[key] = None  # Mark as invalid
            return None
        
        # Get best location name
        name = (addr.get('village') or 
                addr.get('town') or 
                addr.get('city') or 
                addr.get('county') or 
                addr.get('state_district') or 
                'Uttarakhand')
        
        cache[key] = name
        time.sleep(1.0)
        return name
        
    except Exception as e:
        print(f"Geocoding error for ({lat},{lon}): {e}")
        cache[key] = "Uttarakhand"
        return "Uttarakhand"

def _parse_acq_datetime(acq_date: str, acq_time: str):
    ts = ''.join(ch for ch in str(acq_time) if ch.isdigit())
    ts = ts.zfill(4)[-4:]
    hour = int(ts[:2])
    minute = int(ts[2:])
    return datetime.strptime(acq_date, "%Y-%m-%d").replace(hour=hour, minute=minute)

def format_time_ist(dt_utc: datetime) -> str:
    dt_ist = dt_utc + timedelta(hours=5, minutes=30)
    hour12 = dt_ist.hour % 12
    if hour12 == 0:
        hour12 = 12
    ampm = "AM" if dt_ist.hour < 12 else "PM"
    return f"{hour12}:{dt_ist.minute:02d} {ampm} IST"

class FireService:
    def __init__(self, api_key: str = FIRMS_API_KEY):
        self.api_key = api_key
        self.base_url = "https://firms.modaps.eosdis.nasa.gov/api"
        self.bbox = UK_BBOX
        self.cache = _load_cache()
        self.boundary = load_uttarakhand_boundary()

    def fetch_active_fires(self, days: int = 14) -> List[Dict]:
        url = f"{self.base_url}/area/csv/{self.api_key}/VIIRS_SNPP_NRT/{self.bbox}/{days}"
        
        try:
            r = requests.get(url, timeout=30)
            r.raise_for_status()
            lines = r.text.strip().splitlines()
            
            print(f"\n📡 API Response: {len(lines)} lines")
            
            if len(lines) <= 1:
                print("❌ NO DATA from API!")
                print(r.text[:500])
                return []
            
            headers = [h.strip() for h in lines[0].split(',')]
            fires = []
            filtered_count = 0
            boundary_fails = 0
            geocode_fails = 0
            
            print(f"\n📋 Headers: {headers[:5]}...")
            print(f"📡 Processing {len(lines)-1} fire detections...")
            
            for idx, line in enumerate(lines[1:], 1):
                vals = [v.strip() for v in line.split(',')]
                row = dict(zip(headers, vals))
                
                try:
                    lat = float(row.get('latitude') or 0)
                    lon = float(row.get('longitude') or 0)
                    
                    # DEBUG: Show first 5 points
                    if idx <= 5:
                        print(f"  Fire #{idx}: ({lat:.4f}, {lon:.4f})")
                    
                    # TEMPORARY: SKIP BOUNDARY CHECK to see if that's the issue
                    # if not is_in_uttarakhand(lat, lon, self.boundary):
                    #     boundary_fails += 1
                    #     if idx <= 5:
                    #         print(f"    ❌ FAILED boundary check")
                    #     continue
                    
                    brightness = float(row.get('bright_ti4') or 0)
                    frp = float(row.get('frp') or 0)
                    acq_date = row.get('acq_date')
                    acq_time = row.get('acq_time')
                    dt_utc = _parse_acq_datetime(acq_date, acq_time)
                    
                    # TEMPORARY: SKIP GEOCODING to speed up
                    location = "Uttarakhand"  # reverse_geocode(lat, lon, self.cache)
                    
                    # if location is None:
                    #     geocode_fails += 1
                    #     if idx <= 5:
                    #         print(f"    ❌ FAILED geocode check")
                    #     continue
                    
                    fire = {
                        'id': f"{lat:.5f}_{lon:.5f}_{acq_date}_{acq_time}",
                        'latitude': lat,
                        'longitude': lon,
                        'brightness': round(brightness, 2),
                        'frp': round(frp, 2),
                        'acq_date': acq_date,
                        'datetime_utc': dt_utc.isoformat(),
                        'datetime_ist': format_time_ist(dt_utc),
                        'satellite': row.get('satellite'),
                        'confidence': row.get('confidence'),
                        'location': location
                    }
                    fires.append(fire)
                    
                except Exception as e:
                    print(f"❌ Error row {idx}: {e}")
                    if idx <= 3:
                        import traceback
                        traceback.print_exc()
                    continue
            
            fires.sort(key=lambda x: x['datetime_utc'], reverse=True)
            
            print(f"\n📊 Summary:")
            print(f"  Total API fires: {len(lines)-1}")
            print(f"  ❌ Boundary fails: {boundary_fails}")
            print(f"  ❌ Geocode fails: {geocode_fails}")
            print(f"  ✅ Accepted fires: {len(fires)}")
            
            return fires
            
        except Exception as e:
            print(f"❌ FIRMS API Error: {e}")
            import traceback
            traceback.print_exc()
            return []

    def save_public_json(self, outpath: str = OUT_JSON, days: int = 7):
        fires = self.fetch_active_fires(days=days)
        
        high = []
        medium = []
        low = []
        
        for fire in fires:
            brightness = fire['brightness']
            conf = str(fire.get('confidence', '')).lower()
            
            if brightness > 340 and conf == 'high':
                fire['severity'] = 'HIGH'
                fire['color'] = '#dc2626'
                fire['icon'] = '🔴'
                fire['alert'] = True
                high.append(fire)
            elif brightness > 320 or conf in ['high', 'nominal']:
                fire['severity'] = 'MEDIUM'
                fire['color'] = '#f97316'
                fire['icon'] = '🟠'
                fire['alert'] = False
                medium.append(fire)
            else:
                fire['severity'] = 'LOW'
                fire['color'] = '#eab308'
                fire['icon'] = '🟡'
                fire['alert'] = False
                low.append(fire)
        
        out = {
            'total': len(fires),
            'fires': fires,
            'high': high,
            'medium': medium,
            'low': low,
            'last_updated': datetime.utcnow().isoformat() + "Z"
        }
        
        os.makedirs(os.path.dirname(outpath), exist_ok=True)
        with open(outpath, 'w', encoding='utf-8') as f:
            json.dump(out, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Saved to {outpath}")
        print(f"   🔴 High: {len(high)}")
        print(f"   🟠 Medium: {len(medium)}")
        print(f"   🟡 Low: {len(low)}")
        
        return out

if __name__ == "__main__":
    svc = FireService()
    svc.save_public_json(days=10)  # Changed from 7 to 14
