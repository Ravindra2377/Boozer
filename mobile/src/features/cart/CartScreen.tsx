import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, RADIUS, SPACING } from '../../theme';
import { useCartStore } from '../../store/useCartStore';
import { SurfaceCard, AppButton } from '../../components/SharedUI';
import { LiquidGlass } from '../../components/LiquidGlass';

interface CartScreenProps {
  onCheckoutSuccess: () => void;
  onClose: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onCheckoutSuccess,
  onClose,
}) => {
  const { items, updateQuantity, clearCart, getSubtotal, getTotal } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = 49.0;
  const excisePackagingFee = 20.0;
  const originalSubtotal = Math.round(subtotal * 1.08);
  const totalSavings = originalSubtotal - subtotal;
  const total = subtotal + deliveryFee + excisePackagingFee;

  const handlePay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      Alert.alert(
        'Excise Order Confirmed',
        'Razorpay payment captured. Delivery partner assigned from legal excise depot!'
      );
      onCheckoutSuccess();
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Review & Checkout</Text>
          <Text style={styles.subTitle}>10-Minute Hyperlocal Excise Delivery</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyCircle}>
              <Text style={styles.emptyIcon}>🛒</Text>
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>
              Select your favorite beverages from our verified excise catalog.
            </Text>
            <AppButton
              label="Explore Catalog"
              onPress={onClose}
              variant="gradient"
              style={{ marginTop: 18 }}
            />
          </View>
        ) : (
          <>
            {/* Delivery Destination SurfaceCard */}
            <SurfaceCard style={styles.destinationCard}>
              <View style={styles.destHeader}>
                <Text style={styles.destPin}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.destTitle}>Delivery Destination</Text>
                  <Text style={styles.destAddress}>
                    Villa 14, Silicon Meadows, Jubilee Hills, Hyderabad
                  </Text>
                </View>
                <View style={styles.verifiedZoneTag}>
                  <Text style={styles.verifiedZoneText}>LEGAL ZONE</Text>
                </View>
              </View>
              <Text style={styles.geofenceNote}>
                ✓ Verified within statutory 6.5km legal excise depot radius
              </Text>
            </SurfaceCard>

            {/* Savings Banner */}
            {totalSavings > 0 && (
              <View style={styles.savingsBanner}>
                <Text style={styles.savingsIcon}>🎉</Text>
                <Text style={styles.savingsText}>
                  You're saving <Text style={styles.savingsHighlight}>₹{totalSavings}</Text> below statutory market MRP!
                </Text>
              </View>
            )}

            {/* Cart Items List */}
            <Text style={styles.sectionLabel}>ITEMS IN CART ({items.length})</Text>
            {items.map((entry) => (
              <SurfaceCard key={entry.product.id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemBrand}>{entry.product.brand}</Text>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {entry.product.name}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {entry.product.abv}% ABV · {entry.product.volumeMl}ml
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₹{entry.product.priceLegalMrp.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(entry.product.id, entry.quantity - 1)}
                    style={styles.qtyBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{entry.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(entry.product.id, entry.quantity + 1)}
                    style={styles.qtyBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </SurfaceCard>
            ))}

            {/* Responsible Transit Voucher Card */}
            <SurfaceCard style={styles.rideCard}>
              <View style={styles.rideLeft}>
                <View style={styles.rideBadge}>
                  <Text style={styles.rideBadgeText}>RESPONSIBLE DRINKING</Text>
                </View>
                <Text style={styles.rideTitle}>₹150 Safe Ride Credit Included</Text>
                <Text style={styles.rideSub}>
                  Automatic voucher credit sent to Uber/Ola for your safe return.
                </Text>
              </View>
              <View style={styles.ridePill}>
                <Text style={styles.ridePillText}>FREE</Text>
              </View>
            </SurfaceCard>

            {/* Bill Summary */}
            <SurfaceCard style={styles.billCard}>
              <Text style={styles.billHeader}>Bill Summary</Text>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total (Statutory MRP)</Text>
                <Text style={styles.billVal}>₹{subtotal.toFixed(2)}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Excise Security Packaging</Text>
                <Text style={styles.billVal}>₹{excisePackagingFee.toFixed(2)}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Partner Fee (10 min)</Text>
                <Text style={styles.billVal}>₹{deliveryFee.toFixed(2)}</Text>
              </View>

              <View style={[styles.billRow, styles.totalRow]}>
                <View>
                  <Text style={styles.totalLabel}>To Pay</Text>
                  <Text style={styles.taxSub}>Inclusive of all state excise taxes</Text>
                </View>
                <Text style={styles.totalVal}>₹{total.toFixed(2)}</Text>
              </View>
            </SurfaceCard>

            {/* Doorstep Age Check Notice */}
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                🛡 Doorstep Age Check: Physical Government Photo ID and recipient OTP verification enforced by certified rider prior to handover.
              </Text>
            </View>

            {/* Checkout Action */}
            <AppButton
              label={isProcessing ? 'Authorizing Razorpay UPI...' : `Pay ₹${total.toFixed(2)} with UPI`}
              onPress={handlePay}
              disabled={isProcessing}
              variant="gradient"
              style={{ marginTop: 8 }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 80,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 90,
  },
  emptyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyIcon: {
    fontSize: 26,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 240,
  },
  destinationCard: {
    marginBottom: 12,
  },
  destHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  destPin: {
    fontSize: 16,
    marginTop: 1,
  },
  destTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  destAddress: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifiedZoneTag: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  verifiedZoneText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.savings,
  },
  geofenceNote: {
    fontSize: 10.5,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '600',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    borderColor: 'rgba(5, 150, 105, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 10,
    gap: 8,
    marginBottom: 14,
  },
  savingsIcon: {
    fontSize: 14,
  },
  savingsText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  savingsHighlight: {
    color: colors.savings,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 10,
  },
  itemBrand: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  itemMeta: {
    fontSize: 10.5,
    color: colors.textTertiary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    paddingHorizontal: 8,
  },
  rideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(101, 201, 156, 0.08)',
    borderColor: 'rgba(101, 201, 156, 0.25)',
    marginVertical: 12,
  },
  rideLeft: {
    flex: 1,
    paddingRight: 10,
  },
  rideBadge: {
    backgroundColor: 'rgba(101, 201, 156, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  rideBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.primary,
  },
  rideTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  rideSub: {
    fontSize: 10.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ridePill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  ridePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textInverse,
  },
  billCard: {
    marginBottom: 14,
  },
  billHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  billVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 6,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  taxSub: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  noticeBox: {
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 14,
  },
  noticeText: {
    fontSize: 10,
    color: colors.textTertiary,
    lineHeight: 14,
    textAlign: 'center',
  },
});
