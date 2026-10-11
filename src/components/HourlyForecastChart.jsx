import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Cloud, 
  Clock,
  SlidersHorizontal 
} from 'lucide-react';
import { formatTempRaw, formatHour, formatDate } from '../utils/units';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HourlyForecastChart({ hourlyData, tempUnit, selectedDayIndex }) {
  const [activeMetric, setActiveMetric] = useState('temperature');
  const [timeRange, setTimeRange] = useState('24h'); // '24h', '48h', 'selectedDay', '7days'

  if (!hourlyData || !hourlyData.time || hourlyData.time.length === 0) {
    return null;
  }

  // Determine subset of hourly data based on timeRange
  let startIndex = 0;
  let endIndex = 24;

  if (timeRange === '24h') {
    startIndex = 0;
    endIndex = 24;
  } else if (timeRange === '48h') {
    startIndex = 0;
    endIndex = 48;
  } else if (timeRange === 'selectedDay') {
    startIndex = (selectedDayIndex ?? 0) * 24;
    endIndex = startIndex + 24;
  } else if (timeRange === '7days') {
    startIndex = 0;
    endIndex = hourlyData.time.length;
  }

  const times = hourlyData.time.slice(startIndex, endIndex);

  // Label formatting
  const labels = times.map((t, idx) => {
    const d = new Date(t);
    const hourStr = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    // Show day date on first entry or at 12 AM
    if (idx === 0 || d.getHours() === 0) {
      return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${hourStr}`;
    }
    return hourStr;
  });

  // Data series based on active metric
  let chartType = 'line';
  let chartDataset = [];
  let yAxisLabel = '';
  let chartColor = '#06b6d4';
  let chartGradient = ['rgba(6, 182, 212, 0.35)', 'rgba(6, 182, 212, 0.0)'];

  if (activeMetric === 'temperature') {
    const rawTemps = hourlyData.temperature_2m.slice(startIndex, endIndex);
    const convertedTemps = rawTemps.map(c => formatTempRaw(c, tempUnit));
    
    chartColor = '#38bdf8';
    chartGradient = ['rgba(56, 189, 248, 0.4)', 'rgba(56, 189, 248, 0.0)'];
    yAxisLabel = `Temperature (${tempUnit === 'F' ? '°F' : '°C'})`;

    chartDataset = [
      {
        label: `ECMWF AIFS Temperature (${tempUnit === 'F' ? '°F' : '°C'})`,
        data: convertedTemps,
        borderColor: chartColor,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, chartGradient[0]);
          gradient.addColorStop(1, chartGradient[1]);
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: timeRange === '7days' ? 0 : 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#0284c7',
        pointBorderColor: '#ffffff',
      },
    ];

    if (hourlyData.apparent_temperature) {
      const apparents = hourlyData.apparent_temperature.slice(startIndex, endIndex).map(c => formatTempRaw(c, tempUnit));
      chartDataset.push({
        label: `Apparent / Feels Like (${tempUnit === 'F' ? '°F' : '°C'})`,
        data: apparents,
        borderColor: '#a855f7',
        borderDash: [4, 4],
        fill: false,
        tension: 0.35,
        borderWidth: 1.5,
        pointRadius: 0,
      });
    }
  } else if (activeMetric === 'precipitation') {
    chartType = 'bar';
    const precip = (hourlyData.precipitation || []).slice(startIndex, endIndex);
    chartColor = '#0284c7';
    yAxisLabel = 'Precipitation (mm/h)';

    chartDataset = [
      {
        type: 'bar',
        label: 'AIFS Precipitation (mm/h)',
        data: precip,
        backgroundColor: 'rgba(56, 189, 248, 0.7)',
        borderColor: '#38bdf8',
        borderWidth: 1,
        borderRadius: 4,
      },
    ];
  } else if (activeMetric === 'wind') {
    const wind = (hourlyData.wind_speed_10m || []).slice(startIndex, endIndex);
    chartColor = '#60a5fa';
    yAxisLabel = 'Wind Speed (km/h)';

    chartDataset = [
      {
        label: 'AIFS 10m Wind Speed (km/h)',
        data: wind,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.15)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: timeRange === '7days' ? 0 : 2.5,
      },
    ];
  } else if (activeMetric === 'pressure') {
    const pressure = (hourlyData.surface_pressure || []).slice(startIndex, endIndex);
    chartColor = '#c084fc';
    yAxisLabel = 'Surface Pressure (hPa)';

    chartDataset = [
      {
        label: 'Surface Pressure (hPa)',
        data: pressure,
        borderColor: '#c084fc',
        backgroundColor: 'rgba(192, 132, 252, 0.15)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: timeRange === '7days' ? 0 : 2.5,
      },
    ];
  } else if (activeMetric === 'clouds') {
    const clouds = (hourlyData.cloud_cover || []).slice(startIndex, endIndex);
    chartColor = '#94a3b8';
    yAxisLabel = 'Cloud Cover (%)';

    chartDataset = [
      {
        label: 'Cloud Cover (%)',
        data: clouds,
        borderColor: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: timeRange === '7days' ? 0 : 2.5,
      },
    ];
  }

  const options = {
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
          font: { size: 12, family: 'sans-serif' },
          boxWidth: 14,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: timeRange === '7days' ? 14 : 12,
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
          color: '#94a3b8',
          font: { size: 12 },
        },
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
    },
  };

  const metricTabs = [
    { id: 'temperature', label: 'Temperature', icon: Thermometer },
    { id: 'precipitation', label: 'Precipitation', icon: Droplets },
    { id: 'wind', label: 'Wind Speed', icon: Wind },
    { id: 'pressure', label: 'Surface Pressure', icon: Gauge },
    { id: 'clouds', label: 'Cloud Cover', icon: Cloud },
  ];

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-xl">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            <span>ECMWF AIFS Hourly Atmospheric Trajectory</span>
          </h2>
          <p className="text-xs text-slate-400">
            High-resolution temporal progression computed by AI neural forecasting
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start lg:self-auto">
          <button
            onClick={() => setTimeRange('24h')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeRange === '24h'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setTimeRange('48h')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeRange === '48h'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            48 Hours
          </button>
          <button
            onClick={() => setTimeRange('selectedDay')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 'selectedDay'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Day {selectedDayIndex + 1}
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeRange === '7days'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Full 7 Days
          </button>
        </div>
      </div>

      {/* Metric Selector Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-800/80 pb-4">
        {metricTabs.map((m) => {
          const Icon = m.icon;
          const isActive = activeMetric === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-80 sm:h-96 relative">
        {chartType === 'bar' ? (
          <Bar data={{ labels, datasets: chartDataset }} options={options} />
        ) : (
          <Line data={{ labels, datasets: chartDataset }} options={options} />
        )}
      </div>
    </div>
  );
}

