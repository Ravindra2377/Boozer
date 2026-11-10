import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Crosshair, Radio, AlertTriangle, Play, Pause, RotateCcw,
  Navigation, ShieldAlert, CheckCircle2, Search, MapPin
} from 'lucide-react';
import { loadGoogleMapsScript } from './loadGoogleMaps';
import { BOOZER_DARK_MAP_STYLE } from './googleMapStyles';
import { addDarkTileLayer } from './mapTiles';
import { api } from '../../api/client';
import {
  calculateHaversineDistance,
  getLiveDeviceCoordinates,
  reverseGeocode,
  fetchRealRoadRoute
} from '../../api/liveLocationService';

/**
 * Calculates shortest distance (in meters) from a point to a polyline segment.
 */
function distanceToSegmentMeters(p, a, b) {
  const [lat, lng] = p;
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;

  const R = 6371000; // Earth radius in meters
  const toRad = Math.PI / 180;
  const x1 = lat1 * toRad, y1 = lng1 * toRad;
  const x2 = lat2 * toRad, y2 = lng2 * toRad;
  const x0 = lat * toRad, y0 = lng * toRad;

  // Approximate flat earth projection for short distances
  const dx = (x2 - x1) * Math.cos((y1 + y2) / 2);
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;

  if (l2 === 0) {
    return calculateHaversineDistance(lat, lng, lat1, lng1) * 1000;
  }

  const px = (x0 - x1) * Math.cos((y1 + y2) / 2);
  const py = y0 - y1;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / l2));

  const projLat = lat1 + (lat2 - lat1) * t;
  const projLng = lng1 + (lng2 - lng1) * t;
  return calculateHaversineDistance(lat, lng, projLat, projLng) * 1000;
}

function calculateMinDistanceToRoute(point, waypoints) {
  if (!waypoints || waypoints.length < 2) return 0;
  let minMeters = Infinity;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = distanceToSegmentMeters(point, waypoints[i], waypoints[i + 1]);
    if (d < minMeters) minMeters = d;
  }
  return minMeters;
}

/**
 * Universal Production Delivery & Safe Ride Map Component.
 * Supports:
 * - Google Maps Platform (when API key is present) with luxury dark theme
 * - High-resolution dark Leaflet canvas fallback (zero key required)
 * - Real live SSE telemetry pipeline with staleness indicators
 * - Snap-to-route calculation and off-route breach alerts
 * - Per-retailer statutory delivery radius check
 * - Interactive GPS Replay mode for testing & QA
 * - Draggable destination pin with reverse geocoding
 */
