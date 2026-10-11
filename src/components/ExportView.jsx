import React, { useState } from 'react';
import { 
  Download, 
  FileCode, 
  Copy, 
  Check, 
  Terminal, 
  FileSpreadsheet, 
  FileJson,
  Sparkles
} from 'lucide-react';

export default function ExportView({ location, weatherData }) {
  const [copiedTab, setCopiedTab] = useState(null);
  const [activeCodeTab, setActiveCodeTab] = useState('python_api');

  if (!weatherData) return null;

  // Export as JSON
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify({
      model: 'ECMWF AIFS (0.25°)',
      location,
      generatedAt: new Date().toISOString(),
      forecast: weatherData,
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecmwf_aifs_${location.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_forecast.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as CSV
  const handleDownloadCsv = () => {
    const hourly = weatherData.hourly || {};
    const times = hourly.time || [];
    
    const headers = [
      'Time (ISO)',
      'Temperature_2m (C)',
      'Relative_Humidity_2m (%)',
      'Precipitation (mm)',
      'Surface_Pressure (hPa)',
      'Wind_Speed_10m (km/h)',
      'Wind_Direction_10m (deg)',
      'Cloud_Cover (%)',
    ];

    const rows = times.map((t, i) => [
      t,
      hourly.temperature_2m?.[i] ?? '',
      hourly.relative_humidity_2m?.[i] ?? '',
      hourly.precipitation?.[i] ?? '',
      hourly.surface_pressure?.[i] ?? '',
      hourly.wind_speed_10m?.[i] ?? '',
      hourly.wind_direction_10m?.[i] ?? '',
      hourly.cloud_cover?.[i] ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecmwf_aifs_${location.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_forecast.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text, tabId) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  // Code snippets
  const pythonApiCode = `# Python script to query ECMWF AIFS forecast using Open-Meteo API
import requests
import json

lat = ${location.latitude.toFixed(4)}
lon = ${location.longitude.toFixed(4)}

url = "https://api.open-meteo.com/v1/ecmwf"
params = {
    "latitude": lat,
    "longitude": lon,
    "models": "ecmwf_aifs025_single",
    "hourly": "temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m",
    "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    "timezone": "auto"
}

response = requests.get(url, params=params)
data = response.json()

print(f"Location: {data.get('latitude')}, {data.get('longitude')}")
print("7-Day Daily Max Temps (C):", data['daily']['temperature_2m_max'])
print("First 24h Hourly Temps (C):", data['hourly']['temperature_2m'][:24])
`;

  const pythonEcmwfOpendataCode = `# Python script using the official ECMWF Open Data client
# Install with: pip install ecmwf-opendata
from ecmwf.opendata import Client

# Initialize client specifying AIFS AI model
client = Client(source="ecmwf", model="aifs")

# Download 24h surface forecast for mean sea level pressure (msl) & 2m temp (2t)
client.retrieve(
    step=24,
    type="fc",
    param=["msl", "2t"],
    target="ecmwf_aifs_forecast.grib2"
)

print("Downloaded raw GRIB2 forecast from ECMWF Open Data!")
`;

  const curlCode = `curl -X GET "https://api.open-meteo.com/v1/ecmwf?latitude=${location.latitude.toFixed(4)}&longitude=${location.longitude.toFixed(4)}&models=ecmwf_aifs025_single&hourly=temperature_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto" -H "Accept: application/json"`;

  const jsCode = `// JavaScript / Node.js fetch snippet
const url = 'https://api.open-meteo.com/v1/ecmwf?latitude=${location.latitude.toFixed(4)}&longitude=${location.longitude.toFixed(4)}&models=ecmwf_aifs025_single&hourly=temperature_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto';

const res = await fetch(url);
const data = await res.json();
console.log('ECMWF AIFS forecast:', data);
`;

  return (
    <div className="space-y-6">
      {/* Download Cards */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-xl">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-2">
          <Download className="h-5 w-5 text-cyan-400" />
          <span>Export Forecast Data for {location.name}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Download the raw ECMWF AIFS forecasted time-series data for analysis in Excel, pandas, Python, R, or GIS.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {/* CSV Download Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Download as CSV</div>
                <div className="text-xs text-slate-400">Time series table for Excel / Pandas</div>
              </div>
            </div>
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              Export CSV
            </button>
          </div>

          {/* JSON Download Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
                <FileJson className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Download as JSON</div>
                <div className="text-xs text-slate-400">Full model structure & metadata</div>
              </div>
            </div>
            <button
              onClick={handleDownloadJson}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Code Generator Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Terminal className="h-5 w-5 text-cyan-400" />
              <span>Programmatic API & Model Code</span>
            </h3>
            <p className="text-xs text-slate-400">
              Integrate ECMWF AIFS into your scientific pipelines or backend applications
            </p>
          </div>

          {/* Code Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveCodeTab('python_api')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeCodeTab === 'python_api' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Python (API)
            </button>
            <button
              onClick={() => setActiveCodeTab('ecmwf_opendata')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeCodeTab === 'ecmwf_opendata' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              ecmwf-opendata (GRIB2)
            </button>
            <button
              onClick={() => setActiveCodeTab('curl')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeCodeTab === 'curl' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveCodeTab('js')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeCodeTab === 'js' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              JavaScript
            </button>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
            <span>
              {activeCodeTab === 'python_api' && 'python_aifs_query.py'}
              {activeCodeTab === 'ecmwf_opendata' && 'download_aifs_grib2.py'}
              {activeCodeTab === 'curl' && 'bash / terminal'}
              {activeCodeTab === 'js' && 'index.js'}
            </span>
            <button
              onClick={() => {
                const code = 
                  activeCodeTab === 'python_api' ? pythonApiCode :
                  activeCodeTab === 'ecmwf_opendata' ? pythonEcmwfOpendataCode :
                  activeCodeTab === 'curl' ? curlCode : jsCode;
                copyToClipboard(code, activeCodeTab);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-400 transition-colors"
            >
              {copiedTab === activeCodeTab ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
            <code>
              {activeCodeTab === 'python_api' && pythonApiCode}
              {activeCodeTab === 'ecmwf_opendata' && pythonEcmwfOpendataCode}
              {activeCodeTab === 'curl' && curlCode}
              {activeCodeTab === 'js' && jsCode}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

