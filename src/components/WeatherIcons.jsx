import React from 'react';
import { 
  Sun, 
  SunMedium, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Compass
} from 'lucide-react';
import { getWmoInfo } from '../services/weatherApi';

export function ConditionIcon({ code, className = 'h-6 w-6' }) {
  const info = getWmoInfo(code);

  switch (info.icon) {
    case 'Sun':
      return <Sun className={`${className} text-amber-400`} />;
    case 'SunMedium':
      return <SunMedium className={`${className} text-amber-300`} />;
    case 'CloudSun':
      return <CloudSun className={`${className} text-cyan-300`} />;
    case 'Cloud':
      return <Cloud className={`${className} text-slate-300`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-slate-400`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-cyan-400`} />;
    case 'CloudRain':
      return <CloudRain className={`${className} text-blue-400`} />;
    case 'CloudSnow':
      return <CloudSnow className={`${className} text-sky-200`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-violet-400 animate-pulse`} />;
    default:
      return <Sun className={`${className} text-amber-400`} />;
  }
}

export { Droplets, Wind, Gauge, Eye, Compass };

