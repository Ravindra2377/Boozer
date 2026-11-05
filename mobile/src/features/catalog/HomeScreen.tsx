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
    { key: 'ALL', label: 'All', icon: '✨' },
    { key: 'BEER', label: 'Beer', icon: '🍺' },
    { key: 'WHISKY', label: 'Whisky', icon: '🥃' },
    { key: 'VODKA', label: 'Vodka', icon: '🍸' },
    { key: 'RUM', label: 'Rum', icon: '🍹' },
    { key: 'WINE', label: 'Wine', icon: '🍷' },
  ];

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Profile & Location Bar */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greetingText}>Good evening, Panvi 👋</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Hyderabad ⌄</Text>
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
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search for your favourite drink..."
          placeholderTextColor={colors.creamMuted}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Hero Ride Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroTextContainer}>
          <View style={styles.safetyTag}>
            <Text style={styles.safetyTagText}>🛡 Safety First</Text>
          </View>
          <Text style={styles.heroTitle}>Get a Ride with Every Order</Text>
          <Text style={styles.heroDesc}>
            Included ₹150 ride voucher on Uber and Ola for a safe ride home.
          </Text>
          <TouchableOpacity onPress={onNavigateToRide} style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Explore Rides →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.carGraphic}>
          <Text style={styles.carEmoji}>🚘</Text>
        </View>
        <View style={styles.amberRoadTrail} />
      </View>

      {/* Categories Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((c) => {
          const isActive = selectedCategory === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              onPress={() => setSelectedCategory(c.key)}
              style={styles.categoryItem}
            >
              <View style={[styles.categoryIconBox, isActive && styles.categoryIconBoxActive]}>
                <Text style={styles.categoryIconText}>{c.icon}</Text>
              </View>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
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
    gap: 4,
    marginTop: 2,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarText: {
    color: colors.midnight,
    fontSize: 16,
    fontWeight: '900',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.purpleLight,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 17, 32, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.cream,
    fontSize: 13.5,
  },
  heroBanner: {
    backgroundColor: '#181226',
    borderWidth: 1,
    borderColor: colors.cardBorderActive,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroTextContainer: {
    maxWidth: '65%',
  },
  safetyTag: {
    backgroundColor: 'rgba(231, 161, 61, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(231, 161, 61, 0.4)',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  safetyTagText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
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
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  heroCtaText: {
    color: colors.midnight,
    fontSize: 11,
    fontWeight: '800',
  },
  carGraphic: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carEmoji: {
    fontSize: 42,
  },
  amberRoadTrail: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 14,
  },
  categoryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#191326',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryIconBoxActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  categoryIconText: {
    fontSize: 22,
  },
  categoryLabel: {
    color: colors.creamMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  categoryLabelActive: {
    color: colors.gold,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.cream,
    fontSize: 17,
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
    backgroundColor: '#151122',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: '#0A0812',
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
