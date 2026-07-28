// ─────────────────────────────────────────────
//  Screen: Laporan & Riwayat Transaksi
// ─────────────────────────────────────────────
import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {FlashList} from '@shopify/flash-list';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import {Colors, Typography, Spacing, Radius} from '../utils/theme';
import {formatRupiah} from '../utils/currency';
import {useTransactionStore} from '../store/useTransactionStore';
import {groupByDate} from '../database/queries/transactionQueries';
import TransactionCard from '../components/TransactionCard';
import {GroupedTransactions, Transaction} from '../types';

const ReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const {transactions, selectedMonth, fetchTransactions, setMonth} =
    useTransactionStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ── Month Navigation ──
  const prevMonth = () => {
    const m = dayjs(selectedMonth + '-01').subtract(1, 'month').format('YYYY-MM');
    setMonth(m);
  };
  const nextMonth = () => {
    const m = dayjs(selectedMonth + '-01').add(1, 'month').format('YYYY-MM');
    setMonth(m);
  };
  const monthLabel = dayjs(selectedMonth + '-01').format('MMMM YYYY');

  // ── Filter & Group ──
  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      t =>
        t.category_name?.toLowerCase().includes(q) ||
        t.wallet_name?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q),
    );
  }, [transactions, search]);

  const grouped: GroupedTransactions[] = useMemo(
    () => groupByDate(filtered),
    [filtered],
  );

  // ── FlashList items = flat array of headers + transactions ──
  type ListItem =
    | {type: 'header'; data: GroupedTransactions}
    | {type: 'tx'; data: Transaction};

  const listData: ListItem[] = useMemo(() => {
    const result: ListItem[] = [];
    for (const group of grouped) {
      result.push({type: 'header', data: group});
      for (const tx of group.transactions) {
        result.push({type: 'tx', data: tx});
      }
    }
    return result;
  }, [grouped]);

  const renderItem = ({item}: {item: ListItem}) => {
    if (item.type === 'header') {
      const g = item.data as GroupedTransactions;
      const isPositive = g.dailyTotal >= 0;
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>{g.displayDate}</Text>
          <Text
            style={[
              styles.dateHeaderTotal,
              {color: isPositive ? Colors.income : Colors.expense},
            ]}>
            {isPositive ? '+' : ''}
            {formatRupiah(g.dailyTotal)}
          </Text>
        </View>
      );
    }
    return (
      <TransactionCard
        item={item.data as Transaction}
        onPress={() =>
          (navigation as any).navigate('TransactionDetail', {
            transactionId: (item.data as Transaction).id,
          })
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat</Text>
        <View style={{width: 60}} />
      </View>

      {/* Month Selector */}
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.monthArrow}>
          <Text style={styles.monthArrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.monthArrow}>
          <Text style={styles.monthArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Cari kategori, dompet, catatan..."
          placeholderTextColor={Colors.textTertiary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {listData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>Tidak ada transaksi</Text>
          <Text style={styles.emptySubtext}>
            {search ? 'Coba kata kunci lain' : 'Belum ada transaksi bulan ini'}
          </Text>
        </View>
      ) : (
        <FlashList
          data={listData}
          keyExtractor={(item, idx) =>
            item.type === 'header'
              ? `header-${(item.data as GroupedTransactions).date}`
              : `tx-${(item.data as Transaction).id}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          getItemType={item => item.type}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.bg},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {fontSize: Typography.base, color: Colors.primary, fontWeight: Typography.weightSemiBold},
  headerTitle: {fontSize: Typography.md, color: Colors.textPrimary, fontWeight: Typography.weightBold},

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xl,
  },
  monthArrow: {padding: Spacing.sm},
  monthArrowText: {fontSize: Typography['2xl'], color: Colors.primary},
  monthLabel: {fontSize: Typography.md, color: Colors.textPrimary, fontWeight: Typography.weightBold, minWidth: 160, textAlign: 'center'},

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {fontSize: 16},
  searchInput: {flex: 1, fontSize: Typography.base, color: Colors.textPrimary, paddingVertical: Spacing.sm},
  clearSearch: {fontSize: Typography.sm, color: Colors.textTertiary},

  listContent: {padding: Spacing.lg},
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: Spacing.xs,
  },
  dateHeaderText: {fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.weightSemiBold},
  dateHeaderTotal: {fontSize: Typography.sm, fontWeight: Typography.weightBold},

  emptyState: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  emptyEmoji: {fontSize: 48, marginBottom: Spacing.md},
  emptyText: {fontSize: Typography.md, color: Colors.textPrimary, fontWeight: Typography.weightBold, marginBottom: Spacing.xs},
  emptySubtext: {fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center'},
});

export default ReportScreen;
