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
}

const SummaryCard: React.FC<SummaryCardProps> = ({label, amount, type, hidden = false}) => {
  const isIncome = type === 'income';
  const accent = isIncome ? Colors.income : Colors.expense;
  const icon = isIncome ? '↑' : '↓';

  return (
    <View style={[styles.card, {borderLeftColor: accent}]}>
      <View style={[styles.iconBadge, {backgroundColor: accent + '22'}]}>
        <Text style={[styles.iconText, {color: accent}]}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.amount, {color: accent}]} numberOfLines={1}>
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
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: Typography.lg,
    fontWeight: Typography.weightBold,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weightMedium,
    marginBottom: 2,
  },
  amount: {
    fontSize: Typography.sm,
    fontWeight: Typography.weightBold,
  },
});

export default SummaryCard;
