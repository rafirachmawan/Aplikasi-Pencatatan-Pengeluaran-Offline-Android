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
          {/* Row 1: Branding kiri + Chip jam/hari kanan */}
          <View style={styles.headerTopRow}>
            <View style={styles.brandRow}>
              <Image
                source={require("../../assets/Finanku.png")}
                style={styles.brandImage}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>FinanceKu</Text>
            </View>

            <View style={styles.dateTimeChip}>
              <Text style={styles.clockText}>{currentTime}</Text>
              <View style={styles.chipDivider} />
              <Text style={styles.datePillText}>{dayName}</Text>
            </View>
          </View>

          {/* Row 2: Slogan */}
          <Text style={styles.slogan} numberOfLines={1} adjustsFontSizeToFit>
            Catat. Kelola. <Text style={styles.sloganAccent}>Bertumbuh.</Text>
          </Text>
        </View>

        {/* ── Hero Balance Card (Dark Slate Accent) ── */}
        <View style={styles.heroCard}>
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

          <Text style={styles.heroBalanceAmount}>
            {balanceHidden ? "• • • • • •" : formatRupiah(totalBalance)}
          </Text>
        </View>

        {/* ── Budget & Dana Banner ── */}
        <TouchableOpacity
          style={styles.budgetBanner}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Budget")}
        >
          <View style={styles.budgetBannerLeft}>
            <View style={styles.budgetEmojiBadge}>
              <Text style={styles.budgetBannerEmoji}>🪙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.budgetBannerTitle}>Alokasi Dana</Text>
              <Text style={styles.budgetBannerDesc}>
                Atur alokasi gaji & anggaran bulanan
              </Text>
            </View>
          </View>
          <View style={styles.budgetArrowBadge}>
            <Text style={styles.budgetBannerArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* ── Wallets Horizontal Scroll ── */}
        {wallets.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Dompet Saya"
              onAction={() => navigation.navigate("Wallet")}
              actionLabel="Kelola"
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
          <SectionHeader
            title="Alokasi Bulan Ini"
            onAction={() => navigation.navigate("Budget")}
            actionLabel="Atur Alokasi"
          />
          {budgetSlots.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🪙</Text>
              <Text style={styles.emptyText}>Belum Ada Alokasi Bulan Ini</Text>
              <Text style={styles.emptySubtext}>
                Ketuk "Atur Alokasi" untuk membagi anggaran & pos pengeluaran bulanan
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => navigation.navigate("Budget")}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyActionText}>+ Atur Alokasi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            budgetSlots.map((slot, idx) => {
              const barPct = totalBalance > 0 ? Math.min((slot.amount / totalBalance) * 100, 100) : 0;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.allocationCard, { borderLeftColor: slot.color }]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("Budget")}
                >
                  <View style={styles.allocationEmojiBadge}>
                    <Text style={styles.allocationEmoji}>{slot.emoji || "📦"}</Text>
                  </View>
                  <View style={styles.allocationInfo}>
                    <View style={styles.allocationTitleRow}>
                      <Text style={styles.allocationName} numberOfLines={1}>
                        {slot.name}
                      </Text>
                      <Text style={[styles.allocationAmount, { color: slot.color }]}>
                        {balanceHidden ? "• • • • • •" : formatRupiah(slot.amount)}
                      </Text>
                    </View>
                    <View style={styles.allocationBarBg}>
                      <View
                        style={[
                          styles.allocationBarFill,
                          {
                            width: `${barPct}%` as any,
                            backgroundColor: slot.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
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
      <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },

  // Header
  header: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  brandImage: {
    width: 38,
    height: 38,
    transform: [{ scale: 3.8 }],
    marginLeft: Spacing.xs,
    marginRight: Spacing.xs,
  },
  brandName: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  slogan: {
    fontSize: Typography.lg + 2,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
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
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
    ...Shadow.soft,
  },
  chipDivider: {
    width: 1,
    height: 10,
    backgroundColor: Colors.textDisabled,
  },
  clockText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  datePillText: {
    fontSize: Typography.xs - 1,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },

  // Hero Card (Dark Slate Accent)
  heroCard: {
    backgroundColor: Colors.heroBg,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg + 2,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.heroBorder,
    ...Shadow.hero,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  heroLabelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroLabelDot: {
    fontSize: 8,
    color: Colors.income,
  },
  heroLabelText: {
    fontSize: Typography.xs,
    color: Colors.heroTextSecondary,
    fontFamily: Typography.fontMedium,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  heroBalanceAmount: {
    fontSize: Typography["3xl"] + 2,
    color: Colors.heroTextPrimary,
    fontFamily: Typography.fontExtraBold,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs / 2,
    letterSpacing: -1,
  },

  // Budget Banner
  budgetBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.card,
  },
  budgetBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  budgetEmojiBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgInput,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetBannerEmoji: {
    fontSize: 20,
  },
  budgetBannerTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  budgetBannerDesc: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  budgetArrowBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgInput,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  budgetBannerArrow: {
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
  sectionAction: {
    fontSize: Typography.xs + 1,
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
    borderColor: Colors.borderLight,
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

  // Allocation cards
  allocationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xs + 2,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    ...Shadow.soft,
  },
  allocationEmojiBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgInput,
    alignItems: "center",
    justifyContent: "center",
  },
  allocationEmoji: {
    fontSize: 18,
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
    fontSize: Typography.sm + 1,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.xs,
  },
  allocationAmount: {
    fontSize: Typography.sm + 1,
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
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.card,
  },
  emptyEmoji: { fontSize: 36, marginBottom: Spacing.sm },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontSemiBold,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  emptyActionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  emptyActionText: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontBold,
    color: "#FFFFFF",
  },
});

export default DashboardScreen;
