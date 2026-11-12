import React, { useState, useEffect } from 'react';
import BoozerNeonLogo from '../BoozerNeonLogo';
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
  MapPin,
  FileText,
  Building2,
  Bike,
} from 'lucide-react';
import { api } from '../../api/client';
import { INITIAL_USER } from '../../data/mockData';
import {
  isFirebaseConfigured,
  setupRecaptcha,
  sendFirebasePhoneOtp,
  verifyFirebasePhoneOtp,
} from '../../services/firebase';

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

  // Account Type Switcher for Registration: 'customer' | 'retailer'
  const [accountType, setAccountType] = useState('customer');

  // Customer Sign up details
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [dob, setDob] = useState('1998-04-15');
  const [ageConfirmed, setAgeConfirmed] = useState(true);

  // Retailer Sign up details
  const [storeName, setStoreName] = useState('Jubilee Hills Reserve Spirits');
  const [licenseeName, setLicenseeName] = useState('Vikram Malhotra');
  const [licenseNumber, setLicenseNumber] = useState('TS/EXCISE/HYD/2026/0481');
  const [gstin, setGstin] = useState('36AAACB1234D1Z5');
  const [storeAddress, setStoreAddress] = useState('Road No. 36, Jubilee Hills, Hyderabad - 500033');
  const [retailerPhone, setRetailerPhone] = useState('98490 89124');
  const [retailerDeclared, setRetailerDeclared] = useState(true);

  // Flow states
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'success'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(45);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    setMode(initialMode);
    setStep('input');
    setErrorMessage('');
    setInfoMessage('');
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

  // 1. Send OTP (Google Firebase Phone Auth + Sandbox Fallback)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const targetPhone = mode === 'signup'
        ? (accountType === 'retailer' ? retailerPhone : signupPhone)
        : phone;
      if (!targetPhone || targetPhone.replace(/\D/g, '').length < 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number');
        setIsLoading(false);
        return;
      }

      const normalizedPhone = `+91${targetPhone.replace(/\D/g, '').slice(-10)}`;

      if (isFirebaseConfigured()) {
        try {
          const res = await sendFirebasePhoneOtp(normalizedPhone);
          setConfirmationResult(res.confirmationResult);
          setStep('otp');
          setResendTimer(45);
          return;
        } catch (firebaseErr) {
          console.warn('[BOOZER FIREBASE] Firebase delivery notice:', firebaseErr);
          // If billing is not enabled on Firebase Spark tier, automatically fall back to sandbox test OTP
          setConfirmationResult(null);
          await api.requestOtp(normalizedPhone);
          setStep('otp');
          setResendTimer(45);
          setErrorMessage('');
          setInfoMessage('Spark Plan notice: Test OTP 123456 is auto-filled below. (To send cellular SMS, add your number under "Phone numbers for testing" in Firebase Console).');
          return;
        }
      }

      // Default sandbox/local fallback
      await api.requestOtp(normalizedPhone);
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
      const targetPhone = mode === 'signup'
        ? (accountType === 'retailer' ? retailerPhone : signupPhone)
        : phone;
      let authenticatedPhone = `+91 ${targetPhone.replace(/\D/g, '').slice(-10)}`;
      let authenticatedUid = null;

      if (confirmationResult) {
        const verifyRes = await verifyFirebasePhoneOtp(confirmationResult, enteredOtp);
        authenticatedUid = verifyRes.user?.uid;
        if (verifyRes.user?.phoneNumber) {
          authenticatedPhone = verifyRes.user.phoneNumber;
        }
      } else {
        await api.verifyOtp(authenticatedPhone, enteredOtp);
      }

      if (mode === 'signup' && accountType === 'retailer') {
        const authenticatedRetailer = {
          id: authenticatedUid || `ret-${Date.now()}`,
          name: licenseeName || 'Vikram Malhotra',
          fullName: licenseeName || 'Vikram Malhotra',
          storeName: storeName || 'Jubilee Hills Reserve Spirits',
          licenseNumber: licenseNumber || 'TS/EXCISE/HYD/2026/0481',
          gstin: gstin || '36AAACB1234D1Z5',
          storeAddress: storeAddress || 'Road No. 36, Jubilee Hills, Hyderabad - 500033',
          phone: authenticatedPhone,
          kycStatus: 'VERIFIED',
          role: 'RETAILER',
          calculatedAge: 38,
        };

        setStep('success');
        setTimeout(() => {
          if (onSwitchView) onSwitchView('retailer');
          if (onAuthSuccess) onAuthSuccess(authenticatedRetailer);
          onClose();
        }, 850);
        return;
      }

      const authenticatedUser = {
        id: authenticatedUid || (mode === 'signup' ? `usr-${Date.now()}` : INITIAL_USER.id),
        name: mode === 'signup' ? (fullName || 'New Boozer Member') : INITIAL_USER.name,
        fullName: mode === 'signup' ? (fullName || 'New Boozer Member') : INITIAL_USER.fullName,
        phone: authenticatedPhone,
        kycStatus: mode === 'signup' ? 'PENDING' : 'VERIFIED',
        documentType: 'DIGILOCKER_DL',
        maskedDocNumber: 'TS-092015XXXX4819',
        calculatedAge: mode === 'signup' ? calculatedAge : 28,
        activeRideCredit: 150.0,
        deliveryAddress: INITIAL_USER.deliveryAddress,
        role: 'CUSTOMER',
      };

      setStep('success');
      setTimeout(() => {
        if (onSwitchView) onSwitchView('customer');
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
        background: 'rgba(15, 23, 20, 0.65)',
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
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(175deg, #FFFFFF 0%, #FAFCFA 100%)',
          border: '1px solid #DFE6E1',
          borderRadius: '24px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.14), 0 4px 20px rgba(22, 132, 91, 0.08)',
          padding: '30px 28px',
          position: 'relative',
          color: '#18201C',
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
            background: 'radial-gradient(circle, rgba(22, 132, 91, 0.08) 0%, transparent 70%)',
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
            background: '#F1F4F1',
            border: '1px solid #DFE6E1',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#66706A',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Close dialog"
        >
          <X size={16} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'left', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#16845B',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(22, 132, 91, 0.08)',
                border: '1px solid rgba(22, 132, 91, 0.22)',
                padding: '3px 9px',
                borderRadius: '9999px',
              }}
            >
              <Zap size={12} />
              10-Minute Hyperlocal Spirits
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '4px',
              marginBottom: '4px',
            }}
          >
            <BoozerNeonLogo variant="solid" solidColor="#16845B" height={48} />
          </div>

          <p
            style={{
              fontSize: '0.84rem',
              color: '#66706A',
              marginTop: '8px',
              lineHeight: 1.45,
            }}
          >
            {mode === 'signup'
              ? accountType === 'retailer'
                ? 'Onboard your licensed A4 liquor establishment into Boozer’s 10-minute hyperlocal dispatch grid.'
                : accountType === 'rider'
                ? 'Join Boozer’s express courier fleet. Instant dispatch batches, weekly payouts, and ₹85/drop.'
                : 'Join Boozer for verified doorstep delivery & ₹150 Safe Ride Home credits on Uber/Ola.'
              : 'Sign in to access your orders, saved addresses, and express 10-minute dispatch.'}
          </p>

        </div>

        {/* Invisible reCAPTCHA container for Google Firebase Phone Auth */}
        <div id="recaptcha-container"></div>

        {/* Sliding Pill Tab Switcher (CompareX Signature Style) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#F1F4F1',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #DFE6E1',
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
              background: mode === 'login' ? '#16845B' : 'transparent',
              color: mode === 'login' ? '#FFFFFF' : '#66706A',
              boxShadow: mode === 'login' ? '0 2px 10px rgba(22, 132, 91, 0.35)' : 'none',
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
              background: mode === 'signup' ? '#16845B' : 'transparent',
              color: mode === 'signup' ? '#FFFFFF' : '#66706A',
              boxShadow: mode === 'signup' ? '0 2px 10px rgba(22, 132, 91, 0.35)' : 'none',
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

        {/* Info / Notice Banner */}
        {infoMessage && (
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: '#92400E',
              fontSize: '0.8rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              lineHeight: 1.4,
            }}
          >
            <Sparkles size={16} color="#D97706" style={{ flexShrink: 0 }} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div
            style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: '#B91C1C',
              fontSize: '0.82rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldAlert size={16} color="#DC2626" />
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
                background: 'rgba(22, 132, 91, 0.12)',
                border: '2px solid #16845B',
                color: '#16845B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 24px rgba(22, 132, 91, 0.25)',
              }}
            >
              <CheckCircle2 size={38} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18201C' }}>
              {mode === 'signup'
                ? accountType === 'retailer'
                  ? 'Licensed Outlet Registered & Verified!'
                  : 'Account Created & Verified!'
                : 'Welcome back to Boozer!'}
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#66706A', marginTop: '8px' }}>
              {mode === 'signup' && accountType === 'retailer'
                ? `Opening Retailer Dispatch Terminal for ${storeName || 'your outlet'}...`
                : 'Redirecting you to the premium catalog...'}
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
                  background: 'rgba(22, 132, 91, 0.10)',
                  color: '#16845B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <KeyRound size={22} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#18201C' }}>
                Enter 6-Digit Code
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#66706A', marginTop: '4px' }}>
                Dispatched to <strong style={{ color: '#16845B' }}>+91 {mode === 'signup' ? (accountType === 'retailer' ? retailerPhone : signupPhone) : phone}</strong>
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
                    background: '#F7F8F7',
                    border: '1.5px solid #DFE6E1',
                    borderRadius: '12px',
                    color: '#16845B',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16845B';
                    e.target.style.background = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#DFE6E1';
                    e.target.style.background = '#F7F8F7';
                  }}
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
                  background: 'rgba(22, 132, 91, 0.08)',
                  border: '1px solid rgba(22, 132, 91, 0.25)',
                  color: '#16845B',
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
                  color: resendTimer > 0 ? '#929B95' : '#16845B',
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
                  boxShadow: '0 4px 18px rgba(22, 132, 91, 0.35)',
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
                  color: '#66706A',
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
                        color: '#4B5563',
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
                        background: '#F7F8F7',
                        border: '1px solid #DFE6E1',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          padding: '12px 14px',
                          background: '#EAF5EF',
                          borderRight: '1px solid #DFE6E1',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          color: '#16845B',
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
                          color: '#18201C',
                          fontSize: '0.96rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#66706A', marginTop: '6px' }}>
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
                      boxShadow: '0 4px 18px rgba(22, 132, 91, 0.35)',
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
                    background: '#F7F8F7',
                    border: '1px dashed #C9D5CD',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    marginTop: '16px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#16845B',
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
                        background: '#EAF5EF',
                        border: '1px solid rgba(22, 132, 91, 0.35)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 4px',
                        color: '#16845B',
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
                        background: '#FFFFFF',
                        border: '1px solid #DFE6E1',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 4px',
                        color: '#18201C',
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
                        background: '#FFFFFF',
                        border: '1px solid #DFE6E1',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 4px',
                        color: '#18201C',
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

            {/* ─── SIGN UP (CREATE ACCOUNT) FLOW WITH DUAL CUSTOMER / RETAILER SWITCH ─── */}
            {mode === 'signup' && (
              <div>
                {/* Account Type Selector Pill (Customer vs Licensed Retailer) */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#4B5563',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Registration Category
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: accountType === 'retailer' ? '#16845B' : accountType === 'rider' ? '#D97706' : '#18201C',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {accountType === 'retailer' ? '🏪 Licensed A4 Outlet' : accountType === 'rider' ? '🛵 Courier Fleet Pilot' : '👤 Personal Consumer'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '8px',
                      background: '#F1F4F1',
                      padding: '5px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #DFE6E1',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setAccountType('customer');
                        setErrorMessage('');
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: accountType === 'customer' ? '1.5px solid #16845B' : '1px solid transparent',
                        background: accountType === 'customer' ? '#FFFFFF' : 'transparent',
                        color: accountType === 'customer' ? '#16845B' : '#66706A',
                        boxShadow: accountType === 'customer' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.84rem' }}>
                        <User size={15} />
                        <span>Customer</span>
                      </div>
                      <span style={{ fontSize: '0.66rem', color: accountType === 'customer' ? '#4B5563' : '#929B95' }}>
                        Doorstep Delivery
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountType('retailer');
                        setErrorMessage('');
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: accountType === 'retailer' ? '1.5px solid #16845B' : '1px solid transparent',
                        background: accountType === 'retailer' ? '#FFFFFF' : 'transparent',
                        color: accountType === 'retailer' ? '#16845B' : '#66706A',
                        boxShadow: accountType === 'retailer' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.84rem' }}>
                        <Store size={15} />
                        <span>A4 Retailer</span>
                      </div>
                      <span style={{ fontSize: '0.66rem', color: accountType === 'retailer' ? '#4B5563' : '#929B95' }}>
                        Licensed Depots
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountType('rider');
                        setErrorMessage('');
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: accountType === 'rider' ? '1.5px solid #D97706' : '1px solid transparent',
                        background: accountType === 'rider' ? '#FFFFFF' : 'transparent',
                        color: accountType === 'rider' ? '#D97706' : '#66706A',
                        boxShadow: accountType === 'rider' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.84rem' }}>
                        <Bike size={15} />
                        <span>Courier Pilot</span>
                      </div>
                      <span style={{ fontSize: '0.66rem', color: accountType === 'rider' ? '#4B5563' : '#929B95' }}>
                        Fleet & ₹85/Drop
                      </span>
                    </button>
                  </div>
                </div>

                {/* ─── OPTION A: CUSTOMER REGISTRATION FORM ─── */}
                {accountType === 'customer' && (
                  <form onSubmit={handleSendOtp}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      {/* Full Name */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#4B5563',
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
                            background: '#F7F8F7',
                            border: '1px solid #DFE6E1',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 10px',
                          }}
                        >
                          <User size={14} color="#929B95" style={{ marginRight: '6px' }} />
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
                              color: '#18201C',
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
                            color: '#4B5563',
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
                            background: '#F7F8F7',
                            border: '1px solid #DFE6E1',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 10px',
                          }}
                        >
                          <Smartphone size={14} color="#929B95" style={{ marginRight: '6px' }} />
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
                              color: '#18201C',
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
                            color: '#4B5563',
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
                            background: '#F7F8F7',
                            border: '1px solid #DFE6E1',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 10px',
                          }}
                        >
                          <Lock size={14} color="#929B95" style={{ marginRight: '6px' }} />
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
                              color: '#18201C',
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
                            color: '#4B5563',
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
                            background: '#F7F8F7',
                            border: pwdMatches ? '1px solid #16845B' : '1px solid #DFE6E1',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 10px',
                          }}
                        >
                          <ShieldCheck size={14} color={pwdMatches ? '#16845B' : '#929B95'} style={{ marginRight: '6px' }} />
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
                              color: '#18201C',
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
                        background: '#F1F4F1',
                        borderRadius: 'var(--radius-xs)',
                        padding: '8px 10px',
                        marginBottom: '12px',
                        fontSize: '0.68rem',
                      }}
                    >
                      <span style={{ color: pwdLengthValid ? '#16845B' : '#929B95', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pwdLengthValid ? '✓' : '○'} 8-16 characters
                      </span>
                      <span style={{ color: pwdUpperValid ? '#16845B' : '#929B95', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pwdUpperValid ? '✓' : '○'} 1 Uppercase (A-Z)
                      </span>
                      <span style={{ color: pwdNumValid ? '#16845B' : '#929B95', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pwdNumValid ? '✓' : '○'} 1 Number (0-9)
                      </span>
                      <span style={{ color: pwdSpecialValid ? '#16845B' : '#929B95', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                            color: '#4B5563',
                            textTransform: 'uppercase',
                          }}
                        >
                          Date of Birth (Statutory 21+ Age Check)
                        </label>
                        {isLegalAge ? (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: '#16845B',
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
                              color: '#DC2626',
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
                          background: '#F7F8F7',
                          border: isLegalAge ? '1px solid #DFE6E1' : '1px solid #DC2626',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0 10px',
                        }}
                      >
                        <Calendar size={14} color="#929B95" style={{ marginRight: '6px' }} />
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
                            color: '#18201C',
                            fontSize: '0.86rem',
                            outline: 'none',
                            colorScheme: 'light',
                          }}
                        />
                      </div>
                    </div>

                    {/* Safe Ride Voucher Applied */}
                    <div
                      style={{
                        background: 'rgba(22, 132, 91, 0.08)',
                        border: '1px solid rgba(22, 132, 91, 0.28)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Car size={18} color="#16845B" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#16845B' }}>
                          ₹150 Safe Ride Home Voucher Applied
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#66706A' }}>
                          Redeemable on Uber, Ola, or Rapido after ordering
                        </div>
                      </div>
                      <span
                        style={{
                          background: '#16845B',
                          color: '#FFFFFF',
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
                        style={{ marginTop: '3px', accentColor: '#16845B' }}
                      />
                      <label htmlFor="ageCheck" style={{ fontSize: '0.72rem', color: '#4B5563', lineHeight: 1.35 }}>
                        I solemnly confirm that I am <strong style={{ color: '#18201C' }}>21+ years of age</strong> under State Excise Rules, agree to KYC age verification, and consent to physical doorstep ID check.
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
                            : '#E5EAE6',
                        color: isLegalAge && ageConfirmed && isPasswordValid && pwdMatches ? '#FFFFFF' : '#929B95',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        border: 'none',
                        cursor: isLegalAge && ageConfirmed && isPasswordValid && pwdMatches ? 'pointer' : 'not-allowed',
                        boxShadow: isLegalAge && ageConfirmed && isPasswordValid && pwdMatches ? '0 4px 18px rgba(22, 132, 91, 0.35)' : 'none',
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

                {/* ─── OPTION B: LICENSED RETAILER REGISTRATION FORM ─── */}
                {accountType === 'retailer' && (
                  <form onSubmit={handleSendOtp}>
                    {/* Store / Trade Name */}
                    <div style={{ marginBottom: '10px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#4B5563',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Store / Trade Name
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#F7F8F7',
                          border: '1px solid #DFE6E1',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0 10px',
                        }}
                      >
                        <Store size={14} color="#16845B" style={{ marginRight: '6px' }} />
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="Jubilee Hills Reserve Spirits"
                          required
                          style={{
                            width: '100%',
                            padding: '9px 0',
                            background: 'transparent',
                            border: 'none',
                            color: '#18201C',
                            fontSize: '0.86rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      {/* Licensee / Manager Full Name */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#4B5563',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Licensee / Manager Name
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#F7F8F7',
                            border: '1px solid #DFE6E1',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 10px',
                          }}
                        >
                          <User size={14} color="#929B95" style={{ marginRight: '6px' }} />
                          <input
                            type="text"
                            value={licenseeName}
                            onChange={(e) => setLicenseeName(e.target.value)}
                            placeholder="Vikram Malhotra"
                            required
                            style={{
                              width: '100%',
                              padding: '9px 0',
                              background: 'transparent',
                              border: 'none',
                              color: '#18201C',
                              fontSize: '0.86rem',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* Official Business Phone */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#4B5563',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Business Mobile (OTP)
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#F7F8F7',
                            border: '1px solid #DFE6E1',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 10px',
                          }}
                        >
                          <Smartphone size={14} color="#929B95" style={{ marginRight: '6px' }} />
                          <input
                            type="tel"
                            value={retailerPhone}
                            onChange={(e) => setRetailerPhone(e.target.value)}
                            placeholder="98490 89124"
                            required
                            style={{
                              width: '100%',
                              padding: '9px 0',
                              background: 'transparent',
                              border: 'none',
                              color: '#18201C',
                              fontSize: '0.86rem',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px', marginBottom: '10px' }}>
                      {/* State Excise License Number */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: '#4B5563',
                              textTransform: 'uppercase',
                            }}
                          >
                            Excise License (A4)
                          </label>
                          <span style={{ fontSize: '0.64rem', color: '#16845B', fontWeight: 700 }}>
                            Telangana State
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#F7F8F7',
                            border: '1px solid #DFE6E1',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 10px',
                          }}
                        >
                          <ShieldCheck size={14} color="#16845B" style={{ marginRight: '6px' }} />
                          <input
                            type="text"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                            placeholder="TS/EXCISE/HYD/2026/0481"
                            required
                            style={{
                              width: '100%',
                              padding: '9px 0',
                              background: 'transparent',
                              border: 'none',
                              color: '#18201C',
                              fontSize: '0.86rem',
                              outline: 'none',
                              fontFamily: 'monospace',
                            }}
                          />
                        </div>
                      </div>

                      {/* GSTIN */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#4B5563',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          GSTIN Number
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#F7F8F7',
                            border: '1px solid #DFE6E1',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 10px',
                          }}
                        >
                          <FileText size={14} color="#929B95" style={{ marginRight: '6px' }} />
                          <input
                            type="text"
                            value={gstin}
                            onChange={(e) => setGstin(e.target.value.toUpperCase())}
                            placeholder="36AAACB1234D1Z5"
                            required
                            style={{
                              width: '100%',
                              padding: '9px 0',
                              background: 'transparent',
                              border: 'none',
                              color: '#18201C',
                              fontSize: '0.86rem',
                              outline: 'none',
                              fontFamily: 'monospace',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Outlet Physical Address & Pincode */}
                    <div style={{ marginBottom: '10px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#4B5563',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Outlet Physical Address & Pincode
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#F7F8F7',
                          border: '1px solid #DFE6E1',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0 10px',
                        }}
                      >
                        <MapPin size={14} color="#929B95" style={{ marginRight: '6px' }} />
                        <input
                          type="text"
                          value={storeAddress}
                          onChange={(e) => setStoreAddress(e.target.value)}
                          placeholder="Plot 42, Road 36, Jubilee Hills, Hyderabad - 500033"
                          required
                          style={{
                            width: '100%',
                            padding: '9px 0',
                            background: 'transparent',
                            border: 'none',
                            color: '#18201C',
                            fontSize: '0.86rem',
                            outline: 'none',
                          }}
                        />
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
                            color: '#4B5563',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Terminal Password
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#F7F8F7',
                            border: '1px solid #DFE6E1',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 10px',
                          }}
                        >
                          <Lock size={14} color="#929B95" style={{ marginRight: '6px' }} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                              width: '100%',
                              padding: '9px 0',
                              background: 'transparent',
                              border: 'none',
                              color: '#18201C',
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
                            color: '#4B5563',
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
                            background: '#F7F8F7',
                            border: pwdMatches ? '1px solid #16845B' : '1px solid #DFE6E1',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0 10px',
                          }}
                        >
                          <ShieldCheck size={14} color={pwdMatches ? '#16845B' : '#929B95'} style={{ marginRight: '6px' }} />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                              width: '100%',
                              padding: '9px 0',
                              background: 'transparent',
                              border: 'none',
                              color: '#18201C',
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
                        background: '#F1F4F1',
                        borderRadius: 'var(--radius-xs)',
                        padding: '7px 10px',
                        marginBottom: '10px',
                        fontSize: '0.66rem',
                      }}
                    >
                      <span style={{ color: pwdLengthValid ? '#16845B' : '#929B95', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pwdLengthValid ? '✓' : '○'} 8-16 characters
                      </span>
                      <span style={{ color: pwdUpperValid ? '#16845B' : '#929B95', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pwdUpperValid ? '✓' : '○'} 1 Uppercase (A-Z)
                      </span>
                      <span style={{ color: pwdNumValid ? '#16845B' : '#929B95', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pwdNumValid ? '✓' : '○'} 1 Number (0-9)
                      </span>
                      <span style={{ color: pwdSpecialValid ? '#16845B' : '#929B95', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pwdSpecialValid ? '✓' : '○'} 1 Special symbol
                      </span>
                    </div>

                    {/* Statutory Licensee Declaration Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '14px' }}>
                      <input
                        type="checkbox"
                        id="retailerDeclaredCheck"
                        checked={retailerDeclared}
                        onChange={(e) => setRetailerDeclared(e.target.checked)}
                        required
                        style={{ marginTop: '3px', accentColor: '#16845B' }}
                      />
                      <label htmlFor="retailerDeclaredCheck" style={{ fontSize: '0.7rem', color: '#4B5563', lineHeight: 1.35 }}>
                        I solemnly declare that our establishment holds a valid <strong style={{ color: '#18201C' }}>2026 Telangana State Excise A4 License</strong>, authorized storage, and agrees to Boozer's merchant dispatch guidelines, digital batch tracking, and rider OTP handover.
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        !storeName ||
                        !licenseeName ||
                        !licenseNumber ||
                        !gstin ||
                        !storeAddress ||
                        !retailerDeclared ||
                        !isPasswordValid ||
                        !pwdMatches
                      }
                      style={{
                        width: '100%',
                        padding: '13px',
                        borderRadius: 'var(--radius-full)',
                        background:
                          storeName && licenseeName && licenseNumber && gstin && storeAddress && retailerDeclared && isPasswordValid && pwdMatches
                            ? 'linear-gradient(135deg, #0D4F3C 0%, #16845B 50%, #4FAF86 100%)'
                            : '#E5EAE6',
                        color:
                          storeName && licenseeName && licenseNumber && gstin && storeAddress && retailerDeclared && isPasswordValid && pwdMatches
                            ? '#FFFFFF'
                            : '#929B95',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        border: 'none',
                        cursor:
                          storeName && licenseeName && licenseNumber && gstin && storeAddress && retailerDeclared && isPasswordValid && pwdMatches
                            ? 'pointer'
                            : 'not-allowed',
                        boxShadow:
                          storeName && licenseeName && licenseNumber && gstin && storeAddress && retailerDeclared && isPasswordValid && pwdMatches
                            ? '0 4px 18px rgba(22, 132, 91, 0.35)'
                            : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '10px',
                      }}
                    >
                      {isLoading ? <RefreshCw className="spin-slow" size={17} /> : <Store size={17} />}
                      <span>{isLoading ? 'Verifying Credentials...' : 'Register Licensed Outlet & Open Terminal →'}</span>
                    </button>
                  </form>
                )}

                {/* ─── OPTION C: COURIER PILOT REGISTRATION ─── */}
                {accountType === 'rider' && (
                  <div
                    style={{
                      background: '#FFFBEB',
                      border: '1.5px solid #FCD34D',
                      borderRadius: '16px',
                      padding: '22px 18px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#FEF3C7',
                        border: '2px solid #D97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#D97706',
                        margin: '0 auto 14px',
                      }}
                    >
                      <Bike size={28} />
                    </div>

                    <h3 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#78350F', marginBottom: '6px' }}>
                      Boozer Courier & Delivery Pilot Onboarding
                    </h3>

                    <p style={{ fontSize: '0.8rem', color: '#92400E', maxWidth: '380px', margin: '0 auto 16px', lineHeight: 1.45 }}>
                      Earn ₹85/delivery with guaranteed payouts, 100% customer tips, and statutory excise verification benefits. Requires 21+ age and valid driving licence.
                    </p>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxWidth: '340px',
                      margin: '0 auto 20px',
                      textAlign: 'left',
                      fontSize: '0.74rem',
                      color: '#78350F',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={14} color="#D97706" />
                        <span>Instant 10-Minute Dispatch Hub Assignment</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={14} color="#D97706" />
                        <span>Live GPS Telematics & Doorstep OTP Terminal</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={14} color="#D97706" />
                        <span>Daily EV Battery Swapping & Transit Insurance</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSwitchView) onSwitchView('rider');
                        onClose();
                      }}
                      style={{
                        width: '100%',
                        padding: '13px',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                        color: '#FFFFFF',
                        fontSize: '0.92rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(217, 119, 6, 0.35)',
                      }}
                    >
                      <Bike size={18} />
                      <span>Open Pilot Onboarding Terminal →</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
