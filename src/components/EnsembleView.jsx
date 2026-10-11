import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle, 
  Loader2, 
  Sparkles,
  Info
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { fetchAifsEnsemble } from '../services/weatherApi';
import { formatTempRaw } from '../utils/units';

export default function EnsembleView({ location, tempUnit }) {
  const [ensembleData, setEnsembleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSpaghetti, setShowSpaghetti] = useState(true);

  useEffect(() => {
    async function loadEnsemble() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAifsEnsemble(location.latitude, location.longitude);
        setEnsembleData(data);
      } catch (err) {
        console.error('Error fetching AIFS ensemble:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadEnsemble();
  }, [location]);

  if (loading) {
    return (
      <div className="rounded-3xl glass-panel p-12 text-center border border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-white">Loading 50-Member AIFS Ensemble...</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">
          Querying 50 perturbed atmospheric neural network realizations from ECMWF AIFS...
        </p>
      </div>
    );
  }

  if (error || !ensembleData || !ensembleData.hourly) {
    return (
      <div className="rounded-3xl glass-panel p-8 text-center border border-rose-900/40 bg-rose-950/10">
        <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Failed to Load Ensemble Data</h3>
        <p className="text-sm text-slate-400 mt-1">{error || 'Ensemble endpoint unavailable.'}</p>
      </div>
    );
  }

  const { hourly } = ensembleData;
  const timeLimit = 120; // 5 days (120 hours) for ensemble display
  const times = hourly.time.slice(0, timeLimit);

  const labels = times.map((t, idx) => {
    const d = new Date(t);
    const hourStr = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    if (idx === 0 || d.getHours() === 0) {
      return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${hourStr}`;
    }
    return hourStr;
  });

  // Extract all member keys (member01 to member50)
  const memberKeys = Object.keys(hourly).filter(
    k => k.startsWith('temperature_2m_member')
  );

  const meanTemps = (hourly.temperature_2m || []).slice(0, timeLimit);

  // Compute 10th percentile, 90th percentile, and standard deviation spread at each hour
  const p10 = [];
  const p90 = [];
  const spreads = [];

  for (let i = 0; i < timeLimit; i++) {
    const valuesAtHour = [];
    for (const mk of memberKeys) {
      const val = hourly[mk]?.[i];
      if (val !== undefined && val !== null) {
        valuesAtHour.push(val);
      }
    }

    if (valuesAtHour.length > 0) {
      valuesAtHour.sort((a, b) => a - b);
      const p10Val = valuesAtHour[Math.floor(valuesAtHour.length * 0.1)];
      const p90Val = valuesAtHour[Math.floor(valuesAtHour.length * 0.9)];
      const minVal = valuesAtHour[0];
      const maxVal = valuesAtHour[valuesAtHour.length - 1];

      p10.push(formatTempRaw(p10Val, tempUnit));
      p90.push(formatTempRaw(p90Val, tempUnit));
      spreads.push(maxVal - minVal);
    } else {
      p10.push(null);
      p90.push(null);
      spreads.push(0);
    }
  }

  // Calculate average spread in days 1-2 vs days 4-5
  const earlySpread = spreads.slice(0, 48).reduce((a, b) => a + b, 0) / Math.max(1, spreads.slice(0, 48).length);
  const lateSpread = spreads.slice(72, 120).reduce((a, b) => a + b, 0) / Math.max(1, spreads.slice(72, 120).length);

  // Prepare datasets
  const datasets = [];

  // If enabled, add thin spaghetti lines for members (sampled down to 20 for smooth rendering)
  if (showSpaghetti) {
    const sampledMembers = memberKeys.filter((_, idx) => idx % 2 === 0);
    sampledMembers.forEach((mk, idx) => {
      const memberVals = (hourly[mk] || []).slice(0, timeLimit).map(v => formatTempRaw(v, tempUnit));
      datasets.push({
        label: `Member ${idx + 1}`,
        data: memberVals,
        borderColor: 'rgba(56, 189, 248, 0.12)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      });
    });
  }

  // Upper Confidence Band (90th percentile)
  datasets.push({
    label: '90th Percentile (Upper Bound)',
    data: p90,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    borderDash: [4, 4],
    borderWidth: 1.5,
    pointRadius: 0,
    fill: false,
    tension: 0.35,
  });

  // Lower Confidence Band (10th percentile)
  datasets.push({
    label: '10th Percentile (Lower Bound)',
    data: p10,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    borderDash: [4, 4],
    borderWidth: 1.5,
    pointRadius: 0,
    fill: '-1', // Fill area between P90 and P10
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    tension: 0.35,
  });

  // Ensemble Mean Line (Highlight)
  datasets.push({
    label: `ECMWF AIFS Ensemble Mean (${tempUnit === 'F' ? '°F' : '°C'})`,
    data: meanTemps.map(v => formatTempRaw(v, tempUnit)),
    borderColor: '#38bdf8',
    backgroundColor: '#38bdf8',
    borderWidth: 3,
    pointRadius: 2,
    fill: false,
    tension: 0.35,
  });

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
        labels: {
          color: '#cbd5e1',
          filter: (legendItem) => !legendItem.text.startsWith('Member'),
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        borderWidth: 1,
        filter: (tooltipItem) => !tooltipItem.dataset.label.startsWith('Member'),
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 11 }, maxTicksLimit: 12 },
      },
      y: {
        title: {
          display: true,
          text: `Temperature (${tempUnit === 'F' ? '°F' : '°C'})`,
          color: '#94a3b8',
        },
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8' },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
                <Layers className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                ECMWF AIFS 50-Member Probabilistic Ensemble
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Forecast confidence analysis using 50 perturbed initial condition runs of the AIFS neural network. Wider bands indicate chaotic atmospheric bifurcation; narrow bands indicate high confidence.
            </p>
          </div>

          {/* Uncertainty Metrics */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-750 px-4 py-2.5 rounded-2xl shrink-0">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Short-Term Uncertainty
              </div>
              <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> ±{earlySpread.toFixed(1)}°C (Low)
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Day 4-5 Spread
              </div>
              <div className="text-base font-bold text-amber-400">
                ±{lateSpread.toFixed(1)}°C
              </div>
            </div>
          </div>
        </div>

        {/* Informational badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Ensemble Configuration</span>
            <div className="text-sm font-semibold text-white mt-1">50 Perturbed Members + 1 Control</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Confidence Band</span>
            <div className="text-sm font-semibold text-purple-300 mt-1">P10 - P90 Interdecile Range (80%)</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Inference Speed</span>
            <div className="text-sm font-semibold text-cyan-300 mt-1">~5 mins for 50 global forecasts</div>
          </div>
        </div>
      </div>

      {/* Ensemble Chart */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Ensemble Plume & Uncertainty Envelope
            </h3>
            <p className="text-xs text-slate-400">
              Purple shaded band = 80% confidence interval | Blue line = Ensemble mean
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={showSpaghetti}
                onChange={(e) => setShowSpaghetti(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span>Show Member Spaghetti Plumes</span>
            </label>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="w-full h-80 sm:h-96">
          <Line data={{ labels, datasets }} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

