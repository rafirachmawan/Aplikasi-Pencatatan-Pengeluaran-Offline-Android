// ─────────────────────────────────────────────
//  Component: TransactionCard — Single row item
// ─────────────────────────────────────────────
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors, Typography, Spacing, Radius} from '../utils/theme';
import {formatRupiah} from '../utils/currency';
import {formatDate} from '../utils/date';
import {Transaction} from '../types';

interface TransactionCardProps {
  item: Transaction;
  onPress?: (item: Transaction) => void;
  onLongPress?: (item: Transaction) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  item,
  onPress,
  onLongPress,
}) => {
  const isIncome = item.type === 'INCOME';
  const amountColor = isIncome ? Colors.income : Colors.expense;
  const amountPrefix = isIncome ? '+' : '-';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
      onLongPress={() => onLongPress?.(item)}>
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: (item.wallet_color ?? Colors.primary) + '33'},
        ]}>
        <Text style={styles.iconEmoji}>
          {getCategoryEmoji(item.category_icon ?? '')}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {item.category_name ?? 'Lain-lain'}
        </Text>
        <Text style={styles.walletName} numberOfLines={1}>
          {item.wallet_name ?? '—'}{item.notes ? ` · ${item.notes}` : ''}
        </Text>
      </View>

      {/* Amount */}
      <View style={styles.amountSection}>
        <Text style={[styles.amount, {color: amountColor}]}>
          {amountPrefix}{formatRupiah(item.amount)}
        </Text>
        <Text style={styles.date}>{formatDate(item.transaction_date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Map icon_name → emoji fallback (for vector icons, use Icon component)
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  categoryName: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weightSemiBold,
    marginBottom: 2,
  },
  walletName: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.base,
    fontWeight: Typography.weightBold,
    marginBottom: 2,
  },
  date: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
});

export default TransactionCard;
