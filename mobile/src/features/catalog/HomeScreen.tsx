import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useCartStore, ProductItem } from '../../store/useCartStore';

const POPULAR_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-jd',
    name: "Jack Daniel's Old No. 7",
    brand: "Jack Daniel's",
    category: 'WHISKY',
    abv: 40.0,
    volumeMl: 750,
    priceLegalMrp: 2999.0,
    imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=600&q=80',
    tastingNotes: 'Caramel, vanilla, toasted oak, smooth charcoal finish',
    minAge: 21,
  },
  {
    id: 'prod-heineken',
    name: 'Heineken Premium Lager',
    brand: 'Heineken',
    category: 'BEER',
    abv: 5.0,
    volumeMl: 650,
    priceLegalMrp: 1499.0,
    imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=600&q=80',
    tastingNotes: 'Clean, crisp, subtle fruit notes',
    minAge: 21,
  },
  {
    id: 'prod-jw-black',
    name: 'Johnnie Walker Black Label 12Y',
    brand: 'Johnnie Walker',
    category: 'WHISKY',
    abv: 40.0,
    volumeMl: 750,
    priceLegalMrp: 3450.0,
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
    tastingNotes: 'Sweet vanilla, dark fruits, signature smoky finish',
    minAge: 21,
  },
];

interface HomeScreenProps {
  onNavigateToRide: () => void;
  onNavigateToCart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToRide,
  onNavigateToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const { items, addItem } = useCartStore();

  const categories = [
    { key: 'ALL', label: 'All' },
    { key: 'BEER', label: 'Beer' },
    { key: 'WHISKY', label: 'Whisky' },
    { key: 'VODKA', label: 'Vodka' },
    { key: 'RUM', label: 'Rum' },
    { key: 'WINE', label: 'Wine' },
  ];

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Profile & Location Bar */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greetingText}>Good evening, Panvi</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>DELIVERING TO</Text>
            <Text style={styles.locationText}>Hyderabad ▾</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onNavigateToCart} style={styles.avatarButton}>
          <Text style={styles.avatarText}>P</Text>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search by brand, category, or vintage..."
          placeholderTextColor={colors.creamMuted}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Hero Ride Voucher Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroTextContainer}>
          <View style={styles.safetyTag}>
            <Text style={styles.safetyTagText}>RESPONSIBLE TRANSIT</Text>
          </View>
          <Text style={styles.heroTitle}>₹150 Safe Ride Credit Included</Text>
          <Text style={styles.heroDesc}>
            Complimentary voucher applied on Uber & Ola for a safe ride home.
          </Text>
          <TouchableOpacity onPress={onNavigateToRide} style={styles.heroCta}>
            <Text style={styles.heroCtaText}>View Ride Credit →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.voucherBadge}>
          <Text style={styles.voucherBadgeAmount}>₹150</Text>
          <Text style={styles.voucherBadgeSub}>VOUCHER</Text>
        </View>
      </View>

      {/* Categories Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((c) => {
          const isActive = selectedCategory === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              onPress={() => setSelectedCategory(c.key)}
              style={[styles.categoryPill, isActive && styles.categoryPillActive]}
            >
              <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Popular Picks Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Picks</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all →</Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <View style={styles.productGrid}>
        {POPULAR_PRODUCTS.map((prod) => {
          const inCart = items.find((i) => i.product.id === prod.id);
          return (
            <View key={prod.id} style={styles.productCard}>
              <Image source={{ uri: prod.imageUrl }} style={styles.productImage} />
              <View style={styles.abvTag}>
                <Text style={styles.abvText}>{prod.abv}% ABV · {prod.volumeMl}ml</Text>
              </View>

              <Text style={styles.brandText}>{prod.brand}</Text>
              <Text style={styles.productName} numberOfLines={1}>{prod.name}</Text>

              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceValue}>₹{prod.priceLegalMrp.toLocaleString('en-IN')}</Text>
                  <Text style={styles.mrpLabel}>Legal MRP</Text>
                </View>

                <TouchableOpacity onPress={() => addItem(prod)} style={styles.addCircle}>
                  <Text style={styles.addCircleText}>{inCart ? inCart.quantity : '+'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
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
    paddingBottom: 100,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    color: colors.cream,
    fontSize: 20,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  locationLabel: {
    color: colors.creamSubtle,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  locationText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.midnight,
    fontSize: 15,
    fontWeight: '800',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.crimson,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: colors.cream,
    fontSize: 13,
  },
  heroBanner: {
    backgroundColor: '#181822',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.25)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTextContainer: {
    maxWidth: '70%',
  },
  safetyTag: {
    backgroundColor: 'rgba(197, 160, 89, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  safetyTagText: {
    color: colors.gold,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 19,
    marginBottom: 4,
  },
  heroDesc: {
    color: colors.creamMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  heroCta: {
    marginTop: 8,
    backgroundColor: colors.gold,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  heroCtaText: {
    color: colors.midnight,
    fontSize: 11,
    fontWeight: '700',
  },
  voucherBadge: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#1D1D28',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherBadgeAmount: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '900',
  },
  voucherBadgeSub: {
    color: colors.creamMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#181822',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#252535',
    borderColor: colors.gold,
  },
  categoryPillText: {
    color: colors.creamMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: colors.gold,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '800',
  },
  seeAllText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#111116',
    marginBottom: 8,
  },
  abvTag: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(9, 9, 14, 0.85)',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  abvText: {
    color: '#FFA07A',
    fontSize: 9.5,
    fontWeight: '700',
  },
  brandText: {
    color: colors.creamMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  productName: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceValue: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '800',
  },
  mrpLabel: {
    color: colors.creamSubtle,
    fontSize: 9,
  },
  addCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCircleText: {
    color: colors.midnight,
    fontSize: 14,
    fontWeight: '900',
  },
});
