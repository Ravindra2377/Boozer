import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, RADIUS, SHADOWS } from '../theme';
import { LiquidGlass } from './LiquidGlass';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type TabKey = 'home' | 'orders' | 'ride' | 'safety' | 'profile';

interface BottomNavPillProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  orderBadge?: number;
}

interface TabDef {
  key: TabKey;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { key: 'home', label: 'Explore', icon: '✦' },
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'ride', label: 'Ride', icon: '🚗' },
  { key: 'safety', label: 'Safety', icon: '🛡' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

export const BottomNavPill: React.FC<BottomNavPillProps> = ({
  activeTab,
  onTabChange,
  orderBadge = 0,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const scaleAnims = useRef(TABS.map(() => new Animated.Value(1))).current;

  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.key === activeTab)
  );

  const horizontalPadding = 8;
  const tabWidth = containerWidth > 0 ? (containerWidth - horizontalPadding * 2) / TABS.length : 0;
  const lensLeft = horizontalPadding + activeIndex * tabWidth;

  const handleTabPress = (tab: TabKey, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.88,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    LayoutAnimation.configureNext({
      duration: 220,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });

    onTabChange(tab);
  };

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <LiquidGlass
        radius={RADIUS.full}
        intensity={75}
        prominent={false}
        style={styles.pillGlass}
        contentStyle={styles.pillContent}
      >
        <View
          style={styles.tabsRow}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          {/* Animated Liquid Lens Indicator */}
          {tabWidth > 0 && (
            <View
              style={[
                styles.slidingLens,
                {
                  width: tabWidth - 6,
                  left: lensLeft + 3,
                },
              ]}
            >
              <View style={styles.lensHighlight} />
            </View>
          )}

          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabPress(tab.key, idx)}
                activeOpacity={0.8}
                style={styles.tabItem}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnims[idx] }], alignItems: 'center' }}>
                  <View style={styles.iconWrapper}>
                    <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                      {tab.icon}
                    </Text>
                    {tab.key === 'orders' && orderBadge > 0 && (
                      <View style={styles.badgeDot} />
                    )}
                  </View>
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </LiquidGlass>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 999,
  },
  pillGlass: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: 'rgba(23, 32, 27, 0.85)',
    borderColor: 'rgba(101, 201, 156, 0.25)',
    ...SHADOWS.glass,
  },
  pillContent: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  slidingLens: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    backgroundColor: 'rgba(101, 201, 156, 0.18)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(101, 201, 156, 0.45)',
  },
  lensHighlight: {
    position: 'absolute',
    top: 2,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    zIndex: 2,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  tabIconActive: {
    color: colors.primary,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
