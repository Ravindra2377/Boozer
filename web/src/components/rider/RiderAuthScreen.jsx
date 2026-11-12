import React, { useState, useEffect, useRef } from 'react';
import {
  Bike,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Phone,
  User,
  Calendar,
  MapPin,
  Truck,
  Zap,
  Check,
  ArrowRight,
  Lock,
  Award,
  FileText,
  Sparkles,
  RefreshCw,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import BoozerNeonLogo from '../BoozerNeonLogo';

export const DEMO_RIDERS = [
  {
    id: 'rider-01',
    name: 'Rohit Kumar',
    phone: '98490 28192',
    vehicleType: 'Electric 2-Wheeler',
    vehicleNumber: 'TS 09 EA 4819 (Hero Electric Nyx)',
    licenseNumber: 'TS-092019004819',
    hub: 'Hitec City Excise Depot',
    rating: 4.98,
    completedDeliveries: 412,
    kycStatus: 'VERIFIED',
    pin: '1234',
  },
  {
    id: 'rider-02',
    name: 'Vikram Reddy',
    phone: '98222 33445',
    vehicleType: 'Ather 450X EV',
    vehicleNumber: 'TS 10 EV 8291 (Ather 450X)',
    licenseNumber: 'TS-102021008291',
    hub: 'Jubilee Hills Hub',
    rating: 4.95,
    completedDeliveries: 289,
    kycStatus: 'VERIFIED',
    pin: '1234',
  },
  {
    id: 'rider-03',
    name: 'Arjun Sen',
    phone: '98111 22334',
    vehicleType: 'Ola S1 Pro EV',
    vehicleNumber: 'TS 08 BZ 3310 (Ola S1 Pro)',
    licenseNumber: 'TS-082020003310',
    hub: 'Gachibowli Dispatch Zone',
    rating: 4.92,
    completedDeliveries: 195,
    kycStatus: 'VERIFIED',
    pin: '1234',
  },
];

const DISPATCH_HUBS = [
  { id: 'hitec', name: 'Hitec City Excise Depot (TS-EXC-01)', city: 'Hyderabad' },
  { id: 'jubilee', name: 'Jubilee Hills Dispatch Node (TS-EXC-04)', city: 'Hyderabad' },
  { id: 'gachibowli', name: 'Gachibowli Financial District Hub', city: 'Hyderabad' },
  { id: 'banjara', name: 'Banjara Hills Logistics Grid', city: 'Hyderabad' },
  { id: 'indiranagar', name: 'Indiranagar Excise Hub', city: 'Bengaluru' },
];

export function RiderAuthScreen({ onAuthSuccess, onCancel }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' | 'pin'
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'

  // Login state
  const [loginPhone, setLoginPhone] = useState('98490 28192');
  const [loginPin, setLoginPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [dob, setDob] = useState('1999-06-20');
  const [vehicleType, setVehicleType] = useState('Electric 2-Wheeler (EV)');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [selectedHub, setSelectedHub] = useState(DISPATCH_HUBS[0].name);
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Compliance acknowledgments
  const [agreeAge21, setAgreeAge21] = useState(true);
  const [agreeDoorstepOtp, setAgreeDoorstepOtp] = useState(true);
  const [agreeZeroConsumption, setAgreeZeroConsumption] = useState(true);
  const [agreeGpsTracking, setAgreeGpsTracking] = useState(true);

  // OTP inputs
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const otpInputRefs = useRef([]);
  const [resendTimer, setResendTimer] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Autofill demo rider
  const handleSelectDemoRider = (demoRider) => {
    setLoginPhone(demoRider.phone.replace(/\s+/g, ''));
    setLoginPin(demoRider.pin);
    setErrorMessage('');
    setInfoMessage(`Autofilled demo courier profile: ${demoRider.name}`);
  };

  // Calculate age helper
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle Login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanPhone = loginPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (loginMethod === 'pin') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const matched = DEMO_RIDERS.find(
          (r) => r.phone.replace(/\D/g, '') === cleanPhone
        ) || {
          id: `rider-${Date.now()}`,
          name: 'Verified Delivery Pilot',
          phone: `+91 ${cleanPhone}`,
          vehicleType: 'Electric 2-Wheeler',
          vehicleNumber: 'TS 09 EA 4819',
          licenseNumber: 'TS-092020004819',
          hub: selectedHub,
          rating: 4.95,
          completedDeliveries: 84,
          kycStatus: 'VERIFIED',
        };

        handleFinishAuth(matched);
      }, 700);
    } else {
      // Send OTP
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
        setResendTimer(45);
        setInfoMessage('Sandbox OTP dispatched to +91 ' + cleanPhone + ' (Code: 123456)');
      }, 600);
    }
  };

  // Handle Signup submission
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal name as on your driving licence.');
      return;
    }

    const cleanPhone = signupPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const age = calculateAge(dob);
    if (age < 21) {
      setErrorMessage('Under Telangana Excise Regulations, delivery pilots must be at least 21 years old to transport alcohol.');
      return;
    }

    if (!vehicleNumber.trim()) {
      setErrorMessage('Please enter your vehicle registration number.');
      return;
    }

    if (!licenseNumber.trim()) {
      setErrorMessage('Please enter your driving licence number.');
      return;
    }

    if (!agreeAge21 || !agreeDoorstepOtp || !agreeZeroConsumption || !agreeGpsTracking) {
      setErrorMessage('Please accept all statutory delivery compliance conditions to register.');
      return;
    }

    // Move to phone verification OTP
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setResendTimer(45);
      setInfoMessage('Verification OTP sent to +91 ' + cleanPhone + ' (Sandbox Code: 123456)');
    }, 700);
  };

  // Handle OTP digit entry
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = pasted.split('');
      while (newOtp.length < 6) newOtp.push('');
      setOtp(newOtp);
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) {
      setErrorMessage('Please enter all 6 digits of the OTP code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      if (entered === '123456' || entered.length === 6) {
        let riderData;
        if (mode === 'signup') {
          riderData = {
            id: `rider-onboard-${Date.now()}`,
            name: fullName.trim(),
            phone: `+91 ${signupPhone.replace(/\D/g, '')}`,
            vehicleType,
            vehicleNumber: vehicleNumber.trim().toUpperCase(),
            licenseNumber: licenseNumber.trim().toUpperCase(),
            hub: selectedHub,
            dob,
            age: calculateAge(dob),
            emergencyPhone,
            rating: 5.0,
            completedDeliveries: 0,
            kycStatus: 'VERIFIED',
            onboardedAt: new Date().toISOString(),
          };
        } else {
          const clean = loginPhone.replace(/\D/g, '');
          const matched = DEMO_RIDERS.find(
            (r) => r.phone.replace(/\D/g, '') === clean
          );
          riderData = matched || {
            id: `rider-${Date.now()}`,
            name: 'Rohit Kumar',
            phone: `+91 ${clean}`,
            vehicleType: 'Hero Electric Nyx EV',
            vehicleNumber: 'TS 09 EA 4819',
            licenseNumber: 'TS-092019004819',
            hub: selectedHub,
            rating: 4.98,
            completedDeliveries: 412,
            kycStatus: 'VERIFIED',
          };
        }

        handleFinishAuth(riderData);
      } else {
        setErrorMessage('Invalid OTP code. Please use sandbox code 123456.');
      }
    }, 800);
  };

  const handleFinishAuth = (riderData) => {
    setStep('success');
    const session = {
      rider: riderData,
      token: `bz-rider-jwt-${Date.now()}`,
      authenticatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('boozer_rider', JSON.stringify(riderData));
      localStorage.setItem('boozer_rider_session', JSON.stringify(session));
    } catch (err) {
      console.warn('Failed to store rider session', err);
    }

    setTimeout(() => {
      if (onAuthSuccess) {
        onAuthSuccess(session);
      }
    }, 1200);
  };

  return (
    <div style={{
      maxWidth: '680px',
      margin: '20px auto 40px',
      width: '100%',
      padding: '0 16px',
    }}>
      {/* Brand Card */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(20, 26, 22, 0.96) 0%, rgba(13, 17, 15, 0.98) 100%)',
        border: '1px solid var(--border-gold)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7), var(--glow-gold)',
        borderRadius: '24px',
        padding: '32px 28px',
        color: 'var(--color-cream)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow ambient background pill */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(231, 161, 61, 0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <BoozerNeonLogo variant="neon" height={52} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(231, 161, 61, 0.12)',
            border: '1px solid rgba(231, 161, 61, 0.3)',
            borderRadius: 'var(--radius-full)',
            padding: '3px 12px',
            marginBottom: '8px',
          }}>
            <Bike size={13} color="var(--color-gold)" />
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
            }}>
              Courier & Delivery Pilot Terminal
            </span>
          </div>

          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: '4px 0 6px',
          }}>
            {mode === 'login' ? 'Pilot Express Dispatch Sign In' : 'Join the Boozer Delivery Fleet'}
          </h1>

          <p style={{
            fontSize: '0.82rem',
            color: 'var(--color-cream-muted)',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.45,
          }}>
            {mode === 'login'
              ? 'Sign in to access your assigned batches, stream live GPS telematics, and verify customer doorstep OTPs.'
              : 'Onboard as a licensed alcohol delivery courier. Earn ₹85/delivery + 100% customer tips + statutory safe-handling incentives.'}
          </p>
        </div>

        {/* Mode Selector Tabs (Sign In vs Register) */}
        {step !== 'success' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
            marginBottom: '24px',
          }}>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStep('form');
                setErrorMessage('');
                setInfoMessage('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: mode === 'login' ? 'var(--color-gold)' : 'transparent',
                color: mode === 'login' ? '#0E1511' : 'var(--color-cream-muted)',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <KeyRound size={15} />
              <span>Pilot Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setStep('form');
                setErrorMessage('');
                setInfoMessage('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: mode === 'signup' ? 'var(--color-gold)' : 'transparent',
                color: mode === 'signup' ? '#0E1511' : 'var(--color-cream-muted)',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Bike size={15} />
              <span>Partner Onboarding</span>
            </button>
          </div>
        )}

        {/* Feedback banners */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#FCA5A5',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertTriangle size={16} flexShrink={0} />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div style={{
            background: 'rgba(101, 201, 156, 0.12)',
            border: '1px solid rgba(101, 201, 156, 0.35)',
            color: 'var(--color-primary-mint)',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={16} flexShrink={0} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ═══════════ STEP 1: FORM (LOGIN / SIGNUP) ═══════════ */}
        {step === 'form' && mode === 'login' && (
          <div>
            {/* Quick Demo Pilot autofill row */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(231, 161, 61, 0.2)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ⚡ Quick Demo Pilot Auto-Fill
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-cream-muted)' }}>
                  1-Click Test Access
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '8px',
              }}>
                {DEMO_RIDERS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectDemoRider(r)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: loginPhone.includes(r.phone.replace(/\D/g, ''))
                        ? '1px solid var(--color-gold)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--color-cream)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>{r.name}</span>
                      <span style={{ fontSize: '0.66rem', color: 'var(--color-gold)', fontWeight: 700 }}>★ {r.rating}</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-cream-muted)', marginTop: '2px' }}>
                      {r.vehicleType}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit}>
              {/* Method Switch: OTP vs PIN */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                fontSize: '0.78rem',
              }}>
                <span style={{ color: 'var(--color-cream-muted)' }}>Sign in with:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: loginMethod === 'otp' ? 'var(--color-gold)' : 'var(--color-cream-muted)', fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="loginMethod"
                    value="otp"
                    checked={loginMethod === 'otp'}
                    onChange={() => setLoginMethod('otp')}
                    style={{ accentColor: 'var(--color-gold)' }}
                  />
                  <span>Phone OTP (Recommended)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: loginMethod === 'pin' ? 'var(--color-gold)' : 'var(--color-cream-muted)', fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="loginMethod"
                    value="pin"
                    checked={loginMethod === 'pin'}
                    onChange={() => setLoginMethod('pin')}
                    style={{ accentColor: 'var(--color-gold)' }}
                  />
                  <span>Pilot Passcode (PIN)</span>
                </label>
              </div>

              {/* Mobile Phone Field */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-cream-muted)', marginBottom: '6px' }}>
                  Registered Mobile Number
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  gap: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold)', fontWeight: 800, fontSize: '0.88rem' }}>
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.12)' }} />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: '#fff',
                      fontSize: '0.94rem',
                      fontWeight: 600,
                      width: '100%',
                    }}
                  />
                  <Phone size={16} color="var(--color-cream-muted)" />
                </div>
              </div>

              {/* Pilot PIN field if chosen */}
              {loginMethod === 'pin' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-cream-muted)', marginBottom: '6px' }}>
                    Pilot 4-Digit Passcode
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid var(--color-card-border)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    gap: '10px',
                  }}>
                    <KeyRound size={16} color="var(--color-gold)" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      placeholder="Enter PIN (e.g. 1234)"
                      value={loginPin}
                      maxLength={6}
                      onChange={(e) => setLoginPin(e.target.value)}
                      style={{
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        fontSize: '0.94rem',
                        fontWeight: 600,
                        width: '100%',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-cream-muted)', cursor: 'pointer' }}
                    >
                      {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Duty on toggle */}
              <div style={{
                background: 'rgba(101, 201, 156, 0.08)',
                border: '1px solid rgba(101, 201, 156, 0.25)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="var(--color-primary-mint)" />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary-mint)' }}>
                      Auto-Activate GPS & Duty State
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>
                      Immediately connect courier node to Telangana dispatch grid upon sign in
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-mint)',
                  boxShadow: '0 0 8px var(--color-primary-mint)',
                }} />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: 'linear-gradient(135deg, #F5B24E 0%, #E7A13D 100%)',
                  color: '#0E1511',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--glow-gold)',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Verifying Pilot Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{loginMethod === 'otp' ? 'Send Dispatch Verification OTP' : 'Sign In as Pilot'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ═══════════ STEP 1: FORM (PARTNER ONBOARDING / SIGNUP) ═══════════ */}
        {step === 'form' && mode === 'signup' && (
          <form onSubmit={handleSignupSubmit}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--color-card-border)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <User size={14} />
                <span>1. Personal & Contact Details</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cream-muted)', marginBottom: '4px' }}>
                    Full Legal Name (as per DL) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohit Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cream-muted)', marginBottom: '4px' }}>
                    Mobile Number (+91) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cream-muted)', marginBottom: '4px' }}>
                    Date of Birth (Must be 21+) *
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.66rem', color: calculateAge(dob) >= 21 ? 'var(--color-primary-mint)' : '#F87171', marginTop: '2px', display: 'block' }}>
                    Age: {calculateAge(dob)} years {calculateAge(dob) >= 21 ? '(✓ Statutory Verified)' : '(Must be 21+)'}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cream-muted)', marginBottom: '4px' }}>
                    Emergency SOS Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="Family/kin phone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Fleet & Licensing Section */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--color-card-border)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Truck size={14} />
                <span>2. Vehicle & Fleet Licence</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cream-muted)', marginBottom: '4px' }}>
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Electric 2-Wheeler (EV)">Electric 2-Wheeler (EV)</option>
                    <option value="Motorcycle (ICE)">Motorcycle (ICE)</option>
                    <option value="Scooter (ICE)">Scooter (ICE)</option>
                    <option value="Cargo 3-Wheeler EV">Cargo 3-Wheeler EV</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cream-muted)', marginBottom: '4px' }}>
                    Vehicle Registration No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TS 09 EA 4819"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cream-muted)', marginBottom: '4px' }}>
                    Driving Licence Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TS-092021004819"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                      textTransform: 'uppercase',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cream-muted)', marginBottom: '4px' }}>
                    Assigned Depot / Hub
                  </label>
                  <select
                    value={selectedHub}
                    onChange={(e) => setSelectedHub(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  >
                    {DISPATCH_HUBS.map((h) => (
                      <option key={h.id} value={h.name}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Statutory Compliance Agreement */}
            <div style={{
              background: 'rgba(231, 161, 61, 0.08)',
              border: '1px solid rgba(231, 161, 61, 0.25)',
              borderRadius: '16px',
              padding: '14px 16px',
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <ShieldCheck size={14} />
                <span>3. Telangana State Excise Delivery Directives</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-cream)' }}>
                  <input
                    type="checkbox"
                    checked={agreeAge21}
                    onChange={(e) => setAgreeAge21(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--color-gold)' }}
                  />
                  <span>I declare that I am 21+ years of age and hold a valid, non-expired driving licence in Telangana.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-cream)' }}>
                  <input
                    type="checkbox"
                    checked={agreeDoorstepOtp}
                    onChange={(e) => setAgreeDoorstepOtp(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--color-gold)' }}
                  />
                  <span>I agree to verify the customer's 6-digit OTP code at the doorstep before handing over any sealed alcohol order.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-cream)' }}>
                  <input
                    type="checkbox"
                    checked={agreeZeroConsumption}
                    onChange={(e) => setAgreeZeroConsumption(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--color-gold)' }}
                  />
                  <span>I strictly agree to ZERO personal alcohol consumption or handling impairment while on active dispatch duty.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-cream)' }}>
                  <input
                    type="checkbox"
                    checked={agreeGpsTracking}
                    onChange={(e) => setAgreeGpsTracking(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--color-gold)' }}
                  />
                  <span>I consent to live device GPS telematics streaming during active order transit for state regulatory compliance.</span>
                </label>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: 'linear-gradient(135deg, #F5B24E 0%, #E7A13D 100%)',
                color: '#0E1511',
                fontSize: '0.95rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--glow-gold)',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Processing Onboarding Documents...</span>
                </>
              ) : (
                <>
                  <span>Verify Phone & Complete Onboarding</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ═══════════ STEP 2: OTP VERIFICATION SCREEN ═══════════ */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(231, 161, 61, 0.15)',
              border: '2px solid var(--color-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gold)',
              margin: '0 auto 16px',
            }}>
              <KeyRound size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Confirm Courier Phone Verification
            </h3>

            <p style={{ fontSize: '0.82rem', color: 'var(--color-cream-muted)', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.4 }}>
              Enter the 6-digit OTP code dispatched to <strong style={{ color: '#fff' }}>+91 {mode === 'signup' ? signupPhone : loginPhone}</strong>
            </p>

            {/* Sandbox OTP hint pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(101, 201, 156, 0.12)',
              border: '1px solid rgba(101, 201, 156, 0.3)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 14px',
              fontSize: '0.75rem',
              color: 'var(--color-primary-mint)',
              fontWeight: 800,
              marginBottom: '20px',
            }}>
              <span>⚡ Free Sandbox OTP Code: <strong>123456</strong></span>
            </div>

            {/* 6-box OTP entry */}
            <div
              onPaste={handleOtpPaste}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '22px',
              }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  style={{
                    width: '46px',
                    height: '52px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.55)',
                    border: digit ? '1.5px solid var(--color-gold)' : '1px solid var(--color-card-border)',
                    color: '#fff',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    outline: 'none',
                    boxShadow: digit ? '0 0 12px rgba(231, 161, 61, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: 'linear-gradient(135deg, #F5B24E 0%, #E7A13D 100%)',
                color: '#0E1511',
                fontSize: '0.95rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--glow-gold)',
                marginBottom: '16px',
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Authorizing Courier Access...</span>
                </>
              ) : (
                <>
                  <span>Verify Code & Enter Pilot Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Resend & Back controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <button
                type="button"
                onClick={() => setStep('form')}
                style={{ background: 'none', border: 'none', color: 'var(--color-cream-muted)', cursor: 'pointer' }}
              >
                ← Back to Edit Details
              </button>

              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={() => {
                  setResendTimer(45);
                  setInfoMessage('New OTP re-dispatched (Code: 123456)');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendTimer > 0 ? 'var(--color-cream-muted)' : 'var(--color-gold)',
                  cursor: resendTimer > 0 ? 'default' : 'pointer',
                  fontWeight: 700,
                }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP Code'}
              </button>
            </div>
          </form>
        )}

        {/* ═══════════ STEP 3: SUCCESS ANIMATION ═══════════ */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(101, 201, 156, 0.15)',
              border: '2.5px solid var(--color-primary-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-mint)',
              margin: '0 auto 16px',
              boxShadow: '0 0 24px rgba(101, 201, 156, 0.35)',
            }}>
              <CheckCircle2 size={38} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
              Pilot Authorization Successful!
            </h3>

            <p style={{ fontSize: '0.84rem', color: 'var(--color-cream-muted)', maxWidth: '380px', margin: '0 auto 20px' }}>
              Connected to 10-Minute Hyperlocal Logistics Node. Initializing live GPS telematics stream...
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--color-card-border)',
              borderRadius: '12px',
              padding: '8px 18px',
              fontSize: '0.78rem',
              color: 'var(--color-gold)',
            }}>
              <RefreshCw size={14} className="animate-spin" />
              <span>Redirecting to Live Courier Terminal...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default RiderAuthScreen;
