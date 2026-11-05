import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle2, Lock, Smartphone, FileText, ArrowRight } from 'lucide-react';

export function OnboardingKycModal({ isOpen, onClose, user, onVerifyComplete }) {
  const [step, setStep] = useState(1); // 1: Phone OTP, 2: DigiLocker Auth, 3: Verified Result
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [otp, setOtp] = useState('482194');
  const [docType, setDocType] = useState('DRIVING_LICENCE');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 600);
  };

  const handleDigiLockerAuthorize = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      if (onVerifyComplete) {
        onVerifyComplete();
      }
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(42, 157, 143, 0.2)', color: 'var(--color-teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Age & ID Verification</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>
                Powered by DigiLocker · DPDP Act 2023 Compliant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-cream-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: s <= step ? 'var(--color-teal)' : 'var(--color-ink-border)'
              }}
            />
          ))}
        </div>

        {/* STEP 1: Phone OTP */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-cream-muted)' }}>
              Enter your Indian mobile number to begin secure, verified access.
            </p>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-cream-muted)', marginBottom: '4px', display: 'block' }}>
                Mobile Number
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
                borderRadius: '8px', padding: '10px 14px'
              }}>
                <Smartphone size={16} color="var(--color-amber)" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--color-cream)', width: '100%', fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-cream-muted)', marginBottom: '4px', display: 'block' }}>
                One-Time Password (OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
                  borderRadius: '8px', padding: '10px 14px', width: '100%',
                  color: 'var(--color-cream)', fontSize: '0.9rem', outline: 'none',
                  letterSpacing: '0.2em'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-amber)', marginTop: '4px', display: 'block' }}>
                Demo auto-filled: 482194
              </span>
            </div>

            <button
              className="btn-primary"
              onClick={handleSendOtp}
              disabled={isLoading}
              style={{ marginTop: '8px' }}
            >
              <span>{isLoading ? "Verifying OTP..." : "Continue to DigiLocker"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: DigiLocker Authorization */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(232, 163, 61, 0.08)',
              border: '1px solid rgba(232, 163, 61, 0.25)',
              borderRadius: '10px', padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-amber)', marginBottom: '4px' }}>
                <Lock size={16} />
                <strong style={{ fontSize: '0.85rem' }}>DigiLocker Gov Verification</strong>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)' }}>
                BOOZER connects with DigiLocker to verify your date of birth. In accordance with the DPDP Act 2023,
                <strong> raw documents are never stored</strong>. Only the age verification outcome and reference token are retained.
              </p>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-cream-muted)', marginBottom: '8px', display: 'block' }}>
                Select Document for Instant Verification:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: docType === 'DRIVING_LICENCE' ? 'rgba(42, 157, 143, 0.15)' : 'var(--color-ink-card)',
                  border: `1px solid ${docType === 'DRIVING_LICENCE' ? 'var(--color-teal)' : 'var(--color-ink-border)'}`,
                  padding: '12px', borderRadius: '8px', cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="doc"
                    checked={docType === 'DRIVING_LICENCE'}
                    onChange={() => setDocType('DRIVING_LICENCE')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--color-cream)' }}>Driving Licence</strong>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>Ministry of Road Transport & Highways</p>
                  </div>
                </label>

                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: docType === 'AADHAAR' ? 'rgba(42, 157, 143, 0.15)' : 'var(--color-ink-card)',
                  border: `1px solid ${docType === 'AADHAAR' ? 'var(--color-teal)' : 'var(--color-ink-border)'}`,
                  padding: '12px', borderRadius: '8px', cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="doc"
                    checked={docType === 'AADHAAR'}
                    onChange={() => setDocType('AADHAAR')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--color-cream)' }}>Aadhaar Card (Offline XML / OTP)</strong>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)' }}>Masked identifier only (UIDAI standard)</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              className="btn-teal"
              onClick={handleDigiLockerAuthorize}
              disabled={isLoading}
            >
              <span>{isLoading ? "Querying DigiLocker Registry..." : "Authorize via DigiLocker"}</span>
              <CheckCircle2 size={16} />
            </button>
          </div>
        )}

        {/* STEP 3: Verification Result */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(42, 157, 143, 0.2)', color: 'var(--color-teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', boxShadow: 'var(--shadow-glow-teal)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-cream)' }}>Age Verified Successfully!</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-cream-muted)', marginTop: '4px' }}>
                You are legally eligible to order alcohol in Delhi (Legal drinking age: 21+ / Spirits: 25+).
              </p>
            </div>

            <div style={{
              background: 'var(--color-ink-card)', border: '1px solid var(--color-ink-border)',
              borderRadius: '10px', padding: '14px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-cream-muted)' }}>Verified Name:</span>
                <strong style={{ color: 'var(--color-cream)' }}>{user.fullName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-cream-muted)' }}>Calculated Age:</span>
                <span className="badge-teal">31 Years Old (Born 1995)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-cream-muted)' }}>Verification Provider:</span>
                <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>DigiLocker Government API</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-cream-muted)' }}>Masked Document Ref:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-cream)' }}>DL-142011XXXX9124</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-cream-muted)' }}>Doorstep Check:</span>
                <span style={{ color: 'var(--color-cream-muted)' }}>Required by delivery rider</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={onClose}
            >
              Start Browsing Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