export function DeliveryMap({
  mode = 'DELIVERY', // 'DELIVERY' | 'SAFE_RIDE'
  order,
  origin,
  destination,
  waypoints: initialWaypoints = [],
  riderName = "Rohit Kumar",
  riderVehicle = "KA 01 AB 1234",
  height = "320px",
  allowPinDrag = true,
  enableReplayControls = true,
  onDestinationChange,
  onTelemetryUpdate,
  isFrameMode = true
}) {
  const containerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const googleMapRef = useRef(null);

  // Markers
  const riderMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const storeMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const geofenceRef = useRef(null);

  const [activeProvider, setActiveProvider] = useState('LEAFLET'); // 'GOOGLE' | 'LEAFLET'
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Telemetry & State
  const [activeWaypoints, setActiveWaypoints] = useState(initialWaypoints);
  const [currentRiderPos, setCurrentRiderPos] = useState(initialWaypoints[0] || [17.4325, 78.4070]);
  const [currentSpeed, setCurrentSpeed] = useState(28);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [remainingKm, setRemainingKm] = useState(2.8);
  const [etaMinutes, setEtaMinutes] = useState(9);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [secondsSinceLastPing, setSecondsSinceLastPing] = useState(0);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState(null);

  // Safety & Geofence
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [offRouteDistanceMeters, setOffRouteDistanceMeters] = useState(0);
  const [isOutsideZone, setIsOutsideZone] = useState(false);
  const [zoneDistanceKm, setZoneDistanceKm] = useState(0);

  // Destination / Draggable pin state
  const defaultOrigin = origin || {
    name: "Jubilee Hills Reserve Spirits",
    licence: "TS/EXCISE/HYD/2026/0481",
    address: "Road No. 36, Jubilee Hills, Hyderabad",
    coords: [17.4325, 78.4070],
    deliveryRadiusKm: 6.5
  };

  const defaultDest = destination || {
    name: "Delivery Destination",
    address: "Villa 14, Silicon Meadows, Jubilee Hills, Hyderabad",
    coords: [17.4210, 78.4230]
  };

  const [activeDest, setActiveDest] = useState(defaultDest);

  // Replay Simulator state
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [replayFraction, setReplayFraction] = useState(0.0);

  // Check geofence on destination coords
  const verifyGeofence = useCallback((coords) => {
    const dist = calculateHaversineDistance(
      defaultOrigin.coords[0],
      defaultOrigin.coords[1],
      coords[0],
      coords[1]
    );
    const radius = defaultOrigin.deliveryRadiusKm || 6.5;
    if (dist > radius) {
      setIsOutsideZone(true);
      setZoneDistanceKm(Number(dist.toFixed(1)));
    } else {
      setIsOutsideZone(false);
      setZoneDistanceKm(Number(dist.toFixed(1)));
    }
  }, [defaultOrigin.coords, defaultOrigin.deliveryRadiusKm]);

  // Interpolation along waypoints
  const getInterpolatedPoint = useCallback((fraction) => {
    const pts = activeWaypoints.length > 0 ? activeWaypoints : [defaultOrigin.coords, defaultDest.coords];
    if (fraction <= 0) return pts[0];
    if (fraction >= 1) return pts[pts.length - 1];

    const totalSegments = pts.length - 1;
    const scaled = fraction * totalSegments;
    const segIndex = Math.min(Math.floor(scaled), totalSegments - 1);
    const segFraction = scaled - segIndex;

    const p1 = pts[segIndex];
    const p2 = pts[segIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * segFraction;
    const lng = p1[1] + (p2[1] - p1[1]) * segFraction;

    // Calculate heading angle
    const dLng = p2[1] - p1[1];
    const dLat = p2[0] - p1[0];
    const heading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

    return { coords: [lat, lng], heading };
  }, [activeWaypoints, defaultOrigin.coords, defaultDest.coords]);

  // 1. Check & Load Maps Engine on Mount
  useEffect(() => {
    let isCancelled = false;

    async function initMapEngine() {
      setIsLoading(true);
      verifyGeofence(activeDest.coords);

      const googleMaps = await loadGoogleMapsScript();

      if (!isCancelled) {
        if (googleMaps && containerRef.current) {
          initGoogleMap(googleMaps);
          setActiveProvider('GOOGLE');
        } else if (containerRef.current) {
          initLeafletMap();
          setActiveProvider('LEAFLET');
        }
        setIsLoading(false);
      }
    }

    initMapEngine();

    return () => {
      isCancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // 2. Leaflet Map Initializer
  const initLeafletMap = () => {
    if (!containerRef.current) return;
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const waypoints = activeWaypoints.length > 0 ? activeWaypoints : [defaultOrigin.coords, activeDest.coords];
    const bounds = L.latLngBounds(waypoints);

    const map = L.map(containerRef.current, {
      center: bounds.getCenter(),
      zoom: 14,
      zoomControl: false,
      attributionControl: true
    });
    leafletMapRef.current = map;

    addDarkTileLayer(map);

    // Geofence Circle
    const radiusMeters = (defaultOrigin.deliveryRadiusKm || 6.5) * 1000;
    const geofence = L.circle(defaultOrigin.coords, {
      radius: radiusMeters,
      color: '#E7A13D',
      weight: 1.5,
      dashArray: '6, 8',
      fillColor: '#E7A13D',
      fillOpacity: 0.04
    }).addTo(map);
    geofenceRef.current = geofence;

    // Route Polyline
    const route = L.polyline(waypoints, {
      color: mode === 'SAFE_RIDE' ? '#2DD4BF' : '#E7A13D',
      weight: 4,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    routeLineRef.current = route;

    // Origin Marker
    const originIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #16161E; border: 2px solid #C5A059; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.6);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="2"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    storeMarkerRef.current = L.marker(defaultOrigin.coords, { icon: originIcon }).addTo(map);

    // Destination Marker (Draggable)
    const destIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #C5A059; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.6); cursor: grab;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0C0C0F" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const destMarker = L.marker(activeDest.coords, {
      icon: destIcon,
      draggable: allowPinDrag
    }).addTo(map);

    if (allowPinDrag) {
      destMarker.on('dragend', async (e) => {
        const newLatLng = e.target.getLatLng();
        const coords = [newLatLng.lat, newLatLng.lng];
        verifyGeofence(coords);

        const geo = await reverseGeocode(coords[0], coords[1]);
        const updated = {
          name: "Adjusted Doorstep Pin",
          address: geo.shortAddress || geo.displayName,
          coords
        };
        setActiveDest(updated);
        if (onDestinationChange) onDestinationChange(updated);
      });
    }
    customerMarkerRef.current = destMarker;

    // Rider Marker
    const riderIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div class="marker-rider-container">
          <div class="marker-rider-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0C0C0F" stroke-width="2.2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
            <span>${riderName.split(' ')[0]} · ${currentSpeed} km/h</span>
          </div>
          <div class="marker-rider-beacon"></div>
        </div>
      `,
      iconSize: [120, 48],
      iconAnchor: [60, 40]
    });
    riderMarkerRef.current = L.marker(currentRiderPos, { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  };

  // 3. Google Maps Platform Initializer
  const initGoogleMap = (googleMaps) => {
    if (!containerRef.current) return;

    const waypoints = activeWaypoints.length > 0 ? activeWaypoints : [defaultOrigin.coords, activeDest.coords];
    const center = { lat: waypoints[0][0], lng: waypoints[0][1] };

    const map = new googleMaps.Map(containerRef.current, {
      center,
      zoom: 14,
      styles: BOOZER_DARK_MAP_STYLE,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false
    });
    googleMapRef.current = map;

    // Geofence Circle
    const radiusMeters = (defaultOrigin.deliveryRadiusKm || 6.5) * 1000;
    new googleMaps.Circle({
      strokeColor: "#E7A13D",
      strokeOpacity: 0.8,
      strokeWeight: 1.5,
      fillColor: "#E7A13D",
      fillOpacity: 0.05,
      map,
      center: { lat: defaultOrigin.coords[0], lng: defaultOrigin.coords[1] },
      radius: radiusMeters
    });

    // Route Polyline
    const pathCoords = waypoints.map(p => ({ lat: p[0], lng: p[1] }));
    new googleMaps.Polyline({
      path: pathCoords,
      geodesic: true,
      strokeColor: mode === 'SAFE_RIDE' ? '#2DD4BF' : '#E7A13D',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map
    });

    // Fit bounds
    const bounds = new googleMaps.LatLngBounds();
    pathCoords.forEach(p => bounds.extend(p));
    map.fitBounds(bounds, 40);
  };

  // 4. Live Telemetry Pipeline (SSE Stream)
  useEffect(() => {
    if (!order?.id) return;

    const unsubscribe = api.subscribeDeliveryStream(
      order.id,
      (telemetry) => {
        setIsStreamActive(true);
        setLastTelemetryTimestamp(Date.now());
        setSecondsSinceLastPing(0);

        if (telemetry.lat && telemetry.lng) {
          const newPos = [Number(telemetry.lat), Number(telemetry.lng)];
          setCurrentRiderPos(newPos);

          // Snap to route & off-route verification
          const deviationMeters = calculateMinDistanceToRoute(newPos, activeWaypoints);
          setOffRouteDistanceMeters(Math.round(deviationMeters));
          setIsOffRoute(deviationMeters > 150); // Flag if >150m off route

          if (riderMarkerRef.current) {
            riderMarkerRef.current.setLatLng(newPos);
          }
        }

        if (telemetry.speedKmh != null) {
          setCurrentSpeed(Math.round(Number(telemetry.speedKmh)));
        }

        if (telemetry.headingDegrees != null) {
          setCurrentHeading(Math.round(Number(telemetry.headingDegrees)));
        }

        if (onTelemetryUpdate) {
          onTelemetryUpdate(telemetry);
        }
      },
      (err) => {
        console.warn('[BOOZER MAP] SSE stream disconnected:', err);
        setIsStreamActive(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [order?.id, activeWaypoints, onTelemetryUpdate]);

  // Staleness timer
  useEffect(() => {
    if (!lastTelemetryTimestamp) return;
    const interval = setInterval(() => {
      setSecondsSinceLastPing(Math.round((Date.now() - lastTelemetryTimestamp) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastTelemetryTimestamp]);

  // 5. GPS Replay Simulator Loop (QA & Demo Mode)
  useEffect(() => {
    if (!isReplaying) return;

    const interval = setInterval(() => {
      setReplayFraction((prev) => {
        const step = 0.01 * replaySpeed;
        const next = prev + step;

        if (next >= 1.0) {
          setIsReplaying(false);
          return 1.0;
        }

        const point = getInterpolatedPoint(next);
        setCurrentRiderPos(point.coords);
        setCurrentHeading(point.heading);

        const totalDist = activeWaypoints.length > 2 ? 3.4 : 2.8;
        const remDist = Math.max(0, Number((totalDist * (1 - next)).toFixed(1)));
        const remTime = Math.max(0, Math.round(remDist * 3.5));
        setRemainingKm(remDist);
        setEtaMinutes(remTime);
        setCurrentSpeed(32);

        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng(point.coords);
        }

        // Off-route check on replay
        const deviation = calculateMinDistanceToRoute(point.coords, activeWaypoints);
        setIsOffRoute(deviation > 150);
        setOffRouteDistanceMeters(Math.round(deviation));

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isReplaying, replaySpeed, getInterpolatedPoint, activeWaypoints]);

  const handleToggleReplay = () => {
    if (replayFraction >= 1.0) {
      setReplayFraction(0.0);
    }
    setIsReplaying(prev => !prev);
  };

  const handleResetReplay = () => {
    setIsReplaying(false);
    setReplayFraction(0.0);
    const start = getInterpolatedPoint(0.0);
    setCurrentRiderPos(start.coords);
    if (riderMarkerRef.current) riderMarkerRef.current.setLatLng(start.coords);
  };

  const handleFitBounds = () => {
    if (leafletMapRef.current) {
      const waypoints = activeWaypoints.length > 0 ? activeWaypoints : [defaultOrigin.coords, activeDest.coords];
      const bounds = L.latLngBounds(waypoints);
      leafletMapRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  };

  return (
    <div
      className="boozer-map-wrapper"
      style={{
        height,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border-gold)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)'
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Provider badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(12, 12, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '0.66rem',
        color: 'var(--color-cream-muted)'
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: activeProvider === 'GOOGLE' ? '#4285F4' : '#10B981'
        }} />
        <span>{activeProvider === 'GOOGLE' ? 'Google Maps Platform' : 'Vector Dark Canvas'}</span>
      </div>

      {/* Off-Route Alert Banner */}
      {isOffRoute && (
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '10px',
          right: '10px',
          background: 'rgba(239, 68, 68, 0.95)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.74rem',
          fontWeight: 700,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
        }}>
          <ShieldAlert size={16} />
          <span>Courier deviated {offRouteDistanceMeters}m from planned route. Safety verification active.</span>
        </div>
      )}

      {/* Geofence Breach Warning Banner */}
      {isOutsideZone && (
        <div style={{
          position: 'absolute',
          top: isOffRoute ? '82px' : '40px',
          left: '10px',
          right: '10px',
          background: 'rgba(234, 88, 12, 0.95)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.74rem',
          fontWeight: 700,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
        }}>
          <AlertTriangle size={16} />
          <span>Selected address is {zoneDistanceKm}km away, exceeding the legal {defaultOrigin.deliveryRadiusKm || 6.5}km delivery zone limit.</span>
        </div>
      )}

      {/* Replay QA Controls */}
      {enableReplayControls && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          right: '10px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(22, 22, 30, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(231, 161, 61, 0.3)',
          padding: '4px 8px',
          borderRadius: '8px'
        }}>
          <button
            type="button"
            onClick={handleToggleReplay}
            style={{
              background: isReplaying ? '#E7A13D' : 'transparent',
              color: isReplaying ? '#0C0C0F' : '#E7A13D',
              border: '1px solid #E7A13D',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isReplaying ? <Pause size={10} /> : <Play size={10} />}
            <span>{isReplaying ? 'Pause' : 'Replay Run'}</span>
          </button>

          <button
            type="button"
            onClick={() => setReplaySpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)}
            style={{
              background: 'transparent',
              color: 'var(--color-cream-muted)',
              border: 'none',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '3px 6px'
            }}
          >
            {replaySpeed}x
          </button>

          <button
            type="button"
            onClick={handleResetReplay}
            style={{
              background: 'transparent',
              color: 'var(--color-cream-muted)',
              border: 'none',
              cursor: 'pointer',
              padding: '2px'
            }}
            title="Reset"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      )}

      {/* Bottom Telemetry HUD */}
      <div className="map-bottom-telemetry-bar">
        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">Status</span>
          <span className="map-telemetry-value" style={{ color: 'var(--color-gold)' }}>
            {isStreamActive ? 'Live SSE Stream' : isReplaying ? 'Simulation Replay' : 'In Transit'}
          </span>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">ETA</span>
          <span className="map-telemetry-value">{etaMinutes} min</span>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">Distance</span>
          <span className="map-telemetry-value">{remainingKm} km</span>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">Courier Speed</span>
          <span className="map-telemetry-value" style={{ color: '#10B981' }}>
            {currentSpeed} km/h
          </span>
        </div>
      </div>
    </div>
  );
}
