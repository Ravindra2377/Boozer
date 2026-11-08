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
import { useCartStore } from '../../store/useCartStore';

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
  const total = getTotal();

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      Alert.alert('Payment Captured', 'Razorpay payment successful. Order BZ-20261105-4819 placed!');
      onCheckoutSuccess();
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cart & Checkout</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A22', alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: colors.cardBorder }}>
              <Text style={{ fontSize: 18, color: colors.creamMuted }}>0</Text>
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>Add legal beverages from the catalog to proceed.</Text>
          </View>
        ) : (
          <>
            {/* Delivery Location Check */}
            <View style={styles.addressBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressTitle}>Delivery Destination</Text>
                <Text style={styles.addressDesc}>Villa 14, Silicon Meadows, Jubilee Hills</Text>
                <Text style={styles.geofenceBadge}>Within 6.5km legal delivery perimeter</Text>
              </View>
            </View>

            {/* Cart Items */}
            {items.map((entry) => (
              <View key={entry.product.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{entry.product.name}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{entry.product.priceLegalMrp.toLocaleString('en-IN')} × {entry.quantity}
                  </Text>
                </View>

                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(entry.product.id, entry.quantity - 1)}
                    style={styles.qtyBtn}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{entry.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(entry.product.id, entry.quantity + 1)}
                    style={styles.qtyBtn}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Safe Ride Credit Promotion */}
            <View style={styles.safeRidePromo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.safeRideTitle}>Safe Ride Credit Included (₹150)</Text>
                <Text style={styles.safeRideDesc}>
                  Order activates a ₹150 Uber/Ola discount voucher valid for 24h.
                </Text>
              </View>
            </View>

            {/* Price Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal (Statutory MRP)</Text>
                <Text style={styles.breakdownVal}>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Delivery Partner Fee</Text>
                <Text style={styles.breakdownVal}>₹50.00</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Excise Security Packaging</Text>
                <Text style={styles.breakdownVal}>₹20.00</Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalVal}>₹{total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Doorstep Age Check Notice */}
            <Text style={styles.doorstepNotice}>
              🛡 Doorstep Age Check: Physical ID and recipient OTP verification enforced by rider.
            </Text>

            {/* Pay Button */}
            <TouchableOpacity
              onPress={handlePay}
              disabled={isProcessing}
              style={styles.payButton}
            >
              <Text style={styles.payButtonText}>
                {isProcessing ? 'Authorizing Razorpay...' : `Pay ₹${total.toFixed(2)} via UPI`}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
    paddingTop: 54,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  title: {
    color: colors.cream,
    fontSize: 20,
    fontWeight: '800',
  },
  closeText: {
    color: colors.creamMuted,
    fontSize: 18,
  },
  content: {
    padding: 18,
    paddingBottom: 80,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    color: colors.creamMuted,
    fontSize: 12,
    marginTop: 4,
  },
  addressBox: {
    backgroundColor: colors.cardGlass,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  addressTitle: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  addressDesc: {
    color: colors.creamMuted,
    fontSize: 11,
    marginTop: 2,
  },
  geofenceBadge: {
    color: colors.tealNoir,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  itemRow: {
    backgroundColor: '#14101F',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  itemPrice: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1E172E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  qtyBtnText: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '800',
  },
  qtyValue: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '800',
    minWidth: 16,
    textAlign: 'center',
  },
  safeRidePromo: {
    backgroundColor: 'rgba(36, 141, 120, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(36, 141, 120, 0.35)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  safeRideTitle: {
    color: colors.tealNoir,
    fontSize: 12.5,
    fontWeight: '800',
  },
  safeRideDesc: {
    color: colors.creamMuted,
    fontSize: 10.5,
    marginTop: 2,
  },
  breakdownCard: {
    backgroundColor: colors.cardGlass,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    color: colors.creamMuted,
    fontSize: 12,
  },
  breakdownVal: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '800',
  },
  totalVal: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '900',
  },
  doorstepNotice: {
    color: colors.creamMuted,
    fontSize: 10.5,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 14,
  },
  payButton: {
    backgroundColor: colors.gold,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  payButtonText: {
    color: colors.midnight,
    fontSize: 14,
    fontWeight: '900',
  },
});
