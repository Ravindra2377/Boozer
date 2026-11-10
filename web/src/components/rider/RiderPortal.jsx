import React, { useState, useEffect, useRef } from 'react';
import {
  Bike, Navigation, MapPin, ShieldCheck, CheckCircle2, AlertTriangle,
  Play, Pause, RotateCcw, Radio, Phone, User, KeyRound, Clock
} from 'lucide-react';
import { api } from '../../api/client';
import { DeliveryMap } from '../map/DeliveryMap';
import { getMapDataForCity } from '../../data/mapCoordinates';
import {
  getLiveDeviceCoordinates,
  fetchRealRoadRoute,
  calculateHaversineDistance
} from '../../api/liveLocationService';

/**
 * Rider / Courier Companion Portal for Real Pilot Testing.
 * Allows delivery partners to:
 * 1. Stream live phone GPS coordinates to the backend (/deliveries/order/{id}/location)
 * 2. Run simulated turn-by-turn courier delivery for indoor/QA testing
 * 3. Verify customer doorstep OTP to legally complete delivery
 */
export function RiderPortal({ city = "Hyderabad" }) {
  const mapData = getMapDataForCity(city);
  const { store, customer, routeWaypoints } = mapData;

  const [activeOrderId, setActiveOrderId] = useState("BZ-20261105-4819");
  const [orderStatus, setOrderStatus] = useState("DISPATCHED"); // 'DISPATCHED', 'ARRIVED', 'DELIVERED'
  const [courierName] = useState("Rohit Kumar");
  const [courierVehicle] = useState("KA 01 AB 1234 (Hero Electric)");

  // Live GPS Transmission State
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(false);
  const [pingsSentCount, setPingsSentCount] = useState(0);
  const [lastPingTimestamp, setLastPingTimestamp] = useState(null);
  const [transmissionError, setTransmissionError] = useState(null);

  // Simulation mode
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(false);
  const [simIndex, setSimIndex] = useState(0);

  // Current courier coordinates
  const [currentCoords, setCurrentCoords] = useState(routeWaypoints[0]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentHeading, setCurrentHeading] = useState(135);

  // OTP Verification
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isDelivered, setIsDelivered] = useState(false);

  // 1. Live Device GPS Watcher (Streams phone GPS to backend)
  useEffect(() => {
    let watchId = null;

    if (isBroadcastingGps && typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speedKmh = pos.coords.speed != null ? Math.round(pos.coords.speed * 3.6) : 28;
          const heading = pos.coords.heading != null ? Math.round(pos.coords.heading) : 120;

          setCurrentCoords([lat, lng]);
          setCurrentSpeed(speedKmh);
          setCurrentHeading(heading);

          try {
            await api.updateRiderLocation(activeOrderId, {
              lat,
              lng,
              speedKmh,
              headingDegrees: heading,
              accuracy: pos.coords.accuracy
            });
            setPingsSentCount(c => c + 1);
            setLastPingTimestamp(new Date().toLocaleTimeString());
            setTransmissionError(null);
          } catch (err) {
            setTransmissionError('Failed to transmit location to backend API');
          }
        },
        (err) => {
          setTransmissionError(err.message || 'GPS permission denied or unavailable');
          setIsBroadcastingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 2000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isBroadcastingGps, activeOrderId]);

  // 2. Simulated Courier Drive Loop (Sends real API pings along route)
  useEffect(() => {
    if (!isSimulatingDrive) return;

    const interval = setInterval(async () => {
      setSimIndex((prev) => {
        const next = prev + 1;
        if (next >= routeWaypoints.length) {
          setIsSimulatingDrive(false);
          setOrderStatus("ARRIVED");
          return routeWaypoints.length - 1;
        }

        const currentPt = routeWaypoints[prev];
        const nextPt = routeWaypoints[next];

        const dLng = nextPt[1] - currentPt[1];
        const dLat = nextPt[0] - currentPt[0];
        const heading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

        setCurrentCoords(nextPt);
        setCurrentSpeed(32);
        setCurrentHeading(Math.round(heading));

        // Transmit real location update to backend API
        api.updateRiderLocation(activeOrderId, {
          lat: nextPt[0],
          lng: nextPt[1],
          speedKmh: 32,
          headingDegrees: Math.round(heading),
          accuracy: 5.0
        }).then(() => {
          setPingsSentCount(c => c + 1);
          setLastPingTimestamp(new Date().toLocaleTimeString());
          setTransmissionError(null);
        }).catch(() => {
          setTransmissionError('Backend telemetry offline, continuing simulation');
        });

        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulatingDrive, activeOrderId, routeWaypoints]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!inputOtp || inputOtp.length < 4) {
      setOtpError('Please enter the 4-digit doorstep verification OTP.');
      return;
    }

    const verified = await api.verifyDoorstepAge(activeOrderId, inputOtp);
    if (verified) {
      setIsDelivered(true);
      setOrderStatus("DELIVERED");
      setIsBroadcastingGps(false);
      setIsSimulatingDrive(false);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP code. Ask the customer to check their Boozer order screen or SMS.');
    }
  };

  const handleResetPilot = () => {
    setIsBroadcastingGps(false);
    setIsSimulatingDrive(false);
    setSimIndex(0);
    setCurrentCoords(routeWaypoints[0]);
    setOrderStatus("DISPATCHED");
    setIsDelivered(false);
    setPingsSentCount(0);
    setInputOtp('');
    setOtpError('');
  };

  return (
    <div className="main-content-viewport" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '20px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.95) 0%, rgba(14, 14, 20, 0.95) 100%)',
        border: '1px solid var(--border-gold)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(231, 161, 61, 0.15)',
            border: '1.5px solid var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-gold)'
          }}>
            <Bike size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} />
                <span>Courier Terminal Active</span>
              </span>
              <span className="badge-amber">Pilot Telemetry Node</span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {courierName} · {courierVehicle}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>
              Assigned Order: <strong>{activeOrderId}</strong> · State: <strong style={{ color: 'var(--color-gold)' }}>{orderStatus}</strong>
            </p>
          </div>
        </div>

        {/* Transmission telemetry status */}
        <div style={{
          background: 'rgba(12, 12, 15, 0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-cream-muted)', textTransform: 'uppercase', display: 'block' }}>
              Telemetry Pings
            </span>
            <strong style={{ fontSize: '1rem', color: '#10B981' }}>{pingsSentCount} sent</strong>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-cream-muted)', textTransform: 'uppercase', display: 'block' }}>
              Last Broadcast
            </span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-cream)' }}>
              {lastPingTimestamp || 'Standby'}
            </strong>
          </div>
        </div>
      </div>

      {transmissionError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #EF4444',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '16px',
          color: '#F87171',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} />
          <span>{transmissionError}</span>
        </div>
      )}

      {/* Main Grid: Map & Courier Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '20px' }}>
        {/* Left: Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <DeliveryMap
            mode="DELIVERY"
            order={{ id: activeOrderId, status: orderStatus }}
            origin={store}
            destination={customer}
            waypoints={routeWaypoints}
            riderName={courierName}
            height="380px"
            enableReplayControls={false}
          />

          {/* Courier Transmission Controls */}
          <div style={{
            background: 'var(--color-card-bg)',
            border: '1px solid var(--border-gold)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
                Pilot GPS Transmission
              </h4>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
                Transmit real GPS or simulate turn-by-turn road drive pings to customer live stream.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsBroadcastingGps(prev => !prev);
                  if (!isBroadcastingGps) setIsSimulatingDrive(false);
                }}
                disabled={isDelivered}
                style={{
                  background: isBroadcastingGps ? '#10B981' : 'rgba(255,255,255,0.06)',
                  color: isBroadcastingGps ? '#0C0C0F' : '#fff',
                  border: `1px solid ${isBroadcastingGps ? '#10B981' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Radio size={14} className={isBroadcastingGps ? 'animate-spin' : ''} />
                <span>{isBroadcastingGps ? 'Transmitting Phone GPS...' : 'Broadcast Device GPS'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSimulatingDrive(prev => !prev);
                  if (!isSimulatingDrive) setIsBroadcastingGps(false);
                }}
                disabled={isDelivered}
                style={{
                  background: isSimulatingDrive ? '#E7A13D' : 'rgba(231, 161, 61, 0.1)',
                  color: isSimulatingDrive ? '#0C0C0F' : 'var(--color-gold)',
                  border: '1px solid var(--color-gold)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isSimulatingDrive ? <Pause size={14} /> : <Play size={14} />}
                <span>{isSimulatingDrive ? 'Pause Simulation' : 'Simulate Drive Run'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetPilot}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--color-cream-muted)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.76rem',
                  cursor: 'pointer'
                }}
                title="Reset Pilot Test"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Order Dispatch Card & Doorstep Verification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Destination Details */}
          <div style={{
            background: 'var(--color-card-bg)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '18px'
          }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--color-gold)', marginBottom: '12px' }}>
              Delivery Destination
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
              <MapPin size={18} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.86rem', color: '#fff' }}>{customer.name}</strong>
                <p style={{ fontSize: '0.76rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
                  {customer.address}
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.74rem',
              color: 'var(--color-cream)',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-cream-muted)' }}>Store Origin:</span>
                <strong>{store.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-cream-muted)' }}>Excise Licence:</span>
                <strong>{store.licence}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-cream-muted)' }}>Statutory Zone:</span>
                <strong style={{ color: '#10B981' }}>Within {store.deliveryRadiusKm}km</strong>
              </div>
            </div>

            {orderStatus !== 'DELIVERED' && (
              <button
                type="button"
                onClick={() => setOrderStatus("ARRIVED")}
                style={{
                  width: '100%',
                  background: orderStatus === 'ARRIVED' ? '#10B981' : 'rgba(42, 157, 143, 0.2)',
                  color: orderStatus === 'ARRIVED' ? '#0C0C0F' : 'var(--color-teal)',
                  border: '1px solid var(--color-teal)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {orderStatus === 'ARRIVED' ? '✓ Courier Arrived at Doorstep' : 'Mark Arrived at Doorstep'}
              </button>
            )}
          </div>

          {/* Doorstep Age & OTP Check */}
          <div style={{
            background: 'var(--color-card-bg)',
            border: `1.5px solid ${isDelivered ? '#10B981' : 'var(--color-gold)'}`,
            borderRadius: '14px',
            padding: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <KeyRound size={18} style={{ color: isDelivered ? '#10B981' : 'var(--color-gold)' }} />
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#fff' }}>
                Doorstep Age Verification
              </h3>
            </div>

            <p style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
              Telangana Excise compliance mandates physical age verification and entering the customer's private 4-digit OTP code before product handover.
            </p>

            {isDelivered ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                borderRadius: '8px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <CheckCircle2 size={28} style={{ color: '#10B981', margin: '0 auto 6px auto' }} />
                <strong style={{ fontSize: '0.9rem', color: '#10B981', display: 'block' }}>
                  Delivery Successfully Completed!
                </strong>
                <p style={{ fontSize: '0.74rem', color: 'var(--color-cream)', marginTop: '4px' }}>
                  Age confirmed · Order transitioned to DELIVERED in database.
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', display: 'block', marginBottom: '6px' }}>
                    CUSTOMER DOORSTEP OTP:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value)}
                    placeholder="e.g. 8492"
                    style={{
                      width: '100%',
                      background: 'rgba(12, 12, 15, 0.8)',
                      border: '1.5px solid var(--border-gold)',
                      borderRadius: '8px',
                      color: 'var(--color-gold)',
                      padding: '10px',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '6px'
                    }}
                  />
                  {otpError && (
                    <span style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                      {otpError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'var(--color-gold)',
                    color: '#0C0C0F',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Verify Age & Complete Handover
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
