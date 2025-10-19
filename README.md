# 🔥 Uttarakhand Fire Monitoring System

**Real-time wildfire detection and risk assessment platform using NASA satellite data and machine learning.**

[![NASA FIRMS](https://img.shields.io/badge/Data-NASA%20FIRMS-blue)](https://firms.modaps.eosdis.nasa.gov/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-green)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)

---

## 🎯 Overview

This system combines **real-time satellite fire detection** from NASA FIRMS with **machine learning risk predictions** to provide comprehensive wildfire monitoring for Uttarakhand state, India.

### **Key Features:**

✅ **Real-Time Fire Detection** - NASA VIIRS satellite data updated every 3 hours  
✅ **ML Risk Zones** - Predicted high-risk areas using Random Forest classifier  
✅ **Interactive Map** - Leaflet-based visualization with fire markers  
✅ **Automated Alerts** - Notification system for high-severity fires  
✅ **Location Intelligence** - District-level fire location identification  
✅ **Severity Classification** - High/Medium/Low based on brightness & confidence  

---

## 🛰️ Data Sources

| Source | Details | Update Frequency |
|--------|---------|------------------|
| **NASA FIRMS** | VIIRS fire detections (375m resolution) | Every 3 hours |
| **Google Earth Engine** | MODIS NDVI, LST, DEM data | Daily/Weekly |
| **SRTM** | Elevation, slope, aspect | Static |

---

## 🏗️ Technology Stack

### Backend
- Python 3.8+
- NASA FIRMS API
- Earth Engine API
- scikit-learn
- GeoPandas/Rasterio

### Frontend
- React 18 with Vite
- Leaflet Maps
- Tailwind CSS

### Machine Learning
- Random Forest Classifier
- Features: NDVI, LST, Slope, Aspect, Precipitation, Elevation

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/cryingbuddha/high_risk_prediction.git
cd high_risk_prediction
```

### 2. Setup Backend
```bash
pip install -r requirements.txt

# Add NASA FIRMS API key to .env
echo "FIRMS_API_KEY=your_key_here" > .env
```

### 3. Fetch Fire Data
```bash
python src/fire_service.py
```

### 4. Setup Frontend
```bash
cd webapp
npm install
npm run dev
```

### 5. Open Browser
```
http://localhost:5173
```

---

## 📊 System Architecture

```
NASA FIRMS API → Fire Service → JSON Data → React Dashboard
                       ↓
                 ML Risk Model
```

---

## 🔥 Fire Classification

| Severity | Conditions | Alert |
|----------|-----------|-------|
| **HIGH** | Brightness > 340K + High confidence | ✅ Yes |
| **MEDIUM** | Brightness > 320K | ❌ No |
| **LOW** | Brightness ≤ 320K | ❌ No |

---

## 📁 Project Structure

```
high_risk_prediction/
├── src/
│   └── fire_service.py       # NASA FIRMS integration
├── webapp/
│   ├── public/
│   │   ├── active_fires.json
│   │   └── risk_zones.geojson
│   └── src/components/
│       ├── Dashboard.jsx
│       ├── MapView.jsx
│       └── AlertSystem.jsx
├── notebooks/                # ML model training
└── requirements.txt
```

---

## 🚨 Alert System

High-severity fires generate notifications to:
- Forest Department
- Disaster Management
- Fire Department

> Demo mode - Integrate with Twilio/SendGrid for production

---

## 👨‍💻 Author

**Ayush Khatri**  
GitHub: [@cryingbuddha](https://github.com/cryingbuddha)

---

## 🙏 Acknowledgments

- NASA FIRMS for fire detection data
- Google Earth Engine for satellite imagery
- OpenStreetMap for basemaps

---

<div align="center">

**Made with ❤️ for Uttarakhand 🏔️**

</div>
