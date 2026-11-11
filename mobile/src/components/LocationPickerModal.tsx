import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { colors, SPACING, RADIUS, SHADOWS } from '../theme';
import { LiquidGlass } from './LiquidGlass';

interface LocationPickerModalProps {
  visible: boolean;
  currentCity: string;
  currentPincode?: string;
  onClose: () => void;
  onSelectLocation: (city: string, pincode: string) => void;
}

const SUPPORTED_HUBS = [
  { city: 'Hyderabad', pincode: '500081', state: 'Telangana', hub: 'Hitec City Hub' },
  { city: 'Bengaluru', pincode: '560001', state: 'Karnataka', hub: 'Indiranagar Hub' },
  { city: 'Mumbai', pincode: '400001', state: 'Maharashtra', hub: 'Bandra Hub' },
  { city: 'Delhi NCR', pincode: '110001', state: 'Delhi', hub: 'Connaught Place Hub' },
  { city: 'Pune', pincode: '411001', state: 'Maharashtra', hub: 'Koregaon Park Hub' },
  { city: 'Kolkata', pincode: '700001', state: 'West Bengal', hub: 'Park Street Hub' },
  { city: 'Goa', pincode: '403001', state: 'Goa', hub: 'Panaji North Hub' },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  currentCity,
  currentPincode = '',
  onClose,
  onSelectLocation,
}) => {
  const [customPincode, setCustomPincode] = useState(currentPincode);
  const [isLocating, setIsLocating] = useState(false);

  const handleSelect = (city: string, pin: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelectLocation(city, pin);
    onClose();
  };

  const handleUseGps = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const item = geocode[0];
        const detectedCity = item.city || item.subregion || 'Hyderabad';
        const detectedPin = item.postalCode || '500081';
        handleSelect(detectedCity, detectedPin);
      }
    } catch {
      // Fallback
      handleSelect('Hyderabad', '500081');
    } finally {
      setIsLocating(false);
    }
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
        
        <LiquidGlass radius={28} style={styles.modalContent} contentStyle={styles.innerModal}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Delivery Location</Text>
              <Text style={styles.subtitle}>Select your legal Excise delivery zone</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Live GPS Button */}
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleUseGps}
            disabled={isLocating}
            activeOpacity={0.8}
          >
            <View style={styles.gpsIconCircle}>
              {isLocating ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Text style={styles.gpsIconText}>◎</Text>
              )}
            </View>
            <View style={styles.gpsTextCol}>
              <Text style={styles.gpsTitle}>Use Current Location (GPS)</Text>
              <Text style={styles.gpsDesc}>Automatically finds the nearest verified delivery hub</Text>
            </View>
            <Text style={styles.gpsChevron}>→</Text>
          </TouchableOpacity>

          {/* Custom Pincode Form */}
          <View style={styles.pincodeRow}>
            <TextInput
              placeholder="Enter 6-digit Pincode"
              placeholderTextColor={colors.textTertiary}
              value={customPincode}
              onChangeText={setCustomPincode}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.pincodeInput}
            />
            <TouchableOpacity
              style={styles.pincodeSubmit}
              onPress={() => {
                if (customPincode.trim().length === 6) {
                  handleSelect(currentCity || 'Hyderabad', customPincode.trim());
                }
              }}
            >
              <Text style={styles.pincodeSubmitText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Hub list */}
          <Text style={styles.sectionLabel}>SUPPORTED HUBS</Text>
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {SUPPORTED_HUBS.map((hub) => {
              const isSelected = hub.city.toLowerCase() === currentCity.toLowerCase();
              return (
                <TouchableOpacity
                  key={hub.city}
                  onPress={() => handleSelect(hub.city, hub.pincode)}
                  activeOpacity={0.7}
                  style={[styles.hubCard, isSelected && styles.hubCardSelected]}
                >
                  <View style={styles.hubLeft}>
                    <View style={[styles.hubDot, isSelected && styles.hubDotSelected]} />
                    <View>
                      <Text style={[styles.hubCity, isSelected && styles.hubCitySelected]}>
                        {hub.city}
                      </Text>
                      <Text style={styles.hubDetails}>
                        {hub.pincode} · {hub.state} · {hub.hub}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedTag}>
                      <Text style={styles.selectedTagText}>ACTIVE</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </LiquidGlass>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    width: '100%',
    maxHeight: '82%',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    backgroundColor: colors.surface,
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
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 14,
  },
  gpsIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gpsIconText: {
    fontSize: 16,
    color: colors.textInverse,
    fontWeight: '700',
  },
  gpsTextCol: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gpsDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  gpsChevron: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
    paddingRight: 4,
  },
  pincodeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  pincodeInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    fontSize: 14,
  },
  pincodeSubmit: {
    backgroundColor: colors.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pincodeSubmitText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  scrollList: {
    maxHeight: 220,
  },
  hubCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.cardAlt,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  hubCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(101, 201, 156, 0.08)',
  },
  hubLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hubDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginRight: 10,
  },
  hubDotSelected: {
    backgroundColor: colors.primary,
  },
  hubCity: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hubCitySelected: {
    color: colors.primary,
  },
  hubDetails: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  selectedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textInverse,
  },
});
