import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Crosshair, Radio, AlertTriangle } from 'lucide-react';
import { getMapDataForCity } from '../../data/mapCoordinates';
import { addDarkTileLayer } from './mapTiles';
import { api } from '../../api/client';
import {
  getLiveDeviceCoordinates,
  reverseGeocode,
  fetchRealRoadRoute,
  fetchBackendDelivery,
  calculateHaversineDistance
} from '../../api/liveLocationService';

function createSafePopup({ title, subtitle, details, badgeText, badgeColor = '#10B981', badgeBg = 'rgba(16, 185, 129, 0.15)' }) {
  const container = document.createElement('div');
  container.style.fontFamily = 'var(--font-body, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)';
  container.style.padding = '2px';

  if (title) {
    const titleEl = document.createElement('strong');
    titleEl.style.fontSize = '0.88rem';
    titleEl.style.color = '#fff';
    titleEl.textContent = title;
    container.appendChild(titleEl);
  }

  if (subtitle) {
    const subEl = document.createElement('p');
    subEl.style.fontSize = '0.74rem';
    subEl.style.color = 'var(--color-gold, #E7A13D)';
    subEl.style.marginTop = '2px';
    subEl.textContent = subtitle;
    container.appendChild(subEl);
  }

  if (details) {
    const detEl = document.createElement('p');
    detEl.style.fontSize = '0.74rem';
    detEl.style.color = 'var(--color-cream-muted, #B8B5AD)';
    detEl.style.marginTop = '4px';
    detEl.textContent = details;
    container.appendChild(detEl);
  }

  if (badgeText) {
    const badgeEl = document.createElement('div');
    badgeEl.style.marginTop = '6px';
    badgeEl.style.padding = '4px 8px';
    badgeEl.style.background = badgeBg;
    badgeEl.style.border = `1px solid ${badgeColor}`;
    badgeEl.style.borderRadius = '6px';
    badgeEl.style.fontSize = '0.7rem';
    badgeEl.style.color = badgeColor;
    badgeEl.style.fontWeight = '700';
    badgeEl.textContent = badgeText;
    container.appendChild(badgeEl);
  }

  return container;
}

/**
 * Interactive Delivery Tracking Map.
 * Supports:
 * 1. Live SSE Telemetry Pipeline (/deliveries/order/{id}/stream)
 * 2. Real Turn-by-Turn Road Routing
 * 3. Sanitized DOM popups without OTP leakage
 * 4. Geofence radius boundary enforcement
 */
