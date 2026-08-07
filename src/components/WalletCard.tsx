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
      activeOpacity={0.8}
      onPress={() => onPress?.(wallet)}>
      {/* Top Accent Strip */}
      <View style={[styles.accentStrip, { backgroundColor: color }]} />
      
      <View style={styles.content}>
        <View style={styles.top}>
          <View style={[styles.badge, { backgroundColor: color + '1F' }]}>
            <View style={[styles.colorDot, { backgroundColor: color }]} />
          </View>
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
          Awal: {hidden ? '••••••••' : formatRupiah(wallet.initial_balance)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    marginRight: Spacing.md,
    width: 165,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadow.card,
  },
  accentStrip: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: Spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: Typography.md,
    fontFamily: Typography.fontExtraBold,
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  initialLabel: {
    fontSize: Typography.xs - 1,
    fontFamily: Typography.fontRegular,
    color: Colors.textTertiary,
  },
});

export default WalletCard;
