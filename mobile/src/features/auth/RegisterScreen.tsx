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
  // Account Category Switcher
  const [accountType, setAccountType] = useState<'customer' | 'retailer'>('customer');

  // Customer registration fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('98490 12891');
  const [password, setPassword] = useState('Boozer@2026');
  const [confirmPassword, setConfirmPassword] = useState('Boozer@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedAge, setAgreedAge] = useState(true);

  // Licensed Retailer registration fields
  const [storeName, setStoreName] = useState('Jubilee Hills Reserve Spirits');
  const [licenseeName, setLicenseeName] = useState('Vikram Malhotra');
  const [licenseNumber, setLicenseNumber] = useState('TS/EXCISE/HYD/2026/0481');
  const [gstin, setGstin] = useState('36AAACB1234D1Z5');
  const [storeAddress, setStoreAddress] = useState('Road No. 36, Jubilee Hills, Hyderabad - 500033');
  const [retailerPhone, setRetailerPhone] = useState('98490 89124');
  const [retailerDeclared, setRetailerDeclared] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useSessionStore();

  // Password criteria checklist (CompareX pattern)
  const isLengthValid = password.length >= 8 && password.length <= 16;
  const isUpperValid = /[A-Z]/.test(password);
  const isNumValid = /\d/.test(password);
  const isSpecialValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = isLengthValid && isUpperValid && isNumValid && isSpecialValid;
  const isMatch = password === confirmPassword && confirmPassword.length > 0;

  // Form validity
  const isCustomerValid =
    fullName.trim().length > 0 &&
    phone.trim().length >= 10 &&
    isPasswordValid &&
    isMatch &&
    agreedAge;

  const isRetailerValid =
    storeName.trim().length >= 3 &&
    licenseeName.trim().length >= 3 &&
    licenseNumber.trim().length >= 6 &&
    gstin.trim().length >= 10 &&
    storeAddress.trim().length >= 5 &&
    retailerPhone.trim().length >= 10 &&
    isPasswordValid &&
    isMatch &&
    retailerDeclared;

  const isValid = accountType === 'customer' ? isCustomerValid : isRetailerValid;

  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (accountType === 'retailer') {
        setUser({
          fullName: licenseeName || 'Vikram Malhotra',
          phone: `+91 ${retailerPhone.replace(/\D/g, '')}`,
          storeName: storeName || 'Jubilee Hills Reserve Spirits',
          licenseNumber: licenseNumber || 'TS/EXCISE/HYD/2026/0481',
          gstin: gstin || '36AAACB1234D1Z5',
          storeAddress: storeAddress || 'Road No. 36, Jubilee Hills, Hyderabad - 500033',
          role: 'RETAILER',
          kycStatus: 'VERIFIED',
          calculatedAge: 38,
          documentType: 'State Excise A4 License',
          maskedDocNumber: licenseNumber || 'TS/EXCISE/HYD/2026/0481',
        });
      } else {
        setUser({
          fullName: fullName || 'New Boozer Member',
          phone: `+91 ${phone.replace(/\D/g, '')}`,
          role: 'CUSTOMER',
          calculatedAge: 29,
          documentType: 'Driving Licence',
          maskedDocNumber: 'TS-092015XXXX4819',
          kycStatus: 'PENDING',
          activeRideCredit: 150.0,
        });
      }
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
                {accountType === 'retailer'
                  ? 'Onboard your licensed A4 liquor outlet into Boozer’s 10-minute hyperlocal dispatch grid.'
                  : 'Join Boozer for verified statutory doorstep delivery & ₹150 Safe Ride Home credits.'}
              </Text>
            </View>

            {/* Form Surface Card */}
            <SurfaceCard style={styles.formCard}>
              {/* Account Type Toggle Switcher */}
              <View style={styles.accountTypeRow}>
                <TouchableOpacity
                  style={[styles.accountTypeBtn, accountType === 'customer' && styles.accountTypeBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setAccountType('customer');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.accountTypeIcon}>👤</Text>
                  <Text style={[styles.accountTypeLabel, accountType === 'customer' && styles.accountTypeLabelActive]}>
                    Customer
                  </Text>
                  <Text style={styles.accountTypeSub}>Personal Delivery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.accountTypeBtn, accountType === 'retailer' && styles.accountTypeBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setAccountType('retailer');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.accountTypeIcon}>🏪</Text>
                  <Text style={[styles.accountTypeLabel, accountType === 'retailer' && styles.accountTypeLabelActive]}>
                    Licensed Retailer
                  </Text>
                  <Text style={styles.accountTypeSub}>Excise A4 Outlet</Text>
                </TouchableOpacity>
              </View>

              {/* ─── OPTION A: CUSTOMER REGISTRATION ─── */}
              {accountType === 'customer' && (
                <>
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
                </>
              )}

              {/* ─── OPTION B: LICENSED RETAILER REGISTRATION ─── */}
              {accountType === 'retailer' && (
                <>
                  <View style={styles.fieldWrap}>
                    <Text style={styles.label}>STORE / TRADE NAME</Text>
                    <AppInput
                      placeholder="Jubilee Hills Reserve Spirits"
                      value={storeName}
                      onChangeText={setStoreName}
                      leftIcon={<Text style={styles.inputIcon}>🏪</Text>}
                    />
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.label}>LICENSEE / MANAGER NAME</Text>
                    <AppInput
                      placeholder="Vikram Malhotra"
                      value={licenseeName}
                      onChangeText={setLicenseeName}
                      leftIcon={<Text style={styles.inputIcon}>👤</Text>}
                    />
                  </View>

                  <View style={styles.fieldWrap}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>EXCISE LICENSE NUMBER (FORM A4)</Text>
                      <Text style={styles.subLabelBadge}>Telangana State</Text>
                    </View>
                    <AppInput
                      placeholder="TS/EXCISE/HYD/2026/0481"
                      value={licenseNumber}
                      onChangeText={(val) => setLicenseNumber(val.toUpperCase())}
                      autoCapitalize="characters"
                      leftIcon={<Text style={styles.inputIcon}>🛡️</Text>}
                    />
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.label}>GSTIN NUMBER</Text>
                    <AppInput
                      placeholder="36AAACB1234D1Z5"
                      value={gstin}
                      onChangeText={(val) => setGstin(val.toUpperCase())}
                      autoCapitalize="characters"
                      leftIcon={<Text style={styles.inputIcon}>📄</Text>}
                    />
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.label}>OUTLET PHYSICAL ADDRESS & PINCODE</Text>
                    <AppInput
                      placeholder="Road No. 36, Jubilee Hills, Hyderabad - 500033"
                      value={storeAddress}
                      onChangeText={setStoreAddress}
                      leftIcon={<Text style={styles.inputIcon}>📍</Text>}
                    />
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.label}>OFFICIAL BUSINESS MOBILE</Text>
                    <AppInput
                      placeholder="98490 89124"
                      value={retailerPhone}
                      onChangeText={setRetailerPhone}
                      keyboardType="phone-pad"
                      leftIcon={<Text style={styles.flagIcon}>🇮🇳 +91</Text>}
                    />
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.label}>TERMINAL ACCESS PASSWORD</Text>
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

                  {/* Password Checklist */}
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

                  {/* Statutory Retailer Declaration */}
                  <TouchableOpacity
                    style={styles.termsRow}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setRetailerDeclared(!retailerDeclared);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkbox, retailerDeclared && styles.checkboxActive]}>
                      {retailerDeclared && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.termsText}>
                      I solemnly declare that our establishment holds a valid <Text style={styles.boldText}>2026 Telangana State Excise A4 License</Text>, authorized storage, and agrees to Boozer's merchant dispatch guidelines.
                    </Text>
                  </TouchableOpacity>

                  <AppButton
                    label={isLoading ? 'Registering Outlet...' : 'Register Licensed Outlet & Open Terminal →'}
                    onPress={handleRegister}
                    variant="gradient"
                    pill
                    disabled={isLoading || !isValid}
                    style={styles.createBtn}
                  />
                </>
              )}

              <View style={styles.signInRow}>
                <Text style={styles.signInPrompt}>Already registered? </Text>
                <TouchableOpacity onPress={onNavigateToLogin}>
                  <Text style={styles.signInLink}>Sign In to Account</Text>
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
  accountTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 4,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  accountTypeBtnActive: {
    backgroundColor: 'rgba(101, 201, 156, 0.15)',
    borderColor: colors.primaryMint,
  },
  accountTypeIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  accountTypeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  accountTypeLabelActive: {
    color: colors.primaryMint,
  },
  accountTypeSub: {
    fontSize: 9,
    color: colors.textTertiary,
    marginTop: 2,
  },
  fieldWrap: {
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subLabelBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryMint,
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
