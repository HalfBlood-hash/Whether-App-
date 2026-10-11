import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Cpu, 
  BarChart3, 
  Layers, 
  Globe2, 
  BookOpen, 
  Download, 
  Sparkles,
  X,
  Loader2
} from 'lucide-react';
import { searchLocations } from '../services/weatherApi';

const POPULAR_LOCATIONS = [
  { name: 'Tokyo', country: 'Japan', latitude: 35.6895, longitude: 139.6917 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 },
  { name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708 },
];

export default function Header({ 
  currentLocation, 
  onSelectLocation, 
  activeTab, 
  setActiveTab,
  tempUnit,
  setTempUnit 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const dropdownRef = useRef(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (loc) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onSelectLocation({
          name: 'My Location',
          country: `GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed:', err);
        alert('Could not access your location. Please check browser permissions.');
      },
      { timeout: 10000 }
    );
  };

  const navTabs = [
    { id: 'overview', label: 'Forecast Overview', icon: Cpu },
    { id: 'comparison', label: 'AI vs Physics (IFS)', icon: BarChart3 },
    { id: 'ensemble', label: '50-Member Ensemble', icon: Layers },
    { id: 'map', label: 'Global Map', icon: Globe2 },
    { id: 'science', label: 'Inside AIFS', icon: BookOpen },
    { id: 'export', label: 'Export & Code', icon: Download },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Model Badges */}
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950/70 rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  ECMWF <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">AIFS</span>
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  AI Model 0.25°
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>Artificial Intelligence Forecasting System</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-medium">Medium-Range NWP</span>
              </p>
            </div>
          </div>

          {/* Search Bar & Unit Switcher */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input Box */}
            <div className="relative flex-1 md:w-80" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                  placeholder="Search city, country or lat/lon..."
                  className="w-full pl-10 pr-10 py-2 text-sm rounded-xl bg-slate-900 border border-slate-750 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setShowDropdown(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400 animate-spin" />
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full mt-1.5 left-0 right-0 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-xl max-h-72 overflow-y-auto z-50 divide-y divide-slate-800">
                  {searchResults.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <MapPin className="h-4 w-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-slate-200 truncate">{loc.name}</span>
                        <span className="text-xs text-slate-400 truncate">
                          {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono shrink-0">
                        {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Locate Me Button */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Use current GPS location"
              className="p-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-all shrink-0 active:scale-95"
            >
              <Navigation className={`h-4 w-4 ${isLocating ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Unit Toggle */}
            <div className="flex bg-slate-900 border border-slate-750 rounded-xl p-0.5 shrink-0">
              <button
                onClick={() => setTempUnit('C')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  tempUnit === 'C'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setTempUnit('F')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  tempUnit === 'F'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </div>

        {/* Quick Location Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-cyan-400" /> Quick select:
          </span>
          {POPULAR_LOCATIONS.map((loc) => {
            const isSelected = 
              currentLocation.latitude === loc.latitude && 
              currentLocation.longitude === loc.longitude;
            return (
              <button
                key={loc.name}
                onClick={() => handleSelect(loc)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60'
                }`}
              >
                {loc.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-1 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

