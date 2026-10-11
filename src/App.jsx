import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  Cpu, 
  ExternalLink 
} from 'lucide-react';
import Header from './components/Header';
import CurrentWeather from './components/CurrentWeather';
import DailyForecast from './components/DailyForecast';
import HourlyForecastChart from './components/HourlyForecastChart';
import AiComparisonView from './components/AiComparisonView';
import EnsembleView from './components/EnsembleView';
import WeatherMap from './components/WeatherMap';
import AifsScienceView from './components/AifsScienceView';
import ExportView from './components/ExportView';
import { fetchAifsForecast } from './services/weatherApi';

const DEFAULT_LOCATION = {
  name: 'Berlin',
  country: 'Germany',
  latitude: 52.5200,
  longitude: 13.4050,
};

export default function App() {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [tempUnit, setTempUnit] = useState('C');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadForecast = async (loc) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAifsForecast(loc.latitude, loc.longitude);
      setWeatherData(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load forecast:', err);
      setError(err.message || 'Unable to load ECMWF AIFS forecast.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast(currentLocation);
  }, [currentLocation]);

  const handleSelectLocation = (loc) => {
    setCurrentLocation(loc);
    setSelectedDayIndex(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Navigation & Header */}
      <Header
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="rounded-3xl glass-panel p-16 text-center border border-slate-800 flex flex-col items-center justify-center min-h-[450px]">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40 animate-pulse">
                <Cpu className="h-8 w-8 text-cyan-400" />
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 border-t-transparent animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Executing ECMWF AIFS Inference...
            </h2>
            <p className="text-sm text-slate-400 max-w-md mt-2">
              Querying 0.25° spatial grid coordinates ({currentLocation.latitude.toFixed(2)}°, {currentLocation.longitude.toFixed(2)}°) for {currentLocation.name}...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-3xl glass-panel p-12 text-center border border-rose-900/50 bg-rose-950/20">
            <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">Forecast Query Failed</h3>
            <p className="text-sm text-rose-300 max-w-md mx-auto mt-2 mb-6">
              {error}
            </p>
            <button
              onClick={() => loadForecast(currentLocation)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold text-sm transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Retry Query
            </button>
          </div>
        )}

        {/* Views Display */}
        {!loading && !error && weatherData && (
          <>
            {/* TAB 1: Main Forecast Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <CurrentWeather
                  weatherData={weatherData}
                  location={currentLocation}
                  tempUnit={tempUnit}
                />

                <DailyForecast
                  dailyData={weatherData.daily}
                  tempUnit={tempUnit}
                  selectedDayIndex={selectedDayIndex}
                  onSelectDay={setSelectedDayIndex}
                />

                <HourlyForecastChart
                  hourlyData={weatherData.hourly}
                  tempUnit={tempUnit}
                  selectedDayIndex={selectedDayIndex}
                />
              </div>
            )}

            {/* TAB 2: AI vs Physics Comparison */}
            {activeTab === 'comparison' && (
              <AiComparisonView
                location={currentLocation}
                tempUnit={tempUnit}
              />
            )}

            {/* TAB 3: 50-Member Ensemble */}
            {activeTab === 'ensemble' && (
              <EnsembleView
                location={currentLocation}
                tempUnit={tempUnit}
              />
            )}

            {/* TAB 4: Interactive Global Map */}
            {activeTab === 'map' && (
              <WeatherMap
                location={currentLocation}
                weatherData={weatherData}
                onSelectLocation={handleSelectLocation}
                tempUnit={tempUnit}
              />
            )}

            {/* TAB 5: Scientific Documentation & Architecture */}
            {activeTab === 'science' && (
              <AifsScienceView />
            )}

            {/* TAB 6: Data Export & Code Generation */}
            {activeTab === 'export' && (
              <ExportView
                location={currentLocation}
                weatherData={weatherData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ECMWF AIFS Weather Prediction</span>
            <span>•</span>
            <span>Deep Learning Graph Transformer NWP</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Data: ECMWF Open Data & Open-Meteo</span>
            <span>•</span>
            <span className="font-mono text-[11px]">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
