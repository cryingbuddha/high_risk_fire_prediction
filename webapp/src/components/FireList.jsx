import { useState } from 'react';

export default function FireList({ fireData }) {
  const [selectedFire, setSelectedFire] = useState(null);

  if (!fireData || fireData.total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">🔥 Active Fires</h2>
        <div className="text-center py-8 text-gray-500">
          ✅ No active fires detected
          <p className="text-sm mt-2">Good news for Uttarakhand!</p>
        </div>
      </div>
    );
  }

  const FireItem = ({ fire }) => (
    <div
      onClick={() => setSelectedFire(fire)}
      className="p-4 border-b hover:bg-gray-50 cursor-pointer transition"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{fire.icon}</span>
        <div className="flex-1">
          <div className="font-semibold text-base" style={{ color: fire.color }}>
            {fire.severity} SEVERITY
          </div>
          <div className="text-sm text-gray-600 mt-1">
            📍 {fire.location || `${fire.latitude.toFixed(4)}°N, ${fire.longitude.toFixed(4)}°E`}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            🕐 {fire.datetime_ist}
          </div>
          <div className="text-xs text-gray-600">
            🌡️ {fire.brightness}K • 🔥 {fire.frp} MW
          </div>
          {fire.alert && (
            <div className="mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
              ⚠️ Alert Sent to Authorities
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <h2 className="text-xl font-bold">🔥 Active Fires</h2>
        <div className="mt-2 text-sm">
          Total: {fireData.total} detections
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-b grid grid-cols-3 gap-2 text-center">
        <div className="bg-red-100 p-2 rounded">
          <div className="text-2xl font-bold text-red-600">
            {fireData.high.length}
          </div>
          <div className="text-xs text-red-700">High</div>
        </div>
        <div className="bg-orange-100 p-2 rounded">
          <div className="text-2xl font-bold text-orange-600">
            {fireData.medium.length}
          </div>
          <div className="text-xs text-orange-700">Medium</div>
        </div>
        <div className="bg-yellow-100 p-2 rounded">
          <div className="text-2xl font-bold text-yellow-600">
            {fireData.low.length}
          </div>
          <div className="text-xs text-yellow-700">Low</div>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {fireData.high.length > 0 && (
          <>
            <div className="bg-red-50 px-4 py-2 font-semibold text-red-700 sticky top-0">
              🔴 HIGH SEVERITY ({fireData.high.length})
            </div>
            {fireData.high.map((fire) => (
              <FireItem key={fire.id} fire={fire} />
            ))}
          </>
        )}

        {fireData.medium.length > 0 && (
          <>
            <div className="bg-orange-50 px-4 py-2 font-semibold text-orange-700 sticky top-0">
              🟠 MEDIUM SEVERITY ({fireData.medium.length})
            </div>
            {fireData.medium.map((fire) => (
              <FireItem key={fire.id} fire={fire} />
            ))}
          </>
        )}

        {fireData.low.length > 0 && (
          <>
            <div className="bg-yellow-50 px-4 py-2 font-semibold text-yellow-700 sticky top-0">
              🟡 LOW SEVERITY ({fireData.low.length})
            </div>
            {fireData.low.map((fire) => (
              <FireItem key={fire.id} fire={fire} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}