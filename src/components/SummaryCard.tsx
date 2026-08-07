// ─────────────────────────────────────────────
//  Component: SummaryCard — Income / Expense card
// ─────────────────────────────────────────────
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Typography, Spacing, Radius, Shadow} from '../utils/theme';
import {formatRupiah} from '../utils/currency';

interface SummaryCardProps {
  label: string;
  amount: number;
  type: 'income' | 'expense';
  hidden?: boolean;
  variant?: 'light' | 'dark';
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  amount,
  type,
  hidden = false,
  variant = 'dark',
}) => {
  const isIncome = type === 'income';
  const isDark = variant === 'dark';
  const accent = isIncome ? Colors.income : Colors.expense;
  const badgeBg = isDark
    ? isIncome ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)'
    : isIncome ? Colors.incomeLight : Colors.expenseLight;
  const icon = isIncome ? '↙' : '↗';

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      <View style={[styles.iconBadge, { backgroundColor: badgeBg }]}>
        <Text style={[styles.iconText, { color: accent }]}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.label, { color: isDark ? Colors.heroTextSecondary : Colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.amount, { color: isDark ? Colors.heroTextPrimary : Colors.textPrimary }]} numberOfLines={1}>
          {hidden ? '••••••' : formatRupiah(amount)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  cardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardLight: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.soft,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    marginBottom: 2,
  },
  amount: {
    fontSize: Typography.sm + 1,
    fontFamily: Typography.fontBold,
    letterSpacing: -0.2,
  },
});

export default SummaryCard;
