import requests
import json
import time
import os

OUT_PATHS = [
    os.path.join(os.path.dirname(__file__), '..', 'webapp', 'public', 'uttarakhand_boundary.geojson'),
    os.path.join(os.path.dirname(__file__), '..', 'public', 'uttarakhand_boundary.geojson'),
]

def fetch_and_save():
    url = "https://nominatim.openstreetmap.org/search.php"
    params = {
        'q': 'Uttarakhand, India',
        'polygon_geojson': 1,
        'format': 'jsonv2'
    }
    headers = {'User-Agent': 'high_risk_prediction/1.0 (your_email@example.com)'}
    r = requests.get(url, params=params, headers=headers, timeout=30)
    r.raise_for_status()
    data = r.json()
    if not data:
        raise RuntimeError("Nominatim returned empty result for Uttarakhand")
    # Choose the first result with a polygon
    for rec in data:
        geo = rec.get('geojson')
        if geo:
            feature = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {"name": "Uttarakhand (OSM)"},
                        "geometry": geo
                    }
                ]
            }
            for out in OUT_PATHS:
                os.makedirs(os.path.dirname(out), exist_ok=True)
                with open(out, 'w', encoding='utf-8') as f:
                    json.dump(feature, f, indent=2)
                print(f"Saved boundary to {out}")
            return
    raise RuntimeError("No polygon found in Nominatim response")

if __name__ == "__main__":
    fetch_and_save()