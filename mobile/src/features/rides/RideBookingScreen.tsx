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

export const RideBookingScreen: React.FC = () => {
  const [selectedPartner, setSelectedPartner] = useState('uber');
  const [isBooked, setIsBooked] = useState(false);

  const partners = [
    {
      id: 'uber',
      name: 'Uber Premier',
      vehicle: 'Luxury Sedan (Camry / Dzire)',
      eta: '4 min away',
      base: 380,
      net: 230,
      discount: 150,
      driver: 'Manoj Reddy (★ 4.9)',
      plate: 'TS 09 AB 4821',
    },
    {
      id: 'ola',
      name: 'Ola Prime Sedan',
      vehicle: 'Premium Sedan (Free Wi-Fi)',
      eta: '6 min away',
      base: 360,
      net: 210,
      discount: 150,
      driver: 'Kishore Kumar (★ 4.8)',
      plate: 'TS 08 CZ 9912',
    },
    {
      id: 'rapido',
      name: 'Rapido Cab',
      vehicle: 'Quick City Transit',
      eta: '3 min away',
      base: 290,
      net: 140,
      discount: 150,
      driver: 'Suresh Paul (★ 4.7)',
      plate: 'TS 07 ED 1104',
    },
  ];

  const current = partners.find((p) => p.id === selectedPartner) || partners[0];

  return (
    <View style={styles.container}>
      {/* Persistent SOS Floating Pill */}
      <PersistentSosButton />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Safe Ride Voucher Card */}
        <View style={styles.voucherCard}>
          <View style={styles.voucherHeader}>
            <Text style={styles.voucherTag}>BUILT-IN SAFE RIDE CREDIT</Text>
            <Text style={styles.voucherExpiry}>Expires in 23h 40m</Text>
          </View>
          <Text style={styles.voucherCode}>Code: SAFERIDE-4819</Text>
          <Text style={styles.voucherDiscount}>₹150.00 OFF Applied</Text>
          <Text style={styles.voucherNote}>Automatically deducted from your eligible trip</Text>
        </View>

        {/* Origin & Destination */}
        <View style={styles.routeCard}>
          <View style={styles.pointRow}>
            <Text style={{ color: colors.gold, fontSize: 10 }}>●</Text>
            <View>
              <Text style={styles.pointLabel}>Pickup</Text>
              <Text style={styles.pointAddress}>Road No. 36, Jubilee Hills</Text>
            </View>
          </View>
          <View style={styles.dottedDivider} />
          <View style={styles.pointRow}>
            <Text style={{ color: colors.tealNoir, fontSize: 10 }}>●</Text>
            <View>
              <Text style={styles.pointLabel}>Destination</Text>
              <Text style={styles.pointAddress}>Villa 14, Silicon Meadows (Home)</Text>
            </View>
          </View>
        </View>

        {/* Partner Comparisons */}
        <Text style={styles.sectionTitle}>Available Partner Fleets</Text>

        {partners.map((p) => {
          const isSelected = selectedPartner === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => setSelectedPartner(p.id)}
              style={[styles.partnerCard, isSelected && styles.partnerCardActive]}
            >
              <View style={styles.partnerLeft}>
                <View style={styles.carIconBox}>
                  <Text style={{ fontSize: 18 }}>🚘</Text>
                </View>
                <View>
                  <Text style={styles.partnerName}>{p.name}</Text>
                  <Text style={styles.partnerDetails}>{p.vehicle} · {p.eta}</Text>
                </View>
              </View>

              <View style={styles.partnerRight}>
                <Text style={styles.baseFare}>₹{p.base}</Text>
                <Text style={styles.netFare}>₹{p.net}</Text>
                <Text style={styles.discountTag}>₹150 off</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Action Button */}
        {!isBooked ? (
          <TouchableOpacity onPress={() => setIsBooked(true)} style={styles.bookButton}>
            <Text style={styles.bookButtonText}>
              Confirm {current.name} · ₹{current.net}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.bookedContainer}>
            <Text style={styles.bookedTitle}>✓ Ride Confirmed with Safe Ride Credit</Text>
            <Text style={styles.bookedDesc}>
              Driver {current.driver} in {current.plate} will arrive in {current.eta}.
            </Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Live trip link sent via SMS to Rahul & Ananya!')}
              style={styles.shareTripButton}
            >
              <Text style={styles.shareTripText}>Share Live Trip with Contacts →</Text>
            </TouchableOpacity>
          </View>
        )}
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
  voucherCard: {
    backgroundColor: 'rgba(231, 161, 61, 0.1)',
    borderWidth: 1,
    borderColor: colors.cardBorderActive,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  voucherTag: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  voucherExpiry: {
    color: colors.creamMuted,
    fontSize: 10,
  },
  voucherCode: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  voucherDiscount: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 4,
  },
  voucherNote: {
    color: colors.creamMuted,
    fontSize: 11,
  },
  routeCard: {
    backgroundColor: colors.cardGlass,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointLabel: {
    color: colors.creamMuted,
    fontSize: 10,
  },
  pointAddress: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  dottedDivider: {
    height: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.cardBorder,
    marginLeft: 4,
    marginVertical: 2,
  },
  sectionTitle: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  partnerCard: {
    backgroundColor: '#14101F',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  partnerCardActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(231, 161, 61, 0.08)',
  },
  partnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E172E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerName: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '800',
  },
  partnerDetails: {
    color: colors.creamMuted,
    fontSize: 11,
    marginTop: 2,
  },
  partnerRight: {
    alignItems: 'flex-end',
  },
  baseFare: {
    color: colors.creamSubtle,
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  netFare: {
    color: colors.gold,
    fontSize: 17,
    fontWeight: '900',
  },
  discountTag: {
    color: colors.tealNoir,
    fontSize: 9.5,
    fontWeight: '700',
  },
  bookButton: {
    backgroundColor: colors.gold,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  bookButtonText: {
    color: colors.midnight,
    fontSize: 14,
    fontWeight: '800',
  },
  bookedContainer: {
    backgroundColor: 'rgba(36, 141, 120, 0.15)',
    borderWidth: 1,
    borderColor: colors.tealNoir,
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
  },
  bookedTitle: {
    color: colors.tealNoir,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  bookedDesc: {
    color: colors.cream,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  shareTripButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  shareTripText: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '700',
  },
});
