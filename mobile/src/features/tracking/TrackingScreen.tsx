import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { PersistentSosButton } from '../../components/PersistentSosButton';

export const TrackingScreen: React.FC = () => {
  const [doorstepOtp, setDoorstepOtp] = useState('8492');
  const [doorstepVerified, setDoorstepVerified] = useState(false);

  const handleGetHelp = () => {
    Alert.alert(
      'Order Assistance',
      'Need help with order BZ-20261105-4819?',
      [
        { text: 'Call Driver (Rohit Kumar)', onPress: () => Alert.alert('Dialing +91 98111 22334...') },
        { text: 'Live Support Chat', onPress: () => Alert.alert('Connecting to 24/7 concierge...') },
        { text: 'Update Delivery Landmark', onPress: () => Alert.alert('Landmark updated.') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Persistent SOS Floating Pill */}
      <PersistentSosButton />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Top Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.locationCircle}>
            <Text style={{ fontSize: 16 }}>📍</Text>
          </View>
          <View>
            <Text style={styles.statusTitle}>Your order is on the way!</Text>
            <Text style={styles.statusSubtitle}>Arriving in 12 min · Rohit Kumar</Text>
          </View>
        </View>

        {/* Living Route Night Map Graphic */}
        <View style={styles.mapContainer}>
          {/* Blue Store Origin */}
          <View style={styles.originPin}>
            <Text style={{ fontSize: 13 }}>🏪</Text>
          </View>

          {/* Living Route Glowing Trail */}
          <View style={styles.curvedRouteSimulation}>
            <View style={styles.movingCar}>
              <Text style={{ fontSize: 18 }}>🚘</Text>
            </View>
          </View>

          {/* Amber Destination Pin */}
          <View style={styles.destinationPin}>
            <Text style={{ fontSize: 14 }}>📍</Text>
          </View>

          <View style={styles.etaOverlay}>
            <Text style={styles.etaText}>● Live GPS Route</Text>
          </View>
        </View>

        {/* Delivery Partner Card */}
        <View style={styles.driverCard}>
          <View style={styles.driverInfoRow}>
            <View style={styles.driverAvatar}>
              <Text style={{ fontSize: 20 }}>🧔🏽</Text>
            </View>
            <View>
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>Rohit Kumar</Text>
                <Text style={styles.driverRating}>★ 4.9</Text>
              </View>
              <Text style={styles.driverVehicle}>KA 01 AB 1234 · Delivery Partner</Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={() => Alert.alert('Calling Rohit Kumar (+91 98111 22334)...')}
              style={styles.iconButton}
            >
              <Text style={{ fontSize: 15 }}>📞</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Opening live message chat...')}
              style={styles.iconButton}
            >
              <Text style={{ fontSize: 15 }}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Live Location */}
        <TouchableOpacity
          onPress={() => Alert.alert('Live route link broadcasted via SMS to Rahul Verma and Ananya Sen!')}
          style={styles.shareCard}
        >
          <View style={styles.shareLeft}>
            <View style={styles.shareIconBox}>
              <Text style={{ fontSize: 15 }}>🔗</Text>
            </View>
            <View>
              <Text style={styles.shareTitle}>Share Live Location</Text>
              <Text style={styles.shareSubtitle}>with a trusted contact</Text>
            </View>
          </View>
          <Text style={{ color: colors.creamMuted, fontSize: 18 }}>→</Text>
        </TouchableOpacity>

        {/* Doorstep Age Verification Check Card */}
        <View style={styles.doorstepCard}>
          <Text style={styles.doorstepTitle}>Doorstep Age Verification Code</Text>
          <Text style={styles.doorstepSubtitle}>
            Share this digital OTP with delivery partner Rohit Kumar at the door:
          </Text>
          <View style={styles.otpBox}>
            <Text style={styles.otpValue}>{doorstepOtp}</Text>
          </View>
        </View>

        {/* "Get Help" Button (Orders screen support) */}
        <TouchableOpacity onPress={handleGetHelp} style={styles.getHelpButton}>
          <Text style={styles.getHelpText}>Get Help</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  contentContainer: {
    padding: 18,
    paddingTop: 54,
    paddingBottom: 110,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 161, 61, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(231, 161, 61, 0.25)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  locationCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(231, 161, 61, 0.15)',
    borderWidth: 1,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  statusSubtitle: {
    color: colors.creamMuted,
    fontSize: 12,
    marginTop: 2,
  },
  mapContainer: {
    height: 240,
    backgroundColor: '#120D1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  originPin: {
    position: 'absolute',
    top: 36,
    left: 36,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  destinationPin: {
    position: 'absolute',
    bottom: 36,
    right: 40,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  curvedRouteSimulation: {
    position: 'absolute',
    top: 50,
    left: 50,
    right: 50,
    bottom: 50,
    borderWidth: 3,
    borderColor: colors.gold,
    borderStyle: 'dashed',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  movingCar: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  etaOverlay: {
    position: 'absolute',
    top: 12,
    right: 14,
    backgroundColor: 'rgba(9, 9, 14, 0.85)',
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  etaText: {
    color: colors.gold,
    fontSize: 10.5,
    fontWeight: '700',
  },
  driverCard: {
    backgroundColor: colors.cardGlass,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E162F',
    borderWidth: 2,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '800',
  },
  driverRating: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  driverVehicle: {
    color: colors.creamMuted,
    fontSize: 11,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareCard: {
    backgroundColor: 'rgba(22, 17, 32, 0.7)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  shareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(112, 43, 192, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareTitle: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  shareSubtitle: {
    color: colors.creamMuted,
    fontSize: 11,
  },
  doorstepCard: {
    backgroundColor: 'rgba(231, 161, 61, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(231, 161, 61, 0.3)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  doorstepTitle: {
    color: colors.gold,
    fontSize: 12.5,
    fontWeight: '800',
  },
  doorstepSubtitle: {
    color: colors.creamMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 8,
  },
  otpBox: {
    backgroundColor: '#0D0B14',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  otpValue: {
    color: colors.cream,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 6,
  },
  getHelpButton: {
    backgroundColor: 'rgba(26, 20, 36, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getHelpText: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
