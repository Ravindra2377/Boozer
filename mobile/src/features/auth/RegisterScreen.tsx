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

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
  onRegisterSuccess?: () => void;
  onClose?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
  onClose,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('98490 12891');
  const [password, setPassword] = useState('Boozer@2026');
  const [confirmPassword, setConfirmPassword] = useState('Boozer@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedAge, setAgreedAge] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useSessionStore();

  // Password criteria checklist (CompareX pattern)
  const isLengthValid = password.length >= 8 && password.length <= 16;
  const isUpperValid = /[A-Z]/.test(password);
  const isNumValid = /\d/.test(password);
  const isSpecialValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = isLengthValid && isUpperValid && isNumValid && isSpecialValid;
  const isMatch = password === confirmPassword && confirmPassword.length > 0;
  const isValid = fullName.trim().length > 0 && phone.trim().length >= 10 && isPasswordValid && isMatch && agreedAge;

  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setUser({
        fullName: fullName || 'New Boozer Member',
        phone: `+91 ${phone.replace(/\D/g, '')}`,
        calculatedAge: 29,
        documentType: 'Driving Licence',
        maskedDocNumber: 'TS-092015XXXX4819',
      });
      if (onRegisterSuccess) onRegisterSuccess();
      if (onClose) onClose();
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#17201B', '#0E1511', '#080E0A']}
          style={styles.heroBg}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInner}>
            {/* Top Close button if modal */}
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            )}

            {/* Header */}
            <View style={styles.headerSection}>
              <View style={styles.speedBadge}>
                <Text style={styles.speedBadgeText}>⚡ 10-MINUTE HYPERLOCAL SPIRITS</Text>
              </View>
              <Text style={styles.heading}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join Boozer for verified statutory doorstep delivery & ₹150 Safe Ride Home credits.
              </Text>
            </View>

            {/* Form Surface Card */}
            <SurfaceCard style={styles.formCard}>
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>FULL LEGAL NAME</Text>
                <AppInput
                  placeholder="Kabir Varma"
                  value={fullName}
                  onChangeText={setFullName}
                  leftIcon={<Text style={styles.inputIcon}>👤</Text>}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>MOBILE PHONE NUMBER</Text>
                <AppInput
                  placeholder="98490 12891"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  leftIcon={<Text style={styles.flagIcon}>🇮🇳 +91</Text>}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>EMAIL ADDRESS (OPTIONAL)</Text>
                <AppInput
                  placeholder="user@boozer.in"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  leftIcon={<Text style={styles.inputIcon}>✉</Text>}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>PASSWORD</Text>
                <AppInput
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  }
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>CONFIRM PASSWORD</Text>
                <AppInput
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={true}
                  leftIcon={<Text style={styles.inputIcon}>🛡️</Text>}
                />
              </View>

              {/* CompareX Password Criteria Checklist */}
              <View style={styles.checklist}>
                <Text style={[styles.checkItem, isLengthValid && styles.checkItemActive]}>
                  {isLengthValid ? '✓' : '○'} 8-16 characters
                </Text>
                <Text style={[styles.checkItem, isUpperValid && styles.checkItemActive]}>
                  {isUpperValid ? '✓' : '○'} 1 Uppercase (A-Z)
                </Text>
                <Text style={[styles.checkItem, isNumValid && styles.checkItemActive]}>
                  {isNumValid ? '✓' : '○'} 1 Number (0-9)
                </Text>
                <Text style={[styles.checkItem, isSpecialValid && styles.checkItemActive]}>
                  {isSpecialValid ? '✓' : '○'} 1 Special symbol
                </Text>
              </View>

              {/* Safe Ride Voucher Banner */}
              <View style={styles.voucherCard}>
                <Text style={styles.voucherIcon}>🚕</Text>
                <View style={styles.voucherTextWrap}>
                  <Text style={styles.voucherTitle}>₹150 Safe Ride Home Credit</Text>
                  <Text style={styles.voucherSub}>Auto-applied for late night Uber/Ola</Text>
                </View>
                <View style={styles.voucherBadge}>
                  <Text style={styles.voucherBadgeText}>SAFERIDE150</Text>
                </View>
              </View>

              {/* Statutory 21+ Age Confirmation Checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setAgreedAge(!agreedAge);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreedAge && styles.checkboxActive]}>
                  {agreedAge && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I confirm I am <Text style={styles.boldText}>21+ years of age</Text> under State Excise Regulations and consent to doorstep KYC check.
                </Text>
              </TouchableOpacity>

              <AppButton
                label={isLoading ? 'Creating Account...' : 'Create Account & Claim ₹150 Credit →'}
                onPress={handleRegister}
                variant="gradient"
                pill
                disabled={isLoading || !isValid}
                style={styles.createBtn}
              />

              <View style={styles.signInRow}>
                <Text style={styles.signInPrompt}>Already have an account? </Text>
                <TouchableOpacity onPress={onNavigateToLogin}>
                  <Text style={styles.signInLink}>Sign In</Text>
                </TouchableOpacity>
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
  headerSection: {
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
  heading: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  subtitle: {
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
  fieldWrap: {
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  flagIcon: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryMint,
  },
  inputIcon: {
    fontSize: 14,
  },
  eyeIcon: {
    fontSize: 14,
    padding: 4,
  },
  checklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 8,
    borderRadius: RADIUS.sm,
    marginBottom: 12,
  },
  checkItem: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '600',
    width: '46%',
  },
  checkItemActive: {
    color: colors.primaryMint,
    fontWeight: '800',
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(101, 201, 156, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(101, 201, 156, 0.25)',
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  voucherIcon: {
    fontSize: 16,
  },
  voucherTextWrap: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryMint,
  },
  voucherSub: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  voucherBadge: {
    backgroundColor: colors.primaryMint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  voucherBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.background,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '900',
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  boldText: {
    fontWeight: '800',
    color: colors.primaryMint,
  },
  createBtn: {
    marginBottom: 14,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInPrompt: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  signInLink: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryMint,
  },
});
