import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useSessionStore } from '../../store/useSessionStore';
import { AuthModal } from '../auth/AuthModal';

export const ProfileScreen: React.FC = () => {
  const { user } = useSessionStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const pastOrders = [
    {
      id: 'BZ-20261105-4819',
      date: 'Today, 21:44',
      store: 'Jubilee Hills Reserve Spirits',
      items: "1× Jack Daniel's Old No. 7, 2× Heineken",
      total: '₹5,997.00',
      status: 'IN TRANSIT',
      rideCredit: 'Active (₹150.00)',
    },
    {
      id: 'BZ-20261028-0912',
      date: '28 Oct 2026, 20:30',
      store: 'Jubilee Hills Reserve Spirits',
      items: '1× Johnnie Walker Black Label 12Y',
      total: '₹3,450.00',
      status: 'DELIVERED',
      rideCredit: 'Redeemed on Uber',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>{user.fullName.charAt(0)}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
          <Text style={styles.userAge}>
            Age {user.calculatedAge} Years · Born 1997
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsAuthModalOpen(true)}
          style={{
            backgroundColor: 'rgba(101, 201, 156, 0.14)',
            borderWidth: 1,
            borderColor: 'rgba(101, 201, 156, 0.4)',
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 5,
            alignSelf: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>
            Switch Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* DigiLocker KYC Verified Badge */}
      <View style={styles.kycCard}>
        <View style={styles.kycHeader}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(30, 130, 112, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#34D399', fontWeight: '800', fontSize: 12 }}>✓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.kycTitle}>DigiLocker KYC Verified</Text>
            <Text style={styles.kycDoc}>
              {user.documentType} ({user.maskedDocNumber})
            </Text>
          </View>
          <View style={styles.verifiedPill}>
            <Text style={styles.verifiedPillText}>VERIFIED</Text>
          </View>
        </View>
        <Text style={styles.dpdpNotice}>
          DPDP Act 2023 Compliant: Zero raw identity documents stored.
        </Text>
      </View>

      {/* Safe Ride Wallet */}
      <View style={styles.walletCard}>
        <View style={styles.walletLeft}>
          <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#1F1D2B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 14 }}>₹</Text>
          </View>
          <View>
            <Text style={styles.walletLabel}>SAFE RIDE WALLET</Text>
            <Text style={styles.walletAmount}>₹{user.activeRideCredit.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.activeVoucherPill}>
          <Text style={styles.activeVoucherText}>1 Active Credit</Text>
        </View>
      </View>

      {/* Saved Delivery Address */}
      <View style={styles.addressCard}>
        <Text style={styles.addressTitle}>Saved Delivery Location</Text>
        <Text style={styles.addressText}>{user.deliveryAddress}</Text>
        <Text style={styles.zoneText}>Within 6.5km legal delivery perimeter</Text>
      </View>

      {/* Order History */}
      <Text style={styles.sectionTitle}>Past Orders & Receipts</Text>
      {pastOrders.map((ord) => (
        <View key={ord.id} style={styles.orderCard}>
          <View style={styles.orderTop}>
            <Text style={styles.orderId}>{ord.id}</Text>
            <View style={[styles.statusBadge, ord.status === 'DELIVERED' && styles.statusBadgeDelivered]}>
              <Text style={styles.statusBadgeText}>{ord.status}</Text>
            </View>
          </View>

          <Text style={styles.orderStore}>{ord.store}</Text>
          <Text style={styles.orderItems}>{ord.items}</Text>
          <Text style={styles.orderDate}>{ord.date}</Text>

          <View style={styles.orderBottom}>
            <Text style={styles.orderTotal}>Total: {ord.total}</Text>
            <Text style={styles.orderRideCredit}>Ride: {ord.rideCredit}</Text>
          </View>
        </View>
      ))}

      {/* CompareX Styled AuthModal */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </ScrollView>
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
  profileCard: {
    backgroundColor: colors.cardGlass,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeText: {
    color: colors.midnight,
    fontSize: 22,
    fontWeight: '900',
  },
  userName: {
    color: colors.cream,
    fontSize: 18,
    fontWeight: '800',
  },
  userPhone: {
    color: colors.creamMuted,
    fontSize: 12,
    marginTop: 2,
  },
  userAge: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  kycCard: {
    backgroundColor: 'rgba(36, 141, 120, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(36, 141, 120, 0.4)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  kycHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  kycCheckIcon: {
    fontSize: 18,
  },
  kycTitle: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '800',
  },
  kycDoc: {
    color: colors.creamMuted,
    fontSize: 11,
  },
  verifiedPill: {
    backgroundColor: colors.tealNoir,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  verifiedPillText: {
    color: '#fff',
    fontSize: 9.5,
    fontWeight: '900',
  },
  dpdpNotice: {
    color: colors.creamSubtle,
    fontSize: 10,
    lineHeight: 14,
  },
  walletCard: {
    backgroundColor: 'rgba(231, 161, 61, 0.12)',
    borderWidth: 1,
    borderColor: colors.cardBorderActive,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIcon: {
    fontSize: 24,
  },
  walletLabel: {
    color: colors.creamMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  walletAmount: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  activeVoucherPill: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  activeVoucherText: {
    color: colors.midnight,
    fontSize: 11,
    fontWeight: '800',
  },
  addressCard: {
    backgroundColor: colors.cardGlass,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  addressTitle: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  addressText: {
    color: colors.creamMuted,
    fontSize: 11.5,
    lineHeight: 16,
  },
  zoneText: {
    color: colors.tealNoir,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: '#14101F',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  statusBadge: {
    backgroundColor: 'rgba(231, 161, 61, 0.15)',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  statusBadgeDelivered: {
    backgroundColor: 'rgba(36, 141, 120, 0.15)',
  },
  statusBadgeText: {
    color: colors.cream,
    fontSize: 10,
    fontWeight: '800',
  },
  orderStore: {
    color: colors.creamMuted,
    fontSize: 11,
  },
  orderItems: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 4,
  },
  orderDate: {
    color: colors.creamSubtle,
    fontSize: 10,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  orderTotal: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  orderRideCredit: {
    color: colors.tealNoir,
    fontSize: 11,
    fontWeight: '700',
  },
});
