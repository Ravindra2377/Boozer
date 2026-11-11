import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, RADIUS, SHADOWS, SPACING } from '../theme';
import { ProductItem } from '../store/useCartStore';

interface ProductCardProps {
  product: ProductItem;
  quantity?: number;
  onAddToCart?: () => void;
  onRemoveFromCart?: () => void;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity = 0,
  onAddToCart,
  onRemoveFromCart,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 25,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
    }).start();
  };

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onAddToCart) onAddToCart();
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onRemoveFromCart) onRemoveFromCart();
  };

  // Mock a market MRP comparison for realistic quick-commerce savings
  const originalPrice = Math.round(product.priceLegalMrp * 1.08);
  const savings = originalPrice - product.priceLegalMrp;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.container]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* Product Image Area */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Savings Badge */}
          {savings > 50 && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>SAVE ₹{savings}</Text>
            </View>
          )}

          {/* Quick ABV tag */}
          <View style={styles.abvBadge}>
            <Text style={styles.abvBadgeText}>
              {product.abv}% ABV · {product.volumeMl}ml
            </Text>
          </View>
        </View>

        {/* Content Details */}
        <View style={styles.details}>
          <Text style={styles.brandText}>{product.brand}</Text>
          <Text style={styles.nameText} numberOfLines={2}>
            {product.name}
          </Text>

          {product.tastingNotes ? (
            <Text style={styles.tastingNotes} numberOfLines={1}>
              {product.tastingNotes}
            </Text>
          ) : null}

          {/* Price & Cart Actions Row */}
          <View style={styles.priceRow}>
            <View>
              <View style={styles.priceTagRow}>
                <Text style={styles.priceSymbol}>₹</Text>
                <Text style={styles.priceNumber}>
                  {product.priceLegalMrp.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.mrpRow}>
                <Text style={styles.mrpText}>
                  MRP ₹{originalPrice.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.exciseLegalText}>· Statutory</Text>
              </View>
            </View>

            {/* Cart Button */}
            {quantity > 0 ? (
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  onPress={handleRemove}
                  style={styles.qtyBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyDisplay}>{quantity}</Text>
                <TouchableOpacity
                  onPress={handleAdd}
                  style={styles.qtyBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleAdd}
                style={styles.addBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.addBtnText}>ADD +</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  imageWrapper: {
    width: '100%',
    height: 145,
    backgroundColor: colors.cardAlt,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  savingsBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.savings,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  savingsBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  abvBadge: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: 'rgba(14, 21, 17, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  abvBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  details: {
    padding: 10,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 17,
    height: 34,
  },
  tastingNotes: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 2,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceTagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priceSymbol: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  priceNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  mrpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  mrpText: {
    fontSize: 9.5,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  exciseLegalText: {
    fontSize: 8.5,
    color: colors.textTertiary,
  },
  addBtn: {
    backgroundColor: 'rgba(101, 201, 156, 0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  addBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '900',
  },
  qtyDisplay: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 6,
  },
});
