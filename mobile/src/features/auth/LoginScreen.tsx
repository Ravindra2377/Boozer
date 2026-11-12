import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, SPACING, RADIUS } from '../../theme';
import { AppButton, SurfaceCard, AppInput } from '../../components/SharedUI';
import { useSessionStore } from '../../store/useSessionStore';

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
  onLoginSuccess?: () => void;
  onClose?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
  onClose,
}) => {
  const [phone, setPhone] = useState('98490 12891');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useSessionStore();

  const handleSendOtp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 600);
  };

  const handleVerifyOtp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setUser({
        fullName: 'Kabir Varma',
        phone: `+91 ${phone.replace(/\D/g, '')}`,
        calculatedAge: 29,
        documentType: 'Driving Licence',
        maskedDocNumber: 'TS-092015XXXX4819',
      });
      if (onLoginSuccess) onLoginSuccess();
      if (onClose) onClose();
    }, 700);
  };


  const handleQuickPersona = (role: 'customer' | 'retailer' | 'admin') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (role === 'customer') {
      setUser({
        fullName: 'Kabir Varma',
        phone: '+91 98490 12891',
        calculatedAge: 29,
        documentType: 'Driving Licence',
        maskedDocNumber: 'TS-092015XXXX4819',
      });
    } else if (role === 'retailer') {
      setUser({
        fullName: 'Vikram Malhotra (Jubilee Hills Reserve)',
        phone: '+91 98490 89124',
        calculatedAge: 38,
        documentType: 'State Excise Retail License #HYD-2026-09',
        maskedDocNumber: 'LIC-TS-4819-A',
      });
    } else {
      setUser({
        fullName: 'Sri K. Venkat Rao (Excise Officer)',
        phone: '+91 98490 00001',
        calculatedAge: 45,
        documentType: 'Govt Officer ID',
        maskedDocNumber: 'TS-EXCISE-ADMIN-01',
      });
    }
    if (onLoginSuccess) onLoginSuccess();
    if (onClose) onClose();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Ambient Gradient Backdrop */}
        <LinearGradient
          colors={['#17201B', '#0E1511', '#080E0A']}
          style={styles.heroBg}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInner}>
            {/* Top Close / Back button if presented modally */}
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            )}

            {/* Brand Logo & Editorial Header */}
            <View style={styles.logoSection}>
              <View style={styles.speedBadge}>
                <Text style={styles.speedBadgeText}>⚡ 10-MINUTE HYPERLOCAL SPIRITS</Text>
              </View>
              <View style={styles.logoRow}>
                <Text style={styles.brandTitle}>Boozer</Text>
              </View>
              <Text style={styles.tagline}>
                Compare prices across licensed stores, discover craft spirits, and get express doorstep delivery.
              </Text>
            </View>

            {/* Surface Card Container */}
            <SurfaceCard style={styles.formCard}>
              <Text style={styles.formTitle}>Sign In</Text>

              {/* STEP: OTP CODE ENTRY */}
              {step === 'otp' ? (
                <View style={styles.otpWrap}>
                  <Text style={styles.otpHeader}>Enter 6-Digit Code</Text>
                  <Text style={styles.otpSub}>
                    Sent to +91 {phone}
                  </Text>

                  <View style={styles.otpRow}>
                    {otp.map((digit, idx) => (
                      <View key={idx} style={styles.otpBox}>
                        <Text style={styles.otpDigit}>{digit}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.otpActions}>
                    <TouchableOpacity
                      onPress={() => setOtp(['1', '2', '3', '4', '5', '6'])}
                      style={styles.autoFillBtn}
                    >
                      <Text style={styles.autoFillText}>Auto-fill 123456</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleSendOtp()}>
                      <Text style={styles.resendText}>Resend Code</Text>
                    </TouchableOpacity>
                  </View>

                  <AppButton
                    label={isLoading ? 'Verifying...' : 'Verify & Continue →'}
                    onPress={handleVerifyOtp}
                    variant="gradient"
                    pill
                    disabled={isLoading}
                    style={styles.submitBtn}
                  />

                  <TouchableOpacity onPress={() => setStep('input')} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Change phone number</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* STEP: INITIAL INPUT (Mobile Phone OTP) */
                <View>
                  <View style={styles.fieldWrap}>
                    <Text style={styles.label}>MOBILE PHONE NUMBER</Text>
                    <AppInput
                      placeholder="98490 12891"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      leftIcon={<Text style={styles.flagIcon}>🇮🇳 +91</Text>}
                    />
                    <Text style={styles.inputHelp}>
                      We will send a 6-digit one-time password via SMS.
                    </Text>
                  </View>

                  <AppButton
                    label={isLoading ? 'Sending Code...' : 'Continue with OTP →'}
                    onPress={handleSendOtp}
                    variant="gradient"
                    pill
                    disabled={isLoading}
                    style={styles.submitBtn}
                  />
                </View>
              )}

              {/* Switch to Register Screen */}
              <View style={styles.registerRow}>
                <Text style={styles.registerPrompt}>Don't have an account? </Text>
                <TouchableOpacity onPress={onNavigateToRegister}>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Persona Logins */}
              <View style={styles.personaCard}>
                <Text style={styles.personaTitle}>⚡ ONE-TAP DEMO LOGINS</Text>
                <View style={styles.personaRow}>
                  <TouchableOpacity
                    style={styles.personaPill}
                    onPress={() => handleQuickPersona('customer')}
                  >
                    <Text style={styles.personaPillText}>👤 Customer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.personaPill}
                    onPress={() => handleQuickPersona('retailer')}
                  >
                    <Text style={styles.personaPillText}>🏪 Retailer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.personaPill}
                    onPress={() => handleQuickPersona('admin')}
                  >
                    <Text style={styles.personaPillText}>🛡️ Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SurfaceCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroBg: {
    ...StyleSheet.absoluteFill,
    opacity: 0.95,
  },
  content: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
    justifyContent: 'center',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  logoSection: {
    marginBottom: SPACING.lg,
  },
  speedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(101, 201, 156, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(101, 201, 156, 0.25)',
    marginBottom: 6,
  },
  speedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryMint,
    letterSpacing: 0.5,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: SPACING.xl,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: SPACING.md,
  },
  fieldWrap: {
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  flagIcon: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryMint,
  },
  inputHelp: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 5,
  },
  submitBtn: {
    marginTop: 10,
    marginBottom: 12,
  },
  otpWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  otpHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  otpSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  otpBox: {
    width: 42,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryMint,
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  autoFillBtn: {
    backgroundColor: 'rgba(101, 201, 156, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(101, 201, 156, 0.3)',
  },
  autoFillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryMint,
  },
  resendText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryMint,
  },
  backBtn: {
    marginTop: 8,
  },
  backBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  registerPrompt: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryMint,
  },
  personaCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 10,
    marginTop: 6,
  },
  personaTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryMint,
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  personaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  personaPill: {
    flex: 1,
    paddingVertical: 7,
    backgroundColor: colors.cardAlt,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  personaPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
