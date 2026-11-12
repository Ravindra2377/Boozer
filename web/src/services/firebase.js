// ==============================================================================
// BOOZER · GOOGLE FIREBASE PHONE AUTHENTICATION SERVICE
// Free Tier: 10,000 Real SMS OTPs / Month across India & International
// Documentation: https://firebase.google.com/docs/auth/web/phone-auth
// ==============================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Returns true if real Firebase API credentials have been configured in .env
 */
export function isFirebaseConfigured() {
  const key = firebaseConfig.apiKey;
  return Boolean(
    key &&
    key.trim() !== '' &&
    !key.includes('your_firebase') &&
    firebaseConfig.projectId
  );
}

let authInstance = null;

/**
 * Returns the initialized Firebase Auth instance
 */
export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!authInstance) {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }

  return authInstance;
}

/**
 * Sets up or reuses an invisible reCAPTCHA verifier for Phone Auth
 * @param {string} containerId - DOM ID where reCAPTCHA will render (e.g. 'recaptcha-container')
 * @returns {RecaptchaVerifier|null}
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  const auth = getFirebaseAuth();
  if (!auth) {
    console.info('[BOOZER FIREBASE] Firebase credentials not configured. Using local sandbox OTP (123456).');
    return null;
  }

  // Clear existing verifier if any to avoid re-initialization collisions
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // Ignored
    }
    window.recaptchaVerifier = null;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[BOOZER FIREBASE] Element #${containerId} not found in DOM.`);
    return null;
  }

  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.info('[BOOZER FIREBASE] reCAPTCHA verified successfully.');
      },
      'expired-callback': () => {
        console.warn('[BOOZER FIREBASE] reCAPTCHA token expired. Prompting re-verification.');
      },
    });

    return window.recaptchaVerifier;
  } catch (err) {
    console.error('[BOOZER FIREBASE] Failed to setup RecaptchaVerifier:', err);
    return null;
  }
}

/**
 * Dispatches an SMS verification code via Firebase Phone Auth
 * @param {string} rawPhone - Raw 10-digit or E.164 phone string (e.g. '9849012891' or '+919849012891')
 * @param {RecaptchaVerifier} [verifier] - Optional verifier instance
 * @returns {Promise<{ confirmationResult?: any, isFirebase: boolean, message: string }>}
 */
export async function sendFirebasePhoneOtp(rawPhone, verifier) {
  // Normalize to E.164 standard for India (+91)
  const digits = rawPhone.replace(/\D/g, '');
  const e164Phone = digits.startsWith('91') && digits.length === 12
    ? `+${digits}`
    : `+91${digits.slice(-10)}`;

  const auth = getFirebaseAuth();

  if (!isFirebaseConfigured() || !auth) {
    // Graceful fallback to sandbox test code when credentials are not configured
    return {
      isFirebase: false,
      message: `Sandbox test mode active. Enter test code 123456 to verify.`,
    };
  }

  const activeVerifier = verifier || window.recaptchaVerifier || setupRecaptcha('recaptcha-container');
  if (!activeVerifier) {
    throw new Error('reCAPTCHA verifier could not be initialized.');
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, e164Phone, activeVerifier);
    window.confirmationResult = confirmationResult;
    return {
      confirmationResult,
      isFirebase: true,
      message: `Firebase SMS code dispatched to ${e164Phone}.`,
    };
  } catch (err) {
    console.error('[BOOZER FIREBASE] signInWithPhoneNumber error:', err);
    // Reset reCAPTCHA on failure
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.render().then((widgetId) => {
          if (window.grecaptcha) window.grecaptcha.reset(widgetId);
        });
      } catch {
        // Ignored
      }
    }
    throw new Error(err.message || 'Failed to dispatch SMS via Firebase.');
  }
}

/**
 * Verifies the 6-digit OTP code against Firebase Phone Auth
 * @param {any} confirmationResult - Confirmation result returned by sendFirebasePhoneOtp
 * @param {string} otpCode - 6-digit OTP string entered by user
 * @returns {Promise<{ user: any, isFirebase: boolean }>}
 */
export async function verifyFirebasePhoneOtp(confirmationResult, otpCode) {
  if (!confirmationResult && window.confirmationResult) {
    confirmationResult = window.confirmationResult;
  }

  if (!confirmationResult) {
    // If no active Firebase confirmation, sandbox validation applies
    if (otpCode === '123456' || otpCode === '999999') {
      return {
        isFirebase: false,
        user: {
          uid: 'sandbox-usr-1',
          phoneNumber: '+919849012891',
        },
      };
    }
    throw new Error('Invalid code. Use test code 123456 in sandbox environment.');
  }

  try {
    const userCredential = await confirmationResult.confirm(otpCode);
    return {
      user: userCredential.user,
      isFirebase: true,
    };
  } catch (err) {
    console.error('[BOOZER FIREBASE] Code confirmation error:', err);
    throw new Error(err.message || 'Incorrect verification code.');
  }
}
