import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  Zap, 
  Network, 
  Database, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function AifsScienceView() {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">
            Deep Learning Meteorology
          </span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          How ECMWF AIFS Works
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-2 leading-relaxed">
          The <strong>Artificial Intelligence Forecasting System (AIFS)</strong> is the European Centre for Medium-Range Weather Forecasts' flagship machine learning weather prediction model. It represents one of the largest shifts in operational numerical weather prediction in 50 years.
        </p>

        {/* Highlight Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">&lt; 1 min</div>
            <div className="text-xs text-slate-400 mt-1">10-Day Global Forecast Runtime</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-indigo-400">0.25°</div>
            <div className="text-xs text-slate-400 mt-1">Global Resolution (~25 km Grid)</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">99.9%</div>
            <div className="text-xs text-slate-400 mt-1">Energy Reduction vs Supercomputers</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-purple-400">40+ Yrs</div>
            <div className="text-xs text-slate-400 mt-1">ERA5 Training Dataset (1979–Present)</div>
          </div>
        </div>
      </div>

      {/* Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: GNN Encoder */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-800/80 shadow-lg">
          <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 w-fit mb-4">
            <Network className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">1. Graph Neural Network Encoder</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Atmospheric observation grids (lat/lon and reduced Gaussian grids) are mapped onto an icosahedral spherical mesh via spatial Graph Neural Networks, preserving spherical Earth topology without polar singularities.
          </p>
        </div>

        {/* Card 2: Transformer Backbone */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-800/80 shadow-lg">
          <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 w-fit mb-4">
            <Cpu className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">2. Multi-Scale Transformer Core</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The multi-layer transformer processor applies self-attention mechanisms across atmospheric layers and spherical tokens, learning non-linear fluid dynamics, Rossby wave propagation, and jet stream dynamics.
          </p>
        </div>

        {/* Card 3: GNN Decoder & Rollout */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-800/80 shadow-lg">
          <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-purple-400 w-fit mb-4">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">3. Autoregressive Rollout</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The decoder projects latent representations back to physical weather variables (temperature, wind, humidity, pressure). The model rolls forward in 6-hour steps to generate 10-day forecasts autoregressively.
          </p>
        </div>
      </div>

      {/* Comparison Table: AIFS vs IFS */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">
          Detailed Comparison: ECMWF AIFS (AI) vs ECMWF IFS (Physics NWP)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Parameter</th>
                <th className="pb-3 font-semibold text-cyan-400">ECMWF AIFS (AI)</th>
                <th className="pb-3 font-semibold text-amber-400">ECMWF IFS HRES (Physics)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 font-medium text-white">Underlying Engine</td>
                <td className="py-3 text-cyan-300">Graph Transformer Neural Network</td>
                <td className="py-3 text-amber-300">Hydrostatic Navier-Stokes Equations</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Compute Hardware</td>
                <td className="py-3">1x NVIDIA A100 / H100 GPU</td>
                <td className="py-3">Thousands of supercomputing CPU cores (Atos BullSequana)</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">10-Day Run Time</td>
                <td className="py-3 font-bold text-emerald-400">~60 seconds</td>
                <td className="py-3 text-slate-400">~60–90 minutes</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Z500 Score (500hPa Geopotential)</td>
                <td className="py-3 text-cyan-300">Higher skill score than IFS out to Day 8</td>
                <td className="py-3 text-amber-300">Benchmark operational standard</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Ensemble Generation</td>
                <td className="py-3">50 members generated in &lt; 5 minutes</td>
                <td className="py-3">Requires dedicated supercomputing partition</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">License & Access</td>
                <td className="py-3">Open Data (CC-BY 4.0) via Open-Meteo & ECMWF</td>
                <td className="py-3">ECMWF Open Data tier</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

