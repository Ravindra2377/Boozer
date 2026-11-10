import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '../../theme/colors';
import { PersistentSosButton } from '../../components/PersistentSosButton';
import { mobileApi } from '../../api/client';

const { width } = Dimensions.get('window');

const STORE_COORD = { latitude: 17.4325, longitude: 78.4070 };
const DESTINATION_COORD = { latitude: 17.4210, longitude: 78.4230 };
const GEOFENCE_RADIUS_METERS = 6500; // 6.5km statutory excise radius

const ROUTE_COORDINATES = [
  { latitude: 17.4325, longitude: 78.4070 },
  { latitude: 17.4318, longitude: 78.4082 },
  { latitude: 17.4302, longitude: 78.4110 },
  { latitude: 17.4280, longitude: 78.4145 },
  { latitude: 17.4255, longitude: 78.4180 },
  { latitude: 17.4230, longitude: 78.4208 },
  { latitude: 17.4210, longitude: 78.4230 },
];

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0e0e14' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0e0e14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b5b1a6' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#22212b' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d321d' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#e7a13d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#080c14' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d5a80' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#141c19' }] },
];

export const TrackingScreen: React.FC = () => {
  const mapRef = useRef<MapView | null>(null);

  const [doorstepOtp] = useState('8492');
  const [riderCoord, setRiderCoord] = useState(ROUTE_COORDINATES[2]);
  const [riderHeading, setRiderHeading] = useState(135);
  const [riderSpeed, setRiderSpeed] = useState(28);
  const [etaMinutes, setEtaMinutes] = useState(11);
  const [remainingKm, setRemainingKm] = useState(2.3);
  const [isLiveTelemetryActive, setIsLiveTelemetryActive] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  // 1. Request location permissions on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermissionGranted(status === 'granted');
      } catch (err) {
        console.warn('Failed to obtain location permission:', err);
      }
    })();
  }, []);

  // 2. Fetch backend delivery status and poll for live courier movement
  useEffect(() => {
    let isCancelled = false;

    const fetchDeliveryStatus = async () => {
      try {
        const data = await mobileApi.getDelivery('BZ-20261105-4819');
        if (!isCancelled && data) {
          if (data.riderLat && data.riderLng) {
            setRiderCoord({
              latitude: Number(data.riderLat),
              longitude: Number(data.riderLng),
            });
            setIsLiveTelemetryActive(true);
          }
          if (data.riderSpeedKmh != null) {
            setRiderSpeed(Math.round(Number(data.riderSpeedKmh)));
          }
          if (data.riderHeadingDegrees != null) {
            setRiderHeading(Math.round(Number(data.riderHeadingDegrees)));
          }
        }
      } catch (err) {
        console.warn('Error fetching mobile delivery status:', err);
      }
    };

    fetchDeliveryStatus();
    const interval = setInterval(fetchDeliveryStatus, 5000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates([STORE_COORD, DESTINATION_COORD, riderCoord], {
        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
        animated: true,
      });
    }
  };

  const handleGetHelp = () => {
    Alert.alert(
      'Order Assistance',
      'Need help with order BZ-20261105-4819?',
      [
        { text: 'Call Driver (Rohit Kumar)', onPress: () => Alert.alert('Dialing +91 98490 28192...') },
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
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>Your order is on the way!</Text>
            <Text style={styles.statusSubtitle}>
              Arriving in {etaMinutes} min · Rohit Kumar (KA 01 AB 1234)
            </Text>
          </View>
        </View>

        {/* Real Native Delivery Map */}
        <View style={styles.mapContainer}>
          {Platform.OS !== 'web' ? (
            <MapView
              ref={mapRef}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
              style={StyleSheet.absoluteFill}
              customMapStyle={DARK_MAP_STYLE}
              initialRegion={{
                latitude: 17.4268,
                longitude: 78.4150,
                latitudeDelta: 0.035,
                longitudeDelta: 0.035,
              }}
            >
              {/* Statutory 6.5km Excise Geofence Circle */}
              <Circle
                center={STORE_COORD}
                radius={GEOFENCE_RADIUS_METERS}
                strokeColor="rgba(231, 161, 61, 0.6)"
                fillColor="rgba(231, 161, 61, 0.05)"
                strokeWidth={1.5}
              />

              {/* Delivery Route Polyline */}
              <Polyline
                coordinates={ROUTE_COORDINATES}
                strokeColor={colors.gold}
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />

              {/* Store Origin Marker */}
              <Marker
                coordinate={STORE_COORD}
                title="Jubilee Hills Reserve Spirits"
                description="L-2 Licensed Fulfillment Point"
              >
                <View style={styles.storeMarker}>
                  <Text style={{ fontSize: 10, color: colors.gold, fontWeight: '800' }}>STORE</Text>
                </View>
              </Marker>

              {/* Customer Destination Marker */}
              <Marker
                coordinate={DESTINATION_COORD}
                title="Delivery Destination"
                description="Doorstep Age & ID Verification Required"
              >
                <View style={styles.customerMarker}>
                  <Text style={{ fontSize: 10, color: '#0C0C0F', fontWeight: '800' }}>YOU</Text>
                </View>
              </Marker>

              {/* Rider Marker with Heading Rotation */}
              <Marker
                coordinate={riderCoord}
                title="Rohit Kumar"
                description={`Courier · ${riderSpeed} km/h`}
                rotation={riderHeading}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.riderMarker}>
                  <Text style={{ fontSize: 12 }}>🛵</Text>
                </View>
              </Marker>
            </MapView>
          ) : (
            // Web Simulator Fallback
            <View style={styles.webFallbackContainer}>
              <View style={styles.webMarkerStore}>
                <Text style={{ fontSize: 9, color: colors.gold, fontWeight: '800' }}>STORE</Text>
              </View>
              <View style={styles.webMarkerRider}>
                <Text style={{ fontSize: 12 }}>🛵</Text>
                <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>{riderSpeed} km/h</Text>
              </View>
              <View style={styles.webMarkerCustomer}>
                <Text style={{ fontSize: 9, color: '#0C0C0F', fontWeight: '800' }}>YOU</Text>
              </View>
            </View>
          )}

          {/* Map Overlay Controls */}
          <View style={styles.mapOverlayHeader}>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: isLiveTelemetryActive ? '#10B981' : colors.gold }]} />
              <Text style={styles.liveText}>
                {isLiveTelemetryActive ? '● Live Telemetry Active' : '● GPS Route'}
              </Text>
            </View>

            <TouchableOpacity onPress={handleRecenter} style={styles.recenterButton}>
              <Text style={{ fontSize: 12, color: colors.cream }}>⌖</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Map Stats */}
          <View style={styles.mapStatsFooter}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>{remainingKm} km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ESTIMATED ETA</Text>
              <Text style={styles.statValue}>{etaMinutes} min</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SPEED</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{riderSpeed} km/h</Text>
            </View>
          </View>
        </View>

        {/* Delivery Partner Card */}
        <View style={styles.driverCard}>
          <View style={styles.driverInfoRow}>
            <View style={styles.driverAvatar}>
              <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 13 }}>RK</Text>
            </View>
            <View>
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>Rohit Kumar</Text>
                <Text style={styles.driverRating}>★ 4.9</Text>
              </View>
              <Text style={styles.driverVehicle}>KA 01 AB 1234 · Verified Courier</Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={() => Alert.alert('Calling Rohit Kumar (+91 98490 28192)...')}
              style={styles.iconButton}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.cream }}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Opening live support chat...')}
              style={styles.iconButton}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.cream }}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Live Location */}
        <TouchableOpacity
          onPress={() => Alert.alert('Live route link broadcasted via SMS to trusted contacts!')}
          style={styles.shareCard}
        >
          <View style={styles.shareLeft}>
            <View style={styles.shareIconBox}>
              <Text style={{ fontSize: 12, color: colors.gold, fontWeight: '700' }}>↗</Text>
            </View>
            <View>
              <Text style={styles.shareTitle}>Share Live Tracking</Text>
              <Text style={styles.shareSubtitle}>with trusted safety contacts</Text>
            </View>
          </View>
          <Text style={{ color: colors.creamMuted, fontSize: 16 }}>→</Text>
        </TouchableOpacity>

        {/* Doorstep Age Verification Check Card (Customer's private OTP) */}
        <View style={styles.doorstepCard}>
          <Text style={styles.doorstepTitle}>Doorstep Age Verification Code</Text>
          <Text style={styles.doorstepSubtitle}>
            Share this private 4-digit OTP with courier Rohit Kumar upon doorstep age & ID check:
          </Text>
          <View style={styles.otpBox}>
            <Text style={styles.otpValue}>{doorstepOtp}</Text>
          </View>
        </View>

        {/* Get Help Button */}
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
    height: 280,
    backgroundColor: '#0E0E14',
    borderWidth: 1,
    borderColor: 'rgba(231, 161, 61, 0.3)',
    borderRadius: 22,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  storeMarker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#16161E',
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
  },
  customerMarker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.gold,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  riderMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16161E',
    borderWidth: 2,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101018',
  },
  webMarkerStore: {
    position: 'absolute',
    top: 30,
    left: 40,
    backgroundColor: '#16161E',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  webMarkerCustomer: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    backgroundColor: colors.gold,
    padding: 6,
    borderRadius: 8,
  },
  webMarkerRider: {
    alignItems: 'center',
    backgroundColor: 'rgba(231, 161, 61, 0.2)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  mapOverlayHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 9, 14, 0.88)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(231, 161, 61, 0.3)',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    color: colors.cream,
    fontSize: 10,
    fontWeight: '700',
  },
  recenterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(9, 9, 14, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  mapStatsFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(14, 14, 20, 0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: colors.creamMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  statValue: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  driverCard: {
    backgroundColor: colors.cardGlass,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: 'rgba(231, 161, 61, 0.15)',
    borderWidth: 1.5,
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  driverRating: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  shareCard: {
    backgroundColor: colors.cardGlass,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderRadius: 16,
    backgroundColor: 'rgba(231, 161, 61, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  shareSubtitle: {
    color: colors.creamMuted,
    fontSize: 11,
    marginTop: 1,
  },
  doorstepCard: {
    backgroundColor: 'rgba(231, 161, 61, 0.06)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(231, 161, 61, 0.25)',
    marginBottom: 20,
  },
  doorstepTitle: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '800',
  },
  doorstepSubtitle: {
    color: colors.creamMuted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  otpBox: {
    backgroundColor: 'rgba(12, 12, 15, 0.85)',
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  otpValue: {
    color: colors.gold,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 10,
  },
  getHelpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  getHelpText: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
});
