import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, RADIUS, SPACING, SHADOWS } from '../../theme';
import { LiquidGlass } from '../../components/LiquidGlass';
import { SurfaceCard, AppButton, AppInput } from '../../components/SharedUI';
import { useSessionStore } from '../../store/useSessionStore';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('98490 12891');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUser } = useSessionStore();

  const handleModeSwitch = (newMode: 'login' | 'signup') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setMode(newMode);
  };

  const handleAuthSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setUser({
        fullName: mode === 'signup' ? (fullName || 'New Boozer Member') : 'Kabir Varma',
        phone: phone || '+91 98490 12891',
        calculatedAge: 29,
        documentType: 'Driving Licence',
        maskedDocNumber: 'TS-092015XXXX4819',
      });
      onClose();
    }, 800);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <LiquidGlass
          radius={RADIUS.xxl}
          intensity={85}
          style={styles.modalContent}
          contentStyle={styles.innerModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              {/* Close Button */}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.brandHeader}>
                <Text style={styles.eyebrow}>10-MINUTE HYPERLOCAL SPIRITS</Text>
                <View style={styles.logoRow}>
                  <Text style={styles.brandTitle}>Boozer</Text>
                  <View style={styles.dot} />
                </View>
                <Text style={styles.tagline}>
                  {mode === 'login'
                    ? 'Sign in to access your orders, safe ride wallet, and instant checkout.'
                    : 'Join Boozer for verified statutory doorstep delivery & ₹150 Safe Ride credits.'}
                </Text>
              </View>

              {/* Surface Form Card */}
              <SurfaceCard style={styles.formCard}>
                {/* Pill Switcher */}
                <View style={styles.pillSwitcher}>
                  <TouchableOpacity
                    style={[styles.switcherTab, mode === 'login' && styles.switcherTabActive]}
                    onPress={() => handleModeSwitch('login')}
                  >
                    <Text style={[styles.switcherText, mode === 'login' && styles.switcherTextActive]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.switcherTab, mode === 'signup' && styles.switcherTabActive]}
                    onPress={() => handleModeSwitch('signup')}
                  >
                    <Text style={[styles.switcherText, mode === 'signup' && styles.switcherTextActive]}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>

                {mode === 'signup' && (
                  <View style={styles.fieldWrap}>
                    <Text style={styles.label}>FULL LEGAL NAME</Text>
                    <AppInput
                      placeholder="e.g. Kabir Varma"
                      value={fullName}
                      onChangeText={setFullName}
                      leftIcon={<Text style={styles.inputIcon}>👤</Text>}
                    />
                  </View>
                )}

                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>MOBILE PHONE NUMBER</Text>
                  <AppInput
                    placeholder="98490 12891"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    leftIcon={<Text style={styles.inputIcon}>📱</Text>}
                  />
                </View>

                {mode === 'login' ? (
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
                ) : null}

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

                {mode === 'signup' && (
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setAgreed(!agreed)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                      {agreed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      I solemnly confirm I am 21+ years of age under State Excise Laws.
                    </Text>
                  </TouchableOpacity>
                )}

                {/* CompareX Pill Action Button */}
                <AppButton
                  label={
                    isSubmitting
                      ? 'Authenticating...'
                      : mode === 'login'
                      ? 'Sign In →'
                      : 'Create Account & Claim ₹150 Credit →'
                  }
                  onPress={handleAuthSubmit}
                  variant="gradient"
                  pill
                  disabled={isSubmitting || (mode === 'signup' && !agreed)}
                  style={{ marginTop: 12 }}
                />

                {/* Switch link */}
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleModeSwitch(mode === 'login' ? 'signup' : 'login')}
                  >
                    <Text style={styles.switchLink}>
                      {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </SurfaceCard>
            </ScrollView>
          </KeyboardAvoidingView>
        </LiquidGlass>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.surface,
    maxHeight: '90%',
  },
  innerModal: {
    padding: SPACING.xl,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
    marginBottom: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  brandHeader: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: colors.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: 12,
  },
  pillSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.cardAlt,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    marginBottom: 16,
  },
  switcherTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  switcherTabActive: {
    backgroundColor: colors.primary,
  },
  switcherText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  switcherTextActive: {
    color: colors.textInverse,
    fontWeight: '800',
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
  inputIcon: {
    fontSize: 14,
  },
  eyeIcon: {
    fontSize: 14,
    padding: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
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
  checkboxLabel: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  switchText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  switchLink: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
});
