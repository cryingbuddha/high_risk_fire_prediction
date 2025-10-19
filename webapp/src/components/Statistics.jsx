export default function Statistics({ fireData }) {
  // Add loading/error states
  if (!fireData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-xl text-gray-600">Loading statistics...</div>
        </div>
      </div>
    );
  }

  // If no fires detected
  if (fireData.total === 0) {
    return (
      <div className="space-y-6">
        {/* Summary Cards - Show 0 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Fires" value={0} icon="🔥" color="orange" />
          <StatCard title="High Severity" value={0} icon="🔴" color="red" />
          <StatCard title="Medium Severity" value={0} icon="🟠" color="orange" />
          <StatCard title="Low Severity" value={0} icon="🟡" color="yellow" />
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            No Active Fires Detected!
          </h2>
          <p className="text-gray-600">
            Great news for Uttarakhand! No wildfire activity in the last 7 days.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            Last updated: {fireData.last_updated ? new Date(fireData.last_updated).toLocaleString() : 'Just now'}
          </div>
        </div>
      </div>
    );
  }

  // If fires exist - show full statistics
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Fires"
          value={fireData.total}
          icon="🔥"
          color="orange"
        />
        <StatCard
          title="High Severity"
          value={fireData.high.length}
          icon="🔴"
          color="red"
        />
        <StatCard
          title="Medium Severity"
          value={fireData.medium.length}
          icon="🟠"
          color="orange"
        />
        <StatCard
          title="Low Severity"
          value={fireData.low.length}
          icon="🟡"
          color="yellow"
        />
      </div>

      {/* Fire Details Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 text-white p-4">
          <h2 className="text-xl font-bold">📋 Detailed Fire List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Severity</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Coordinates</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Brightness</th>
                <th className="px-4 py-3 text-left">FRP</th>
              </tr>
            </thead>
            <tbody>
              {fireData.fires.map((fire) => (
                <tr key={fire.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span style={{ color: fire.color }} className="font-semibold">
                      {fire.icon} {fire.severity}
                    </span>
                    {fire.alert && (
                      <div className="text-xs text-red-600 font-semibold mt-1">⚠️ Alert</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{fire.location || 'Uttarakhand'}</div>
                    <div className="text-xs text-gray-500">{fire.satellite}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {fire.latitude.toFixed(4)}°N<br/>{fire.longitude.toFixed(4)}°E
                  </td>
                  <td className="px-4 py-3 text-sm">{fire.acq_date}</td>
                  <td className="px-4 py-3 text-sm">{fire.acq_time_formatted || fire.acq_time}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-semibold">{fire.brightness}K</span>
                    <div className={`text-xs mt-1 ${
                      fire.confidence === 'high' ? 'text-green-600' :
                      fire.confidence === 'nominal' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {fire.confidence}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">{fire.frp} MW</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    orange: 'from-orange-500 to-red-500',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-orange-500'
  };

  return (
    <div className={`bg-gradient-to-r ${colors[color]} text-white rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm opacity-90">{title}</div>
          <div className="text-4xl font-bold mt-2">{value}</div>
        </div>
        <div className="text-5xl opacity-50">{icon}</div>
      </div>
    </div>
  );
}