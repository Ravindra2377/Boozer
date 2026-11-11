import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, RADIUS, SPACING } from '../theme';
import { LiquidGlass } from './LiquidGlass';
import { AppButton } from './SharedUI';

export interface FilterState {
  category: string;
  sortBy: 'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'ABV_HIGH';
  maxPrice: number;
  deliveryFast: boolean;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
}

const CATEGORIES = ['ALL', 'WHISKY', 'BEER', 'VODKA', 'RUM', 'GIN', 'WINE', 'TEQUILA'];
const SORT_OPTIONS: { key: FilterState['sortBy']; label: string }[] = [
  { key: 'POPULAR', label: 'Most Popular' },
  { key: 'PRICE_LOW', label: 'Price: Low to High' },
  { key: 'PRICE_HIGH', label: 'Price: High to Low' },
  { key: 'ABV_HIGH', label: 'Highest ABV %' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onApplyFilters(draftFilters);
    onClose();
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onResetFilters();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <LiquidGlass radius={28} style={styles.modalContent} contentStyle={styles.innerModal}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>Filter & Sort</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Sort Section */}
            <Text style={styles.sectionTitle}>SORT BY</Text>
            <View style={styles.chipRow}>
              {SORT_OPTIONS.map((sort) => {
                const isSelected = draftFilters.sortBy === sort.key;
                return (
                  <TouchableOpacity
                    key={sort.key}
                    onPress={() => setDraftFilters({ ...draftFilters, sortBy: sort.key })}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextActive,
                      ]}
                    >
                      {sort.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Category Section */}
            <Text style={styles.sectionTitle}>CATEGORY</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => {
                const isSelected = draftFilters.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setDraftFilters({ ...draftFilters, category: cat })}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Fast Delivery Checkbox */}
            <Text style={styles.sectionTitle}>DELIVERY SPEED</Text>
            <TouchableOpacity
              onPress={() =>
                setDraftFilters({
                  ...draftFilters,
                  deliveryFast: !draftFilters.deliveryFast,
                })
              }
              style={[
                styles.speedToggle,
                draftFilters.deliveryFast && styles.speedToggleActive,
              ]}
            >
              <Text style={styles.speedIcon}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.speedTitle}>10-Minute Instant Delivery Only</Text>
                <Text style={styles.speedSub}>Verified hyperlocal stock in legal radius</Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  draftFilters.deliveryFast && styles.checkboxActive,
                ]}
              >
                {draftFilters.deliveryFast && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Action Button */}
          <View style={styles.footer}>
            <AppButton
              label="Apply Filters"
              onPress={handleApply}
              variant="gradient"
              style={{ width: '100%' }}
            />
          </View>
        </LiquidGlass>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    maxHeight: '75%',
    backgroundColor: colors.surface,
  },
  innerModal: {
    padding: SPACING.xl,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  body: {
    maxHeight: 340,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  speedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  speedToggleActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(101, 201, 156, 0.08)',
  },
  speedIcon: {
    fontSize: 20,
  },
  speedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  speedSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '900',
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
