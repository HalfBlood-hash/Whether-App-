// Unit conversion and formatting utilities

export function formatTemp(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined) return '--';
  if (unit === 'F') {
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTempRaw(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined) return null;
  if (unit === 'F') {
    return Number(((celsius * 9) / 5 + 32).toFixed(1));
  }
  return Number(celsius.toFixed(1));
}

export function formatWindSpeed(kmh, unit = 'kmh') {
  if (kmh === null || kmh === undefined) return '--';
  if (unit === 'mph') {
    return `${(kmh * 0.621371).toFixed(1)} mph`;
  }
  if (unit === 'ms') {
    return `${(kmh / 3.6).toFixed(1)} m/s`;
  }
  return `${kmh.toFixed(1)} km/h`;
}

export function formatPressure(hpa, unit = 'hpa') {
  if (hpa === null || hpa === undefined) return '--';
  if (unit === 'inHg') {
    return `${(hpa * 0.02953).toFixed(2)} inHg`;
  }
  return `${Math.round(hpa)} hPa`;
}

export function formatPrecip(mm, unit = 'mm') {
  if (mm === null || mm === undefined) return '--';
  if (unit === 'in') {
    return `${(mm * 0.0393701).toFixed(2)} in`;
  }
  return `${mm.toFixed(1)} mm`;
}

export function getWindDirection(deg) {
  if (deg === null || deg === undefined) return '';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

export function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatHour(isoTime) {
  if (!isoTime) return '';
  const d = new Date(isoTime);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

