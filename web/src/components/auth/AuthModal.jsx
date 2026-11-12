import React, { useState, useEffect } from 'react';
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
  Check,
  Wine,
  Clock,
  Zap,
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

  // Form inputs
  const [phone, setPhone] = useState('98490 12891');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [password, setPassword] = useState('Boozer@2026');
  const [confirmPassword, setConfirmPassword] = useState('Boozer@2026');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up details
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [dob, setDob] = useState('1998-04-15');
  const [ageConfirmed, setAgeConfirmed] = useState(true);

  // Flow states
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'success'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(45);

  useEffect(() => {
    setMode(initialMode);
    setStep('input');
    setErrorMessage('');
  }, [initialMode, isOpen]);

  // Resend countdown timer
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

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

  // Password rules validation (CompareX RegisterScreen pattern)
  const pwdLengthValid = password.length >= 8;
  const pwdUpperValid = /[A-Z]/.test(password);
  const pwdNumValid = /\d/.test(password);
  const pwdSpecialValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const pwdMatches = password === confirmPassword && confirmPassword.length > 0;
  const isPasswordValid = pwdLengthValid && pwdUpperValid && pwdNumValid && pwdSpecialValid;

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
      setResendTimer(45);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP
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
        activeRideCredit: 150.0,
        deliveryAddress: INITIAL_USER.deliveryAddress,
        role: 'CUSTOMER',
      };

      setStep('success');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(authenticatedUser);
        onClose();
      }, 850);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid code. Use test code 123456');
    } finally {
      setIsLoading(false);
    }
  };


  // 4. Quick Persona Selection
  const handleQuickPersona = (persona) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (persona === 'customer') {
        const cust = {
          ...INITIAL_USER,
          kycStatus: 'VERIFIED',
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
          role: 'RETAILER',
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
          role: 'ADMIN',
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
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 10, 8, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'linear-gradient(165deg, rgba(23, 32, 27, 0.98) 0%, rgba(14, 21, 17, 0.99) 100%)',
          border: '1px solid rgba(101, 201, 156, 0.22)',
          borderRadius: '24px',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.85), 0 0 40px rgba(22, 132, 91, 0.2)',
          padding: '32px 30px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(101, 201, 156, 0.16) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
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

        {/* Brand Header */}
        <div style={{ textAlign: 'left', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: 'var(--color-primary-mint)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Zap size={12} />
              10-Minute Hyperlocal Spirits
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.4rem',
              fontWeight: 900,
              color: 'var(--color-cream)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Boozer</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--color-primary-mint)',
                boxShadow: '0 0 12px var(--color-primary-mint)',
                display: 'inline-block',
                marginLeft: '2px',
              }}
            />
          </div>

          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--color-cream-muted)',
              marginTop: '6px',
              lineHeight: 1.45,
            }}
          >
            {mode === 'signup'
              ? 'Join Boozer for verified doorstep delivery & ₹150 Safe Ride Home credits on Uber/Ola.'
              : 'Sign in to access your orders, saved addresses, and express 10-minute dispatch.'}
          </p>
        </div>

        {/* Sliding Pill Tab Switcher (CompareX Signature Style) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(14, 21, 17, 0.95)',
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
              padding: '9px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: mode === 'login' ? 'var(--color-primary-mint)' : 'transparent',
              color: mode === 'login' ? '#0E1511' : 'var(--color-cream-muted)',
              boxShadow: mode === 'login' ? '0 4px 14px rgba(101, 201, 156, 0.35)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Lock size={14} />
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
              padding: '9px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: mode === 'signup' ? 'var(--color-primary-mint)' : 'transparent',
              color: mode === 'signup' ? '#0E1511' : 'var(--color-cream-muted)',
              boxShadow: mode === 'signup' ? '0 4px 14px rgba(101, 201, 156, 0.35)' : 'none',
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
              background: 'rgba(220, 76, 62, 0.12)',
              border: '1px solid rgba(220, 76, 62, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: '#FCA5A5',
              fontSize: '0.82rem',
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

        {/* STEP 1: SUCCESS ANIMATION */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '36px 10px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(5, 150, 105, 0.2)',
                border: '2px solid var(--color-primary-mint)',
                color: 'var(--color-primary-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 32px rgba(101, 201, 156, 0.45)',
              }}
            >
              <CheckCircle2 size={38} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-cream)' }}>
              {mode === 'signup' ? 'Account Created & Verified!' : 'Welcome back to Boozer!'}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--color-cream-muted)', marginTop: '8px' }}>
              Redirecting you to the premium catalog...
            </p>
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(101, 201, 156, 0.12)',
                  color: 'var(--color-primary-mint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <KeyRound size={22} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-cream)' }}>
                Enter 6-Digit Code
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-cream-muted)', marginTop: '4px' }}>
                Dispatched to <strong style={{ color: 'var(--color-primary-mint)' }}>+91 {mode === 'signup' ? signupPhone : phone}</strong>
              </p>
            </div>

            {/* OTP Boxes */}
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
                    width: '46px',
                    height: '54px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1.5px solid var(--color-card-border)',
                    borderRadius: '12px',
                    color: 'var(--color-primary-mint)',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary-mint)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-card-border)')}
                />
              ))}
            </div>

            {/* Quick Actions / Countdown */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                fontSize: '0.78rem',
              }}
            >
              <button
                type="button"
                onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
                style={{
                  background: 'rgba(101, 201, 156, 0.12)',
                  border: '1px solid rgba(101, 201, 156, 0.3)',
                  color: 'var(--color-primary-mint)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                }}
              >
                Auto-fill Code (123456)
              </button>

              <button
                type="button"
                onClick={() => resendTimer === 0 && handleSendOtp()}
                disabled={resendTimer > 0}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: resendTimer > 0 ? 'var(--color-cream-muted)' : 'var(--color-primary-mint)',
                  cursor: resendTimer > 0 ? 'default' : 'pointer',
                  fontWeight: 700,
                }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
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
                  padding: '13px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #0D4F3C 0%, #16845B 50%, #4FAF86 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: isLoading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 20px rgba(22, 132, 91, 0.45)',
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
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: '6px',
                  textAlign: 'center',
                }}
              >
                ← Back to Edit Number
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MAIN INPUT FORMS */}
        {step === 'input' && (
          <div>
            {/* ─── SIGN IN FORM (100% Mobile Phone OTP Verified) ─── */}
            {mode === 'login' && (
              <div>
                <form onSubmit={handleSendOtp}>
                  <div style={{ marginBottom: '16px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.74rem',
                        fontWeight: 800,
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
                          padding: '12px 14px',
                          background: 'rgba(101, 201, 156, 0.08)',
                          borderRight: '1px solid var(--color-card-border)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.88rem',
                          fontWeight: 800,
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
                          padding: '12px 14px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-cream)',
                          fontSize: '0.96rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-cream-muted)', marginTop: '6px' }}>
                      We will send a 6-digit one-time password via SMS. Phone numbers are verified directly with State Excise compliance.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, #0D4F3C 0%, #16845B 50%, #4FAF86 100%)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      border: 'none',
                      cursor: isLoading ? 'wait' : 'pointer',
                      boxShadow: '0 4px 18px rgba(22, 132, 91, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    {isLoading ? <RefreshCw className="spin-slow" size={17} /> : <ArrowRight size={17} />}
                    <span>{isLoading ? 'Sending Code...' : 'Continue with OTP →'}</span>
                  </button>
                </form>

                {/* CompareX Inspired Demo Accounts Bar */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(101, 201, 156, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    marginTop: '16px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: 'var(--color-primary-mint)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>⚡ Quick Test Personas (One-Tap Login)</span>
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickPersona('customer')}
                      style={{
                        background: 'rgba(101, 201, 156, 0.12)',
                        border: '1px solid rgba(101, 201, 156, 0.35)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 4px',
                        color: 'var(--color-primary-mint)',
                        fontSize: '0.74rem',
                        fontWeight: 800,
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
                        padding: '8px 4px',
                        color: 'var(--color-cream)',
                        fontSize: '0.74rem',
                        fontWeight: 800,
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
                        padding: '8px 4px',
                        color: 'var(--color-cream)',
                        fontSize: '0.74rem',
                        fontWeight: 800,
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

            {/* ─── SIGN UP (CREATE ACCOUNT) FORM ─── */}
            {mode === 'signup' && (
              <form onSubmit={handleSendOtp}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  {/* Full Name */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: 'var(--color-cream-muted)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Full Legal Name
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--color-card-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 10px',
                      }}
                    >
                      <User size={14} color="var(--color-cream-muted)" style={{ marginRight: '6px' }} />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Kabir Varma"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 0',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-cream)',
                          fontSize: '0.86rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: 'var(--color-cream-muted)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Mobile Phone
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--color-card-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 10px',
                      }}
                    >
                      <Smartphone size={14} color="var(--color-cream-muted)" style={{ marginRight: '6px' }} />
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="98765 43210"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 0',
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

                {/* Password Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: 'var(--color-cream-muted)',
                        marginBottom: '4px',
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
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 10px',
                      }}
                    >
                      <Lock size={14} color="var(--color-cream-muted)" style={{ marginRight: '6px' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 0',
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
                        fontWeight: 800,
                        color: 'var(--color-cream-muted)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Confirm Password
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: pwdMatches ? '1px solid var(--color-primary-mint)' : '1px solid var(--color-card-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 10px',
                      }}
                    >
                      <ShieldCheck size={14} color={pwdMatches ? 'var(--color-primary-mint)' : 'var(--color-cream-muted)'} style={{ marginRight: '6px' }} />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 0',
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

                {/* CompareX Password Strength Checklist */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px 10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '8px 10px',
                    marginBottom: '12px',
                    fontSize: '0.68rem',
                  }}
                >
                  <span style={{ color: pwdLengthValid ? 'var(--color-primary-mint)' : 'var(--color-cream-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {pwdLengthValid ? '✓' : '○'} 8-16 characters
                  </span>
                  <span style={{ color: pwdUpperValid ? 'var(--color-primary-mint)' : 'var(--color-cream-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {pwdUpperValid ? '✓' : '○'} 1 Uppercase (A-Z)
                  </span>
                  <span style={{ color: pwdNumValid ? 'var(--color-primary-mint)' : 'var(--color-cream-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {pwdNumValid ? '✓' : '○'} 1 Number (0-9)
                  </span>
                  <span style={{ color: pwdSpecialValid ? 'var(--color-primary-mint)' : 'var(--color-cream-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {pwdSpecialValid ? '✓' : '○'} 1 Special symbol
                  </span>
                </div>

                {/* Date of Birth & Legal Age Indicator */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: 'var(--color-cream-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Date of Birth (Statutory 21+ Age Check)
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
                        Age: {calculatedAge} Yrs (Must be 21+)
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: isLegalAge ? '1px solid var(--color-card-border)' : '1px solid var(--color-crimson)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 10px',
                    }}
                  >
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
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                </div>

                {/* Safe Ride Voucher Applied */}
                <div
                  style={{
                    background: 'rgba(101, 201, 156, 0.08)',
                    border: '1px solid rgba(101, 201, 156, 0.28)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
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
                      padding: '3px 7px',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    SAFERIDE150
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
                    I solemnly confirm that I am <strong>21+ years of age</strong> under State Excise Rules, agree to KYC age verification, and consent to physical doorstep ID check.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isLegalAge || !ageConfirmed || !isPasswordValid || !pwdMatches}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 'var(--radius-full)',
                    background:
                      isLegalAge && ageConfirmed && isPasswordValid && pwdMatches
                        ? 'linear-gradient(135deg, #0D4F3C 0%, #16845B 50%, #4FAF86 100%)'
                        : 'rgba(255,255,255,0.06)',
                    color: isLegalAge && ageConfirmed && isPasswordValid && pwdMatches ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    border: 'none',
                    cursor: isLegalAge && ageConfirmed && isPasswordValid && pwdMatches ? 'pointer' : 'not-allowed',
                    boxShadow: isLegalAge && ageConfirmed && isPasswordValid && pwdMatches ? '0 4px 18px rgba(22, 132, 91, 0.4)' : 'none',
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
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
