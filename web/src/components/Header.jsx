import React from 'react';
import { ShieldCheck, Smartphone, Store, ShieldAlert, Clock, ShoppingBag, Eye } from 'lucide-react';

export function Header({
  activeView,
  setActiveView,
  isFrameMode,
  setIsFrameMode,
  cartCount,
  onOpenCart,
  onOpenKycModal,
  kycVerified
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
                stroke="#E7A13D"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 18 L31.5 18 L29.5 39 C29.5 41 28 42 26 42 L14 42 C12 42 10.5 41 10.5 39 Z"
                fill="#E7A13D"
              />
              <rect x="14" y="24" width="10" height="10" rx="1.5" fill="rgba(255,255,255,0.4)" />
            </svg>
          </span>
          <span>ZER</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)', marginLeft: '6px', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '8px' }}>
          Midnight Gold × Neon Luxury
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
              style={{ background: 'rgba(231, 161, 61, 0.15)', color: 'var(--color-gold)', position: 'relative' }}
              onClick={onOpenCart}
            >
              <ShoppingBag size={17} />
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
      </div>
    </header>
  );
}
