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

const JourneyMap = ({ path }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [loadingGeocodes, setLoadingGeocodes] = useState(false);
  const [mapStops, setMapStops] = useState([]);

  // Resolve geocodes for source, transfer points, and destination
  useEffect(() => {
    if (!path || path.length === 0) return;

    // Identify major stops: ONLY start (source) and end (destination)
    const majorSteps = [
      {
        stop: path[0].stop,
        bus: path[0].bus,
        isStart: true,
        isEnd: false,
        dbCoords: path[0].coordinates
      },
      {
        stop: path[path.length - 1].stop,
        bus: path[path.length - 1].bus,
        isStart: false,
        isEnd: true,
        dbCoords: path[path.length - 1].coordinates
      }
    ];

    let active = true;
    const resolveCoordinates = async () => {
      setLoadingGeocodes(true);
      const resolved = await Promise.all(
        majorSteps.map(async (step) => {
          let coords = await geocodeStop(step.stop);
          // Fallback to database coordinates if geocoding fails
          if (!coords) {
            coords = step.dbCoords;
          }
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

    return () => {
      active = false;
    };
  }, [path]);

  // Render Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapStops.length === 0) return;

    // Initialize the Leaflet map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    // Add Voyager map tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Draw polylines (colored routes) connecting the resolved stops in order
    const colors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6']; // Emerald, Teal, Cyan, Blue
    const allCoords = [];

    for (let i = 0; i < mapStops.length - 1; i++) {
      const current = mapStops[i];
      const next = mapStops[i + 1];
      const coords = [current.coordinates, next.coordinates];
      allCoords.push(...coords);

      const color = colors[i % colors.length];
      const polyline = L.polyline(coords, {
        color: color,
        weight: 6,
        opacity: 0.85,
        lineJoin: 'round',
      }).addTo(map);

      polyline.bindPopup(`<strong>Bus ${current.bus}</strong>`);
    }

    // Draw Markers ONLY for Source and Destination stops
    mapStops.forEach((step) => {
      // Only draw start (source) and end (destination) markers
      if (!step.isStart && !step.isEnd) {
        return;
      }

      let markerOptions = {};
      let popupContent = `<strong>${step.stop}</strong><br/>`;

      if (step.isStart) {
        markerOptions = {
          radius: 8,
          fillColor: '#10b981', // Emerald
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.95,
        };
        popupContent += `<span style="color:#047857; font-weight:bold;">Start Station</span><br/>Board Bus <strong>${step.bus}</strong>`;
      } else if (step.isEnd) {
        markerOptions = {
          radius: 8,
          fillColor: '#f59e0b', // Amber
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.95,
        };
        popupContent += `<span style="color:#b45309; font-weight:bold;">Destination</span><br/>Arrive here`;
      }

      const marker = L.circleMarker(step.coordinates, markerOptions).addTo(map);
      marker.bindPopup(popupContent);

      marker.bindTooltip(step.stop, {
        permanent: false,
        direction: 'top',
        className: 'font-sans font-medium text-xs rounded shadow px-2 py-1 border-none bg-slate-800 text-white',
      });
    });

    // Auto-fit bounds
    if (allCoords.length > 0) {
      map.fitBounds(allCoords, { padding: [50, 50] });
    }

    // Cleanup on unmount or mapStops change
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapStops]);

  return (
    <div className="w-full relative overflow-hidden bg-white/80 border border-slate-200/80 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in mb-4">
      <div className="flex justify-between items-center px-3 pb-2.5">
        <h3 className="font-display font-semibold text-base text-slate-700 flex items-center gap-2 m-0">
          <svg className="text-emerald-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          Journey Route Map
        </h3>
        <span className="text-[0.75rem] font-sans font-medium text-slate-400 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full">
          {loadingGeocodes ? 'Geocoding...' : 'Interactive Zoom'}
        </span>
      </div>
      <div className="relative w-full h-[320px]">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full rounded-2xl border border-slate-100 z-10" 
        />
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
