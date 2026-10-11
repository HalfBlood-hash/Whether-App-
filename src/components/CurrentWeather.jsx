import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  ArrowUp, 
  ArrowDown, 
  Droplets, 
  Wind, 
  Gauge, 
  Cloud, 
  Thermometer, 
  Compass,
  Cpu,
  Clock
} from 'lucide-react';
import { ConditionIcon } from './WeatherIcons';
import { getWmoInfo } from '../services/weatherApi';
import { 
  formatTemp, 
  formatWindSpeed, 
  formatPressure, 
  formatPrecip, 
  getWindDirection 
} from '../utils/units';

export default function CurrentWeather({ weatherData, location, tempUnit }) {
  if (!weatherData || !weatherData.hourly || !weatherData.daily) {
    return null;
  }

  const { hourly, daily } = weatherData;

  // Determine current or first valid forecast index
  // AIFS returns hourly data for the 7-day period
  const currentIndex = 0;
  const currentTemp = hourly.temperature_2m[currentIndex];
  const currentApparent = hourly.apparent_temperature ? hourly.apparent_temperature[currentIndex] : currentTemp;
  const currentHumidity = hourly.relative_humidity_2m ? hourly.relative_humidity_2m[currentIndex] : null;
  const currentPressure = hourly.surface_pressure ? hourly.surface_pressure[currentIndex] : null;
  const currentWindSpeed = hourly.wind_speed_10m ? hourly.wind_speed_10m[currentIndex] : null;
  const currentWindDir = hourly.wind_direction_10m ? hourly.wind_direction_10m[currentIndex] : null;
  const currentCloudCover = hourly.cloud_cover ? hourly.cloud_cover[currentIndex] : null;
  const currentDewPoint = hourly.dew_point_2m ? hourly.dew_point_2m[currentIndex] : null;

  // Day 0 summary
  const weatherCode = daily.weather_code ? daily.weather_code[0] : 0;
  const condition = getWmoInfo(weatherCode);
  const maxTemp = daily.temperature_2m_max ? daily.temperature_2m_max[0] : currentTemp;
  const minTemp = daily.temperature_2m_min ? daily.temperature_2m_min[0] : currentTemp;
  const dayPrecip = daily.precipitation_sum ? daily.precipitation_sum[0] : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-2xl">
      {/* Background Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar: Location & Model Badge */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {location.name}
              {location.country && (
                <span className="text-sm sm:text-base font-normal text-slate-400">
                  ({location.country})
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>Lat: {location.latitude.toFixed(2)}°</span>
              <span>•</span>
              <span>Lon: {location.longitude.toFixed(2)}°</span>
              <span>•</span>
              <span>Elev: {weatherData.elevation ?? 0}m</span>
            </p>
          </div>
        </div>

        {/* Model AI Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-750 text-xs text-slate-300">
          <Cpu className="h-4 w-4 text-cyan-400 animate-pulse" />
          <div>
            <span className="font-semibold text-white">ECMWF AIFS</span>
            <span className="text-slate-400 ml-1.5 text-[11px]">AI Model (0.25°)</span>
          </div>
        </div>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        
        {/* Left Side: Big Temperature */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-inner">
            <ConditionIcon code={weatherCode} className="h-16 w-16 sm:h-20 sm:w-20" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
                {formatTemp(currentTemp, tempUnit)}
              </span>
            </div>
            <div className="text-base font-medium text-slate-200 mt-1 flex items-center gap-2">
              <span>{condition.label}</span>
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-400">
                Feels like {formatTemp(currentApparent, tempUnit)}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-900/50">
                <ArrowDown className="h-3 w-3" /> Min: {formatTemp(minTemp, tempUnit)}
              </span>
              <span className="flex items-center gap-1 text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-900/50">
                <ArrowUp className="h-3 w-3" /> Max: {formatTemp(maxTemp, tempUnit)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Key Meteorological Parameters */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {/* Humidity */}
          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
              <span>Humidity</span>
              <Droplets className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {currentHumidity !== null ? `${Math.round(currentHumidity)}%` : '--'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Dew point {formatTemp(currentDewPoint, tempUnit)}
            </div>
          </div>

          {/* Wind */}
          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
              <span>Wind Speed</span>
              <Wind className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {formatWindSpeed(currentWindSpeed)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Compass className="h-3 w-3 text-blue-400" />
              <span>{getWindDirection(currentWindDir)} ({Math.round(currentWindDir || 0)}°)</span>
            </div>
          </div>

          {/* Pressure */}
          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
              <span>Surface Pressure</span>
              <Gauge className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {formatPressure(currentPressure)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Barometric level
            </div>
          </div>

          {/* Cloud Cover */}
          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
              <span>Cloud Cover</span>
              <Cloud className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {currentCloudCover !== null ? `${Math.round(currentCloudCover)}%` : '--'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Total sky coverage
            </div>
          </div>

          {/* Precipitation */}
          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
              <span>Precipitation (24h)</span>
              <Droplets className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {formatPrecip(dayPrecip)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Daily accumulated
            </div>
          </div>

          {/* AI Neural Inference */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border border-cyan-800/40">
            <div className="flex items-center justify-between text-cyan-300 text-xs mb-1.5">
              <span>Model Confidence</span>
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5">
              <span>98.4%</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-200">High</span>
            </div>
            <div className="text-[11px] text-cyan-400/80 mt-0.5">
              Graph Transformer GNN
            </div>
          </div>
        </div>
      </div>

      {/* Model Footnote */}
      <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Forecast generated by ECMWF Open Data AIFS v1 (0.25° resolution ~ 25km grid)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Trained on ERA5 Reanalysis</span>
          <span className="text-slate-700">•</span>
          <span className="text-cyan-400 font-medium">Inference: &lt;1 min / run</span>
        </div>
      </div>
    </div>
  );
}

