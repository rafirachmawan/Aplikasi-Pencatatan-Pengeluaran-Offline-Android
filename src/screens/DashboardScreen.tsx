// ─────────────────────────────────────────────
//  Screen: Dashboard Utama
// ─────────────────────────────────────────────
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PieChart} from 'react-native-gifted-charts';

import {RootStackParamList} from '../navigation/AppNavigator';
import {Colors, Typography, Spacing, Radius, Shadow} from '../utils/theme';
import {formatRupiah, formatRupiahCompact} from '../utils/currency';
import {currentMonthLabel} from '../utils/date';
import {getCategoryExpenses} from '../database/queries/transactionQueries';

import {useWalletStore} from '../store/useWalletStore';
import {useTransactionStore} from '../store/useTransactionStore';

import SummaryCard from '../components/SummaryCard';
import TransactionCard from '../components/TransactionCard';
import WalletCard from '../components/WalletCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);

  const {wallets, totalBalance, fetchWallets} = useWalletStore();
  const {summary, recentTransactions, selectedMonth, fetchTransactions, fetchRecent} =
    useTransactionStore();
  
  const insets = useSafeAreaInsets();

  const pieData = useMemo(() => {
    const cats = getCategoryExpenses(selectedMonth);
    return cats.map(c => ({
      value: c.total,
      color: c.color,
      text: c.category_name,
      focused: false,
    }));
  }, [selectedMonth]);

  // Live clock
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'});
  });

  const dayName = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  useEffect(() => {
    fetchWallets();
    fetchTransactions();
    fetchRecent();
  }, []);

  // Update clock every minute
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}));
    }, 60_000);
    return () => clearInterval(tick);
  }, []);

  const handleAddPress = useCallback(() => {
    setShowActionSheet(true);
  }, []);

  const handleAddTransaction = () => {
    setShowActionSheet(false);
    navigation.navigate('AddTransaction');
  };

  const handleAddWallet = () => {
    setShowActionSheet(false);
    navigation.navigate('Wallet');
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>

          {/* Row 1: Branding kiri + Chip jam/hari kanan */}
          <View style={styles.headerTopRow}>
            <View style={styles.brandRow}>
              <Image 
                source={require('../../assets/Finanku.png')} 
                style={styles.brandImage}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>FinanKu</Text>
            </View>

            <View style={styles.dateTimeChip}>
              <Text style={styles.clockText}>{currentTime}</Text>
              <View style={styles.chipDivider} />
              <Text style={styles.datePillText}>{dayName}</Text>
            </View>
          </View>

          {/* Row 2: Slogan */}
          <Text style={styles.slogan}>
            Catat. Kelola.{'\n'}
            <Text style={styles.sloganAccent}>Bertumbuh.</Text>
          </Text>

        </View>

        {/* Total Balance Card */}
        <View style={styles.balanceCard}>
          {/* Label + toggle mata */}
          <View style={styles.balanceLabelRow}>
            <Text style={styles.balanceLabel}>Total Saldo</Text>
            <TouchableOpacity
              onPress={() => setBalanceHidden(v => !v)}
              style={styles.eyeBtn}
              activeOpacity={0.7}>
              <Text style={styles.eyeIcon}>
                {balanceHidden ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>
            {balanceHidden ? '• • • • • •' : formatRupiah(totalBalance)}
          </Text>

          <View style={styles.summaryRow}>
            <SummaryCard
              label="Pemasukan"
              amount={summary.total_income}
              type="income"
              hidden={balanceHidden}
            />
            <View style={{width: Spacing.sm}} />
            <SummaryCard
              label="Pengeluaran"
              amount={summary.total_expense}
              type="expense"
              hidden={balanceHidden}
            />
          </View>
        </View>

        {/* Amplop Digital Banner */}
        <TouchableOpacity
          style={styles.budgetBanner}
          onPress={() => navigation.navigate('Budget')}
          activeOpacity={0.85}>
          <View style={styles.budgetBannerLeft}>
            <Text style={styles.budgetBannerEmoji}>🪙</Text>
            <View>
              <Text style={styles.budgetBannerTitle}>Amplop Digital</Text>
              <Text style={styles.budgetBannerDesc}>Atur alokasi gaji & anggaran bulanan</Text>
            </View>
          </View>
          <Text style={styles.budgetBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Wallets Horizontal Scroll */}
        {wallets.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Dompet Saya"
              onAction={() => navigation.navigate('Wallet')}
              actionLabel="Kelola"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.walletList}>
              {wallets.map(w => (
                <WalletCard
                  key={w.id}
                  wallet={w}
                  onPress={() => navigation.navigate('Wallet')}
                  hidden={balanceHidden}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Pie Chart ── */}
        {pieData.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Pengeluaran Bulan Ini" />
            <View style={styles.chartCard}>
              <PieChart
                data={pieData}
                donut
                innerRadius={70}
                radius={110}
                centerLabelComponent={() => (
                  <View style={styles.chartCenter}>
                    <Text style={styles.chartCenterLabel}>Total</Text>
                    <Text style={styles.chartCenterAmount}>
                      {formatRupiahCompact(summary.total_expense)}
                    </Text>
                  </View>
                )}
              />
              {/* Legend */}
              <View style={styles.legend}>
                {pieData.slice(0, 5).map((item, idx) => (
                  <View key={idx} style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, {backgroundColor: item.color}]}
                    />
                    <Text style={styles.legendText} numberOfLines={1}>
                      {item.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Recent Transactions ── */}
        <View style={[styles.section, {marginBottom: 100}]}>
          <SectionHeader
            title="Transaksi Terakhir"
            onAction={() => navigation.navigate('Report')}
            actionLabel="Lihat Semua"
          />
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>Belum ada transaksi</Text>
              <Text style={styles.emptySubtext}>
                Ketuk tombol + untuk mencatat transaksi pertama
              </Text>
            </View>
          ) : (
            recentTransactions.map(tx => (
              <TransactionCard
                key={tx.id}
                item={tx}
                onPress={() =>
                  navigation.navigate('TransactionDetail', {
                    transactionId: tx.id,
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Expandable FAB Overlay ── */}
      {showActionSheet && (
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10 }]}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        />
      )}

      {/* ── Expandable FAB Menu ── */}
      {showActionSheet && (
        <View style={[styles.fabMenu, { bottom: Math.max(insets.bottom, 16) + 80 }]}>
          <View style={styles.fabMenuItem}>
            <TouchableOpacity style={[styles.miniFab, {backgroundColor: Colors.expense}]} activeOpacity={0.8} onPress={handleAddTransaction}>
              <Text style={{fontSize: 24}}>📝</Text>
            </TouchableOpacity>
            <Text style={styles.fabMenuLabel}>Transaksi</Text>
          </View>
          
          <View style={styles.fabMenuItem}>
            <TouchableOpacity style={[styles.miniFab, {backgroundColor: Colors.income}]} activeOpacity={0.8} onPress={handleAddWallet}>
              <Text style={{fontSize: 24}}>👛</Text>
            </TouchableOpacity>
            <Text style={styles.fabMenuLabel}>Dompet</Text>
          </View>
        </View>
      )}

      {/* ── Main Floating Action Button ── */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 16, zIndex: 20 }]}
        onPress={() => setShowActionSheet(!showActionSheet)}
        activeOpacity={0.85}>
        <Text style={[styles.fabText, showActionSheet && { transform: [{ rotate: '45deg' }] }]}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ── Helper: Section Header ──
const SectionHeader: React.FC<{
  title: string;
  onAction?: () => void;
  actionLabel?: string;
}> = ({title, onAction, actionLabel}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onAction && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.bg},
  scroll: {paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl},

  // Header
  header: {
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandImage: {
    width: 44,
    height: 44,
    transform: [{ scale: 4.5 }],
    marginLeft: Spacing.sm,
    marginRight: Spacing.xs,
  },
  brandName: {
    fontSize: Typography.lg,
    fontWeight: Typography.weightExtraBold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  slogan: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.weightExtraBold,
    color: Colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  sloganAccent: {
    color: Colors.primary,
  },
  dateTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '18',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 10,
  },
  chipDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.primary + '50',
  },
  clockText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weightBold,
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  datePillText: {
    fontSize: Typography.sm,
    color: Colors.primaryLight,
    fontWeight: Typography.weightSemiBold,
    letterSpacing: 0.2,
  },
  // Balance Card
  balanceCard: {
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    marginBottom: Spacing.xl,
    ...Shadow.elevated,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  // Budget Banner
  budgetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    ...Shadow.card,
  },
  budgetBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  budgetBannerEmoji: {
    fontSize: 28,
  },
  budgetBannerTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  budgetBannerDesc: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  budgetBannerArrow: {
    fontSize: Typography.lg,
    color: Colors.primary,
    fontWeight: Typography.weightBold,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  balanceLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weightMedium,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: Typography['3xl'],
    color: Colors.textPrimary,
    fontWeight: Typography.weightExtraBold,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
  },

  // Wallet list
  walletList: {
    paddingRight: Spacing.lg,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weightBold,
  },
  sectionAction: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.weightSemiBold,
  },

  // Chart
  chartCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  chartCenter: {
    alignItems: 'center',
  },
  chartCenterLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  chartCenterAmount: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weightBold,
  },
  legend: {
    width: '100%',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  legendText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    flex: 1,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyEmoji: {fontSize: 48, marginBottom: Spacing.md},
  emptyText: {
    fontSize: Typography.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weightBold,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.elevated,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    lineHeight: 36,
  },

  // Expandable FAB
  fabMenu: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
    gap: 48,
  },
  fabMenuItem: {
    alignItems: 'center',
  },
  fabMenuLabel: {
    backgroundColor: Colors.bgCardElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: 6,
    fontSize: Typography.xs,
    color: Colors.textPrimary,
    fontWeight: Typography.weightBold,
    ...Shadow.card,
  },
  miniFab: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.elevated,
  },
});

export default DashboardScreen;
