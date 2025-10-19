import React, { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

function PredictionForm() {
  const [form, setForm] = useState({ ndvi: '0.7', lst: '28', slope: '25', elevation: '1800' });
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const score = Math.min(Math.max(
      parseFloat(form.ndvi) * 0.532 +
      parseFloat(form.lst) * 0.058 / 100 +
      parseFloat(form.slope) * 0.121 / 100 +
      parseFloat(form.elevation) * 0.257 / 10000,
      0
    ), 1);

    setResult({
      score,
      level: score > 0.7 ? 'High' : score > 0.4 ? 'Medium' : 'Low',
      color: score > 0.7 ? 'red' : score > 0.4 ? 'yellow' : 'green',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold">Manual Risk Prediction</p>
          <p>Enter environmental parameters to estimate fire risk.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Input Parameters</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'ndvi', label: 'NDVI', hint: '0-1' },
              { key: 'lst', label: 'Temperature (°C)', hint: '>25 = high risk' },
              { key: 'slope', label: 'Slope (°)', hint: '>20 = steep' },
              { key: 'elevation', label: 'Elevation (m)', hint: '1200-2500 = pine' },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type="number"
                  step="any"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">{hint}</p>
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
            >
              Predict Fire Risk
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Prediction Result</h2>
          {result ? (
            <div className={`bg-${result.color}-50 border-2 border-${result.color}-300 rounded-lg p-6 text-center`}>
              <div className="text-sm font-medium text-gray-600 mb-2">Fire Risk Level</div>
              <div className={`text-4xl font-bold text-${result.color}-600 mb-2`}>{result.level}</div>
              <div className="text-2xl font-semibold">{(result.score * 100).toFixed(1)}%</div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Enter parameters to see prediction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PredictionForm;