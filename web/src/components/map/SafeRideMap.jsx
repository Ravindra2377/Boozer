import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Crosshair, Maximize2, Minimize2, Plus, Minus, MapPin
} from 'lucide-react';
import { getMapDataForCity } from '../../data/mapCoordinates';
import { addDarkTileLayer } from './mapTiles';

/**
 * Interactive Safe Ride Home Map built with Leaflet and CartoDB Dark Matter.
 * Displays pickup, dropoff, route, and live nearby partner fleets (Uber / Ola / Rapido).
 */
export function SafeRideMap({
  city = "Hyderabad",
  selectedPartner,
  onSelectPartner,
  isBooked = false,
  height = "260px",
  isFrameMode = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const cabMarkersMapRef = useRef(new Map());
  const approachLineRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [approachProgress, setApproachProgress] = useState(0); // 0 to 1
  const [driverEta, setDriverEta] = useState(selectedPartner?.etaMinutes || 4);

  const mapData = getMapDataForCity(city);
  const { safeRide } = mapData;
  const { pickup, dropoff, routeWaypoints, nearbyCabs } = safeRide;

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
      attributionControl: true
    });
    mapInstanceRef.current = map;

    // Attach dark mode tile layer (CARTO / Stadia / Mapbox / Esri Dark Canvas zero-key fallback)
    addDarkTileLayer(map);

    // Safe Ride Route Polyline Glow Underlay
    L.polyline(routeWaypoints, {
      color: 'rgba(42, 157, 143, 0.25)',
      weight: 10,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Active Glowing Route
    L.polyline(routeWaypoints, {
      color: '#2DD4BF',
      weight: 4,
      className: 'leaflet-glowing-route-teal',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 1. Pickup Marker (Golden Amber)
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
    const pickupMarker = L.marker(pickup.coords, { icon: pickupIcon }).addTo(map);
    pickupMarker.bindPopup(`
      <div style="font-family: var(--font-body)">
        <strong style="color: var(--color-gold); font-size: 0.88rem;">Pickup Location</strong>
        <p style="font-size: 0.74rem; color: var(--color-cream); margin-top: 2px;">${pickup.label}</p>
        <p style="font-size: 0.72rem; color: var(--color-cream-muted); margin-top: 2px;">${pickup.address}</p>
      </div>
    `);

    // 2. Drop-off Marker (Emerald / Teal)
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

    // 3. Nearby Partner Cabs
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
  }, [city, pickup, dropoff, routeWaypoints, nearbyCabs]);

  // Immediate re-invalidation when frame mode expands/contracts
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const t = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        const bounds = L.latLngBounds(routeWaypoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }, 180);
    return () => clearTimeout(t);
  }, [isFrameMode, routeWaypoints]);

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
    const bounds = L.latLngBounds(routeWaypoints);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
  };

  // Focus Pickup
  const handleFocusPickup = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(pickup.coords, 16, { animate: true });
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
          <span>SAFE RIDE DISPATCH RADAR</span>
        </div>

        <div className="map-control-btn-group">
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
          <span className="map-telemetry-label">Net Payable</span>
          <span className="map-telemetry-value" style={{ color: 'var(--color-teal)' }}>
            ₹{selectedPartner?.netPayable}
          </span>
        </div>
      </div>
    </div>
  );
}
