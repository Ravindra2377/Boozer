import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, RADIUS } from '../theme';

interface LiquidGlassProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
  intensity?: number;
  tintColor?: string;
  prominent?: boolean;
  neutral?: boolean;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  style,
  contentStyle,
  radius = RADIUS.xl,
  intensity = 65,
  tintColor,
  prominent = false,
  neutral = false,
}) => {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled?.().then(setReduceTransparency);
    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceTransparencyChanged',
      setReduceTransparency
    );
    return () => subscription?.remove?.();
  }, []);

  const fallback = prominent
    ? tintColor || colors.primaryDark
    : neutral
    ? 'rgba(23, 32, 27, 0.70)'
    : 'rgba(18, 28, 22, 0.65)';

  return (
    <View
      style={[
        styles.root,
        {
          borderRadius: radius,
          borderColor: prominent
            ? 'rgba(101, 201, 156, 0.35)'
            : neutral
            ? 'rgba(255, 255, 255, 0.12)'
            : 'rgba(101, 201, 156, 0.20)',
          shadowColor: '#000',
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, overflow: 'hidden' },
        ]}
      >
        {!reduceTransparency && (
          <BlurView
            intensity={intensity}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: fallback }]} />
        <LinearGradient
          colors={
            prominent
              ? ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.03)', 'rgba(0,0,0,0.12)']
              : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)', 'rgba(0,0,0,0.20)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={contentStyle}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
});
