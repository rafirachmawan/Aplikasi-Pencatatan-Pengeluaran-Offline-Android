// ─────────────────────────────────────────────
//  Component: CategoryGrid — Picker for fast entry
// ─────────────────────────────────────────────
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import {Colors, Typography, Spacing, Radius} from '../utils/theme';
import {Category} from '../types';

interface CategoryGridProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (category: Category) => void;
}

const getCategoryEmoji = (icon: string): string => {
  const map: Record<string, string> = {
    'fast-food-outline': '🍜',
    'car-outline': '🚗',
    'cart-outline': '🛒',
    'medkit-outline': '💊',
    'school-outline': '📚',
    'game-controller-outline': '🎮',
    'flash-outline': '⚡',
    'home-outline': '🏠',
    'briefcase-outline': '💼',
    'cash-outline': '💵',
    'laptop-outline': '💻',
    'trending-up-outline': '📈',
    'add-circle-outline': '➕',
    'ellipsis-horizontal-outline': '•••',
  };
  return map[icon] ?? '💳';
};

const ITEM_SIZE = 72;
const NUM_COLS = 4;

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedId,
  onSelect,
}) => {
  const renderItem = ({item}: {item: Category}) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.itemSelected]}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}>
        <Text style={styles.emoji}>{getCategoryEmoji(item.icon_name)}</Text>
        <Text
          style={[styles.label, isSelected && styles.labelSelected]}
          numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={categories}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      numColumns={NUM_COLS}
      scrollEnabled={false}
      contentContainerStyle={styles.grid}
    />
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.sm,
  },
  item: {
    flex: 1,
    margin: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: ITEM_SIZE,
  },
  itemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '22',
  },
  emoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  label: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: Typography.weightMedium,
  },
  labelSelected: {
    color: Colors.primary,
    fontWeight: Typography.weightBold,
  },
});

export default CategoryGrid;
