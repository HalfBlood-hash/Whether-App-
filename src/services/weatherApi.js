// Weather API Service for ECMWF AIFS (Artificial Intelligence Forecasting System)
// Connects to ECMWF Open-Meteo endpoints for deterministic, ensemble, and IFS comparison data

const ECMWF_ENDPOINT = 'https://api.open-meteo.com/v1/ecmwf';
const ENSEMBLE_ENDPOINT = 'https://ensemble-api.open-meteo.com/v1/ensemble';
const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * WMO Weather interpretation codes
 */
export const WMO_CODES = {
  0: { label: 'Clear Sky', icon: 'Sun', desc: 'Mainly clear sky' },
  1: { label: 'Mainly Clear', icon: 'SunMedium', desc: 'Mainly clear with passing clouds' },
  2: { label: 'Partly Cloudy', icon: 'CloudSun', desc: 'Partly cloudy sky' },
  3: { label: 'Overcast', icon: 'Cloud', desc: 'Overcast cloud cover' },
  45: { label: 'Foggy', icon: 'CloudFog', desc: 'Fog and depositing rime fog' },
  48: { label: 'Icy Fog', icon: 'CloudFog', desc: 'Depositing rime fog' },
  51: { label: 'Light Drizzle', icon: 'CloudDrizzle', desc: 'Light intensity drizzle' },
  53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', desc: 'Moderate intensity drizzle' },
  55: { label: 'Dense Drizzle', icon: 'CloudDrizzle', desc: 'Dense intensity drizzle' },
  61: { label: 'Slight Rain', icon: 'CloudRain', desc: 'Slight rain showers' },
  63: { label: 'Moderate Rain', icon: 'CloudRain', desc: 'Moderate continuous rain' },
  65: { label: 'Heavy Rain', icon: 'CloudRain', desc: 'Heavy rain downpour' },
  71: { label: 'Slight Snow', icon: 'CloudSnow', desc: 'Slight snow fall' },
  73: { label: 'Moderate Snow', icon: 'CloudSnow', desc: 'Moderate snow fall' },
  75: { label: 'Heavy Snow', icon: 'CloudSnow', desc: 'Heavy snow fall' },
  77: { label: 'Snow Grains', icon: 'CloudSnow', desc: 'Snow grains' },
  80: { label: 'Slight Rain Showers', icon: 'CloudRain', desc: 'Slight rain showers' },
  81: { label: 'Moderate Showers', icon: 'CloudRain', desc: 'Moderate rain showers' },
  82: { label: 'Violent Showers', icon: 'CloudRain', desc: 'Violent rain showers' },
  85: { label: 'Slight Snow Showers', icon: 'CloudSnow', desc: 'Slight snow showers' },
  86: { label: 'Heavy Snow Showers', icon: 'CloudSnow', desc: 'Heavy snow showers' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning', desc: 'Thunderstorm with possible hail' },
  96: { label: 'Thunderstorm with Hail', icon: 'CloudLightning', desc: 'Thunderstorm with slight hail' },
  99: { label: 'Severe Thunderstorm', icon: 'CloudLightning', desc: 'Severe thunderstorm with heavy hail' },
};

export function getWmoInfo(code) {
  if (code === undefined || code === null) return WMO_CODES[0];
  return WMO_CODES[code] || { label: `Condition (${code})`, icon: 'Cloud', desc: 'Weather condition' };
}

/**
 * Fetch ECMWF AIFS Deterministic Forecast
 */
export async function fetchAifsForecast(latitude, longitude, timezone = 'auto') {
  const hourlyParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'dew_point_2m',
    'apparent_temperature',
    'precipitation',
    'surface_pressure',
    'cloud_cover',
    'wind_speed_10m',
    'wind_direction_10m',
  ].join(',');

  const dailyParams = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'precipitation_sum',
    'wind_speed_10m_max',
  ].join(',');

  const url = `${ECMWF_ENDPOINT}?latitude=${latitude}&longitude=${longitude}&models=ecmwf_aifs025_single&hourly=${hourlyParams}&daily=${dailyParams}&timezone=${encodeURIComponent(timezone)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ECMWF AIFS forecast: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch AI vs Physics Comparison (ECMWF AIFS vs ECMWF IFS)
 */
export async function fetchModelComparison(latitude, longitude, timezone = 'auto') {
  const hourlyParams = [
    'temperature_2m',
    'precipitation',
    'surface_pressure',
    'wind_speed_10m',
  ].join(',');

  const dailyParams = [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
  ].join(',');

  const url = `${ECMWF_ENDPOINT}?latitude=${latitude}&longitude=${longitude}&models=ecmwf_aifs025_single,ecmwf_ifs025&hourly=${hourlyParams}&daily=${dailyParams}&timezone=${encodeURIComponent(timezone)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch model comparison: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch ECMWF AIFS Ensemble Forecast (50 members + mean)
 */
export async function fetchAifsEnsemble(latitude, longitude) {
  const hourlyParams = ['temperature_2m', 'precipitation', 'wind_speed_10m', 'surface_pressure'].join(',');
  const url = `${ENSEMBLE_ENDPOINT}?latitude=${latitude}&longitude=${longitude}&models=ecmwf_aifs025&hourly=${hourlyParams}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ECMWF AIFS ensemble: ${response.status}`);
  }
  return await response.json();
}

/**
 * Search cities using Open-Meteo Geocoding
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `${GEOCODING_ENDPOINT}?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.results || []).map(r => ({
    id: `${r.id || r.latitude + '_' + r.longitude}`,
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
    elevation: r.elevation,
    timezone: r.timezone,
  }));
}

