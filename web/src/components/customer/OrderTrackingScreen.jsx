import React, { useState } from 'react';
import {
  Phone, MessageSquare, ShieldCheck, Share2, HelpCircle,
  ArrowRight, Key, UserCheck, Navigation, CheckCircle2, ChevronRight
} from 'lucide-react';
import { ORDER_STATE_MACHINE_STEPS } from '../../data/mockData';
import { LiveDeliveryMap } from '../map/LiveDeliveryMap';

export function OrderTrackingScreen({
  order,
  onNavigateToRides,
  onAdvanceOrderState,
  city = "Hyderabad"
}) {
  const [doorstepOtp, setDoorstepOtp] = useState('');
  const [doorstepError, setDoorstepError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

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

      {/* Live Interactive Delivery Route Map (Leaflet × CartoDB Dark Matter) */}
      <LiveDeliveryMap
        order={order}
        city={city}
        height="300px"
        riderName="Rohit Kumar"
        riderVehicle="KA 01 AB 1234"
      />

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
