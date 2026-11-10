// ============================================================================
// BOOZER · GOOGLE MAPS PLATFORM DYNAMIC LOADER
// Safely loads Google Maps JavaScript API with Places and Geometry libraries.
// If no key is provided, returns null to allow seamless Leaflet fallback.
// ============================================================================

let googleMapsPromise = null;

export function loadGoogleMapsScript(apiKey) {
  if (typeof window === 'undefined') return Promise.resolve(null);

  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return Promise.resolve(null);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve) => {
    const existingScript = document.getElementById('boozer-google-maps-script');
    if (existingScript) {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        existingScript.addEventListener('load', () => resolve(window.google.maps));
        existingScript.addEventListener('error', () => resolve(null));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'boozer-google-maps-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        resolve(null);
      }
    };

    script.onerror = (err) => {
      console.warn('[BOOZER MAP] Failed to load Google Maps JavaScript API:', err);
      resolve(null);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
