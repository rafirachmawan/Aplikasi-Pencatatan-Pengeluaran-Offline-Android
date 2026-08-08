// ─────────────────────────────────────────────
//  Screen: Dashboard Utama
// ─────────────────────────────────────────────
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PieChart } from "react-native-gifted-charts";
import dayjs from 'dayjs';

import { RootStackParamList } from "../navigation/AppNavigator";
import { Colors, Typography, Spacing, Radius, Shadow } from "../utils/theme";
import { formatRupiah, formatRupiahCompact } from "../utils/currency";
import { currentMonthLabel } from "../utils/date";
import { getCategoryExpenses } from "../database/queries/transactionQueries";
import { loadBudgetPlan, BudgetSlot } from "../database/queries/budgetQueries";

import { useWalletStore } from "../store/useWalletStore";
import { useTransactionStore } from "../store/useTransactionStore";

import WalletCard from "../components/WalletCard";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [balanceHidden, setBalanceHidden] = useState(false);
  const [budgetSlots, setBudgetSlots] = useState<BudgetSlot[]>([]);

  const { wallets, totalBalance, fetchWallets } = useWalletStore();
  const {
    summary,
    selectedMonth,
    fetchTransactions,
    fetchRecent,
  } = useTransactionStore();

  const insets = useSafeAreaInsets();

  const pieData = useMemo(() => {
    const cats = getCategoryExpenses(selectedMonth);
    return cats.map((c) => ({
      value: c.total,
      color: c.color,
      text: c.category_name,
      focused: false,
    }));
  }, [selectedMonth]);

  // Allocation Breakdown Calculations
  const totalAllocated = useMemo(() => {
    return budgetSlots.reduce((sum, slot) => sum + (slot.amount || 0), 0);
  }, [budgetSlots]);

  const unallocatedBalance = useMemo(() => {
    return Math.max(0, totalBalance - totalAllocated);
  }, [totalBalance, totalAllocated]);

  const allocatedPercentage = useMemo(() => {
    if (totalBalance <= 0) return 0;
    return Math.min(100, Math.round((totalAllocated / totalBalance) * 100));
  }, [totalBalance, totalAllocated]);

  // Live clock
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    let h = now.getUTCHours() + 7;
    if (h >= 24) h -= 24;
    return `${h.toString().padStart(2, "0")}.${now.getUTCMinutes().toString().padStart(2, "0")}`;
  });

  const dayName = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchWallets();
      fetchTransactions();
      fetchRecent();
      const currentPeriod = dayjs().format('YYYY-MM');
      const plan = loadBudgetPlan(currentPeriod);
      if (plan) {
        setBudgetSlots(plan.slots);
      } else {
        setBudgetSlots([]);
      }
    }, [])
  );

  // Update clock exactly when minute changes
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      let h = now.getUTCHours() + 7;
      if (h >= 24) h -= 24;
      const newTime = `${h.toString().padStart(2, "0")}.${now.getUTCMinutes().toString().padStart(2, "0")}`;
      setCurrentTime((prev) => (prev !== newTime ? newTime : prev));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Row 1: Branding Kiri + Chip Waktu Kanan */}
          <View style={styles.headerTopRow}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadgeContainer}>
                <Image
                  source={require("../../assets/Finanku.png")}
                  style={styles.brandImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.brandTextGroup}>
                <Text style={styles.brandName}>FinanceKu</Text>
                <Text style={styles.brandSubText}>Financial Tracker</Text>
              </View>
            </View>

            <View style={styles.dateTimeChip}>
              <View style={styles.pulseDot} />
              <Text style={styles.clockText}>{currentTime}</Text>
              <View style={styles.chipDivider} />
              <Text style={styles.datePillText}>{dayName}</Text>
            </View>
          </View>

          {/* Row 2: Slogan Banner */}
          <View style={styles.sloganCard}>
            <Text style={styles.slogan} numberOfLines={1} adjustsFontSizeToFit>
              Catat. Kelola. <Text style={styles.sloganAccent}>Bertumbuh.</Text>
            </Text>
          </View>
        </View>

        {/* ── Hero Balance Card (Dark Slate Accent with Mesh Orbs) ── */}
        <View style={styles.heroCard}>
          {/* Decorative Ambient Background Orbs */}
          <View style={styles.heroOrb1} pointerEvents="none" />
          <View style={styles.heroOrb2} pointerEvents="none" />
          <View style={styles.heroOrb3} pointerEvents="none" />

          <View style={styles.heroTopRow}>
            <View style={styles.heroLabelBadge}>
              <Text style={styles.heroLabelDot}>●</Text>
              <Text style={styles.heroLabelText}>Total Saldo</Text>
            </View>
            <TouchableOpacity
              onPress={() => setBalanceHidden((v) => !v)}
              style={styles.eyeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeIcon}>{balanceHidden ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroBalanceAmount} numberOfLines={1} adjustsFontSizeToFit>
            {balanceHidden ? "• • • • • •" : formatRupiah(totalBalance)}
          </Text>

          {/* Allocation Breakdown inside Hero Card */}
          <View style={styles.heroAllocationBreakdown}>
            <View style={styles.heroAllocationBarBg}>
              <View
                style={[
                  styles.heroAllocationBarFill,
                  { width: `${allocatedPercentage}%` },
                ]}
              />
            </View>

            <View style={styles.heroBreakdownRow}>
              <View style={styles.heroBreakdownCol}>
                <View style={styles.heroBreakdownDotLabel}>
                  <View style={[styles.dotIndicator, { backgroundColor: Colors.income }]} />
                  <Text style={styles.heroBreakdownLabel} numberOfLines={1}>Terdialokasikan</Text>
                </View>
                <Text style={styles.heroBreakdownValue} numberOfLines={1} adjustsFontSizeToFit>
                  {balanceHidden ? "••••••" : formatRupiah(totalAllocated)} ({allocatedPercentage}%)
                </Text>
              </View>

              <View style={styles.heroBreakdownDivider} />

              <View style={styles.heroBreakdownCol}>
                <View style={styles.heroBreakdownDotLabel}>
                  <View style={[styles.dotIndicator, { backgroundColor: '#60A5FA' }]} />
                  <Text style={styles.heroBreakdownLabel} numberOfLines={1}>Belum Dialokasi</Text>
                </View>
                <Text style={styles.heroBreakdownValue} numberOfLines={1} adjustsFontSizeToFit>
                  {balanceHidden ? "••••••" : formatRupiah(unallocatedBalance)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.heroFooterRow}>
            <View style={styles.heroChipDecoration}>
              <View style={styles.heroChipLine} />
              <Text style={styles.heroChipText}>FinanceKu Card</Text>
            </View>
          </View>
        </View>

        {/* ── Quick Actions Row ── */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionCard}
            activeOpacity={0.82}
            onPress={() => navigation.navigate("Budget")}
          >
            <View style={[styles.quickActionAccentStrip, { backgroundColor: '#F59E0B' }]} />
            <View style={styles.quickActionContent}>
              <View style={[styles.quickActionIconBadge, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                <Text style={styles.quickActionEmoji}>🪙</Text>
              </View>
              <Text style={styles.quickActionTitle} numberOfLines={1}>Atur Alokasi</Text>
              <Text style={styles.quickActionDesc} numberOfLines={1}>Atur pos anggaran</Text>
              <View style={styles.quickActionArrow}>
                <Text style={styles.quickActionArrowText}>→</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            activeOpacity={0.82}
            onPress={() => navigation.navigate("Wallet")}
          >
            <View style={[styles.quickActionAccentStrip, { backgroundColor: '#10B981' }]} />
            <View style={styles.quickActionContent}>
              <View style={[styles.quickActionIconBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={styles.quickActionEmoji}>💳</Text>
              </View>
              <Text style={styles.quickActionTitle} numberOfLines={1}>Kelola Pemasukan</Text>
              <Text style={styles.quickActionDesc} numberOfLines={1}>Kelola sumber pemasukan</Text>
              <View style={styles.quickActionArrow}>
                <Text style={styles.quickActionArrowText}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Wallets Horizontal Scroll ── */}
        {wallets.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Pemasukan Saya"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.walletList}
            >
              {wallets.map((w) => (
                <WalletCard
                  key={w.id}
                  wallet={w}
                  onPress={() => navigation.navigate("Wallet")}
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
                radius={105}
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
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
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

        {/* ── Monthly Budget Allocations (Alokasi Bulan Ini) ── */}
        <View style={[styles.section, { marginBottom: Spacing.xl }]}>
          <SectionHeader title="Alokasi Bulan Ini" />
          {budgetSlots.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyState}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Budget")}
            >
              <Text style={styles.emptyEmoji}>🪙</Text>
              <Text style={styles.emptyText}>Belum Ada Alokasi Bulan Ini</Text>
              <Text style={styles.emptySubtext}>
                Gunakan menu Atur Alokasi di atas untuk membagi pos anggaran bulanan.
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.allocationContainerCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate("Budget")}
            >
              {/* Summary Header Banner */}
              <View style={styles.allocationSummaryBanner}>
                <View style={styles.allocationSummaryCol}>
                  <Text style={styles.allocationSummaryLabel} numberOfLines={1}>Total Alokasi</Text>
                  <Text style={styles.allocationSummaryValue} numberOfLines={1} adjustsFontSizeToFit>
                    {balanceHidden ? "••••••" : formatRupiah(totalAllocated)}
                  </Text>
                </View>
                <View style={styles.allocationSummaryPill}>
                  <Text style={styles.allocationSummaryPillLabel} numberOfLines={1}>Sisa Belum Dialokasi:</Text>
                  <Text style={styles.allocationSummaryPillValue} numberOfLines={1} adjustsFontSizeToFit>
                    {balanceHidden ? "••••••" : formatRupiah(unallocatedBalance)}
                  </Text>
                </View>
              </View>

              {budgetSlots.map((slot, idx) => {
                const barPct = totalBalance > 0 ? Math.min((slot.amount / totalBalance) * 100, 100) : 0;
                const isLast = idx === budgetSlots.length - 1;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.allocationItemRow,
                      !isLast && styles.allocationItemBorder,
                    ]}
                  >
                    <View style={[styles.allocationEmojiWrapper, { backgroundColor: (slot.color || Colors.primary) + '15' }]}>
                      <Text style={styles.allocationEmoji}>{slot.emoji || "📦"}</Text>
                    </View>
                    <View style={styles.allocationInfo}>
                      <View style={styles.allocationTitleRow}>
                        <Text style={styles.allocationName} numberOfLines={1}>
                          {slot.name}
                        </Text>
                        <Text style={[styles.allocationAmount, { color: slot.color || Colors.textPrimary }]}>
                          {balanceHidden ? "• • • • • •" : formatRupiah(slot.amount)}
                        </Text>
                      </View>
                      <View style={styles.allocationBarBg}>
                        <View
                          style={[
                            styles.allocationBarFill,
                            {
                              width: `${barPct}%` as any,
                              backgroundColor: slot.color || Colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Helper: Section Header ──
const SectionHeader: React.FC<{
  title: string;
  onAction?: () => void;
  actionLabel?: string;
}> = ({ title, onAction, actionLabel }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onAction && (
      <TouchableOpacity
        onPress={onAction}
        style={styles.sectionActionPill}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionAction}>{actionLabel}</Text>
        <Text style={styles.sectionActionArrow}>›</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },

  // Header
  header: {
    marginBottom: Spacing.md + 4,
    gap: Spacing.sm + 2,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm - 2,
  },
  logoBadgeContainer: {
    width: 46,
    height: 46,
    borderRadius: Radius.lg - 2,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...Shadow.soft,
  },
  brandImage: {
    width: 42,
    height: 42,
    transform: [{ scale: 1.8 }],
  },
  brandTextGroup: {
    justifyContent: "center",
  },
  brandName: {
    fontSize: Typography.base + 2,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 20,
  },
  brandSubText: {
    fontSize: Typography.xs - 2,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  sloganCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    alignSelf: "flex-start",
    ...Shadow.soft,
  },
  slogan: {
    fontSize: Typography.sm + 1,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  sloganAccent: {
    color: Colors.primary,
    fontFamily: Typography.fontExtraBold,
  },
  dateTimeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
    ...Shadow.soft,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.income,
  },
  chipDivider: {
    width: 1,
    height: 10,
    backgroundColor: Colors.border,
  },
  clockText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  datePillText: {
    fontSize: Typography.xs - 1,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },

  // Hero Card (Dark Slate Accent with Mesh Orbs)
  heroCard: {
    backgroundColor: Colors.heroBg,
    borderRadius: Radius["2xl"],
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md + 2,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    position: "relative",
    overflow: "hidden",
    ...Shadow.hero,
  },
  heroOrb1: {
    position: "absolute",
    right: -25,
    top: -25,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  heroOrb2: {
    position: "absolute",
    right: 40,
    bottom: -45,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(59, 130, 246, 0.14)",
  },
  heroOrb3: {
    position: "absolute",
    left: -35,
    bottom: -35,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs + 2,
  },
  heroLabelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  heroLabelDot: {
    fontSize: 8,
    color: Colors.income,
  },
  heroLabelText: {
    fontSize: Typography.xs,
    color: Colors.heroTextPrimary,
    fontFamily: Typography.fontMedium,
  },
  eyeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  eyeIcon: {
    fontSize: 15,
  },
  heroBalanceAmount: {
    fontSize: Typography["3xl"] + 2,
    color: Colors.heroTextPrimary,
    fontFamily: Typography.fontExtraBold,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    letterSpacing: -1,
  },
  heroAllocationBreakdown: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: Radius.lg,
    padding: Spacing.sm + 2,
    marginVertical: Spacing.xs,
    gap: Spacing.xs + 2,
  },
  heroAllocationBarBg: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  heroAllocationBarFill: {
    height: "100%",
    backgroundColor: Colors.income,
    borderRadius: Radius.full,
  },
  heroBreakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroBreakdownCol: {
    flex: 1,
    gap: 2,
  },
  heroBreakdownDotLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  heroBreakdownLabel: {
    fontSize: Typography.xs - 2,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: Typography.fontMedium,
  },
  heroBreakdownValue: {
    fontSize: Typography.xs,
    color: Colors.heroTextPrimary,
    fontFamily: Typography.fontExtraBold,
  },
  heroBreakdownDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: Spacing.xs,
  },
  heroFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xs + 2,
  },
  heroChipDecoration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroChipLine: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  heroChipText: {
    fontSize: Typography.xs - 2,
    color: "rgba(255, 255, 255, 0.4)",
    fontFamily: Typography.fontSemiBold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Quick Actions Row
  quickActionsRow: {
    flexDirection: "row",
    gap: Spacing.sm + 2,
    marginBottom: Spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    ...Shadow.card,
  },
  quickActionAccentStrip: {
    height: 4,
    width: "100%",
  },
  quickActionContent: {
    padding: Spacing.md,
    alignItems: "center",
    gap: 6,
  },
  quickActionIconBadge: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionTitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  quickActionDesc: {
    fontSize: Typography.xs - 1,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 4,
  },
  quickActionArrow: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgInput,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionArrowText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },

  // Wallet list
  walletList: {
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.xs,
  },

  // Section
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm + 4,
  },
  sectionTitle: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontSemiBold,
    letterSpacing: -0.2,
  },
  sectionActionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 2,
  },
  sectionAction: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontFamily: Typography.fontBold,
  },
  sectionActionArrow: {
    fontSize: Typography.sm + 2,
    color: Colors.primary,
    fontFamily: Typography.fontBold,
  },

  // Chart
  chartCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  chartCenter: {
    alignItems: "center",
  },
  chartCenterLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  chartCenterAmount: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
  },
  legend: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.xs + 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  legendText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
    flex: 1,
  },

  // Allocation cards container
  allocationContainerCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  allocationSummaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bgInput,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 4,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xs + 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  allocationSummaryCol: {
    gap: 2,
  },
  allocationSummaryLabel: {
    fontSize: Typography.xs - 2,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  allocationSummaryValue: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontExtraBold,
    color: Colors.income,
  },
  allocationSummaryPill: {
    alignItems: "flex-end",
    gap: 2,
  },
  allocationSummaryPillLabel: {
    fontSize: Typography.xs - 2,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  allocationSummaryPillValue: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontBold,
    color: Colors.primary,
  },
  allocationItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs + 4,
    gap: Spacing.sm + 2,
  },
  allocationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  allocationEmojiWrapper: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  allocationEmoji: {
    fontSize: 18,
    textAlign: "center",
  },
  allocationInfo: {
    flex: 1,
    gap: 6,
  },
  allocationTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  allocationName: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.xs,
  },
  allocationAmount: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontExtraBold,
  },
  allocationBarBg: {
    height: 6,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  allocationBarFill: {
    height: "100%",
    borderRadius: Radius.full,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  emptyEmoji: { fontSize: 32, marginBottom: Spacing.xs },
  emptyText: {
    fontSize: Typography.sm + 1,
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
    marginBottom: 2,
  },
  emptySubtext: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default DashboardScreen;
