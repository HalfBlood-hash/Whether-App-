import React from 'react';
import { Calendar, ArrowUp, ArrowDown, Droplets, Wind } from 'lucide-react';
import { ConditionIcon } from './WeatherIcons';
import { getWmoInfo } from '../services/weatherApi';
import { formatTemp, formatDate, formatPrecip, formatWindSpeed } from '../utils/units';

export default function DailyForecast({ dailyData, tempUnit, selectedDayIndex, onSelectDay }) {
  if (!dailyData || !dailyData.time) return null;

  const {
    time = [],
    weather_code = [],
    temperature_2m_max = [],
    temperature_2m_min = [],
    precipitation_sum = [],
    wind_speed_10m_max = [],
  } = dailyData;

  // Find min and max across all 7 days to calculate proportional temperature range bars
  const allMins = temperature_2m_min.filter(t => t !== null);
  const allMaxs = temperature_2m_max.filter(t => t !== null);
  const globalMin = allMins.length ? Math.min(...allMins) : 0;
  const globalMax = allMaxs.length ? Math.max(...allMaxs) : 30;
  const range = Math.max(1, globalMax - globalMin);

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800/80 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              7-Day ECMWF AIFS Forecast
            </h2>
            <p className="text-xs text-slate-400">
              Medium-range deep neural network weather projection
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          Click any day to filter hourly charts
        </span>
      </div>

      {/* Grid of 7 days */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {time.map((dayIso, idx) => {
          const code = weather_code[idx] ?? 0;
          const condition = getWmoInfo(code);
          const min = temperature_2m_min[idx];
          const max = temperature_2m_max[idx];
          const precip = precipitation_sum[idx] ?? 0;
          const wind = wind_speed_10m_max[idx];
          const isSelected = selectedDayIndex === idx;

          // Bar calculations
          const minPercent = Math.max(0, Math.min(100, ((min - globalMin) / range) * 100));
          const maxPercent = Math.max(0, Math.min(100, ((max - globalMin) / range) * 100));
          const widthPercent = Math.max(8, maxPercent - minPercent);

          const dateObj = new Date(dayIso);
          const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <button
              key={dayIso}
              onClick={() => onSelectDay(idx)}
              className={`text-left p-4 rounded-2xl transition-all flex flex-col justify-between border relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
              )}

              {/* Day & Date */}
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className={`text-sm font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                    {dayName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {dateFormatted}
                  </div>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <ConditionIcon code={code} className="h-6 w-6" />
                </div>
              </div>

              {/* Condition Text */}
              <div className="my-3 text-xs text-slate-300 font-medium truncate w-full" title={condition.label}>
                {condition.label}
              </div>

              {/* Min & Max Numbers */}
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-400 flex items-center gap-0.5">
                  <ArrowDown className="h-3 w-3 text-emerald-400" />
                  {formatTemp(min, tempUnit)}
                </span>
                <span className="text-slate-100 flex items-center gap-0.5">
                  <ArrowUp className="h-3 w-3 text-rose-400" />
                  {formatTemp(max, tempUnit)}
                </span>
              </div>

              {/* Visual Temperature Range Bar */}
              <div className="w-full bg-slate-950/80 h-1.5 rounded-full overflow-hidden mb-3 relative">
                <div
                  className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400"
                  style={{
                    left: `${minPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                />
              </div>

              {/* Precipitation & Wind stats */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 w-full">
                <span className="flex items-center gap-1" title="Daily precipitation">
                  <Droplets className="h-3 w-3 text-cyan-400" />
                  {formatPrecip(precip)}
                </span>
                <span className="flex items-center gap-1" title="Max wind speed">
                  <Wind className="h-3 w-3 text-blue-400" />
                  {formatWindSpeed(wind)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

