import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Globe, Sparkles } from 'lucide-react';
import { formatTemp } from '../utils/units';

// Custom sleek pulsed DivIcon to avoid broken png image paths in Vite/React
const createCustomMarker = (tempStr) => {
  return L.divIcon({
    className: 'custom-weather-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; background: rgba(6, 182, 212, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; background: #0284c7; border: 2px solid #ffffff; color: white; font-weight: bold; font-size: 11px; padding: 3px 8px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <span>📍</span>
          <span>${tempStr || 'AIFS'}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to handle map clicks and trigger forecast for clicked coords
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({
        name: `Custom Location`,
        country: `Lat ${lat.toFixed(2)}°, Lon ${lng.toFixed(2)}°`,
        latitude: lat,
        longitude: lng,
      });
    },
  });
  return null;
}

// Controller to smoothly pan map when selected location changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.2 });
  }, [center, map]);
  return null;
}

export default function WeatherMap({ location, weatherData, onSelectLocation, tempUnit }) {
  const currentTemp = weatherData?.hourly?.temperature_2m?.[0];
  const tempStr = currentTemp !== undefined ? formatTemp(currentTemp, tempUnit) : '';

  const center = [location.latitude, location.longitude];
  const customIcon = createCustomMarker(tempStr);

  const regionPresets = [
    { label: 'Europe', lat: 48.8566, lon: 2.3522, name: 'Paris, Europe' },
    { label: 'North America', lat: 40.7128, lon: -74.0060, name: 'New York, USA' },
    { label: 'Asia', lat: 35.6895, lon: 139.6917, name: 'Tokyo, Japan' },
    { label: 'South Asia', lat: 28.6139, lon: 77.2090, name: 'New Delhi, India' },
    { label: 'South America', lat: -23.5505, lon: -46.6333, name: 'São Paulo, Brazil' },
    { label: 'Australia', lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia' },
  ];

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-800/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            <span>Interactive ECMWF AIFS Global Grid</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click anywhere on Earth to query the 0.25° ECMWF neural network model directly at that grid point.
          </p>
        </div>

        {/* Quick Continent presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Fly to:</span>
          {regionPresets.map((r) => (
            <button
              key={r.label}
              onClick={() => onSelectLocation({
                name: r.name,
                country: r.label,
                latitude: r.lat,
                longitude: r.lon,
              })}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-all"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-[550px] relative">
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* CartoDB Dark Matter Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> | ECMWF AIFS 0.25°'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapRecenter center={center} />
          <MapClickHandler onLocationSelect={onSelectLocation} />

          <Marker position={center} icon={customIcon}>
            <Popup>
              <div className="p-1">
                <div className="font-bold text-sm text-white">{location.name}</div>
                <div className="text-xs text-slate-300">{location.country}</div>
                <div className="mt-2 text-sm font-semibold text-cyan-400 flex items-center gap-1">
                  <span>AIFS Temp:</span>
                  <span>{tempStr}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Map Overlay Badge */}
        <div className="absolute bottom-4 left-4 z-[400] glass-card px-4 py-2.5 rounded-2xl border border-slate-750 text-xs text-slate-200 shadow-xl pointer-events-none">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Click map to sample neural forecast</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Active: {location.name} ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
          </div>
        </div>
      </div>
    </div>
  );
}

