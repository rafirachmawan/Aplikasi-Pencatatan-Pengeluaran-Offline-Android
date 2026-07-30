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
  hidden?: boolean;
}

const WalletCard: React.FC<WalletCardProps> = ({wallet, onPress, hidden}) => {
  const color = wallet.color_code ?? Colors.primary;
  const balance = wallet.current_balance ?? wallet.initial_balance;
  const isPositive = balance >= 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress?.(wallet)}>
      <View style={styles.top}>
        <View style={[styles.colorDot, {backgroundColor: color}]} />
        <Text style={styles.name} numberOfLines={1}>
          {wallet.name}
        </Text>
      </View>
      <Text 
        style={[styles.balance, {color: isPositive ? Colors.textPrimary : Colors.expense}]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {hidden ? '••••••••' : formatRupiah(balance)}
      </Text>
      <Text style={styles.initialLabel} numberOfLines={1}>
        Saldo Awal: {hidden ? '••••••••' : formatRupiah(wallet.initial_balance)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard, // Slightly off-white for contrast
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginRight: Spacing.md,
    width: 160,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
    elevation: 2,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  name: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontSemiBold,
    flex: 1,
  },
  balance: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  initialLabel: {
    fontSize: 10,
    fontFamily: Typography.fontRegular,
    color: Colors.textTertiary,
  },
});

export default WalletCard;
