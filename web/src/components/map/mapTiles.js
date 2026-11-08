import L from 'leaflet';

/**
 * Attaches the appropriate dark mode tile layer to the Leaflet map.
 * Priority:
 * 1. CARTO Dark Matter (if VITE_CARTO_API_KEY or VITE_MAP_API_KEY is present)
 * 2. Stadia Alidade Smooth Dark (if VITE_STADIA_API_KEY is present)
 * 3. Mapbox Dark (if VITE_MAPBOX_TOKEN is present)
 * 4. Esri World Dark Gray Canvas (Default: 100% Free, Zero Key, No watermark)
 */
export function addDarkTileLayer(map) {
  const cartoKey = import.meta.env.VITE_CARTO_API_KEY || import.meta.env.VITE_MAP_API_KEY;
  const stadiaKey = import.meta.env.VITE_STADIA_API_KEY;
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  if (cartoKey) {
    return L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${cartoKey}`,
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }
    ).addTo(map);
  }

  if (stadiaKey) {
    return L.tileLayer(
      `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${stadiaKey}`,
      {
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
        maxZoom: 20
      }
    ).addTo(map);
  }

  if (mapboxToken) {
    return L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      {
        attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 19
      }
    ).addTo(map);
  }

  // Default: Esri World Dark Gray Canvas (High-res midnight dark, no API key needed, zero watermark)
  const base = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin',
      maxZoom: 16
    }
  ).addTo(map);

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '',
      maxZoom: 16
    }
  ).addTo(map);

  return base;
}
