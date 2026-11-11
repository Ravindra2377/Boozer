import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, RADIUS, SPACING } from '../../theme';
import { useCartStore, ProductItem } from '../../store/useCartStore';
import { BrandHeader } from '../../components/BrandHeader';
import { SearchBar } from '../../components/SearchBar';
import { FilterModal, FilterState } from '../../components/FilterModal';
import { ProductCard } from '../../components/ProductCard';
import { AppChip, SectionHeader } from '../../components/SharedUI';

const CATALOG_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-jd',
    name: "Jack Daniel's Old No. 7 Tennessee",
    brand: "Jack Daniel's",
    category: 'WHISKY',
    abv: 40.0,
    volumeMl: 750,
    priceLegalMrp: 2999.0,
    imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=600&q=80',
    tastingNotes: 'Caramel, vanilla, toasted oak, charcoal finish',
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
  {
    id: 'prod-heineken',
    name: 'Heineken Premium Pure Malt Lager',
    brand: 'Heineken',
    category: 'BEER',
    abv: 5.0,
    volumeMl: 650,
    priceLegalMrp: 280.0,
    imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=600&q=80',
    tastingNotes: 'Clean, crisp, subtle European barley notes',
    minAge: 21,
  },
  {
    id: 'prod-corona',
    name: 'Corona Extra Premium Imported',
    brand: 'Corona',
    category: 'BEER',
    abv: 4.5,
    volumeMl: 330,
    priceLegalMrp: 240.0,
    imageUrl: 'https://images.unsplash.com/photo-1608270546103-9799298c5663?auto=format&fit=crop&w=600&q=80',
    tastingNotes: 'Light, refreshing, crisp finish with lime aroma',
    minAge: 21,
  },
  {
    id: 'prod-grey-goose',
    name: 'Grey Goose French Vodka',
    brand: 'Grey Goose',
    category: 'VODKA',
    abv: 40.0,
    volumeMl: 750,
    priceLegalMrp: 4100.0,
    imageUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80',
    tastingNotes: 'Almond, apple, citrus, crystalline smoothness',
    minAge: 21,
  },
  {
    id: 'prod-bombay',
    name: 'Bombay Sapphire Botanical Gin',
    brand: 'Bombay Sapphire',
    category: 'GIN',
    abv: 47.0,
    volumeMl: 750,
    priceLegalMrp: 2850.0,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    tastingNotes: 'Juniper, coriander, lemon peel, 10 vapor botanicals',
    minAge: 21,
  },
];

const CATEGORIES = [
  { key: 'ALL', label: 'All Drinks' },
  { key: 'WHISKY', label: 'Whisky' },
  { key: 'BEER', label: 'Beer' },
  { key: 'VODKA', label: 'Vodka' },
  { key: 'GIN', label: 'Gin' },
  { key: 'RUM', label: 'Rum' },
  { key: 'WINE', label: 'Wine' },
];

interface HomeScreenProps {
  onNavigateToRide: () => void;
  onNavigateToCart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToRide,
  onNavigateToCart,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [selectedPincode, setSelectedPincode] = useState('500081');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'ALL',
    sortBy: 'POPULAR',
    maxPrice: 10000,
    deliveryFast: false,
  });

  const { items, addItem, removeItem } = useCartStore();
  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...CATALOG_PRODUCTS];

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tastingNotes && p.tastingNotes.toLowerCase().includes(q))
      );
    }

    // Category filter
    const activeCategory = filters.category;
    if (activeCategory !== 'ALL') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Sort
    if (filters.sortBy === 'PRICE_LOW') {
      result.sort((a, b) => a.priceLegalMrp - b.priceLegalMrp);
    } else if (filters.sortBy === 'PRICE_HIGH') {
      result.sort((a, b) => b.priceLegalMrp - a.priceLegalMrp);
    } else if (filters.sortBy === 'ABV_HIGH') {
      result.sort((a, b) => b.abv - a.abv);
    }

    return result;
  }, [search, filters]);

  const activeFilterCount =
    (filters.category !== 'ALL' ? 1 : 0) +
    (filters.sortBy !== 'POPULAR' ? 1 : 0) +
    (filters.deliveryFast ? 1 : 0);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CompareX Editorial Brand Header */}
        <BrandHeader
          city={selectedCity}
          pincode={selectedPincode}
          onLocationChange={(city, pin) => {
            setSelectedCity(city);
            setSelectedPincode(pin);
          }}
          cartCount={totalCartCount}
          onCartPress={onNavigateToCart}
          kycVerified
        />

        {/* Search Bar with Filter Modal Trigger */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
          onOpenFilter={() => setFilterModalVisible(true)}
          filterActiveCount={activeFilterCount}
        />

        {/* Hero Responsible Transit Banner (CompareX Emerald Gradient) */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#0A2E23', '#116149', '#16845B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroLeft}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>RESPONSIBLE TRANSIT</Text>
              </View>
              <Text style={styles.heroTitle}>₹150 Safe Ride Credit</Text>
              <Text style={styles.heroSubtitle}>
                Drink responsibly. Auto-redeem voucher on Uber & Ola for a safe ride home.
              </Text>
              <TouchableOpacity
                onPress={onNavigateToRide}
                style={styles.heroButton}
                activeOpacity={0.8}
              >
                <Text style={styles.heroButtonText}>Claim Ride Voucher →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.voucherBox}>
              <Text style={styles.voucherSymbol}>₹</Text>
              <Text style={styles.voucherAmount}>150</Text>
              <Text style={styles.voucherLabel}>VOUCHER</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Category Pills Bar */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const isActive = filters.category === cat.key;
              return (
                <AppChip
                  key={cat.key}
                  label={cat.label}
                  active={isActive}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category: cat.key,
                    }))
                  }
                />
              );
            })}
          </ScrollView>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderWrap}>
          <SectionHeader
            title="Excise Legal Stock"
            subtitle={`Showing ${filteredProducts.length} verified spirits in ${selectedCity}`}
            actionLabel={activeFilterCount > 0 ? 'Clear Filters' : undefined}
            onActionPress={() =>
              setFilters({
                category: 'ALL',
                sortBy: 'POPULAR',
                maxPrice: 10000,
                deliveryFast: false,
              })
            }
            badge="100% GENUINE"
          />
        </View>

        {/* Products Grid */}
        <View style={styles.grid}>
          {filteredProducts.map((prod) => {
            const inCart = items.find((i) => i.product.id === prod.id);
            return (
              <View key={prod.id} style={styles.gridItem}>
                <ProductCard
                  product={prod}
                  quantity={inCart?.quantity || 0}
                  onAddToCart={() => addItem(prod)}
                  onRemoveFromCart={() => removeItem(prod.id)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={setFilters}
        onResetFilters={() =>
          setFilters({
            category: 'ALL',
            sortBy: 'POPULAR',
            maxPrice: 10000,
            deliveryFast: false,
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
    paddingTop: 42,
  },
  bannerContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: 16,
  },
  heroBanner: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(101, 201, 156, 0.35)',
    overflow: 'hidden',
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroTag: {
    backgroundColor: 'rgba(101, 201, 156, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroTagText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 3,
    lineHeight: 15,
  },
  heroButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  heroButtonText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '800',
  },
  voucherBox: {
    width: 66,
    height: 66,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(101, 201, 156, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherSymbol: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '800',
  },
  voucherAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: -2,
  },
  voucherLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeaderWrap: {
    paddingHorizontal: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  gridItem: {
    width: '50%',
  },
});
