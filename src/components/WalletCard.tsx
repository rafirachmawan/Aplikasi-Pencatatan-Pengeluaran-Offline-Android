// ─────────────────────────────────────────────
//  Component: WalletCard
// ─────────────────────────────────────────────
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors, Typography, Spacing, Radius, Shadow} from '../utils/theme';
import {formatRupiah} from '../utils/currency';
import {Wallet} from '../types';

interface WalletCardProps {
  wallet: Wallet;
  onPress?: (wallet: Wallet) => void;
}

const WalletCard: React.FC<WalletCardProps> = ({wallet, onPress}) => {
  const color = wallet.color_code ?? Colors.primary;
  const balance = wallet.current_balance ?? wallet.initial_balance;
  const isPositive = balance >= 0;

  return (
    <TouchableOpacity
      style={[styles.card, {borderTopColor: color}]}
      activeOpacity={0.75}
      onPress={() => onPress?.(wallet)}>
      <View style={styles.top}>
        <View style={[styles.colorDot, {backgroundColor: color}]} />
        <Text style={styles.name} numberOfLines={1}>
          {wallet.name}
        </Text>
      </View>
      <Text style={[styles.balance, {color: isPositive ? Colors.textPrimary : Colors.expense}]}>
        {formatRupiah(balance)}
      </Text>
      <Text style={styles.initialLabel}>
        Saldo Awal: {formatRupiah(wallet.initial_balance)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginRight: Spacing.md,
    width: 180,
    borderTopWidth: 3,
    ...Shadow.card,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  name: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weightMedium,
    flex: 1,
  },
  balance: {
    fontSize: Typography.xl,
    fontWeight: Typography.weightExtraBold,
    marginBottom: 4,
  },
  initialLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
});

export default WalletCard;
