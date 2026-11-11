import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Mail,
  Lock,
  User,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Car,
  KeyRound,
  Sparkles,
  RefreshCw,
  Store,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { api } from '../../api/client';
import { INITIAL_USER } from '../../data/mockData';

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login', // 'login' | 'signup'
  onAuthSuccess,
  onSwitchView,
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' | 'password'

  // Form states
  const [phone, setPhone] = useState('98490 12891');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [email, setEmail] = useState('kabir.varma@boozer.in');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up states
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [dob, setDob] = useState('1998-04-15');
  const [city, setCity] = useState('Hyderabad (Jubilee Hills Zone)');
  const [referralCode] = useState('SAFERIDE150');
  const [ageConfirmed, setAgeConfirmed] = useState(true);

  // Flow & UI states
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'success'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Calculate age from DOB
  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(dob);
  const isLegalAge = calculatedAge >= 21;

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // 1. Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const targetPhone = mode === 'signup' ? signupPhone : phone;
      if (!targetPhone || targetPhone.replace(/\D/g, '').length < 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number');
        setIsLoading(false);
        return;
      }

      await api.requestOtp(`+91${targetPhone.replace(/\D/g, '')}`);
      setStep('otp');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP / Submit
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter the full 6-digit code');
      setIsLoading(false);
      return;
    }

    try {
      const targetPhone = mode === 'signup' ? signupPhone : phone;
      const res = await api.verifyOtp(`+91${targetPhone.replace(/\D/g, '')}`, enteredOtp);

      const authenticatedUser = {
        id: res?.user?.id || (mode === 'signup' ? `usr-${Date.now()}` : INITIAL_USER.id),
        name: mode === 'signup' ? (fullName || 'New Boozer Member') : (res?.user?.fullName || INITIAL_USER.name),
        fullName: mode === 'signup' ? (fullName || 'New Boozer Member') : (res?.user?.fullName || INITIAL_USER.fullName),
        phone: `+91 ${targetPhone.replace(/\D/g, '')}`,
        kycStatus: mode === 'signup' ? 'PENDING' : (res?.user?.kycStatus || 'VERIFIED'),
        documentType: 'DIGILOCKER_DL',
        maskedDocNumber: 'TS-092015XXXX4819',
        calculatedAge: mode === 'signup' ? calculatedAge : 28,
        activeRideCredit: 150.00,
        deliveryAddress: city ? `${city}, Road No. 36` : INITIAL_USER.deliveryAddress,
        role: 'CUSTOMER'
      };

      setStep('success');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(authenticatedUser);
        onClose();
      }, 900);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid OTP code. Please use sandbox test code 123456');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Password login for Admin/Retailer
  const handlePasswordLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const isRetailer = email.includes('retailer');
      const isAdmin = email.includes('admin') || email.includes('excise');

      const staffUser = {
        id: isRetailer ? 'ret-staff-1' : isAdmin ? 'adm-excise-1' : INITIAL_USER.id,
        name: isRetailer ? 'Vikram Malhotra (Store Manager)' : isAdmin ? 'Excise Commissioner Rao' : INITIAL_USER.name,
        fullName: isRetailer ? 'Vikram Malhotra' : isAdmin ? 'Rao V. Excise Admin' : INITIAL_USER.fullName,
        phone: '+91 98490 12891',
        email,
        kycStatus: 'VERIFIED',
        calculatedAge: 36,
        activeRideCredit: 250.00,
        role: isRetailer ? 'RETAILER' : isAdmin ? 'ADMIN' : 'CUSTOMER'
      };

      if (onSwitchView) {
        if (isRetailer) onSwitchView('retailer');
        else if (isAdmin) onSwitchView('admin');
      }

      setStep('success');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(staffUser);
        onClose();
      }, 700);
    }, 600);
  };

  // 4. Quick Demo Personas
  const handleQuickPersona = (persona) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (persona === 'customer') {
        const cust = {
          ...INITIAL_USER,
          kycStatus: 'VERIFIED'
        };
        if (onSwitchView) onSwitchView('customer');
        if (onAuthSuccess) onAuthSuccess(cust);
      } else if (persona === 'retailer') {
        const retailer = {
          id: 'ret-manager-1',
          name: 'Vikram Malhotra (Jubilee Hills Reserve)',
          fullName: 'Vikram Malhotra',
          phone: '+91 98490 89124',
          kycStatus: 'VERIFIED',
          calculatedAge: 38,
          role: 'RETAILER'
        };
        if (onSwitchView) onSwitchView('retailer');
        if (onAuthSuccess) onAuthSuccess(retailer);
      } else if (persona === 'admin') {
        const adminUser = {
          id: 'adm-tg-1',
          name: 'Telangana State Excise Compliance Officer',
          fullName: 'Sri K. Venkat Rao',
          phone: '+91 98490 00001',
          kycStatus: 'VERIFIED',
          calculatedAge: 45,
          role: 'ADMIN'
        };
        if (onSwitchView) onSwitchView('admin');
        if (onAuthSuccess) onAuthSuccess(adminUser);
      }
      onClose();
    }, 400);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--color-plum-surface)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 24px rgba(101, 201, 156, 0.1)',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--color-card-border)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cream-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Close dialog"
        >
          <X size={16} />
        </button>

        {/* CompareX Signature Brand Header */}
        <div style={{ textAlign: 'left', marginBottom: '22px' }}>
          <p style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: 'var(--color-primary-mint)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            10-Minute Hyperlocal Spirits
          </p>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.2rem',
            fontWeight: 900,
            color: 'var(--color-cream)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>Boozer</span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-primary-mint)',
              display: 'inline-block',
              marginLeft: '2px'
            }}></span>
          </div>
          <p style={{
            fontSize: '0.84rem',
            color: 'var(--color-cream-muted)',
            marginTop: '6px',
            lineHeight: 1.4,
          }}>
            {mode === 'signup'
              ? 'Join Boozer for verified statutory doorstep delivery and ₹150 Safe Ride credits.'
              : 'Sign in to access your orders, safe ride wallet, and instant checkout.'}
          </p>
        </div>

        {/* CompareX Surface Card Form Container */}
        <div style={{
          background: 'var(--color-midnight)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: '16px',
        }}>
          {/* Mode Switcher Tabs (Pill style matching CompareX) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(23, 32, 27, 0.9)',
              padding: '4px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-card-border)',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStep('input');
                setErrorMessage('');
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === 'login' ? 'var(--color-primary-mint)' : 'transparent',
                color: mode === 'login' ? '#0E1511' : 'var(--color-cream-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setStep('input');
                setErrorMessage('');
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === 'signup' ? 'var(--color-primary-mint)' : 'transparent',
                color: mode === 'signup' ? '#0E1511' : 'var(--color-cream-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>Sign Up</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                background: 'rgba(220, 76, 62, 0.12)',
                border: '1px solid rgba(220, 76, 62, 0.35)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                color: '#FCA5A5',
                fontSize: '0.8rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldAlert size={16} color="var(--color-crimson)" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP: SUCCESS ANIMATION */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(5, 150, 105, 0.18)',
                  border: '2px solid var(--color-primary-mint)',
                  color: 'var(--color-primary-mint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 24px rgba(101, 201, 156, 0.35)',
                }}
              >
                <CheckCircle2 size={34} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-cream)' }}>
                {mode === 'signup' ? 'Account Created & Verified!' : 'Welcome back to Boozer!'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-cream-muted)', marginTop: '6px' }}>
                Authentication confirmed · Session unlocked with 256-bit vault
              </p>
            </div>
          )}

          {/* STEP: OTP VERIFICATION */}
          {step === 'otp' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(101, 201, 156, 0.14)',
                    border: '1px solid var(--color-primary-mint)',
                    color: 'var(--color-primary-mint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                  }}
                >
                  <KeyRound size={20} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-cream)' }}>
                  Enter 6-Digit OTP Code
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)', marginTop: '4px' }}>
                  Sent to <strong style={{ color: 'var(--color-primary-mint)' }}>+91 {mode === 'signup' ? signupPhone : phone}</strong>
                </p>
              </div>

              {/* OTP 6-Digit Boxes with CompareX Styling */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '18px',
                }}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '44px',
                      height: '52px',
                      textAlign: 'center',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono-price)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1.5px solid var(--color-card-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-primary-mint)',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary-mint)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-card-border)')}
                  />
                ))}
              </div>

              {/* Quick Sandbox Auto-Fill Helper */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '18px',
                  fontSize: '0.76rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
                  style={{
                    background: 'rgba(101, 201, 156, 0.12)',
                    border: '1px solid rgba(101, 201, 156, 0.3)',
                    color: 'var(--color-primary-mint)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  Auto-fill Test OTP (123456)
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary-mint)',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Resend Code
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, #0D4F3C 0%, #16845B 50%, #4FAF86 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: isLoading ? 'wait' : 'pointer',
                    boxShadow: '0 4px 16px rgba(22, 132, 91, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {isLoading ? <RefreshCw className="spin-slow" size={17} /> : <CheckCircle2 size={17} />}
                  <span>{isLoading ? 'Verifying Code...' : 'Verify & Continue'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('input')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-cream-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                >
                  ← Back to Edit Number
                </button>
              </div>
            </div>
          )}

          {/* STEP: INPUT FORM (LOGIN / SIGN UP) */}
          {step === 'input' && (
            <div>
              {/* SIGN IN FORM */}
              {mode === 'login' && (
                <div>
                  {/* Method selector: OTP vs Password */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '16px',
                      borderBottom: '1px solid var(--color-card-border)',
                      paddingBottom: '8px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setLoginMethod('otp')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: loginMethod === 'otp' ? 'var(--color-primary-mint)' : 'var(--color-cream-muted)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        paddingBottom: '4px',
                        borderBottom: loginMethod === 'otp' ? '2px solid var(--color-primary-mint)' : '2px solid transparent',
                      }}
                    >
                      <Smartphone size={14} />
                      <span>Mobile OTP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoginMethod('password')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: loginMethod === 'password' ? 'var(--color-primary-mint)' : 'var(--color-cream-muted)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        paddingBottom: '4px',
                        borderBottom: loginMethod === 'password' ? '2px solid var(--color-primary-mint)' : '2px solid transparent',
                      }}
                    >
                      <Lock size={14} />
                      <span>Email & Password</span>
                    </button>
                  </div>

                  {loginMethod === 'otp' ? (
                    <form onSubmit={handleSendOtp}>
                      <div style={{ marginBottom: '16px' }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--color-cream-muted)',
                            marginBottom: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Mobile Phone Number
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--color-card-border)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              padding: '10px 12px',
                              background: 'rgba(101, 201, 156, 0.1)',
                              borderRight: '1px solid var(--color-card-border)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              color: 'var(--color-primary-mint)',
                            }}
                          >
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="98490 12891"
                            required
                            style={{
                              flex: 1,
                              padding: '10px 12px',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-cream)',
                              fontSize: '0.92rem',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)', marginTop: '5px' }}>
                          Instant 6-digit verification code will be sent via SMS.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: 'var(--radius-full)',
                          background: 'linear-gradient(135deg, #0D4F3C 0%, #16845B 50%, #4FAF86 100%)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          border: 'none',
                          cursor: isLoading ? 'wait' : 'pointer',
                          boxShadow: '0 4px 16px rgba(22, 132, 91, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginBottom: '16px',
                        }}
                      >
                        {isLoading ? <RefreshCw className="spin-slow" size={17} /> : <ArrowRight size={17} />}
                        <span>{isLoading ? 'Sending Code...' : 'Send Verification OTP'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handlePasswordLogin}>
                      {/* CompareX style TextField for Email */}
                      <div style={{ marginBottom: '12px' }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--color-cream-muted)',
                            marginBottom: '6px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Email Address
                        </label>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--color-card-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0 12px',
                        }}>
                          <Mail size={16} color="var(--color-cream-muted)" style={{ marginRight: '8px' }} />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="staff@boozer.in"
                            required
                            style={{
                              flex: 1,
                              padding: '10px 0',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-cream)',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* CompareX style TextField for Password */}
                      <div style={{ marginBottom: '16px' }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--color-cream-muted)',
                            marginBottom: '6px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Password
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--color-card-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0 12px',
                          }}
                        >
                          <Lock size={16} color="var(--color-cream-muted)" style={{ marginRight: '8px' }} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                              flex: 1,
                              padding: '10px 0',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-cream)',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-cream-muted)',
                              padding: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: 'var(--radius-full)',
                          background: 'linear-gradient(135deg, #0D4F3C 0%, #16845B 50%, #4FAF86 100%)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          border: 'none',
                          cursor: isLoading ? 'wait' : 'pointer',
                          boxShadow: '0 4px 16px rgba(22, 132, 91, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginBottom: '16px',
                        }}
                      >
                        {isLoading ? <RefreshCw className="spin-slow" size={17} /> : <Lock size={17} />}
                        <span>{isLoading ? 'Authenticating...' : 'Sign In as Staff / Admin'}</span>
                      </button>
                    </form>
                  )}

                  {/* Switch to Register Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    color: 'var(--color-cream-muted)',
                    marginBottom: '14px',
                  }}>
                    <span>Don't have an account?</span>
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-mint)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Sign Up
                    </button>
                  </div>

                  {/* Quick Persona Demo Switcher in CompareX Chip Style */}
                  <div
                    style={{
                      borderTop: '1px solid var(--color-card-border)',
                      paddingTop: '12px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-cream-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        marginBottom: '8px',
                      }}
                    >
                      Quick Test Personas (1-Click Instant Login):
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleQuickPersona('customer')}
                        style={{
                          background: 'rgba(101, 201, 156, 0.1)',
                          border: '1px solid rgba(101, 201, 156, 0.3)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 6px',
                          color: 'var(--color-primary-mint)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <User size={14} />
                        <span>Customer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickPersona('retailer')}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--color-card-border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 6px',
                          color: 'var(--color-cream)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Store size={14} />
                        <span>Retailer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickPersona('admin')}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--color-card-border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 6px',
                          color: 'var(--color-cream)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ShieldCheck size={14} />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SIGN UP FORM */}
              {mode === 'signup' && (
                <form onSubmit={handleSendOtp}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--color-cream-muted)',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Full Legal Name
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--color-card-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 10px',
                      }}>
                        <User size={14} color="var(--color-cream-muted)" style={{ marginRight: '6px' }} />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Kabir Varma"
                          required
                          style={{
                            width: '100%',
                            padding: '8px 0',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-cream)',
                            fontSize: '0.86rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--color-cream-muted)',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Mobile Phone
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--color-card-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 10px',
                      }}>
                        <Smartphone size={14} color="var(--color-cream-muted)" style={{ marginRight: '6px' }} />
                        <input
                          type="tel"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          placeholder="98765 43210"
                          required
                          style={{
                            width: '100%',
                            padding: '8px 0',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-cream)',
                            fontSize: '0.86rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth & Legal Age Indicator */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--color-cream-muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        Date of Birth (Statutory 21+ Check)
                      </label>
                      {isLegalAge ? (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-primary-mint)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <ShieldCheck size={12} />
                          <span>Age: {calculatedAge} Yrs (Legal)</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-crimson)',
                            fontWeight: 700,
                          }}
                        >
                          Age: {calculatedAge} Yrs (Under 21)
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: isLegalAge ? '1px solid var(--color-card-border)' : '1px solid var(--color-crimson)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 10px',
                    }}>
                      <Calendar size={14} color="var(--color-cream-muted)" style={{ marginRight: '6px' }} />
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 0',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-cream)',
                          fontSize: '0.86rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* City & Delivery Zone */}
                  <div style={{ marginBottom: '10px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--color-cream-muted)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Licensed Delivery Zone
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--color-card-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-cream)',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    >
                      <option value="Hyderabad (Jubilee Hills Zone)" style={{ background: '#17201B' }}>Hyderabad · Jubilee Hills Zone (Active Pilot)</option>
                      <option value="Hyderabad (Banjara Hills Zone)" style={{ background: '#17201B' }}>Hyderabad · Banjara Hills Zone (Active Pilot)</option>
                      <option value="Hyderabad (Hitec City Zone)" style={{ background: '#17201B' }}>Hyderabad · Hitec City / Gachibowli Zone</option>
                      <option value="Bengaluru (Indiranagar Zone)" style={{ background: '#17201B' }}>Bengaluru · Indiranagar Zone (Waitlist)</option>
                    </select>
                  </div>

                  {/* CompareX Safe Ride Voucher Promo Box */}
                  <div
                    style={{
                      background: 'rgba(5, 150, 105, 0.12)',
                      border: '1px solid rgba(5, 150, 105, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Car size={18} color="var(--color-primary-mint)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--color-primary-mint)' }}>
                        ₹150 Safe Ride Home Voucher Applied
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-cream-muted)' }}>
                        Redeemable on Uber, Ola, or Rapido after ordering
                      </div>
                    </div>
                    <span
                      style={{
                        background: 'var(--color-primary-mint)',
                        color: '#0E1511',
                        fontWeight: 900,
                        fontSize: '0.66rem',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-xs)',
                      }}
                    >
                      {referralCode}
                    </span>
                  </div>

                  {/* Statutory Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '14px' }}>
                    <input
                      type="checkbox"
                      id="ageCheck"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                      required
                      style={{ marginTop: '3px', accentColor: 'var(--color-primary-mint)' }}
                    />
                    <label htmlFor="ageCheck" style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', lineHeight: 1.35 }}>
                      I solemnly confirm that I am <strong>21+ years of age</strong> under State Excise Rules, agree to age KYC, and consent to physical doorstep ID check.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !isLegalAge || !ageConfirmed}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-full)',
                      background:
                        isLegalAge && ageConfirmed
                          ? 'linear-gradient(135deg, #0D4F3C 0%, #16845B 50%, #4FAF86 100%)'
                          : 'rgba(255,255,255,0.06)',
                      color: isLegalAge && ageConfirmed ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      border: 'none',
                      cursor: isLegalAge && ageConfirmed ? 'pointer' : 'not-allowed',
                      boxShadow: isLegalAge && ageConfirmed ? '0 4px 16px rgba(22, 132, 91, 0.4)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    {isLoading ? <RefreshCw className="spin-slow" size={17} /> : <Sparkles size={17} />}
                    <span>{isLoading ? 'Sending Code...' : 'Register & Claim ₹150 Safe Ride Credit'}</span>
                  </button>

                  {/* Switch to Login Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    color: 'var(--color-cream-muted)',
                  }}>
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-mint)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AuthModal;
