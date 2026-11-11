import React, { useState } from 'react';
import {
  ShieldCheck, Smartphone, Store, ShieldAlert, Clock, ShoppingBag, Eye, LogOut, LogIn, MapPin, ChevronDown, Check, X, Bike
} from 'lucide-react';

const DELIVERY_HUBS = [
  { city: 'Hyderabad', pincode: '500081', state: 'Telangana', hub: 'Hitec City Excise Depot' },
  { city: 'Bengaluru', pincode: '560001', state: 'Karnataka', hub: 'Indiranagar Hub' },
  { city: 'Mumbai', pincode: '400001', state: 'Maharashtra', hub: 'Bandra West Hub' },
  { city: 'Delhi NCR', pincode: '110001', state: 'Delhi', hub: 'Connaught Hub' },
  { city: 'Pune', pincode: '411001', state: 'Maharashtra', hub: 'Koregaon Park Hub' },
  { city: 'Goa', pincode: '403001', state: 'Goa', hub: 'Panaji North Hub' },
];

export function Header({
  activeView,
  setActiveView,
  isFrameMode,
  setIsFrameMode,
  cartCount,
  onOpenCart,
  onOpenKycModal,
  kycVerified,
  user,
  onSignOut,
  onOpenAuthModal,
}) {
  const [selectedHub, setSelectedHub] = useState(DELIVERY_HUBS[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <>
      <header className="platform-top-bar" style={{
        background: 'rgba(23, 32, 27, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-card-border)',
      }}>
        {/* Signature BOOZER Brand Badge with CompareX Editorial Touch */}
        <div className="brand-badge">
          <div className="boozer-logo-text" style={{ cursor: 'pointer' }} onClick={() => setActiveView('customer')}>
            <span style={{ color: 'var(--color-primary-mint)' }}>B</span>
            <span className="glass-logo-icon">
              <svg viewBox="0 0 40 46">
                <path
                  d="M6 4 L34 4 L31 40 C31 42 29 44 27 44 L13 44 C11 44 9 42 9 40 Z"
                  fill="none"
                  stroke="var(--color-primary-mint)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 18 L31.5 18 L29.5 39 C29.5 41 28 42 26 42 L14 42 C12 42 10.5 41 10.5 39 Z"
                  fill="var(--color-primary-mint)"
                />
                <rect x="14" y="24" width="10" height="10" rx="1.5" fill="rgba(255,255,255,0.4)" />
              </svg>
            </span>
            <span style={{ color: '#F7F8FA' }}>ZER</span>
          </div>

          {/* 10 MIN Speed Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(101, 201, 156, 0.14)',
            border: '1px solid rgba(101, 201, 156, 0.35)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 8px',
            fontSize: '0.68rem',
            fontWeight: 800,
            color: 'var(--color-primary-mint)',
            letterSpacing: '0.04em',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary-mint)' }}></span>
            <span>10 MIN</span>
          </div>

          {/* Location Selector Pill */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(23, 32, 27, 0.65)',
              border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              fontSize: '0.74rem',
              color: 'var(--color-cream)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
            title="Change Delivery City / Hub"
          >
            <MapPin size={12} color="var(--color-primary-mint)" />
            <strong>{selectedHub.city}</strong>
            <span style={{ color: 'var(--color-cream-muted)', fontSize: '0.68rem' }}>({selectedHub.pincode})</span>
            <ChevronDown size={12} color="var(--color-cream-muted)" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="view-modes-pills" style={{
          background: 'rgba(14, 21, 17, 0.8)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-full)',
          padding: '4px',
        }}>
          <button
            className={`view-mode-btn ${activeView === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveView('customer')}
            title="Customer Mobile Lifestyle App"
          >
            <Smartphone size={15} />
            <span>Customer App</span>
          </button>

          <button
            className={`view-mode-btn ${activeView === 'retailer' ? 'active' : ''}`}
            onClick={() => setActiveView('retailer')}
            title="Licensed Retailer Terminal"
          >
            <Store size={15} />
            <span>Retailer Portal</span>
          </button>

          <button
            className={`view-mode-btn ${activeView === 'rider' ? 'active' : ''}`}
            onClick={() => setActiveView('rider')}
            title="Courier Live GPS & OTP Terminal"
          >
            <Bike size={15} />
            <span>Rider (Pilot)</span>
          </button>

          <button
            className={`view-mode-btn ${activeView === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveView('admin')}
            title="Admin Compliance & Audit Trail"
          >
            <ShieldAlert size={15} />
            <span>Admin Command</span>
          </button>
        </div>

        {/* Top Actions */}
        <div className="top-actions-wrap">
          {activeView === 'customer' && (
            <>
              <button
                className="kyc-verified-pill"
                onClick={onOpenKycModal}
                title="Click to view DigiLocker KYC details"
                style={{
                  background: 'rgba(5, 150, 105, 0.16)',
                  border: '1px solid var(--color-savings)',
                  color: 'var(--color-primary-mint)',
                }}
              >
                <ShieldCheck size={14} />
                <span>{kycVerified ? "DigiLocker Verified" : "Verify Age (KYC)"}</span>
              </button>

              <button
                className="frame-toggle-btn"
                onClick={() => setIsFrameMode(!isFrameMode)}
                title={isFrameMode ? "Switch to Expanded Desktop View" : "Switch to Mobile Phone View"}
              >
                <Eye size={14} />
                <span>{isFrameMode ? "Desktop View" : "Mobile View"}</span>
              </button>

              <button
                className="view-mode-btn"
                style={{
                  background: 'rgba(101, 201, 156, 0.14)',
                  color: 'var(--color-primary-mint)',
                  position: 'relative',
                  border: '1px solid rgba(101, 201, 156, 0.35)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                }}
                onClick={onOpenCart}
              >
                <ShoppingBag size={15} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-5px',
                    background: 'var(--color-primary-mint)', color: '#0E1511',
                    width: '18px', height: '18px', borderRadius: '50%',
                    fontSize: '0.68rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--color-cream-muted)' }}>
            <Clock size={13} color="var(--color-primary-mint)" />
            <span>Excise Hours: <strong>10 AM – 10 PM</strong></span>
          </div>

          {/* User Authentication Status & Sign Out */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px',
                  background: 'var(--color-plum-surface)',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: 'var(--radius-full)',
                }}
                title={`Logged in as ${user.fullName || user.name}`}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-mint)',
                    color: '#0E1511',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: 'var(--color-cream)',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {(user?.fullName || user?.name || user?.phone || 'User').split(' ')[0]}
                </span>
              </div>

              <button
                onClick={onSignOut}
                className="view-mode-btn"
                style={{
                  background: 'rgba(220, 76, 62, 0.12)',
                  border: '1px solid rgba(220, 76, 62, 0.3)',
                  color: '#F87171',
                  gap: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-full)',
                }}
                title="Sign Out of BOOZER"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                borderRadius: 'var(--radius-full)',
              }}
              title="Sign In or Register"
            >
              <LogIn size={14} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Location Picker Modal for Web */}
      {isLocationModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--color-plum-surface)',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: '440px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-cream)' }}>
                  Delivery Location
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
                  Select your legal state excise delivery hub
                </p>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', border: 'none',
                  color: 'var(--color-cream)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DELIVERY_HUBS.map((hub) => {
                const isSelected = hub.city === selectedHub.city;
                return (
                  <div
                    key={hub.city}
                    onClick={() => {
                      setSelectedHub(hub);
                      setIsLocationModalOpen(false);
                    }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 14px', borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(101, 201, 156, 0.12)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid var(--color-primary-mint)' : '1px solid var(--color-card-border)',
                      cursor: 'pointer', transition: 'var(--transition-fast)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: isSelected ? 'var(--color-primary-mint)' : 'var(--color-cream)' }}>
                          {hub.city}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-cream-muted)' }}>({hub.pincode})</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-cream-subtle)', marginTop: '2px' }}>
                        {hub.state} · {hub.hub}
                      </div>
                    </div>

                    {isSelected && (
                      <span style={{
                        background: 'var(--color-primary-mint)', color: '#0E1511',
                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        fontSize: '0.68rem', fontWeight: 800
                      }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
