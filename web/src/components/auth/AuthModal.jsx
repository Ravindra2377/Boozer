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
  LogOut,
  RefreshCw,
  Store,
  ChevronRight
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
  const [referralCode, setReferralCode] = useState('SAFERIDE150');
  const [ageConfirmed, setAgeConfirmed] = useState(true);

  // Flow & UI states
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'success'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(30);

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
      setCountdown(30);
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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          background: 'linear-gradient(180deg, #161224 0%, #0D0B14 100%)',
          border: '1px solid rgba(231, 161, 61, 0.3)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95), 0 0 40px rgba(112, 43, 192, 0.25)',
          padding: '28px',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
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
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.7rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              color: 'var(--color-cream)',
            }}
          >
            <span>B</span>
            <span
              style={{
                display: 'inline-flex',
                width: '26px',
                height: '30px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 40 46" style={{ width: '100%', height: '100%' }}>
                <path
                  d="M6 4 L34 4 L31 40 C31 42 29 44 27 44 L13 44 C11 44 9 42 9 40 Z"
                  fill="none"
                  stroke="#E7A13D"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 18 L31.5 18 L29.5 39 C29.5 41 28 42 26 42 L14 42 C12 42 10.5 41 10.5 39 Z"
                  fill="#E7A13D"
                />
                <rect x="14" y="24" width="10" height="10" rx="1.5" fill="rgba(255,255,255,0.45)" />
              </svg>
            </span>
            <span>ZER</span>
          </div>
          <p
            style={{
              fontSize: '0.76rem',
              color: 'var(--color-gold)',
              marginTop: '4px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Midnight Gold × Neon Luxury
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)', marginTop: '4px' }}>
            {mode === 'signup'
              ? 'Create your verified account for legal doorstep delivery & safe ride credits'
              : 'Sign in to access your orders, safe ride wallet & fast checkout'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(0,0,0,0.4)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.08)',
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
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: mode === 'login' ? 'var(--color-gold)' : 'transparent',
              color: mode === 'login' ? '#09090E' : 'var(--color-cream-muted)',
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
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: mode === 'signup' ? 'var(--color-gold)' : 'transparent',
              color: mode === 'signup' ? '#09090E' : 'var(--color-cream-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#FCA5A5',
              fontSize: '0.8rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldAlert size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP: SUCCESS ANIMATION */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(42, 157, 143, 0.2)',
                border: '2px solid var(--color-teal)',
                color: 'var(--color-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 25px rgba(42, 157, 143, 0.4)',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-cream)' }}>
              {mode === 'signup' ? 'Account Created & Verified!' : 'Welcome to BOOZER!'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-cream-muted)', marginTop: '6px' }}>
              Authentication confirmed · Session unlocked with 256-bit luxury vault
            </p>
          </div>
        )}

        {/* STEP: OTP VERIFICATION */}
        {step === 'otp' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(231, 161, 61, 0.15)',
                  border: '1px solid var(--color-gold)',
                  color: 'var(--color-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <KeyRound size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-cream)' }}>
                Enter 6-Digit OTP Code
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-muted)', marginTop: '4px' }}>
                Sent to <strong style={{ color: 'var(--color-gold)' }}>+91 {mode === 'signup' ? signupPhone : phone}</strong>
              </p>
            </div>

            {/* OTP 6-Digit Boxes */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '20px',
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
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono-price)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid rgba(231, 161, 61, 0.3)',
                    borderRadius: '10px',
                    color: 'var(--color-gold)',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-gold)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(231, 161, 61, 0.3)')}
                />
              ))}
            </div>

            {/* Quick Sandbox Auto-Fill Helper */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                fontSize: '0.76rem',
              }}
            >
              <button
                type="button"
                onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
                style={{
                  background: 'rgba(112, 43, 192, 0.2)',
                  border: '1px solid rgba(112, 43, 192, 0.4)',
                  color: 'var(--color-purple-light)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                }}
              >
                Auto-fill Sandbox OTP (123456)
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-gold)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Resend Code
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, var(--color-gold) 0%, #D48924 100%)',
                  color: '#09090E',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: isLoading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 18px rgba(231, 161, 61, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isLoading ? <RefreshCw className="spin-slow" size={18} /> : <CheckCircle2 size={18} />}
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
                    gap: '10px',
                    marginBottom: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    paddingBottom: '10px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: loginMethod === 'otp' ? 'var(--color-gold)' : 'var(--color-cream-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      paddingBottom: '4px',
                      borderBottom: loginMethod === 'otp' ? '2px solid var(--color-gold)' : '2px solid transparent',
                    }}
                  >
                    <Smartphone size={15} />
                    <span>Mobile OTP (Customer)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginMethod('password')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: loginMethod === 'password' ? 'var(--color-gold)' : 'var(--color-cream-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      paddingBottom: '4px',
                      borderBottom: loginMethod === 'password' ? '2px solid var(--color-gold)' : '2px solid transparent',
                    }}
                  >
                    <Lock size={14} />
                    <span>Email & Password (Staff/Admin)</span>
                  </button>
                </div>

                {loginMethod === 'otp' ? (
                  <form onSubmit={handleSendOtp}>
                    <div style={{ marginBottom: '18px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--color-cream-muted)',
                          marginBottom: '8px',
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
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(231, 161, 61, 0.3)',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            padding: '12px 14px',
                            background: 'rgba(231, 161, 61, 0.1)',
                            borderRight: '1px solid rgba(231, 161, 61, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: 'var(--color-gold)',
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
                            padding: '12px 14px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-cream)',
                            fontSize: '0.95rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', marginTop: '6px' }}>
                        We will send a 6-digit statutory verification OTP via SMS.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, var(--color-gold) 0%, #D48924 100%)',
                        color: '#09090E',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        border: 'none',
                        cursor: isLoading ? 'wait' : 'pointer',
                        boxShadow: '0 4px 18px rgba(231, 161, 61, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                      }}
                    >
                      {isLoading ? <RefreshCw className="spin-slow" size={18} /> : <ArrowRight size={18} />}
                      <span>{isLoading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordLogin}>
                    <div style={{ marginBottom: '14px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--color-cream-muted)',
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@boozer.in"
                        required
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(231, 161, 61, 0.3)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-cream)',
                          fontSize: '0.92rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.78rem',
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
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(231, 161, 61, 0.3)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          style={{
                            flex: 1,
                            padding: '12px 14px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-cream)',
                            fontSize: '0.92rem',
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
                            padding: '0 12px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, var(--color-gold) 0%, #D48924 100%)',
                        color: '#09090E',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        border: 'none',
                        cursor: isLoading ? 'wait' : 'pointer',
                        boxShadow: '0 4px 18px rgba(231, 161, 61, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                      }}
                    >
                      {isLoading ? <RefreshCw className="spin-slow" size={18} /> : <Lock size={18} />}
                      <span>{isLoading ? 'Authenticating...' : 'Sign In as Staff / Admin'}</span>
                    </button>
                  </form>
                )}

                {/* Quick Persona Demo Switcher */}
                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '14px',
                    marginTop: '10px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.72rem',
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
                        background: 'rgba(231, 161, 61, 0.1)',
                        border: '1px solid rgba(231, 161, 61, 0.25)',
                        borderRadius: '8px',
                        padding: '8px 6px',
                        color: 'var(--color-gold)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <User size={15} />
                      <span>Customer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickPersona('retailer')}
                      style={{
                        background: 'rgba(112, 43, 192, 0.12)',
                        border: '1px solid rgba(112, 43, 192, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 6px',
                        color: 'var(--color-purple-light)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Store size={15} />
                      <span>Retailer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickPersona('admin')}
                      style={{
                        background: 'rgba(42, 157, 143, 0.12)',
                        border: '1px solid rgba(42, 157, 143, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 6px',
                        color: 'var(--color-teal)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ShieldCheck size={15} />
                      <span>Excise Admin</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSendOtp}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--color-cream-muted)',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Kabir Varma"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(231, 161, 61, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-cream)',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--color-cream-muted)',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Mobile Phone
                    </label>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="98765 43210"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(231, 161, 61, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-cream)',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Date of Birth & Legal Age Indicator */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label
                      style={{
                        fontSize: '0.74rem',
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
                          color: 'var(--color-teal)',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
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
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: isLegalAge ? '1px solid rgba(42, 157, 143, 0.4)' : '1px solid var(--color-crimson)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-cream)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* City & Delivery Zone */}
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: 'var(--color-cream-muted)',
                      marginBottom: '6px',
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
                      padding: '10px 12px',
                      background: '#151122',
                      border: '1px solid rgba(231, 161, 61, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-cream)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Hyderabad (Jubilee Hills Zone)">Hyderabad · Jubilee Hills Zone (Active Pilot)</option>
                    <option value="Hyderabad (Banjara Hills Zone)">Hyderabad · Banjara Hills Zone (Active Pilot)</option>
                    <option value="Hyderabad (Hitec City Zone)">Hyderabad · Hitec City / Gachibowli Zone</option>
                    <option value="Bengaluru (Indiranagar Zone)">Bengaluru · Indiranagar Zone (Waitlist)</option>
                  </select>
                </div>

                {/* Safe Ride Voucher Promo */}
                <div
                  style={{
                    background: 'rgba(231, 161, 61, 0.08)',
                    border: '1px dashed rgba(231, 161, 61, 0.35)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Car size={20} color="var(--color-gold)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                      ₹150 Safe Ride Home Voucher Applied
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-cream-muted)' }}>
                      Redeemable on Uber, Ola, or Rapido after ordering
                    </div>
                  </div>
                  <span
                    style={{
                      background: 'var(--color-gold)',
                      color: '#09090E',
                      fontWeight: 900,
                      fontSize: '0.68rem',
                      padding: '3px 7px',
                      borderRadius: '4px',
                    }}
                  >
                    {referralCode}
                  </span>
                </div>

                {/* Statutory Checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '18px' }}>
                  <input
                    type="checkbox"
                    id="ageCheck"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    required
                    style={{ marginTop: '3px', accentColor: 'var(--color-gold)' }}
                  />
                  <label htmlFor="ageCheck" style={{ fontSize: '0.74rem', color: 'var(--color-cream-muted)', lineHeight: 1.4 }}>
                    I solemnly confirm that I am <strong>21+ years of age</strong> under State Excise Rules, agree to DigiLocker age KYC, and consent to physical doorstep verification.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isLegalAge || !ageConfirmed}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background:
                      isLegalAge && ageConfirmed
                        ? 'linear-gradient(135deg, var(--color-gold) 0%, #D48924 100%)'
                        : 'rgba(255,255,255,0.1)',
                    color: isLegalAge && ageConfirmed ? '#09090E' : 'rgba(255,255,255,0.4)',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    border: 'none',
                    cursor: isLegalAge && ageConfirmed ? 'pointer' : 'not-allowed',
                    boxShadow: isLegalAge && ageConfirmed ? '0 4px 18px rgba(231, 161, 61, 0.35)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {isLoading ? <RefreshCw className="spin-slow" size={18} /> : <Sparkles size={18} />}
                  <span>{isLoading ? 'Sending Verification OTP...' : 'Register & Claim ₹150 Safe Ride Credit'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Guarantee */}
        <div
          style={{
            marginTop: '18px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.7rem',
            color: 'var(--color-cream-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} />
            <span>256-Bit Encrypted</span>
          </div>
          <span>DPDP Act 2023 Compliant</span>
          <span>State Excise Licensed</span>
        </div>
      </div>
    </div>
  );
}
export default AuthModal;
