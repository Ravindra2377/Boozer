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
              Welcome, Guest Explorer
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-cream-muted)', marginTop: '4px', maxWidth: '280px' }}>
              Sign in or create an account to unlock statutory doorstep delivery, DigiLocker KYC, and ₹150 Safe Ride credit.
            </p>
          </div>
          <button
            onClick={onOpenAuthModal}
            style={{
              marginTop: '6px',
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--color-gold) 0%, #D48924 100%)',
              color: '#09090E',
              fontWeight: 800,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(231, 161, 61, 0.35)'
            }}
          >
            <LogIn size={16} />
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
            background: 'linear-gradient(135deg, var(--color-amber) 0%, #B87820 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-ink)'
          }}>
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-cream)' }}>
              {user.fullName}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>
              {user.phone} · DOB: 30 Apr 1995 ({user.calculatedAge} Years Old)
            </p>
          </div>
        </div>

        {/* KYC Verification Box */}
        <div style={{
          background: 'rgba(42, 157, 143, 0.12)', border: '1px solid rgba(42, 157, 143, 0.35)',
          borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--color-teal)" />
            <div>
              <strong style={{ fontSize: '0.8rem', color: 'var(--color-teal)' }}>
                DigiLocker KYC Verified
              </strong>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>
                {user.documentType} ({user.maskedDocNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onOpenKycModal}
            style={{
              background: 'transparent', border: 'none', color: 'var(--color-cream)',
              fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline'
            }}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Safe Ride Wallet */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232, 163, 61, 0.15) 0%, rgba(42, 157, 143, 0.15) 100%)',
        border: '1px solid rgba(232, 163, 61, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink)'
          }}>
            <Car size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', textTransform: 'uppercase' }}>
              Safe Ride Wallet Balance
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-amber)' }}>
              ₹{user.activeRideCredit.toFixed(2)}
            </h3>
          </div>
        </div>
        <span className="badge-teal">1 Active Credit</span>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px' }}>
          Saved Delivery Address
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <MapPin size={16} color="var(--color-amber)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '0.82rem', color: 'var(--color-cream)' }}>Home / Delivery Zone</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
              {user.deliveryAddress}
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
                <span className={ord.status === 'DELIVERED' ? 'badge-teal' : 'badge-amber'}>
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
                borderTop: '1px solid var(--color-ink-border)', paddingTop: '8px', marginTop: '4px'
              }}>
                <div style={{ fontSize: '0.74rem' }}>
                  <span style={{ color: 'var(--color-cream-muted)' }}>Total: </span>
                  <strong style={{ color: 'var(--color-amber)' }}>{ord.amount}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--color-teal)' }}>
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
          Logged in as <strong>{user.phone || user.fullName}</strong> · 256-Bit Encrypted Session
        </p>

        <button
          onClick={onSignOut}
          style={{
            marginTop: '4px',
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#FCA5A5',
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
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out of Boozer</span>
        </button>
      </div>
    </div>
  );
}
