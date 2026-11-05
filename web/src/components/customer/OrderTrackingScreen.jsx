import React, { useState, useEffect } from 'react';
import {
  Phone, MessageSquare, ShieldCheck, Share2, HelpCircle,
  ArrowRight, Key, UserCheck, Navigation, CheckCircle2, ChevronRight
} from 'lucide-react';
import { ORDER_STATE_MACHINE_STEPS } from '../../data/mockData';

export function OrderTrackingScreen({
  order,
  onNavigateToRides,
  onAdvanceOrderState
}) {
  const [carProgress, setCarProgress] = useState(60); // 0 to 100 along path
  const [doorstepOtp, setDoorstepOtp] = useState('');
  const [doorstepError, setDoorstepError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Moving car along glowing trail
  useEffect(() => {
    if (order.status === 'DISPATCHED') {
      const interval = setInterval(() => {
        setCarProgress((prev) => (prev >= 92 ? 55 : prev + 2.5));
      }, 900);
      return () => clearInterval(interval);
    }
  }, [order.status]);

  const currentStepIndex = ORDER_STATE_MACHINE_STEPS.findIndex((s) => s.key === order.status);
  const currentStep = ORDER_STATE_MACHINE_STEPS[currentStepIndex] || ORDER_STATE_MACHINE_STEPS[0];

  const handleVerifyDoorstep = () => {
    if (doorstepOtp === '8492' || doorstepOtp.length >= 4) {
      setDoorstepError('');
      onAdvanceOrderState();
    } else {
      setDoorstepError('Invalid OTP. Provide recipient OTP sent via SMS (Demo: 8492).');
    }
  };

  return (
    <div className="screen-scroll-body" style={{ position: 'relative' }}>
      {/* Top Banner Matching Reference Image 1: "Your order is on the way! Arriving in 12 min" */}
      <div style={{
        background: 'rgba(231, 161, 61, 0.08)', border: '1px solid rgba(231, 161, 61, 0.25)',
        borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex',
        alignItems: 'center', gap: '14px'
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%',
          background: 'rgba(231, 161, 61, 0.18)', border: '1px solid var(--color-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)',
          boxShadow: 'var(--glow-gold)', flexShrink: 0
        }}>
          📍
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
            {order.status === 'DELIVERED' ? "Order Delivered Successfully!" : "Your order is on the way!"}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
            {order.status === 'DELIVERED' ? "Enjoy responsibly. Safe ride credit active." : "Arriving in 12 min · Rohit Kumar"}
          </p>
        </div>
      </div>

      {/* Living Route Map (Matching Phone Mockup 3 in Reference Image) */}
      <div style={{
        width: '100%', height: '280px', borderRadius: 'var(--radius-lg)',
        background: 'radial-gradient(circle at 60% 40%, #171126 0%, #0B0813 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Abstract Dark City Grid */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
          <line x1="0" y1="40" x2="100%" y2="40" stroke="#372C4C" strokeWidth="2" />
          <line x1="0" y1="120" x2="100%" y2="120" stroke="#372C4C" strokeWidth="3" />
          <line x1="0" y1="200" x2="100%" y2="200" stroke="#372C4C" strokeWidth="2" />
          <line x1="60" y1="0" x2="60" y2="100%" stroke="#372C4C" strokeWidth="2" />
          <line x1="160" y1="0" x2="160" y2="100%" stroke="#372C4C" strokeWidth="4" />
          <line x1="280" y1="0" x2="280" y2="100%" stroke="#372C4C" strokeWidth="2" />
        </svg>

        {/* The Living Glowing Amber Route Line */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="routeGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4361EE" />
              <stop offset="30%" stopColor="#E7A13D" />
              <stop offset="100%" stopColor="#F5B24E" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Glowing underlay */}
          <path
            d="M 60 70 Q 120 160 220 130 T 320 220"
            fill="none"
            stroke="rgba(231, 161, 61, 0.4)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Crisp animated route */}
          <path
            d="M 60 70 Q 120 160 220 130 T 320 220"
            fill="none"
            stroke="url(#routeGlowGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#glowEffect)"
            strokeDasharray="6 4"
            className="living-route-svg"
          />
        </svg>

        {/* Origin Pin (Blue circle matching reference) */}
        <div style={{
          position: 'absolute', top: '56px', left: '46px',
          width: '28px', height: '28px', borderRadius: '50%',
          background: '#2563EB', color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800,
          boxShadow: '0 0 16px rgba(37, 99, 235, 0.8)', border: '2px solid #fff'
        }}>
          🏪
        </div>

        {/* Destination Pin (Amber pin matching reference) */}
        <div style={{
          position: 'absolute', bottom: '46px', right: '46px',
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--color-gold)', color: 'var(--color-midnight)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900,
          boxShadow: 'var(--glow-gold)', border: '2px solid #fff'
        }}>
          📍
        </div>

        {/* Moving Delivery Car along the route */}
        <div style={{
          position: 'absolute',
          top: `${70 + (carProgress / 100) * 130}px`,
          left: `${60 + (carProgress / 100) * 240}px`,
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.8s ease',
          zIndex: 10
        }}>
          <div style={{
            width: '38px', height: '24px', borderRadius: '6px',
            background: 'linear-gradient(135deg, #F5B24E 0%, #D97706 100%)',
            border: '2px solid #fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.72rem',
            boxShadow: '0 0 20px rgba(231, 161, 61, 0.9)'
          }}>
            🚗
          </div>
        </div>

        {/* Delivery ETA Pill */}
        <div style={{
          position: 'absolute', top: '12px', right: '14px',
          background: 'rgba(13, 11, 20, 0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-full)',
          padding: '4px 12px', fontSize: '0.72rem', color: 'var(--color-gold)', fontWeight: 700
        }}>
          ● Live GPS Feed
        </div>
      </div>

      {/* Delivery Partner Card (Matching Image 1: "Rohit Kumar ★ 4.9 · KA 01 AB 1234") */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #2D1F47 0%, #151024 100%)',
            border: '2px solid var(--color-gold)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.2rem', color: 'var(--color-cream)'
          }}>
            🧔🏽
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontSize: '0.92rem', color: 'var(--color-cream)' }}>Rohit Kumar</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 700 }}>★ 4.9</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
              KA 01 AB 1234 · Delivery Partner
            </p>
          </div>
        </div>

        {/* Call and Message Buttons (Matching Image 1) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => alert('Calling delivery partner Rohit Kumar (+91 98111 22334)...')}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Call Partner"
          >
            <Phone size={16} />
          </button>
          <button
            onClick={() => alert('Opening live chat with delivery partner Rohit Kumar...')}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Chat with Partner"
          >
            <MessageSquare size={16} />
          </button>
        </div>
      </div>

      {/* Share Live Location Card (Matching Image 1: "Share Live Location with a trusted contact →") */}
      <div
        className="glass-card"
        onClick={() => alert('Live tracking link shared via SMS to trusted contacts (Rahul & Ananya)!')}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', padding: '14px 16px', background: 'rgba(23, 17, 34, 0.65)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'rgba(112, 43, 192, 0.2)', color: 'var(--color-purple-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Share2 size={16} />
          </div>
          <div>
            <strong style={{ fontSize: '0.84rem', color: 'var(--color-cream)' }}>
              Share Live Location
            </strong>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>
              Send real-time map link to trusted contacts
            </p>
          </div>
        </div>
        <ChevronRight size={18} color="var(--color-cream-muted)" />
      </div>

      {/* Doorstep Verification Modal / Callout if ARRIVED */}
      {order.status === 'ARRIVED' && (
        <div style={{
          background: 'rgba(231, 161, 61, 0.12)', border: '1px solid var(--color-gold)',
          borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--color-gold)" />
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-gold)' }}>
              Doorstep Age Verification Required
            </strong>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>
            Rider Rohit Kumar is at your door. Present physical ID or provide digital OTP (Demo: 8492).
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Enter OTP (Hint: 8492)"
              value={doorstepOtp}
              onChange={(e) => setDoorstepOtp(e.target.value)}
              style={{
                background: 'rgba(13, 11, 20, 0.8)', border: '1px solid var(--color-card-border)',
                borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '0.9rem',
                letterSpacing: '0.1em', width: '100%', outline: 'none'
              }}
            />
            <button
              className="btn-primary"
              onClick={handleVerifyDoorstep}
              style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}
            >
              <UserCheck size={16} />
              <span>Verify</span>
            </button>
          </div>
          {doorstepError && (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-crimson)' }}>{doorstepError}</span>
          )}
        </div>
      )}

      {/* Order Support "Get Help" Button */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => setShowHelpModal(true)}
          style={{
            width: '100%', padding: '15px', borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(30, 24, 44, 0.9) 0%, rgba(18, 14, 28, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-heading)',
            fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.02em',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-gold)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(231, 161, 61, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4)';
          }}
        >
          <HelpCircle size={18} color="var(--color-gold)" />
          <span>Get Help</span>
        </button>
      </div>

      {/* Order Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(231, 161, 61, 0.15)', color: 'var(--color-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Order Assistance</h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>
                    Order {order.orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)', marginBottom: '14px' }}>
              How can we assist you with your delivery?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  alert('Connecting to delivery partner Rohit Kumar (+91 98111 22334)...');
                  setShowHelpModal(false);
                }}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 14px', textAlign: 'left' }}
              >
                <Phone size={16} color="var(--color-gold)" />
                <div>
                  <strong style={{ fontSize: '0.82rem', display: 'block' }}>Call Delivery Partner</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>Rohit Kumar (KA 01 AB 1234)</span>
                </div>
              </button>

              <button
                onClick={() => {
                  alert('Connecting to Boozer Live Support chat specialist...');
                  setShowHelpModal(false);
                }}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 14px', textAlign: 'left' }}
              >
                <MessageSquare size={16} color="var(--color-gold)" />
                <div>
                  <strong style={{ fontSize: '0.82rem', display: 'block' }}>Chat with Support Specialist</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>24/7 dedicated concierge</span>
                </div>
              </button>

              <button
                onClick={() => {
                  alert('Delivery instructions updated and forwarded to rider.');
                  setShowHelpModal(false);
                }}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 14px', textAlign: 'left' }}
              >
                <Navigation size={16} color="var(--color-gold)" />
                <div>
                  <strong style={{ fontSize: '0.82rem', display: 'block' }}>Update Delivery Landmark</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>Villa 14, Silicon Meadows</span>
                </div>
              </button>
            </div>

            <div style={{
              marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.7rem', color: 'var(--color-cream-subtle)', textAlign: 'center'
            }}>
              For personal emergency assistance, please navigate to the dedicated Safety tab.
            </div>
          </div>
        </div>
      )}

      {/* State Machine Stepper & Testing Controls */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Order Lifecycle & Verification</h3>
          <span className="badge-gold">{currentStep.label}</span>
        </div>

        <div className="stepper-container">
          {ORDER_STATE_MACHINE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            return (
              <div
                key={step.key}
                className={`stepper-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              >
                <div className="step-circle">
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <div className="step-info">
                  <h4>{step.label}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Advance Button */}
        <div style={{
          marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)' }}>
            Status: <strong style={{ color: 'var(--color-cream)' }}>{order.status}</strong>
          </span>
          {order.status !== 'DELIVERED' ? (
            <button
              className="btn-purple-outline"
              onClick={onAdvanceOrderState}
              style={{ padding: '6px 12px', fontSize: '0.74rem' }}
            >
              <span>Advance State</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <span className="badge-teal">Delivered & Verified</span>
          )}
        </div>
      </div>
    </div>
  );
}
