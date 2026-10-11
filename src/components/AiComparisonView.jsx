import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { fetchModelComparison } from '../services/weatherApi';
import { formatTemp, formatTempRaw } from '../utils/units';

export default function AiComparisonView({ location, tempUnit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonMetric, setComparisonMetric] = useState('temperature'); // 'temperature', 'precipitation', 'pressure'

  useEffect(() => {
    async function loadComparison() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchModelComparison(location.latitude, location.longitude);
        setData(result);
      } catch (err) {
        console.error('Error fetching model comparison:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadComparison();
  }, [location]);

  if (loading) {
    return (
      <div className="rounded-3xl glass-panel p-12 text-center border border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-white">Comparing Weather Models...</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          Querying ECMWF AIFS (Artificial Intelligence) and ECMWF IFS (Physics NWP) grids in parallel...
        </p>
      </div>
    );
  }

  if (error || !data || !data.hourly) {
    return (
      <div className="rounded-3xl glass-panel p-8 text-center border border-rose-900/40 bg-rose-950/10">
        <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Failed to Load Model Comparison</h3>
        <p className="text-sm text-slate-400 mt-1">{error || 'No comparative data returned.'}</p>
      </div>
    );
  }

  const { hourly } = data;
  const timeLimit = 72; // First 72 hours for high-res comparison
  const times = hourly.time.slice(0, timeLimit);

  const labels = times.map((t, idx) => {
    const d = new Date(t);
    const hourStr = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    if (idx === 0 || d.getHours() === 0) {
      return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${hourStr}`;
    }
    return hourStr;
  });

  const aifsTemps = (hourly.temperature_2m_ecmwf_aifs025_single || []).slice(0, timeLimit);
  const ifsTemps = (hourly.temperature_2m_ecmwf_ifs025 || []).slice(0, timeLimit);

  const aifsPrecip = (hourly.precipitation_ecmwf_aifs025_single || []).slice(0, timeLimit);
  const ifsPrecip = (hourly.precipitation_ecmwf_ifs025 || []).slice(0, timeLimit);

  const aifsPressure = (hourly.surface_pressure_ecmwf_aifs025_single || []).slice(0, timeLimit);
  const ifsPressure = (hourly.surface_pressure_ecmwf_ifs025 || []).slice(0, timeLimit);

  // Compute statistics (Mean Absolute Error / Delta between AI & Physics)
  let deltaSum = 0;
  let count = 0;
  for (let i = 0; i < Math.min(aifsTemps.length, ifsTemps.length); i++) {
    if (aifsTemps[i] !== null && ifsTemps[i] !== null) {
      deltaSum += Math.abs(aifsTemps[i] - ifsTemps[i]);
      count++;
    }
  }
  const meanTempDiff = count > 0 ? (deltaSum / count).toFixed(2) : 0;

  let dataset = [];
  let yTitle = '';

  if (comparisonMetric === 'temperature') {
    yTitle = `Temperature (${tempUnit === 'F' ? '°F' : '°C'})`;
    dataset = [
      {
        label: 'ECMWF AIFS (AI Deep Learning)',
        data: aifsTemps.map(t => formatTempRaw(t, tempUnit)),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 1.5,
      },
      {
        label: 'ECMWF IFS (Traditional Physics NWP)',
        data: ifsTemps.map(t => formatTempRaw(t, tempUnit)),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderDash: [5, 5],
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 1.5,
      },
    ];
  } else if (comparisonMetric === 'precipitation') {
    yTitle = 'Precipitation (mm/h)';
    dataset = [
      {
        label: 'ECMWF AIFS (AI Model)',
        data: aifsPrecip,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.6)',
        tension: 0.2,
        borderWidth: 2,
      },
      {
        label: 'ECMWF IFS (Physics Model)',
        data: ifsPrecip,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        tension: 0.2,
        borderWidth: 2,
      },
    ];
  } else if (comparisonMetric === 'pressure') {
    yTitle = 'Pressure (hPa)';
    dataset = [
      {
        label: 'ECMWF AIFS (AI)',
        data: aifsPressure,
        borderColor: '#06b6d4',
        tension: 0.3,
        borderWidth: 2.5,
      },
      {
        label: 'ECMWF IFS (Physics)',
        data: ifsPressure,
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        tension: 0.3,
        borderWidth: 2,
      },
    ];
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1', font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 11 }, maxTicksLimit: 12 },
      },
      y: {
        title: { display: true, text: yTitle, color: '#94a3b8' },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8' },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the comparison */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI vs Physics: ECMWF AIFS vs ECMWF IFS
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Compare ECMWF's revolutionary AI forecasting system against Europe's premier numerical weather model (IFS). See where deep learning and primitive-equation atmospheric physics agree or diverge.
            </p>
          </div>

          {/* Model Delta Pill */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-750 px-4 py-2.5 rounded-2xl shrink-0">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Mean Temp Divergence
              </div>
              <div className="text-lg font-bold text-cyan-400">
                ±{meanTempDiff}°C
              </div>
            </div>
            <Activity className="h-6 w-6 text-slate-500" />
          </div>
        </div>

        {/* Model Cards Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* AIFS Box */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-sm text-cyan-300">ECMWF AIFS (Data-Driven AI)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-900/60 text-cyan-200">
                Neural GNN
              </span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Trained on 40+ years of ERA5 reanalysis and operational IFS analyses</li>
              <li>Generates a 10-day global forecast in ~1 minute on a single GPU</li>
              <li>Outperforms IFS on many synoptic upper-air verification metrics</li>
            </ul>
          </div>

          {/* IFS Box */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-400" />
                <span className="font-bold text-sm text-amber-300">ECMWF IFS (Atmospheric Physics)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-900/60 text-amber-200">
                Numerical NWP
              </span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Solves Navier-Stokes hydrodynamics and radiation transfer equations</li>
              <li>Requires supercomputing cluster with thousands of CPU cores</li>
              <li>Benchmark golden standard for operational medium-range weather</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              72-Hour Comparative Atmospheric Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Blue = ECMWF AIFS (AI) | Amber Dashed = ECMWF IFS (Physics)
            </p>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setComparisonMetric('temperature')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                comparisonMetric === 'temperature'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setComparisonMetric('precipitation')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                comparisonMetric === 'precipitation'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Precipitation
            </button>
            <button
              onClick={() => setComparisonMetric('pressure')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                comparisonMetric === 'pressure'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pressure
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="w-full h-80 sm:h-96">
          <Line data={{ labels, datasets: dataset }} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

