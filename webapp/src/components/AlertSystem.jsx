import { useState, useEffect } from 'react';

export default function AlertSystem({ fireData }) {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(true);

  useEffect(() => {
    if (fireData?.alerts) {
      setAlerts(fireData.alerts);
    }
  }, [fireData]);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Alert Banner */}
      <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚨</span>
            <div>
              <h3 className="font-bold text-lg">
                {alerts.length} HIGH SEVERITY ALERT{alerts.length > 1 ? 'S' : ''}
              </h3>
              <p className="text-sm text-red-100">
                Automatic notifications sent to forest authorities
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded text-sm font-semibold transition"
          >
            {showAlerts ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Alert Details */}
      {showAlerts && (
        <div className="mt-4 space-y-3">
          {alerts.map((alert, index) => (
            <div key={alert.id} className="bg-white border-l-4 border-red-500 rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                      ALERT #{index + 1}
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      {alert.status}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-gray-800 mb-1">{alert.message}</h4>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <div className="font-semibold">{alert.location}</div>
                      <div className="text-xs text-gray-500">{alert.coordinates}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Detected:</span>
                      <div className="font-semibold">{alert.detected_at}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Brightness:</span>
                      <div className="font-semibold">{alert.brightness}K</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Fire Power:</span>
                      <div className="font-semibold">{alert.frp} MW</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-600 mb-1">
                      📧 Notifications sent to:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {alert.recipients.map((email, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-center">
                    <div className="text-xs font-semibold">PRIORITY</div>
                    <div className="text-lg font-bold">{alert.priority}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demo Notice */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <strong>🔍 Demo Mode:</strong> This is a demonstration of an automated alert system. 
        In production, this would integrate with email/SMS services to notify forest officials, 
        disaster management teams, and fire departments in real-time.
      </div>
    </div>
  );
}
