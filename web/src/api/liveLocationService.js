// ============================================================================
// BOOZER · LIVE LOCATION & REAL-ROAD ROUTING SERVICE
// HTML5 GPS Geolocation, OpenStreetMap Nominatim, OSRM Real Turn-by-Turn Routing
// ============================================================================

import { api } from './client';

/**
 * Requests high-accuracy live GPS coordinates from the user's device browser.
 */
export function getLiveDeviceCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: pos.timestamp
        });
      },
      (err) => {
        let msg = 'Failed to get location.';
        if (err.code === 1) msg = 'Location permission was denied. Enable GPS in browser settings.';
        else if (err.code === 2) msg = 'Location is unavailable. Check your device GPS.';
        else if (err.code === 3) msg = 'Location request timed out.';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
}

/**
 * Reverse-geocodes GPS coordinates into a human-readable street address
 * using OpenStreetMap Nominatim (Free, no API key required).
 */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en'
        }
      }
    );

    if (!res.ok) {
      throw new Error(`Reverse geocode failed: ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
    const city = addr.city || addr.town || addr.village || addr.state_district || 'Hyderabad';
    const postcode = addr.postcode ? ` - ${addr.postcode}` : '';
    const state = addr.state || '';

    const shortAddress = road ? `${road}, ${city}${postcode}` : data.display_name.split(',').slice(0, 3).join(',');

    return {
      displayName: data.display_name,
      shortAddress,
      city,
      state,
      postcode: addr.postcode || ''
    };
  } catch (err) {
    console.warn('[BOOZER LIVE MAP] Reverse geocoding failed, using fallback:', err);
    return {
      displayName: `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      shortAddress: `Live Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      city: 'Detected City',
      state: '',
      postcode: ''
    };
  }
}

/**
 * Fetches real driving road waypoints, distance, and duration between two GPS coordinates
 * using the Open Source Routing Machine (OSRM) engine.
 *
 * @param {[number, number]} startCoords [lat, lng]
 * @param {[number, number]} endCoords [lat, lng]
 * @returns {Promise<{ waypoints: Array<[number, number]>, distanceKm: number, durationMinutes: number }>}
 */
export async function fetchRealRoadRoute(startCoords, endCoords) {
  const [lat1, lng1] = startCoords;
  const [lat2, lng2] = endCoords;

  try {
    // OSRM expects coordinates in lng,lat format
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`OSRM routing failed: ${res.status}`);
    }

    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const primaryRoute = data.routes[0];
      const geoCoordinates = primaryRoute.geometry.coordinates; // [[lng, lat], ...]

      // Leaflet expects [lat, lng]
      const leafletWaypoints = geoCoordinates.map(([lon, lat]) => [lat, lon]);
      const distanceKm = Number((primaryRoute.distance / 1000).toFixed(2));
      const durationMinutes = Math.max(1, Math.round(primaryRoute.duration / 60));

      return {
        waypoints: leafletWaypoints,
        distanceKm,
        durationMinutes,
        isRealRoad: true
      };
    }
  } catch (err) {
    console.warn('[BOOZER ROUTING] OSRM real-road routing failed, falling back to direct waypoints:', err);
  }

  // Graceful fallback to direct interpolated waypoints
  const waypoints = generateInterpolatedPath(startCoords, endCoords, 8);
  const distanceKm = Number((calculateHaversineDistance(lat1, lng1, lat2, lng2)).toFixed(2));
  const durationMinutes = Math.max(2, Math.round(distanceKm * 3.5));

  return {
    waypoints,
    distanceKm,
    durationMinutes,
    isRealRoad: false
  };
}

/**
 * Fetches live delivery telemetry from Spring Boot backend API.
 */
export async function fetchBackendDelivery(orderId) {
  try {
    const delivery = await api.getDelivery(orderId);
    if (delivery) {
      return {
        riderName: delivery.riderName || 'Rohit Kumar',
        riderPhone: delivery.riderPhone || '+91 98490 28192',
        riderLat: delivery.riderLat ? Number(delivery.riderLat) : null,
        riderLng: delivery.riderLng ? Number(delivery.riderLng) : null,
        status: delivery.status || 'IN_TRANSIT',
        doorstepOtp: delivery.doorstepOtp || '8492'
      };
    }
  } catch (err) {
    console.warn('[BOOZER API] Backend delivery fetch error:', err);
  }
  return null;
}

/**
 * Calculates Haversine distance in kilometers between two GPS points.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateInterpolatedPath(start, end, steps = 6) {
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lat = start[0] + (end[0] - start[0]) * fraction;
    const lng = start[1] + (end[1] - start[1]) * fraction;
    path.push([lat, lng]);
  }
  return path;
}
