import React, { useState } from 'react';
import {
  Car, ShieldCheck, MapPin, Share2, CheckCircle2,
  ExternalLink, Sparkles, Navigation, Copy
} from 'lucide-react';
import { MOCK_RIDE_PARTNERS } from '../../data/mockData';
import { SafeRideMap } from '../map/SafeRideMap';

export function RideBookingScreen({ user, onOpenSos, isFrameMode = true }) {
  const [selectedPartner, setSelectedPartner] = useState(MOCK_RIDE_PARTNERS[0]);
  const [isBooked, setIsBooked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [livePickupAddress, setLivePickupAddress] = useState(null);

  const isDelhi = user?.city?.toLowerCase()?.includes('delhi');
  const pickupAddress = livePickupAddress || (isDelhi
    ? "Flat 402, Barakhamba Towers, Connaught Place"
    : "Jubilee Hills Club / Social Bar, Road No. 36");
  const dropoffAddress = isDelhi
    ? "House 24, Sector 44, Noida (Home)"
    : (user?.deliveryAddress || "Villa 14, Silicon Meadows, Jubilee Hills (Home)");

  const handleBook = () => {
    setIsBooked(true);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSelectPartnerFromMap = (cab) => {
    const matched = MOCK_RIDE_PARTNERS.find(
      (p) => p.partner === cab.partner || p.id === cab.id
    );
    if (matched) {
      setSelectedPartner(matched);
    }
  };

  return (
    <div className="screen-scroll-body">
      {/* Active Safe Ride Credit Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.25) 0%, rgba(232, 163, 61, 0.15) 100%)',
        border: '1px solid rgba(42, 157, 143, 0.5)', borderRadius: 'var(--radius-md)', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge-teal">
            <ShieldCheck size={13} />
            <span>Built-in Safe Ride Credit</span>
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)' }}>Expires in 23h 48m</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', textTransform: 'uppercase' }}>
              Voucher Code: <strong style={{ color: 'var(--color-cream)' }}>SAFERIDE-1849A</strong>
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-teal)' }}>
              ₹150.00 OFF Applied
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>Capped per order</span>
        </div>
      </div>

      {/* Origin & Destination Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-amber)' }} />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>Pickup Location</span>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-cream)' }}>
              {pickupAddress}
            </p>
          </div>
        </div>

        <div style={{ borderLeft: '2px dashed var(--color-ink-border)', marginLeft: '3px', height: '14px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-teal)' }} />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>Drop-off Location</span>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-cream)' }}>
              {dropoffAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Safe Ride Dispatch Radar Map */}
      <SafeRideMap
        city={user?.city || "Hyderabad"}
        selectedPartner={selectedPartner}
        onSelectPartner={handleSelectPartnerFromMap}
        onPickupChange={(livePickup) => setLivePickupAddress(livePickup.address || livePickup.label)}
        isBooked={isBooked}
        isFrameMode={isFrameMode}
        height="260px"
      />

      {/* Partner Comparison Section */}
      <div>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '10px' }}>
          Compare Partner Fleets
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {MOCK_RIDE_PARTNERS.map((item) => {
            const isSelected = selectedPartner.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedPartner(item)}
                style={{
                  background: isSelected ? 'rgba(42, 157, 143, 0.12)' : 'var(--color-ink-card)',
                  border: `1px solid ${isSelected ? 'var(--color-teal)' : 'var(--color-ink-border)'}`,
                  borderRadius: 'var(--radius-md)', padding: '14px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '8px', background: '#111A24',
                    border: '1px solid var(--color-ink-border)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-amber)'
                  }}>
                    {item.partner === 'UBER' ? 'Uber' : item.partner === 'OLA' ? 'Ola' : 'Rapido'}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--color-cream)' }}>{item.name}</strong>
                    <p style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)' }}>
                      {item.vehicleType} · <strong>{item.etaMinutes} min away</strong>
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-cream-subtle)', textDecoration: 'line-through' }}>
                      ₹{item.baseFare}
                    </span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--color-teal)' }}>
                      ₹{item.netPayable}
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-teal)' }}>₹150 off applied</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking State or Confirmation */}
      {!isBooked ? (
        <button
          className="btn-teal"
          onClick={handleBook}
          style={{ padding: '14px', fontSize: '0.92rem', marginTop: '8px' }}
        >
          <Car size={18} />
          <span>Confirm {selectedPartner.name} · ₹{selectedPartner.netPayable}</span>
        </button>
      ) : (
        <div style={{
          background: 'rgba(42, 157, 143, 0.15)', border: '1px solid var(--color-teal)',
          borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-teal)' }}>
            <CheckCircle2 size={20} />
            <strong style={{ fontSize: '0.92rem' }}>Ride Booked with Safe Ride Credit!</strong>
          </div>

          <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>Driver: <strong>{selectedPartner.driver}</strong></div>
            <div>Vehicle: <strong>{selectedPartner.vehicleNo}</strong> ({selectedPartner.vehicleType})</div>
            <div>Arriving in: <strong style={{ color: 'var(--color-teal)' }}>{selectedPartner.etaMinutes} minutes</strong></div>
            <div>Payment: <strong>₹{selectedPartner.netPayable}</strong> (₹150 reimbursed automatically)</div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              className="btn-secondary"
              onClick={() => setShowShareModal(true)}
              style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}
            >
              <Share2 size={16} />
              <span>Share Trip with Trusted Contacts</span>
            </button>

            <button
              className="btn-primary"
              onClick={() => window.open('https://m.uber.com', '_blank')}
              style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}
            >
              <ExternalLink size={16} />
              <span>Open in App</span>
            </button>
          </div>
        </div>
      )}

      {/* Share Trip Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-teal)' }}>
                <Share2 size={18} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Share Safe Trip</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)', marginBottom: '14px' }}>
              Your trusted contacts (<strong>Pooja Sharma</strong> and <strong>Karan Verma</strong>) will receive
              a live encrypted link to follow your vehicle until you reach home safely.
            </p>

            <div style={{
              background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
              borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px'
            }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-cream)' }}>
                https://track.boozerapp.in/trip/t_89a12c49e
              </span>
              <button
                onClick={handleCopyLink}
                style={{
                  background: copiedLink ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)',
                  border: 'none', borderRadius: '4px', padding: '4px 8px', color: '#fff',
                  fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                {copiedLink ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <button
              className="btn-teal"
              style={{ width: '100%' }}
              onClick={() => {
                alert('Trip tracking link broadcasted via SMS to Pooja Sharma and Karan Verma!');
                setShowShareModal(false);
              }}
            >
              <span>Broadcast SMS to Trusted Contacts</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
