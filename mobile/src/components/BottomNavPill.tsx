import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export type TabKey = 'home' | 'orders' | 'ride' | 'safety' | 'profile';

interface BottomNavPillProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNavPill: React.FC<BottomNavPillProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'home', label: 'Home', icon: '⌂' },
    { key: 'orders', label: 'Orders', icon: '⬡' },
    { key: 'ride', label: 'Ride', icon: '🚘' },
    { key: 'safety', label: 'Safety', icon: '🛡' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.outerContainer}>
      <View style={styles.pillContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: '#0D0B12',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: '100%',
    maxWidth: 380,
    justifyContent: 'space-around',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    minWidth: 50,
  },
  tabIcon: {
    fontSize: 18,
    color: colors.creamMuted,
    marginBottom: 3,
  },
  tabIconActive: {
    color: colors.gold,
    textShadowColor: 'rgba(231, 161, 61, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.creamMuted,
  },
  tabLabelActive: {
    color: colors.gold,
    fontWeight: '800',
  },
});
