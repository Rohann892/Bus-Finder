import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Module-level cache to prevent duplicate Nominatim requests
const geocodeCache = {};

async function geocodeStop(stopName) {
  if (geocodeCache[stopName]) {
    return geocodeCache[stopName];
  }
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(stopName + ', Kolkata')}&format=json&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      geocodeCache[stopName] = coords;
      return coords;
    }
  } catch (err) {
    console.error("Geocoding failed for stop:", stopName, err);
  }
  return null;
}

// Mode → colour mapping for map polylines / markers
const MODE_COLORS = {
  bus:   '#10b981', // emerald-500
  metro: '#8b5cf6', // violet-500
  train: '#3b82f6', // blue-500
  walk:  '#f59e0b', // amber-500
};

const MODE_LABELS = {
  bus:   'Bus',
  metro: 'Metro',
  train: 'Train',
  walk:  'Walk',
};

function getModeColor(mode) {
  return MODE_COLORS[mode] || MODE_COLORS.bus;
}

// ── Map Legend ────────────────────────────────────────────────────────────────
const MapLegend = ({ modes }) => {
  if (!modes || modes.length === 0) return null;
  return (
    <div className="absolute bottom-3 left-3 z-[9999] bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-2 flex flex-col gap-1 shadow-md pointer-events-none">
      {modes.map(m => (
        <div key={m} className="flex items-center gap-2 text-[0.75rem] font-sans font-medium text-slate-700">
          <span className="inline-block w-5 h-1.5 rounded-full" style={{ backgroundColor: getModeColor(m) }} />
          {MODE_LABELS[m] || m}
        </div>
      ))}
    </div>
  );
};

const JourneyMap = ({ path }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [loadingGeocodes, setLoadingGeocodes] = useState(false);
  const [mapStops, setMapStops] = useState([]);

  // Resolve geocodes for source, transfer points, and destination
  useEffect(() => {
    if (!path || path.length === 0) return;

    // Collect key waypoints: source, transfer points (bus changes), destination
    const keyIndices = new Set([0, path.length - 1]);
    for (let i = 1; i < path.length; i++) {
      if (path[i].bus !== path[i - 1].bus) {
        keyIndices.add(i - 1); // alight
        keyIndices.add(i);     // board
      }
    }

    const majorSteps = [...keyIndices].sort((a, b) => a - b).map(idx => ({
      stop:     path[idx].stop,
      bus:      path[idx].bus,
      mode:     path[idx].mode || 'bus',
      isStart:  idx === 0,
      isEnd:    idx === path.length - 1,
      dbCoords: path[idx].coordinates,
    }));

    let active = true;
    const resolveCoordinates = async () => {
      setLoadingGeocodes(true);
      const resolved = await Promise.all(
        majorSteps.map(async (step) => {
          let coords = await geocodeStop(step.stop);
          if (!coords) coords = step.dbCoords;
          return { ...step, coordinates: coords };
        })
      );

      if (active) {
        const validStops = resolved.filter(s => s.coordinates && s.coordinates.length === 2);
        setMapStops(validStops);
        setLoadingGeocodes(false);
      }
    };

    resolveCoordinates();
    return () => { active = false; };
  }, [path]);

  // Render Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapStops.length === 0) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    // Voyager tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    const allCoords = [];

    // Draw polyline segments coloured by mode
    for (let i = 0; i < mapStops.length - 1; i++) {
      const current = mapStops[i];
      const next    = mapStops[i + 1];
      const segCoords = [current.coordinates, next.coordinates];
      allCoords.push(...segCoords);

      const color = getModeColor(current.mode);
      const isWalk = current.mode === 'walk';

      const polyline = L.polyline(segCoords, {
        color,
        weight: isWalk ? 4 : 6,
        opacity: isWalk ? 0.65 : 0.88,
        dashArray: isWalk ? '8, 8' : null,
        lineJoin: 'round',
      }).addTo(map);

      polyline.bindPopup(
        `<strong>${MODE_LABELS[current.mode] || 'Bus'} ${current.bus}</strong><br/>${current.stop} → ${next.stop}`
      );
    }

    // Markers for source, transfers, and destination
    mapStops.forEach((step) => {
      const color = getModeColor(step.mode);
      let markerColor = color;
      let popupContent = `<strong>${step.stop}</strong><br/>`;

      if (step.isStart) {
        markerColor = color;
        popupContent += `<span style="color:${color}; font-weight:bold;">Start — ${MODE_LABELS[step.mode] || 'Bus'}</span><br/>Board <strong>${step.bus}</strong>`;
      } else if (step.isEnd) {
        markerColor = '#f59e0b';
        popupContent += `<span style="color:#b45309; font-weight:bold;">Destination</span><br/>Arrive here`;
      } else {
        // Transfer point
        popupContent += `<span style="color:${color}; font-weight:bold;">Transfer → ${MODE_LABELS[step.mode] || 'Bus'}</span><br/>Board <strong>${step.bus}</strong>`;
      }

      const marker = L.circleMarker(step.coordinates, {
        radius:      step.isStart || step.isEnd ? 9 : 7,
        fillColor:   markerColor,
        color:       '#ffffff',
        weight:      3,
        opacity:     1,
        fillOpacity: 0.95,
      }).addTo(map);

      marker.bindPopup(popupContent);
      marker.bindTooltip(step.stop, {
        permanent: false,
        direction: 'top',
        className: 'font-sans font-medium text-xs rounded shadow px-2 py-1 border-none bg-slate-800 text-white',
      });
    });

    if (allCoords.length > 0) {
      map.fitBounds(allCoords, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapStops]);

  // Unique modes used (for legend)
  const modesInPath = [...new Set((path || []).map(s => s.mode || 'bus'))];

  return (
    <div className="w-full relative overflow-hidden bg-white/80 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in mb-3 sm:mb-4">
      <div className="flex justify-between items-center px-2 sm:px-3 pb-2 sm:pb-2.5">
        <h3 className="font-display font-semibold text-sm sm:text-base text-slate-700 flex items-center gap-1.5 sm:gap-2 m-0">
          <svg className="text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          Journey Route Map
        </h3>
        <span className="text-[0.68rem] sm:text-[0.75rem] font-sans font-medium text-slate-400 bg-slate-50 border border-slate-200/60 px-1.5 sm:px-2 py-0.5 rounded-full">
          {loadingGeocodes ? 'Geocoding...' : 'Interactive'}
        </span>
      </div>
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[320px]">
        <div
          ref={mapContainerRef}
          className="w-full h-full rounded-2xl border border-slate-100 z-10"
        />
        {/* Map Legend */}
        <MapLegend modes={modesInPath} />
        {loadingGeocodes && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-20 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-600 font-sans font-medium text-sm">
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
              Resolving coordinates...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyMap;
