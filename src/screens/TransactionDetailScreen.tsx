// ─────────────────────────────────────────────
//  Screen: Transaction Detail + Delete
// ─────────────────────────────────────────────
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Colors, Typography, Spacing, Radius, Shadow} from '../utils/theme';
import {formatRupiah} from '../utils/currency';
import {formatDateLong} from '../utils/date';
import {useTransactionStore} from '../store/useTransactionStore';
import {useWalletStore} from '../store/useWalletStore';
import {Transaction} from '../types';

type RouteType = RouteProp<RootStackParamList, 'TransactionDetail'>;

const ICON_EMOJI_MAP: Record<string, string> = {
  'fast-food-outline': '🍜', 'car-outline': '🚗', 'cart-outline': '🛒',
  'medkit-outline': '💊', 'school-outline': '📚', 'game-controller-outline': '🎮',
  'flash-outline': '⚡', 'home-outline': '🏠', 'briefcase-outline': '💼',
  'cash-outline': '💵', 'laptop-outline': '💻', 'trending-up-outline': '📈',
  'add-circle-outline': '➕', 'ellipsis-horizontal-outline': '•••',
};

const TransactionDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const {transactionId} = route.params;

  const {transactions, removeTransaction} = useTransactionStore();
  const {fetchWallets} = useWalletStore();

  const tx: Transaction | undefined = transactions.find(t => t.id === transactionId);
  const isIncome = tx?.type === 'INCOME';
  const amountColor = isIncome ? Colors.income : Colors.expense;

  const handleDelete = () => {
    Alert.alert(
      'Hapus Transaksi',
      'Yakin ingin menghapus transaksi ini? Tindakan ini tidak bisa dibatalkan.',
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            removeTransaction(transactionId);
            fetchWallets();
            navigation.goBack();
          },
        },
      ],
    );
  };

  if (!tx) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Transaksi tidak ditemukan.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnHeader}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Transaksi</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteBtn}>🗑 Hapus</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Amount Hero */}
        <View style={[styles.heroCard, {borderTopColor: amountColor}]}>
          <Text style={styles.heroEmoji}>
            {ICON_EMOJI_MAP[tx.category_icon ?? ''] ?? '💳'}
          </Text>
          <Text style={styles.heroCategory}>{tx.category_name}</Text>
          <Text style={[styles.heroAmount, {color: amountColor}]}>
            {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
          </Text>
          <View
            style={[
              styles.typeBadge,
              {backgroundColor: amountColor + '22'},
            ]}>
            <Text style={[styles.typeBadgeText, {color: amountColor}]}>
              {isIncome ? '↑ Pemasukan' : '↓ Pengeluaran'}
            </Text>
          </View>
        </View>

        {/* Detail rows */}
        <View style={styles.detailCard}>
          <DetailRow label="Dompet" value={tx.wallet_name ?? '—'} />
          <DetailRow label="Tanggal" value={formatDateLong(tx.transaction_date)} />
          {tx.notes && <DetailRow label="Catatan" value={tx.notes} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow: React.FC<{label: string; value: string}> = ({label, value}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.bg},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtnHeader: {fontSize: Typography.base, color: Colors.primary, fontWeight: Typography.weightSemiBold},
  headerTitle: {fontSize: Typography.md, color: Colors.textPrimary, fontWeight: Typography.weightBold},
  deleteBtn: {fontSize: Typography.sm, color: Colors.expense, fontWeight: Typography.weightSemiBold},

  scroll: {padding: Spacing.lg, gap: Spacing.lg},

  heroCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    padding: Spacing['2xl'], alignItems: 'center', borderTopWidth: 3, ...Shadow.card,
    gap: Spacing.sm,
  },
  heroEmoji: {fontSize: 48},
  heroCategory: {fontSize: Typography.md, color: Colors.textSecondary, fontWeight: Typography.weightMedium},
  heroAmount: {fontSize: Typography['3xl'], fontWeight: Typography.weightExtraBold},
  typeBadge: {paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: Radius.full},
  typeBadgeText: {fontSize: Typography.sm, fontWeight: Typography.weightBold},

  detailCard: {backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md},
  detailRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  detailLabel: {fontSize: Typography.base, color: Colors.textSecondary, fontWeight: Typography.weightMedium},
  detailValue: {fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.weightSemiBold, flex: 1, textAlign: 'right'},

  notFound: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md},
  notFoundText: {fontSize: Typography.md, color: Colors.textSecondary},
  backBtn: {fontSize: Typography.base, color: Colors.primary},
});

export default TransactionDetailScreen;
