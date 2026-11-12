import React from 'react';
import {
  ShieldCheck, User, MapPin, Car, Clock, Receipt, CheckCircle2, ChevronRight, LogOut, LogIn, Sparkles
} from 'lucide-react';

export function ProfileScreen({ user, onOpenKycModal, onSignOut, onOpenAuthModal }) {
  if (!user) {
    return (
      <div className="screen-scroll-body">
        <div className="glass-card" style={{ textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(231, 161, 61, 0.15)', border: '1px solid var(--color-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-gold)'
          }}>
            <User size={30} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-cream)' }}>
              Sign In to Boozer
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-cream-muted)', marginTop: '4px', maxWidth: '280px' }}>
              Sign in or create an account to unlock statutory doorstep delivery, DigiLocker KYC, and ₹150 Safe Ride credit.
            </p>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="btn-primary"
            style={{
              marginTop: '6px',
              padding: '10px 20px',
              cursor: 'pointer',
            }}
          >
            <LogIn size={15} />
            <span>Sign In / Create Account</span>
          </button>
        </div>
      </div>
    );
  }
  const pastOrders = [
    {
      id: "BZ-20261104-1849",
      date: "Today, 10:04 PM",
      store: "Connaught Place Premium Vintners",
      items: "2× Bira 91 White, 1× Sula Rasa Cabernet",
      amount: "₹1,880.00",
      status: "IN_TRANSIT",
      doorAgeVerified: false,
      rideCredit: "Active (₹150.00)"
    },
    {
      id: "BZ-20261028-0912",
      date: "28 Oct 2026, 08:30 PM",
      store: "Connaught Place Premium Vintners",
      items: "1× Amrut Fusion Single Malt, 2× Schweppes Tonic",
      amount: "₹4,720.00",
      status: "DELIVERED",
      doorAgeVerified: true,
      rideCredit: "Redeemed on Uber"
    }
  ];

  return (
    <div className="screen-scroll-body">
      {/* Profile Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #16845B 0%, #0D4F3C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF'
          }}>
            {(user?.fullName || user?.name || user?.phone || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-cream)' }}>
              {user?.fullName || user?.name || user?.phone || 'Boozer Member'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>
              {user?.phone || '+91 98765 43210'} · DOB: {user?.dateOfBirth || '30 Apr 1995'} ({user?.calculatedAge || 29} Years Old)
            </p>
          </div>
        </div>

        {/* KYC Verification Box */}
        <div style={{
          background: '#EAF5EF', border: '1px solid #DFE6E1',
          borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#16845B" />
            <div>
              <strong style={{ fontSize: '0.8rem', color: '#16845B' }}>
                DigiLocker KYC Verified
              </strong>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>
                {user?.documentType || 'DigiLocker DL'} ({user?.maskedDocNumber || 'DL-TS092015XXXX4819'})
              </p>
            </div>
          </div>
          <button
            onClick={onOpenKycModal}
            style={{
              background: 'transparent', border: 'none', color: '#16845B',
              fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700
            }}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Safe Ride Wallet */}
      <div style={{
        background: '#FFF9ED',
        border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', padding: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', background: '#F59E0B',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF'
          }}>
            <Car size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>
              Safe Ride Wallet Balance
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#B45309' }}>
              ₹{(user?.activeRideCredit ?? 150).toFixed(2)}
            </h3>
          </div>
        </div>
        <span style={{
          background: '#EAF5EF', color: '#16845B', border: '1px solid #C5E3D2',
          padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700
        }}>
          1 Active Credit
        </span>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>
          Saved Delivery Address
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <MapPin size={16} color="#16845B" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '0.82rem', color: 'var(--color-cream)' }}>Home / Delivery Zone</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
              {user?.deliveryAddress || 'Villa 14, Silicon Meadows, Jubilee Hills, Hyderabad - 500033'}
            </p>
          </div>
        </div>
      </div>

      {/* Past Orders History */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px' }}>
          Order History & Receipts
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pastOrders.map((ord) => (
            <div
              key={ord.id}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.84rem', color: 'var(--color-cream)' }}>{ord.id}</strong>
                <span style={{
                  background: ord.status === 'DELIVERED' ? '#EAF5EF' : '#FEF3C7',
                  color: ord.status === 'DELIVERED' ? '#16845B' : '#B45309',
                  border: `1px solid ${ord.status === 'DELIVERED' ? '#C5E3D2' : '#FDE68A'}`,
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700
                }}>
                  {ord.status === 'DELIVERED' ? 'Delivered' : 'In Transit'}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)' }}>
                <div>Store: {ord.store}</div>
                <div>Items: <span style={{ color: 'var(--color-cream)' }}>{ord.items}</span></div>
                <div>Date: {ord.date}</div>
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: '1px solid var(--color-card-border)', paddingTop: '8px', marginTop: '4px'
              }}>
                <div style={{ fontSize: '0.74rem' }}>
                  <span style={{ color: 'var(--color-cream-muted)' }}>Total: </span>
                  <strong style={{ color: '#18201C', fontWeight: 800 }}>{ord.amount}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#16845B', fontWeight: 600 }}>
                  <Car size={13} />
                  <span>Ride Credit: {ord.rideCredit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account & Session Controls */}
      <div className="glass-card" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 800 }}>Account & Session</h3>
        <p style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)' }}>
          Logged in as <strong>{user?.phone || user?.fullName || 'Verified Member'}</strong> · 256-Bit Encrypted Session
        </p>

        <button
          onClick={onSignOut}
          style={{
            marginTop: '4px',
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FEE2E2';
            e.currentTarget.style.borderColor = '#FCA5A5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FEF2F2';
            e.currentTarget.style.borderColor = '#FECACA';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out of Boozer</span>
        </button>
      </div>
    </div>
  );
}
