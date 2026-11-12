import React, { useState } from 'react';
import BoozerNeonLogo from './BoozerNeonLogo';
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
        background: '#FFFFFF',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-card-border)',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
      }}>
        {/* Signature BOOZER Brand Badge with CompareX Editorial Touch */}
        <div className="brand-badge">
          <button type="button" onClick={() => setActiveView('customer')} aria-label="BOOZER home"
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <span className="logo-full"><BoozerNeonLogo variant="solid" solidColor="#16845B" height={44} /></span>
            <span className="logo-mark"><BoozerNeonLogo variant="mark" solidColor="#16845B" height={40} /></span>
          </button>

          {/* Location Selector Pill */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#F1F4F1',
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
          background: '#F1F4F1',
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
                  background: 'rgba(22, 132, 91, 0.10)',
                  border: '1px solid rgba(22, 132, 91, 0.25)',
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
                  background: 'rgba(22, 132, 91, 0.08)',
                  color: 'var(--color-primary-mint)',
                  position: 'relative',
                  border: '1px solid rgba(22, 132, 91, 0.25)',
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
                    background: 'var(--color-primary-mint)', color: '#FFFFFF',
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
                  background: '#F1F4F1',
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
                    color: '#FFFFFF',
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
                  background: 'rgba(220, 76, 62, 0.08)',
                  border: '1px solid rgba(220, 76, 62, 0.25)',
                  color: '#DC2626',
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
          background: 'rgba(24, 32, 28, 0.50)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
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
                  background: '#F1F4F1', border: 'none',
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
                      background: isSelected ? 'rgba(22, 132, 91, 0.08)' : '#F7F9F8',
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
                        background: 'var(--color-primary-mint)', color: '#FFFFFF',
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
