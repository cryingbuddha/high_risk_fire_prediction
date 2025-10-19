import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

export default function MapView({ fireData }) {
  const center = [30.0, 79.3];
  const [boundary, setBoundary] = useState(null);

  // Load Uttarakhand boundary
  useEffect(() => {
    fetch('/uttarakhand_boundary.geojson')
      .then(res => res.json())
      .then(data => setBoundary(data))
      .catch(err => console.error('Error loading boundary:', err));
  }, []);

  const boundaryStyle = {
    color: '#0b61f6',
    weight: 4,
    opacity: 0.9,
    fill: false,
    dashArray: null
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">🗺️ Uttarakhand Fire Map</h2>
        <div className="flex gap-4 text-sm">
          <span>🔴 High</span>
          <span>🟠 Medium</span>
          <span>🟡 Low</span>
        </div>
      </div>

      <div className="h-[700px]">
        <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Uttarakhand Boundary */}
          {boundary && (
            <GeoJSON data={boundary} style={boundaryStyle} />
          )}

          {/* Fire Markers */}
          {fireData?.fires.map((fire) => (
            <CircleMarker
              key={fire.id}
              center={[fire.latitude, fire.longitude]}
              radius={8}
              pathOptions={{
                color: fire.severity === 'HIGH' ? '#dc2626' : fire.severity === 'MEDIUM' ? '#f97316' : '#eab308',
                fillColor: fire.severity === 'HIGH' ? '#dc2626' : fire.severity === 'MEDIUM' ? '#f97316' : '#eab308',
                fillOpacity: 0.8,
                weight: 2
              }}
            >
              <Popup>
                <div style={{minWidth: 220}}>
                  <div style={{fontWeight: 700, color: fire.severity === 'HIGH' ? '#b91c1c' : '#d97706'}}>
                    {fire.severity} SEVERITY
                  </div>
                  <div style={{marginTop:4}}>
                    <strong>📍 Location:</strong> {fire.location || 'Uttarakhand'}
                  </div>
                  <div>🕒 {fire.datetime_ist}</div>
                  <div>🌡️ Brightness: {fire.brightness} K</div>
                  <div>🔥 FRP: {fire.frp} MW</div>
                  <div>🛰️ {fire.satellite} • Confidence: {fire.confidence}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}