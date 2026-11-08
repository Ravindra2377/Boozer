import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Maximize2, Minimize2, Plus, Minus,
  ShieldCheck, Crosshair, Navigation
} from 'lucide-react';
import { getMapDataForCity } from '../../data/mapCoordinates';

/**
 * High-performance interactive Delivery Tracking Map built with Leaflet
 * styled with CartoDB Dark Matter luxury midnight theme.
 */
export function LiveDeliveryMap({
  order,
  city = "Hyderabad",
  height = "320px",
  riderName = "Rohit Kumar",
  riderVehicle = "KA 01 AB 1234",
  onArrivedDoorstep
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const geofenceCircleRef = useRef(null);
  const routeLineRef = useRef(null);
  const traveledLineRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [followRider, setFollowRider] = useState(false);
  const [showGeofence, setShowGeofence] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(28);
  const [remainingKm, setRemainingKm] = useState(1.8);
  const [etaMinutes, setEtaMinutes] = useState(11);
  const [progressFraction, setProgressFraction] = useState(0.45); // 0.0 to 1.0

  const mapData = getMapDataForCity(city);
  const { store, customer, routeWaypoints } = mapData;

  // Linear interpolation along waypoints given progress fraction (0..1)
  const getInterpolatedPoint = useCallback((fraction) => {
    if (fraction <= 0) return routeWaypoints[0];
    if (fraction >= 1) return routeWaypoints[routeWaypoints.length - 1];

    const totalSegments = routeWaypoints.length - 1;
    const scaled = fraction * totalSegments;
    const segIndex = Math.min(Math.floor(scaled), totalSegments - 1);
    const segFraction = scaled - segIndex;

    const p1 = routeWaypoints[segIndex];
    const p2 = routeWaypoints[segIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * segFraction;
    const lng = p1[1] + (p2[1] - p1[1]) * segFraction;
    return [lat, lng];
  }, [routeWaypoints]);

  // Compute sliced path up to current fraction
  const getTraveledCoordinates = useCallback((fraction) => {
    const totalSegments = routeWaypoints.length - 1;
    const scaled = fraction * totalSegments;
    const segIndex = Math.min(Math.floor(scaled), totalSegments - 1);
    const currentPoint = getInterpolatedPoint(fraction);

    const traveled = routeWaypoints.slice(0, segIndex + 1);
    traveled.push(currentPoint);
    return traveled;
  }, [routeWaypoints, getInterpolatedPoint]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const bounds = L.latLngBounds(routeWaypoints);
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

    // CartoDB Dark Matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // 1. Statutory 6.5 km Excise Geofence Circle
    const geofence = L.circle(store.coords, {
      radius: store.deliveryRadiusKm * 1000,
      color: '#E7A13D',
      weight: 1.5,
      dashArray: '6, 8',
      fillColor: '#E7A13D',
      fillOpacity: 0.04
    }).addTo(map);
    geofence.bindTooltip(`Statutory ${store.deliveryRadiusKm}km Legal Excise Delivery Radius`, {
      className: 'leaflet-popup-content-wrapper',
      direction: 'top'
    });
    geofenceCircleRef.current = geofence;

    // 2. Full Route Underlying Glow Path
    L.polyline(routeWaypoints, {
      color: 'rgba(231, 161, 61, 0.25)',
      weight: 10,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 3. Remaining Route Active Line
    const routeLine = L.polyline(routeWaypoints, {
      color: '#F5B24E',
      weight: 4,
      className: 'leaflet-glowing-route',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    routeLineRef.current = routeLine;

    // 4. Traveled Route Solid Path
    const initialTraveled = getTraveledCoordinates(progressFraction);
    const traveledLine = L.polyline(initialTraveled, {
      color: '#E7A13D',
      weight: 4,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    traveledLineRef.current = traveledLine;

    // 5. Store Marker
    const storeIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div class="boozer-marker marker-store" title="${store.name}">
          <span>🏪</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });
    const storeMarker = L.marker(store.coords, { icon: storeIcon }).addTo(map);
    storeMarker.bindPopup(`
      <div style="font-family: var(--font-body)">
        <strong style="color: var(--color-gold); font-size: 0.9rem;">${store.name}</strong>
        <p style="font-size: 0.72rem; color: #E7A13D; margin-top: 2px;">${store.licence} (L-2 Licensed)</p>
        <p style="font-size: 0.75rem; color: var(--color-cream-muted); margin-top: 4px;">${store.address}</p>
        <div style="margin-top: 6px; font-size: 0.7rem; color: #10B981; font-weight: 700;">
          ✓ Authorized Legal MRP Fulfillment Point
        </div>
      </div>
    `);

    // 6. Customer Destination Marker
    const customerIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div class="boozer-marker marker-customer" title="Delivery Address">
          <span>📍</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    const customerMarker = L.marker(customer.coords, { icon: customerIcon }).addTo(map);
    customerMarker.bindPopup(`
      <div style="font-family: var(--font-body)">
        <strong style="color: var(--color-teal); font-size: 0.9rem;">Delivery Destination</strong>
        <p style="font-size: 0.76rem; color: var(--color-cream); margin-top: 2px;">${customer.name}</p>
        <p style="font-size: 0.74rem; color: var(--color-cream-muted); margin-top: 2px;">${customer.address}</p>
        <div style="margin-top: 6px; padding: 4px 8px; background: rgba(42, 157, 143, 0.15); border: 1px solid var(--color-teal); border-radius: 6px; font-size: 0.7rem; color: var(--color-teal); font-weight: 700;">
          🔒 Doorstep Age Verification Required (OTP: ${customer.doorstepOtp})
        </div>
      </div>
    `);

    // 7. Rider Marker
    const initialRiderCoord = getInterpolatedPoint(progressFraction);
    const riderIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div class="marker-rider-container">
          <div class="marker-rider-badge">
            <span>🛵</span>
            <span>${riderName.split(' ')[0]} · ${currentSpeed} km/h</span>
          </div>
          <div class="marker-rider-beacon"></div>
        </div>
      `,
      iconSize: [120, 48],
      iconAnchor: [60, 40]
    });
    const riderMarker = L.marker(initialRiderCoord, { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);
    riderMarker.bindPopup(`
      <div style="font-family: var(--font-body)">
        <strong style="color: #fff; font-size: 0.9rem;">${riderName}</strong>
        <span style="color: var(--color-gold); font-size: 0.75rem; font-weight: 800; margin-left: 6px;">★ 4.9</span>
        <p style="font-size: 0.74rem; color: var(--color-cream-muted); margin-top: 2px;">${riderVehicle} · Verified Partner</p>
        <div style="margin-top: 6px; font-size: 0.72rem; color: var(--color-gold);">
          ● Live Telemetry: 10Hz Stream Active
        </div>
      </div>
    `);
    riderMarkerRef.current = riderMarker;

    // Initial fit
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

    // Handle initial render sizing
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city, store, customer, routeWaypoints]);

  // Synchronize Rider Position when order status changes or time ticks
  useEffect(() => {
    const isDispatched = order?.status === 'DISPATCHED';
    const isArrived = ['ARRIVED', 'AGE_CHECKED', 'DELIVERED'].includes(order?.status);

    if (isArrived) {
      setProgressFraction(1.0);
      setRemainingKm(0.0);
      setEtaMinutes(0);
      setCurrentSpeed(0);

      const destCoord = customer.coords;
      if (riderMarkerRef.current && mapInstanceRef.current) {
        riderMarkerRef.current.setLatLng(destCoord);
        if (traveledLineRef.current) {
          traveledLineRef.current.setLatLngs(routeWaypoints);
        }
      }
      return;
    }

    if (!isDispatched) return;

    // Simulate real-time progress while dispatched
    const interval = setInterval(() => {
      setProgressFraction((prev) => {
        const next = prev >= 0.94 ? 0.45 : prev + 0.02;

        // Calculate dynamic ETA & speed
        const remKm = Math.max(0.1, Number((2.8 * (1 - next)).toFixed(1)));
        const remMin = Math.max(1, Math.round(remKm * 4.2));
        const simSpeed = Math.floor(26 + Math.random() * 8);

        setRemainingKm(remKm);
        setEtaMinutes(remMin);
        setCurrentSpeed(simSpeed);

        const currentCoord = getInterpolatedPoint(next);

        if (riderMarkerRef.current && mapInstanceRef.current) {
          riderMarkerRef.current.setLatLng(currentCoord);

          // Update rider icon HTML with new speed
          const updatedIcon = L.divIcon({
            className: 'boozer-marker-wrapper',
            html: `
              <div class="marker-rider-container">
                <div class="marker-rider-badge">
                  <span>🛵</span>
                  <span>${riderName.split(' ')[0]} · ${simSpeed} km/h</span>
                </div>
                <div class="marker-rider-beacon"></div>
              </div>
            `,
            iconSize: [120, 48],
            iconAnchor: [60, 40]
          });
          riderMarkerRef.current.setIcon(updatedIcon);

          // Update traveled polyline
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
    }, 1800);

    return () => clearInterval(interval);
  }, [order?.status, followRider, getInterpolatedPoint, getTraveledCoordinates, customer.coords, riderName, riderVehicle, routeWaypoints, onArrivedDoorstep]);

  // Toggle Geofence Circle Visibility
  useEffect(() => {
    if (!geofenceCircleRef.current || !mapInstanceRef.current) return;
    if (showGeofence) {
      if (!mapInstanceRef.current.hasLayer(geofenceCircleRef.current)) {
        geofenceCircleRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(geofenceCircleRef.current)) {
        mapInstanceRef.current.removeLayer(geofenceCircleRef.current);
      }
    }
  }, [showGeofence]);

  // Recenter Route
  const handleFitRoute = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds(routeWaypoints);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
  };

  // Center Rider
  const handleFocusRider = () => {
    if (!mapInstanceRef.current || !riderMarkerRef.current) return;
    mapInstanceRef.current.setView(riderMarkerRef.current.getLatLng(), 16, { animate: true });
    setFollowRider(true);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Toggle Fullscreen / Expanded View
  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 300);
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
      {/* Leaflet DOM Anchor */}
      <div ref={mapContainerRef} className="boozer-map-element" />

      {/* Top Floating Glass Overlay */}
      <div className="map-floating-overlay-top">
        {/* Telemetry Indicator */}
        <div className="map-telemetry-badge">
          <span className="blinking-dot" />
          <span>LIVE GPS · 10Hz TELEMETRY</span>
        </div>

        {/* Map Control Button Group */}
        <div className="map-control-btn-group">
          {/* Toggle 6.5km Excise Geofence */}
          <button
            type="button"
            className={`map-glass-btn ${showGeofence ? 'active' : ''}`}
            onClick={() => setShowGeofence(!showGeofence)}
            title="Toggle 6.5 km Excise Boundary"
          >
            <ShieldCheck size={14} />
            <span style={{ fontSize: '0.68rem' }}>6.5km Zone</span>
          </button>

          {/* Follow Rider */}
          <button
            type="button"
            className={`map-glass-btn ${followRider ? 'active' : ''}`}
            onClick={() => setFollowRider(!followRider)}
            title="Auto-Center Rider"
          >
            <Navigation size={13} />
            <span style={{ fontSize: '0.68rem' }}>Follow</span>
          </button>

          {/* Fit Route */}
          <button
            type="button"
            className="map-glass-btn map-glass-btn-icon"
            onClick={handleFitRoute}
            title="Fit Entire Route"
          >
            <Crosshair size={14} />
          </button>

          {/* Zoom In */}
          <button
            type="button"
            className="map-glass-btn map-glass-btn-icon"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <Plus size={14} />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            className="map-glass-btn map-glass-btn-icon"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <Minus size={14} />
          </button>

          {/* Expand / Minimize */}
          <button
            type="button"
            className="map-glass-btn map-glass-btn-icon"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Expand Map"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
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
          <span className="map-telemetry-label">Distance Left</span>
          <span className="map-telemetry-value">
            {['ARRIVED', 'AGE_CHECKED', 'DELIVERED'].includes(order?.status) ? '0.0 km' : `${remainingKm} km`}
          </span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">Current Speed</span>
          <span className="map-telemetry-value" style={{ color: '#10B981' }}>
            {['ARRIVED', 'AGE_CHECKED', 'DELIVERED'].includes(order?.status) ? '0 km/h' : `${currentSpeed} km/h`}
          </span>
        </div>
      </div>
    </div>
  );
}
