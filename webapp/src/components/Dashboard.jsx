import { useState, useEffect } from 'react';
import MapView from './MapView';
import FireList from './FireList';
import Statistics from './Statistics';
import AlertSystem from './AlertSystem';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('map');
  const [fireData, setFireData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFires = async () => {
      try {
        const response = await fetch('/active_fires.json');
        const data = await response.json();
        setFireData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading fire data:', error);
        setLoading(false);
      }
    };

    fetchFires();
    const interval = setInterval(fetchFires, 3 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">🔥 Loading fire data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            🔥 Uttarakhand Fire Monitoring System
          </h1>
          <p className="text-orange-100 mt-2">
            Real-time wildfire detection and risk assessment
          </p>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('map')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'map'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-orange-600'
              }`}
            >
              🗺️ Risk Map & Active Fires
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'stats'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-orange-600'
              }`}
            >
              📊 Statistics & Trends
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {/* Alert System - Shows only if high-severity fires exist */}
        {fireData?.alerts && fireData.alerts.length > 0 && (
          <AlertSystem fireData={fireData} />
        )}

        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FireList fireData={fireData} />
            </div>
            <div className="lg:col-span-3">
              <MapView fireData={fireData} />
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <Statistics fireData={fireData} />
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            Data: NASA FIRMS • Updated every 3 hours
          </p>
        </div>
      </footer>
    </div>
  );
}