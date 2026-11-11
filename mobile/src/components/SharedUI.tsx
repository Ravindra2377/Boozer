import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TextInputProps,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, SPACING, RADIUS, SHADOWS } from '../theme';

// ── Surface Card ─────────────────────────────────────────────────────────────
interface SurfaceCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  style,
  onPress,
  activeOpacity = 0.9,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onPress();
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <CardComponent
        activeOpacity={activeOpacity}
        onPress={onPress ? handlePress : undefined}
        onPressIn={onPress ? handlePressIn : undefined}
        onPressOut={onPress ? handlePressOut : undefined}
        style={[
          styles.surfaceCard,
          style,
        ]}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
};

// ── App Button ───────────────────────────────────────────────────────────────
interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  rightIcon,
  disabled = false,
  pill = false,
  style,
  textStyle,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 24,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
    }).start();
  };

  const handlePress = () => {
    if (onPress && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onPress();
    }
  };

  const isPrimary = variant === 'primary';
  const isGradient = variant === 'gradient';
  const isGhost = variant === 'ghost';

  const content = (
    <View style={styles.buttonContent}>
      {icon && <View style={styles.buttonIconLeft}>{icon}</View>}
      <Text
        style={[
          styles.buttonText,
          (isPrimary || isGradient) ? styles.buttonTextPrimary : styles.buttonTextGhost,
          textStyle,
        ]}
      >
        {label}
      </Text>
      {rightIcon && <View style={styles.buttonIconRight}>{rightIcon}</View>}
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.buttonBase,
          pill && styles.buttonPill,
          isGhost && styles.buttonGhost,
          disabled && styles.buttonDisabled,
          style,
        ]}
      >
        {isGradient ? (
          <LinearGradient
            colors={['#0D4F3C', '#16845B', '#3A9D76']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientLayer, pill && styles.buttonPill]}
          >
            {content}
          </LinearGradient>
        ) : isPrimary ? (
          <View style={[styles.primaryLayer, pill && styles.buttonPill]}>
            {content}
          </View>
        ) : (
          content
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── App Chip ─────────────────────────────────────────────────────────────────
interface AppChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  count?: number;
  icon?: React.ReactNode;
}

export const AppChip: React.FC<AppChipProps> = ({
  label,
  active = false,
  onPress,
  count,
  icon,
}) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={[
        styles.chipBase,
        active ? styles.chipActive : styles.chipInactive,
      ]}
    >
      {icon && <View style={styles.chipIcon}>{icon}</View>}
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.chipBadge, active ? styles.chipBadgeActive : styles.chipBadgeInactive]}>
          <Text style={[styles.chipBadgeText, active ? styles.chipBadgeTextActive : styles.chipBadgeTextInactive]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ── App Input ────────────────────────────────────────────────────────────────
interface AppInputProps extends TextInputProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppInput: React.FC<AppInputProps> = ({
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {leftIcon && <View style={styles.inputIconLeft}>{leftIcon}</View>}
      <TextInput
        placeholderTextColor={colors.textTertiary}
        style={[styles.inputField, style]}
        {...props}
      />
      {rightIcon && <View style={styles.inputIconRight}>{rightIcon}</View>}
    </View>
  );
};

// ── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  badge?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  badge,
}) => {
  return (
    <View style={styles.sectionHeaderRow}>
      <View>
        <View style={styles.titleWithBadge}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {badge && (
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {actionLabel && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  surfaceCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  buttonBase: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPill: {
    borderRadius: RADIUS.full,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  primaryLayer: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: RADIUS.md,
  },
  gradientLayer: {
    width: '100%',
    borderRadius: RADIUS.md,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonTextPrimary: {
    color: colors.textInverse,
  },
  buttonTextGhost: {
    color: colors.textPrimary,
  },
  buttonIconLeft: {
    marginRight: 8,
  },
  buttonIconRight: {
    marginLeft: 8,
  },
  chipBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  chipTextInactive: {
    color: colors.textSecondary,
  },
  chipBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
  },
  chipBadgeActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  chipBadgeInactive: {
    backgroundColor: colors.cardAlt,
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipBadgeTextActive: {
    color: colors.textInverse,
  },
  chipBadgeTextInactive: {
    color: colors.textTertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
  },
  inputField: {
    flex: 1,
    height: 44,
    color: colors.textPrimary,
    fontSize: 14,
  },
  inputIconLeft: {
    marginRight: 8,
  },
  inputIconRight: {
    marginLeft: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionBadge: {
    backgroundColor: colors.savingsLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  sectionBadgeText: {
    color: colors.savings,
    fontSize: 10,
    fontWeight: '700',
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
