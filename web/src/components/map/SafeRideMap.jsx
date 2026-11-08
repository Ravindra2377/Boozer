import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Crosshair, Maximize2, Minimize2, Plus, Minus, MapPin, Compass
} from 'lucide-react';
import { getMapDataForCity } from '../../data/mapCoordinates';
import { addDarkTileLayer } from './mapTiles';
import {
  getLiveDeviceCoordinates,
  reverseGeocode,
  fetchRealRoadRoute
} from '../../api/liveLocationService';

/**
 * Interactive Safe Ride Home Map built with Leaflet and CartoDB/Esri Dark Canvas.
 * Supports:
 * 1. Real Road Routing via OSRM turn-by-turn geometry
 * 2. Real Device GPS Location detection for instant safe ride pickup
 * 3. Live nearby partner fleets (Uber / Ola / Rapido)
 */
export function SafeRideMap({
  city = "Hyderabad",
  selectedPartner,
  onSelectPartner,
  onPickupChange,
  isBooked = false,
  height = "260px",
  isFrameMode = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const cabMarkersMapRef = useRef(new Map());
  const approachLineRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const glowLineRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [approachProgress, setApproachProgress] = useState(0); // 0 to 1
  const [driverEta, setDriverEta] = useState(selectedPartner?.etaMinutes || 4);
  const [isLocating, setIsLocating] = useState(false);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState(false);
  const [roadTripKm, setRoadTripKm] = useState(3.6);

  const mapData = getMapDataForCity(city);
  const { safeRide } = mapData;
  const { pickup, dropoff, routeWaypoints, nearbyCabs } = safeRide;

  const [activePickup, setActivePickup] = useState(pickup);
  const [activeRouteWaypoints, setActiveRouteWaypoints] = useState(routeWaypoints);

  // 1. Calculate Real Road Driving Geometry via OSRM on Mount
  useEffect(() => {
    let isCancelled = false;

    fetchRealRoadRoute(activePickup.coords, dropoff.coords).then((route) => {
      if (!isCancelled && route && route.waypoints && route.waypoints.length > 1) {
        setActiveRouteWaypoints(route.waypoints);
        setRoadTripKm(route.distanceKm);

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
  }, [activePickup.coords, dropoff.coords]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const bounds = L.latLngBounds(activeRouteWaypoints);
    const center = bounds.getCenter();

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 14,
      zoomControl: false,
      attributionControl: true
    });
    mapInstanceRef.current = map;

    // Attach dark mode tile layer (CARTO / Stadia / Mapbox / Esri Dark Canvas zero-key fallback)
    addDarkTileLayer(map);

    // Safe Ride Route Polyline Glow Underlay
    const glowLine = L.polyline(activeRouteWaypoints, {
      color: 'rgba(42, 157, 143, 0.25)',
      weight: 10,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    glowLineRef.current = glowLine;

    // Active Glowing Route
    const routeLine = L.polyline(activeRouteWaypoints, {
      color: '#2DD4BF',
      weight: 4,
      className: 'leaflet-glowing-route-teal',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    routeLineRef.current = routeLine;

    // Pickup Marker (Golden Amber)
    const pickupIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div class="boozer-marker" style="
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #E7A13D 0%, #B87314 100%);
          border: 2px solid #fff; display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; box-shadow: 0 0 20px rgba(231, 161, 61, 0.8);
        ">
          <span>🚕</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    const pickupMarker = L.marker(activePickup.coords, { icon: pickupIcon }).addTo(map);
    pickupMarker.bindPopup(`
      <div style="font-family: var(--font-body)">
        <strong style="color: var(--color-gold); font-size: 0.88rem;">Pickup Location</strong>
        <p style="font-size: 0.74rem; color: var(--color-cream); margin-top: 2px;">${activePickup.label}</p>
        <p style="font-size: 0.72rem; color: var(--color-cream-muted); margin-top: 2px;">${activePickup.address}</p>
      </div>
    `);
    pickupMarkerRef.current = pickupMarker;

    // Drop-off Marker (Emerald / Teal)
    const dropoffIcon = L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div class="boozer-marker marker-customer" style="width: 34px; height: 34px;">
          <span>🏠</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    const dropoffMarker = L.marker(dropoff.coords, { icon: dropoffIcon }).addTo(map);
    dropoffMarker.bindPopup(`
      <div style="font-family: var(--font-body)">
        <strong style="color: var(--color-teal); font-size: 0.88rem;">Safe Drop-off Destination</strong>
        <p style="font-size: 0.74rem; color: var(--color-cream); margin-top: 2px;">${dropoff.label}</p>
        <p style="font-size: 0.72rem; color: var(--color-cream-muted); margin-top: 2px;">${dropoff.address}</p>
      </div>
    `);

    // Nearby Partner Cabs
    const markersMap = new Map();
    nearbyCabs.forEach((cab) => {
      const isSelected = selectedPartner?.partner === cab.partner || selectedPartner?.id === cab.id;
      const cabIcon = createCabIcon(cab, isSelected);

      const marker = L.marker(cab.coords, { icon: cabIcon }).addTo(map);
      marker.on('click', () => {
        if (onSelectPartner) onSelectPartner(cab);
      });
      marker.bindTooltip(`<strong>${cab.name}</strong> · ${cab.etaMinutes} min away`, {
        className: 'leaflet-popup-content-wrapper',
        direction: 'top'
      });
      markersMap.set(cab.id, marker);
    });
    cabMarkersMapRef.current = markersMap;

    // Initial fit
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });

    const t1 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }, 120);

    const t2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }, 450);

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
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city, activePickup, dropoff, nearbyCabs]);

  // 3. Immediate re-invalidation when frame mode expands/contracts
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const t = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        const bounds = L.latLngBounds(activeRouteWaypoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }, 180);
    return () => clearTimeout(t);
  }, [isFrameMode, activeRouteWaypoints]);

  // 4. Live Device GPS Pickup Point Handler
  const handleDetectLivePickup = async () => {
    try {
      setIsLocating(true);
      const liveCoords = await getLiveDeviceCoordinates();
      const geocode = await reverseGeocode(liveCoords.lat, liveCoords.lng);

      const livePickup = {
        label: "Your Real Location (Pickup)",
        address: geocode.shortAddress || geocode.displayName,
        coords: [liveCoords.lat, liveCoords.lng]
      };

      setActivePickup(livePickup);
      setIsLiveGpsActive(true);
      if (onPickupChange) {
        onPickupChange(livePickup);
      }

      if (pickupMarkerRef.current && mapInstanceRef.current) {
        pickupMarkerRef.current.setLatLng(livePickup.coords);
        pickupMarkerRef.current.bindPopup(`
          <div style="font-family: var(--font-body)">
            <strong style="color: #10B981; font-size: 0.88rem;">📍 Live Device GPS Pickup</strong>
            <p style="font-size: 0.74rem; color: var(--color-cream); margin-top: 2px;">${livePickup.label}</p>
            <p style="font-size: 0.72rem; color: var(--color-cream-muted); margin-top: 2px;">${livePickup.address}</p>
          </div>
        `).openPopup();
      }

      // Fetch real road route from live pickup to home
      const roadRoute = await fetchRealRoadRoute(livePickup.coords, dropoff.coords);
      if (roadRoute && roadRoute.waypoints) {
        setActiveRouteWaypoints(roadRoute.waypoints);
        setRoadTripKm(roadRoute.distanceKm);

        if (mapInstanceRef.current) {
          if (glowLineRef.current) glowLineRef.current.setLatLngs(roadRoute.waypoints);
          if (routeLineRef.current) routeLineRef.current.setLatLngs(roadRoute.waypoints);
          const bounds = L.latLngBounds(roadRoute.waypoints);
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }
      }
    } catch (err) {
      alert(err.message || 'Could not fetch device location.');
    } finally {
      setIsLocating(false);
    }
  };

  // Helper to construct custom HTML Cab Icon
  const createCabIcon = (cab, isSelected) => {
    const brandColor = cab.partner === 'UBER' ? '#FFFFFF' : cab.partner === 'OLA' ? '#10B981' : '#F59E0B';
    const tagBg = cab.partner === 'UBER' ? '#1E1B2E' : cab.partner === 'OLA' ? '#062B1F' : '#301F08';

    return L.divIcon({
      className: 'boozer-marker-wrapper',
      html: `
        <div class="marker-cab-badge ${isSelected ? 'active' : ''}" style="background: ${tagBg}; border-color: ${isSelected ? 'var(--color-teal)' : brandColor};">
          <span style="font-size: 0.8rem;">🚗</span>
          <div style="display: flex; flex-direction: column; line-height: 1.1;">
            <strong style="font-size: 0.68rem; color: #fff;">${cab.name}</strong>
            <span style="font-size: 0.62rem; color: ${brandColor}; font-weight: 700;">${cab.etaMinutes} min away</span>
          </div>
        </div>
      `,
      iconSize: [110, 36],
      iconAnchor: [55, 18]
    });
  };

  // Update selected cab icon when selection changes
  useEffect(() => {
    if (!cabMarkersMapRef.current) return;
    nearbyCabs.forEach((cab) => {
      const marker = cabMarkersMapRef.current.get(cab.id);
      if (marker) {
        const isSelected = selectedPartner?.partner === cab.partner || selectedPartner?.id === cab.id;
        marker.setIcon(createCabIcon(cab, isSelected));
      }
    });
  }, [selectedPartner, nearbyCabs]);

  // Simulate approach when ride is booked
  useEffect(() => {
    if (!isBooked || !mapInstanceRef.current) return;

    const activeCab = nearbyCabs.find(
      (c) => c.partner === selectedPartner?.partner || c.id === selectedPartner?.id
    ) || nearbyCabs[0];

    const path = activeCab.approachPath;
    const marker = cabMarkersMapRef.current.get(activeCab.id);

    // Draw approach path
    if (approachLineRef.current) {
      mapInstanceRef.current.removeLayer(approachLineRef.current);
    }
    const approachLine = L.polyline(path, {
      color: 'var(--color-teal)',
      weight: 3,
      dashArray: '5, 5'
    }).addTo(mapInstanceRef.current);
    approachLineRef.current = approachLine;

    // Animate cab along approach path
    const interval = setInterval(() => {
      setApproachProgress((prev) => {
        const next = prev >= 0.95 ? 0.95 : prev + 0.1;
        const lat = path[0][0] + (path[path.length - 1][0] - path[0][0]) * next;
        const lng = path[0][1] + (path[path.length - 1][1] - path[0][1]) * next;

        if (marker) {
          marker.setLatLng([lat, lng]);
        }

        const remainingMinutes = Math.max(1, Math.round((1 - next) * activeCab.etaMinutes));
        setDriverEta(remainingMinutes);

        return next;
      });
    }, 1500);

    return () => {
      clearInterval(interval);
      if (approachLineRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(approachLineRef.current);
      }
    };
  }, [isBooked, selectedPartner, nearbyCabs]);

  // Recenter Route
  const handleFitRoute = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds(activeRouteWaypoints);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
  };

  // Focus Pickup
  const handleFocusPickup = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(activePickup.coords, 16, { animate: true });
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 300);
  };

  return (
    <div
      className="boozer-map-wrapper"
      style={{
        height: isFullscreen ? '100vh' : height,
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? '0' : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto'
      }}
    >
      <div ref={mapContainerRef} className="boozer-map-element" />

      {/* Top Floating Controls */}
      <div className="map-floating-overlay-top">
        <div className="map-telemetry-badge">
          <span className="blinking-dot" style={{ background: '#2DD4BF', boxShadow: '0 0 8px #2DD4BF' }} />
          <span>{isLiveGpsActive ? '● LIVE DEVICE PICKUP GPS' : 'SAFE RIDE DISPATCH RADAR'}</span>
        </div>

        <div className="map-control-btn-group">
          {/* My Live Location */}
          <button
            type="button"
            className={`map-glass-btn ${isLiveGpsActive ? 'active' : ''}`}
            onClick={handleDetectLivePickup}
            disabled={isLocating}
            title="Use My Device Live GPS for Safe Ride Pickup"
          >
            <Compass size={13} className={isLocating ? 'spin-icon' : ''} />
            <span style={{ fontSize: '0.68rem' }}>
              {isLocating ? 'Locating...' : isLiveGpsActive ? 'Live Pickup' : 'My GPS'}
            </span>
          </button>

          <button
            type="button"
            className="map-glass-btn"
            onClick={handleFocusPickup}
            title="Focus Pickup Location"
          >
            <MapPin size={13} />
            <span style={{ fontSize: '0.68rem' }}>Pickup</span>
          </button>

          <button
            type="button"
            className="map-glass-btn map-glass-btn-icon"
            onClick={handleFitRoute}
            title="Fit Entire Trip Route"
          >
            <Crosshair size={14} />
          </button>

          <button
            type="button"
            className="map-glass-btn map-glass-btn-icon"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <Plus size={14} />
          </button>

          <button
            type="button"
            className="map-glass-btn map-glass-btn-icon"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <Minus size={14} />
          </button>

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
          <span className="map-telemetry-label">Selected Fleet</span>
          <span className="map-telemetry-value" style={{ color: 'var(--color-teal)' }}>
            {selectedPartner?.name || 'Uber Premier'}
          </span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">{isBooked ? 'Driver En Route' : 'Pickup ETA'}</span>
          <span className="map-telemetry-value">
            {isBooked ? `${driverEta} min away` : `${selectedPartner?.etaMinutes || 4} min away`}
          </span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">Road Distance</span>
          <span className="map-telemetry-value">
            {roadTripKm} km
          </span>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

        <div className="map-telemetry-metric">
          <span className="map-telemetry-label">Net Payable</span>
          <span className="map-telemetry-value" style={{ color: 'var(--color-teal)' }}>
            ₹{selectedPartner?.netPayable}
          </span>
        </div>
      </div>
    </div>
  );
}