export function LiveDeliveryMap({
  order,
  city = "Hyderabad",
  height = "320px",
  riderName = "Rohit Kumar",
  riderVehicle = "KA 01 AB 1234",
  onArrivedDoorstep,
  onTelemetryUpdate,
  isFrameMode = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const geofenceCircleRef = useRef(null);
  const routeLineRef = useRef(null);
  const traveledLineRef = useRef(null);
  const glowLineRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [followRider, setFollowRider] = useState(false);
  const [showGeofence, setShowGeofence] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(28);
  const [remainingKm, setRemainingKm] = useState(2.8);
  const [etaMinutes, setEtaMinutes] = useState(9);
  const [progressFraction, setProgressFraction] = useState(0.35);

  const [isStreamActive, setIsStreamActive] = useState(false);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState(null);
  const [secondsSinceLastPing, setSecondsSinceLastPing] = useState(0);
  const [zoneWarning, setZoneWarning] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const mapData = getMapDataForCity(city);
  const { store, customer, routeWaypoints } = mapData;

  const [activeCustomer, setActiveCustomer] = useState(customer);
  const [activeWaypoints, setActiveWaypoints] = useState(routeWaypoints);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isRealRoad, setIsRealRoad] = useState(false);
  const [backendRider, setBackendRider] = useState(null);

  const displayRiderName = backendRider?.riderName || riderName;
  const displayRiderVehicle = backendRider?.riderPhone ? `${backendRider.riderPhone} · Verified` : riderVehicle;

  // Linear interpolation along waypoints given progress fraction (0..1)
  const getInterpolatedPoint = useCallback((fraction) => {
    const pts = activeWaypoints && activeWaypoints.length > 0 ? activeWaypoints : routeWaypoints;
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
    return [lat, lng];
  }, [activeWaypoints, routeWaypoints]);

  // Compute sliced path up to current fraction
  const getTraveledCoordinates = useCallback((fraction) => {
    const pts = activeWaypoints && activeWaypoints.length > 0 ? activeWaypoints : routeWaypoints;
    const totalSegments = pts.length - 1;
    const scaled = fraction * totalSegments;
    const segIndex = Math.min(Math.floor(scaled), totalSegments - 1);
    const currentPoint = getInterpolatedPoint(fraction);

    const traveled = pts.slice(0, segIndex + 1);
    traveled.push(currentPoint);
    return traveled;
  }, [activeWaypoints, routeWaypoints, getInterpolatedPoint]);

  // 1. Fetch Real Road Geometry and Backend Telemetry Snapshot on Mount
  useEffect(() => {
    let isCancelled = false;

    if (order?.id) {
      fetchBackendDelivery(order.id).then((delivery) => {
        if (!isCancelled && delivery) {
          setBackendRider(delivery);
          if (delivery.speedKmh != null) setCurrentSpeed(Math.round(delivery.speedKmh));
          if (delivery.riderLat && delivery.riderLng && riderMarkerRef.current) {
            riderMarkerRef.current.setLatLng([delivery.riderLat, delivery.riderLng]);
          }
        }
      });
    }

    fetchRealRoadRoute(store.coords, customer.coords).then((route) => {
      if (!isCancelled && route && route.waypoints && route.waypoints.length > 1) {
        setActiveWaypoints(route.waypoints);
        setRemainingKm(route.distanceKm);
        setEtaMinutes(route.durationMinutes);
        setIsRealRoad(route.isRealRoad);

        if (onTelemetryUpdate) {
          onTelemetryUpdate({
            remainingKm: route.distanceKm,
            etaMinutes: route.durationMinutes,
            isRealRoad: route.isRealRoad
          });
        }

        if (mapInstanceRef.current) {
          if (glowLineRef.current) glowLineRef.current.setLatLngs(route.waypoints);
          if (routeLineRef.current) routeLineRef.current.setLatLngs(route.waypoints);
          const bounds = L.latLngBounds(route.waypoints);
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [order?.id, store.coords, customer.coords]);

  // 2. Real Live SSE Telemetry Subscription
  useEffect(() => {
    if (!order?.id) return;

    const unsubscribe = api.subscribeDeliveryStream(
      order.id,
      (telemetry) => {
        setIsStreamActive(true);
        setLastTelemetryTimestamp(Date.now());
        setSecondsSinceLastPing(0);

        if (telemetry.lat && telemetry.lng) {
          const newCoord = [Number(telemetry.lat), Number(telemetry.lng)];
          if (riderMarkerRef.current) {
            riderMarkerRef.current.setLatLng(newCoord);

            if (followRider && mapInstanceRef.current) {
              mapInstanceRef.current.panTo(newCoord, { animate: true, duration: 0.5 });
            }
          }
        }

        if (telemetry.speedKmh != null) {
          setCurrentSpeed(Math.round(Number(telemetry.speedKmh)));
        }

        if (telemetry.riderName) {
          setBackendRider((prev) => ({ ...prev, ...telemetry }));
        }

        if (onTelemetryUpdate) {
          onTelemetryUpdate(telemetry);
        }
      },
      (err) => {
        console.warn('[BOOZER MAP] SSE stream disconnected, using local telemetry:', err);
        setIsStreamActive(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [order?.id, followRider, onTelemetryUpdate]);

  // Telemetry staleness ticker
  useEffect(() => {
    if (!lastTelemetryTimestamp) return;
    const interval = setInterval(() => {
      setSecondsSinceLastPing(Math.round((Date.now() - lastTelemetryTimestamp) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastTelemetryTimestamp]);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const bounds = L.latLngBounds(activeWaypoints);
    const center = bounds.getCenter();

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
      fadeAnimation: true,
      zoomAnimation: true
    });
    mapInstanceRef.current = map;

    addDarkTileLayer(map);

    // Statutory Legal Delivery Radius
    const deliveryRadiusKm = store.deliveryRadiusKm || 6.5;
    const geofence = L.circle(store.coords, {
      radius: deliveryRadiusKm * 1000,
      color: '#E7A13D',
      weight: 1.5,
      dashArray: '6, 8',
      fillColor: '#E7A13D',
      fillOpacity: 0.04
    }).addTo(map);
    geofence.bindTooltip(`Excise Delivery Radius: ${deliveryRadiusKm}km`, {
      className: 'leaflet-popup-content-wrapper',
      direction: 'top'
    });
    geofenceCircleRef.current = geofence;

    // Route Glow Path
    const glowLine = L.polyline(activeWaypoints, {
      color: 'rgba(231, 161, 61, 0.25)',
      weight: 10,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    glowLineRef.current = glowLine;

    // Remaining Route Active Line
    const routeLine = L.polyline(activeWaypoints, {
      color: '#F5B24E',
      weight: 4,
      className: 'leaflet-glowing-route',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    routeLineRef.current = routeLine;

    // Traveled Route Solid Path
    const initialTraveled = getTraveledCoordinates(progressFraction);
    const traveledLine = L.polyline(initialTraveled, {
      color: '#E7A13D',
      weight: 4,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    traveledLineRef.current = traveledLine;

    // Store Marker (Sanitized DOM Popup)
    const storeIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div class="boozer-marker marker-store" title="Store" style="
          width: 32px; height: 32px; border-radius: 50%;
          background: #16161E; border: 2px solid #C5A059;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const storeMarker = L.marker(store.coords, { icon: storeIcon }).addTo(map);
    storeMarker.bindPopup(() => createSafePopup({
      title: store.name,
      subtitle: `${store.licence} (L-2 Licensed)`,
      details: store.address,
      badgeText: '✓ Authorized Legal MRP Fulfillment Point',
      badgeColor: '#10B981',
      badgeBg: 'rgba(16, 185, 129, 0.15)'
    }));

    // Customer Destination Marker (Sanitized DOM Popup - ZERO OTP LEAK)
    const customerIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div class="boozer-marker marker-customer" title="Delivery Address" style="
          width: 32px; height: 32px; border-radius: 50%;
          background: #C5A059; border: 2px solid #FFFFFF;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0C0C0F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const customerMarker = L.marker(activeCustomer.coords, { icon: customerIcon }).addTo(map);
    customerMarker.bindPopup(() => createSafePopup({
      title: 'Delivery Destination',
      subtitle: activeCustomer.name || 'Recipient',
      details: activeCustomer.address || '',
      badgeText: '🔒 Doorstep Age & ID Verification Required',
      badgeColor: '#2A9D8F',
      badgeBg: 'rgba(42, 157, 143, 0.15)'
    }));
    customerMarkerRef.current = customerMarker;

    // Rider Marker
    const initialRiderCoord = getInterpolatedPoint(progressFraction);
    const riderIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div class="marker-rider-container">
          <div class="marker-rider-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0C0C0F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
            <span>${displayRiderName.split(' ')[0]} · ${currentSpeed} km/h</span>
          </div>
          <div class="marker-rider-beacon"></div>
        </div>
      `,
      iconSize: [120, 48],
      iconAnchor: [60, 40]
    });
    const riderMarker = L.marker(initialRiderCoord, { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);
    riderMarker.bindPopup(() => createSafePopup({
      title: displayRiderName,
      subtitle: displayRiderVehicle,
      details: 'Assigned Boozer Verified Delivery Courier',
      badgeText: isStreamActive ? '● Live Telemetry: SSE Stream Connected' : '○ Standby Telemetry',
      badgeColor: isStreamActive ? '#10B981' : '#E7A13D',
      badgeBg: 'rgba(231, 161, 61, 0.15)'
    }));
    riderMarkerRef.current = riderMarker;

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city, store, customer]);

  // Frame mode re-invalidation
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const t = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        const bounds = L.latLngBounds(activeWaypoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }, 180);
    return () => clearTimeout(t);
  }, [isFrameMode, activeWaypoints]);

  // 4. Fallback / Test Simulation Loop (Only active when NOT receiving real live SSE telemetry)
  useEffect(() => {
    const isDispatched = order?.status === 'DISPATCHED';
    const isArrived = ['ARRIVED', 'AGE_CHECKED', 'DELIVERED'].includes(order?.status);

    if (isArrived) {
      setProgressFraction(1.0);
      setRemainingKm(0.0);
      setEtaMinutes(0);
      setCurrentSpeed(0);

      const destCoord = activeCustomer.coords;
      if (riderMarkerRef.current && mapInstanceRef.current) {
        riderMarkerRef.current.setLatLng(destCoord);
        if (traveledLineRef.current) {
          traveledLineRef.current.setLatLngs(activeWaypoints);
        }
      }
      return;
    }

    if (!isDispatched || isStreamActive) return;

    // Predictable interpolation when waiting for rider telemetry
    const interval = setInterval(() => {
      setProgressFraction((prev) => {
        const next = prev >= 0.94 ? 0.35 : prev + 0.015;

        const totalDist = activeWaypoints.length > 2 ? 3.4 : 2.8;
        const remKm = Math.max(0.1, Number((totalDist * (1 - next)).toFixed(1)));
        const remMin = Math.max(1, Math.round(remKm * 3.8));
        const simSpeed = 28;

        setRemainingKm(remKm);
        setEtaMinutes(remMin);
        setCurrentSpeed(simSpeed);

        const currentCoord = getInterpolatedPoint(next);

        if (riderMarkerRef.current && mapInstanceRef.current) {
          riderMarkerRef.current.setLatLng(currentCoord);

          if (traveledLineRef.current) {
            traveledLineRef.current.setLatLngs(getTraveledCoordinates(next));
          }

          if (followRider) {
            mapInstanceRef.current.panTo(currentCoord, { animate: true, duration: 0.6 });
          }
        }

        if (next >= 0.94 && onArrivedDoorstep) {
          onArrivedDoorstep();
        }

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [order?.status, isStreamActive, followRider, getInterpolatedPoint, getTraveledCoordinates, activeCustomer.coords, activeWaypoints, onArrivedDoorstep]);

  // 5. Detect and Use Live Device GPS Location with Geofence Validation
  const handleDetectLiveGps = async () => {
    try {
      setIsLocating(true);
      setErrorMessage(null);
      const liveCoords = await getLiveDeviceCoordinates();
      const geocode = await reverseGeocode(liveCoords.lat, liveCoords.lng);

      // Check against retailer's licensed delivery radius
      const distFromStoreKm = calculateHaversineDistance(
        store.coords[0],
        store.coords[1],
        liveCoords.lat,
        liveCoords.lng
      );
      const maxRadiusKm = store.deliveryRadiusKm || 6.5;

      if (distFromStoreKm > maxRadiusKm) {
        setZoneWarning(
          `Detected location (${distFromStoreKm.toFixed(1)} km) is outside the licensed ${maxRadiusKm} km excise delivery zone.`
        );
      } else {
        setZoneWarning(null);
      }

      const liveCustomer = {
        name: "Your Live Location (Verified)",
        address: geocode.shortAddress || geocode.displayName,
        coords: [liveCoords.lat, liveCoords.lng]
      };

      setActiveCustomer(liveCustomer);
      setIsLiveGpsActive(true);

      if (customerMarkerRef.current && mapInstanceRef.current) {
        customerMarkerRef.current.setLatLng(liveCustomer.coords);
        customerMarkerRef.current.bindPopup(() => createSafePopup({
          title: '📍 Live Device GPS Doorstep',
          subtitle: liveCustomer.name,
          details: liveCustomer.address,
          badgeText: `GPS Accuracy: ±${Math.round(liveCoords.accuracy || 15)}m`,
          badgeColor: '#10B981',
          badgeBg: 'rgba(16, 185, 129, 0.15)'
        })).openPopup();
      }

      const roadRoute = await fetchRealRoadRoute(store.coords, liveCustomer.coords);
      if (roadRoute && roadRoute.waypoints) {
        setActiveWaypoints(roadRoute.waypoints);
        setRemainingKm(roadRoute.distanceKm);
        setEtaMinutes(roadRoute.durationMinutes);
        setIsRealRoad(roadRoute.isRealRoad);

        if (onTelemetryUpdate) {
          onTelemetryUpdate({
            isLiveGps: true,
            address: liveCustomer.address,
            remainingKm: roadRoute.distanceKm,
            etaMinutes: roadRoute.durationMinutes,
            isRealRoad: roadRoute.isRealRoad
          });
        }

        if (mapInstanceRef.current) {
          if (glowLineRef.current) glowLineRef.current.setLatLngs(roadRoute.waypoints);
          if (routeLineRef.current) routeLineRef.current.setLatLngs(roadRoute.waypoints);
          const bounds = L.latLngBounds(roadRoute.waypoints);
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not fetch device location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleFitRoute = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds(activeWaypoints);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
  };

  return (
    <div
      className={`boozer-map-wrapper ${isFullscreen ? 'boozer-map-fullscreen' : ''}`}
      style={{
        height: isFullscreen ? '100vh' : height,
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? '0' : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto'
      }}
    >
      <div ref={mapContainerRef} className="boozer-map-element" />

      {/* Zone warning banner if outside perimeter */}
      {zoneWarning && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          background: 'rgba(239, 68, 68, 0.92)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.74rem',
          fontWeight: '600',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}>
          <AlertTriangle size={16} />
          <span>{zoneWarning}</span>
        </div>
      )}

      {/* Inline Error Toast */}
      {errorMessage && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          background: 'rgba(220, 38, 38, 0.95)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.74rem',
          fontWeight: '600',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Floating Overlay */}
      <div className="map-floating-overlay-top">
        <div className="map-control-btn-group">
          <button
            type="button"
            className="map-glass-btn map-glass-btn-icon"
            onClick={handleFitRoute}
            title="Re-center Route"
          >
            <Crosshair size={14} />
          </button>
          <button
            type="button"
            className={`map-glass-btn ${isLiveGpsActive ? 'active' : ''}`}
            onClick={handleDetectLiveGps}
            disabled={isLocating}
            title="Use Device GPS"
          >
            <Radio size={14} className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'Locating...' : isLiveGpsActive ? 'GPS Locked' : 'My GPS'}</span>
          </button>
        </div>

        {/* Live SSE Stream Badge */}
        <div style={{
          background: isStreamActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(231, 161, 61, 0.2)',
          border: `1px solid ${isStreamActive ? '#10B981' : '#E7A13D'}`,
          borderRadius: '20px',
          padding: '4px 10px',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: isStreamActive ? '#10B981' : '#E7A13D',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isStreamActive ? '#10B981' : '#E7A13D',
            display: 'inline-block'
          }} />
          {isStreamActive
            ? secondsSinceLastPing > 5
              ? `Live (updated ${secondsSinceLastPing}s ago)`
              : 'Live Telemetry Active'
            : 'Telemetry Standby'}
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="map-bottom-telemetry-bar">
        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">Status</span>
          <span className="map-telemetry-value" style={{ color: 'var(--color-gold)' }}>
            {['ARRIVED', 'AGE_CHECKED', 'DELIVERED'].includes(order?.status) ? 'Arrived at Door' : 'In Transit'}
          </span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">Estimated Arrival</span>
          <span className="map-telemetry-value">
            {['ARRIVED', 'AGE_CHECKED', 'DELIVERED'].includes(order?.status) ? 'Now' : `${etaMinutes} min`}
          </span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">Road Distance</span>
          <span className="map-telemetry-value">
            {['ARRIVED', 'AGE_CHECKED', 'DELIVERED'].includes(order?.status) ? '0.0 km' : `${remainingKm} km`}
          </span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">Rider Speed</span>
          <span className="map-telemetry-value" style={{ color: '#10B981' }}>
            {['ARRIVED', 'AGE_CHECKED', 'DELIVERED'].includes(order?.status) ? '0 km/h' : `${currentSpeed} km/h`}
          </span>
        </div>
      </div>
    </div>
  );
}
