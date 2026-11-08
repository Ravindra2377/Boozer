import React from 'react';
import {
  ShieldCheck, Smartphone, Store, ShieldAlert, Clock, ShoppingBag, Eye, LogOut, LogIn, User
} from 'lucide-react';

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
  return (
    <header className="platform-top-bar">
      {/* Signature BOOZER Logo */}
      <div className="brand-badge">
        <div className="boozer-logo-text">
          <span>B</span>
          <span className="glass-logo-icon">
            <svg viewBox="0 0 40 46">
              <path
                d="M6 4 L34 4 L31 40 C31 42 29 44 27 44 L13 44 C11 44 9 42 9 40 Z"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 18 L31.5 18 L29.5 39 C29.5 41 28 42 26 42 L14 42 C12 42 10.5 41 10.5 39 Z"
                fill="var(--color-gold)"
              />
              <rect x="14" y="24" width="10" height="10" rx="1.5" fill="rgba(255,255,255,0.4)" />
            </svg>
          </span>
          <span>ZER</span>
        </div>
        <span style={{ fontSize: '0.68rem', color: 'var(--color-cream-muted)', marginLeft: '8px', borderLeft: '1px solid var(--color-card-border)', paddingLeft: '8px', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
          Express Delivery · Telangana
        </span>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="view-modes-pills">
        <button
          className={`view-mode-btn ${activeView === 'customer' ? 'active' : ''}`}
          onClick={() => setActiveView('customer')}
          title="Customer Mobile Lifestyle App"
        >
          <Smartphone size={16} />
          <span>Customer App</span>
        </button>

        <button
          className={`view-mode-btn ${activeView === 'retailer' ? 'active' : ''}`}
          onClick={() => setActiveView('retailer')}
          title="Licensed Retailer Terminal"
        >
          <Store size={16} />
          <span>Retailer Portal</span>
        </button>

        <button
          className={`view-mode-btn ${activeView === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveView('admin')}
          title="Admin Compliance & Audit Trail"
        >
          <ShieldAlert size={16} />
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
              style={{ background: '#22222E', color: 'var(--color-gold)', position: 'relative', border: '1px solid var(--color-card-border)' }}
              onClick={onOpenCart}
            >
              <ShoppingBag size={15} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-5px',
                  background: 'var(--color-gold)', color: 'var(--color-midnight)',
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
          <Clock size={13} color="var(--color-gold)" />
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
                background: '#1A1A22',
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
                  background: 'var(--color-gold)',
                  color: '#0C0C0F',
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
                background: 'rgba(214, 69, 69, 0.12)',
                border: '1px solid rgba(214, 69, 69, 0.3)',
                color: '#F87171',
                gap: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
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
            }}
            title="Sign In or Register"
          >
            <LogIn size={14} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
