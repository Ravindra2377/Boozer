import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, SPACING, RADIUS } from '../theme';
import { LocationPickerModal } from './LocationPickerModal';

interface BrandHeaderProps {
  city?: string;
  pincode?: string;
  onLocationChange?: (city: string, pincode: string) => void;
  cartCount?: number;
  onCartPress?: () => void;
  onProfilePress?: () => void;
  kycVerified?: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  city = 'Hyderabad',
  pincode = '500081',
  onLocationChange,
  cartCount = 0,
  onCartPress,
  onProfilePress,
  kycVerified = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState(city);
  const [selectedPincode, setSelectedPincode] = useState(pincode);

  const handleOpenLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setModalVisible(true);
  };

  const handleSelectLocation = (newCity: string, newPin: string) => {
    setSelectedCity(newCity);
    setSelectedPincode(newPin);
    if (onLocationChange) {
      onLocationChange(newCity, newPin);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftCol}>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>Boozer</Text>
          </View>

          <TouchableOpacity
            style={styles.locationSelector}
            onPress={handleOpenLocation}
            activeOpacity={0.7}
          >
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.locationText}>
              {selectedCity} {selectedPincode ? `(${selectedPincode})` : ''}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightCol}>
          {kycVerified && (
            <View style={styles.kycBadge}>
              <Text style={styles.kycBadgeText}>21+ VERIFIED</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.cartBtn}
            onPress={onCartPress}
            activeOpacity={0.75}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <LocationPickerModal
        visible={modalVisible}
        currentCity={selectedCity}
        currentPincode={selectedPincode}
        onClose={() => setModalVisible(false)}
        onSelectLocation={handleSelectLocation}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 12,
    paddingBottom: 12,
  },
  leftCol: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  locationPin: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kycBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.14)',
    borderWidth: 1,
    borderColor: colors.savings,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  kycBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.savings,
    letterSpacing: 0.3,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: {
    fontSize: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textInverse,
  },
});
