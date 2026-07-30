// ─────────────────────────────────────────────
//  Screen: Amplop Digital — Budget Planner
// ─────────────────────────────────────────────
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { formatRupiah, formatInputAmount } from '../utils/currency';
import { loadBudgetPlan, saveBudgetPlan, BudgetSlot } from '../database/queries/budgetQueries';
import { useWalletStore } from '../store/useWalletStore';

const EMOJI_OPTIONS = ['🏠','🍜','🚌','💰','🎮','📚','💊','👗','🛒','🎵','✈️','💻','📦','🎁','🌱'];
const COLOR_OPTIONS = ['#818CF8','#4ADE80','#F87171','#FBBF24','#60A5FA','#F472B6','#34D399','#FB923C','#A78BFA','#22D3EE'];

const BudgetScreen: React.FC = () => {
  const navigation = useNavigation();
  const { wallets } = useWalletStore();

  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [slots, setSlots] = useState<Omit<BudgetSlot, 'id' | 'plan_id'>[]>([]);
  const [saving, setSaving] = useState(false);

  // Load saved plan on mount
  useEffect(() => {
    const plan = loadBudgetPlan();
    if (plan) {
      setSelectedWalletId(plan.wallet_id);
      setSlots(plan.slots.map(s => ({
        name: s.name,
        emoji: s.emoji,
        amount: s.amount,
        color: s.color,
      })));
    } else if (wallets.length > 0) {
      setSelectedWalletId(wallets[0].id); // default to first wallet
    }
  }, [wallets]);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const incomeNum = selectedWallet?.current_balance || 0;
  const totalAllocated = slots.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const remaining = incomeNum - totalAllocated;
  const fillPct = incomeNum > 0 ? Math.min((totalAllocated / incomeNum) * 100, 100) : 0;

  // ─── Slot CRUD ────────────────────────────────
  const addSlot = () => {
    setSlots(prev => [
      ...prev,
      { name: '', emoji: '📦', amount: 0, color: COLOR_OPTIONS[prev.length % COLOR_OPTIONS.length] },
    ]);
  };

  const removeSlot = (idx: number) => {
    setSlots(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSlot = (idx: number, field: keyof Omit<BudgetSlot, 'id' | 'plan_id'>, value: string | number) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  // ─── Save ─────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!selectedWalletId) {
      Alert.alert('Perhatian', 'Pilih sumber dompet terlebih dahulu.');
      return;
    }
    if (incomeNum <= 0) {
      Alert.alert('Perhatian', 'Dompet yang dipilih tidak memiliki saldo.');
      return;
    }
    if (slots.length === 0) {
      Alert.alert('Perhatian', 'Tambahkan minimal satu pos alokasi.');
      return;
    }
    if (slots.some(s => !s.name.trim())) {
      Alert.alert('Perhatian', 'Semua pos harus memiliki nama.');
      return;
    }
    if (totalAllocated > incomeNum) {
      Alert.alert(
        'Melebihi Saldo',
        `Total alokasi ${formatRupiah(totalAllocated)} melebihi saldo dompet ${formatRupiah(incomeNum)}.`
      );
      return;
    }

    setSaving(true);
    try {
      saveBudgetPlan(selectedWalletId, slots);
      Alert.alert('Tersimpan ✅', 'Rencana anggaran berhasil disimpan!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan rencana anggaran.');
    } finally {
      setSaving(false);
    }
  }, [incomeNum, slots, totalAllocated, navigation]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Amplop Digital</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            disabled={saving}>
            <Text style={styles.saveBtnText}>Simpan</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Wallet Selector */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>💼  Pilih Sumber Dompet</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
              {wallets.map(w => {
                const isSelected = w.id === selectedWalletId;
                return (
                  <TouchableOpacity
                    key={w.id!}
                    onPress={() => setSelectedWalletId(w.id!)}
                    style={[
                      styles.walletOpt,
                      isSelected && styles.walletOptActive,
                      { borderLeftColor: w.color_code }
                    ]}>
                    <Text style={styles.walletOptName}>{w.name}</Text>
                    <Text style={styles.walletOptBalance}>{formatRupiah(w.current_balance ?? w.initial_balance)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Progress Bar */}
          <View style={styles.card}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Total Dialokasikan</Text>
              <Text style={[
                styles.progressPct,
                { color: totalAllocated > incomeNum ? Colors.expense : totalAllocated === incomeNum ? Colors.income : Colors.textPrimary }
              ]}>
                {formatRupiah(totalAllocated)}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill,
                {
                  width: `${fillPct}%` as any,
                  backgroundColor: totalAllocated > incomeNum ? Colors.expense : totalAllocated === incomeNum ? Colors.income : Colors.primary,
                }
              ]} />
            </View>
            <Text style={styles.progressNote}>
              {totalAllocated === incomeNum && incomeNum > 0
                ? '✅ Sempurna! Semua gaji sudah terbagi.'
                : totalAllocated > incomeNum
                ? `⚠️  Melebihi gaji ${formatRupiah(totalAllocated - incomeNum)}.`
                : incomeNum > 0
                ? `ℹ️  Sisa ${formatRupiah(remaining)} belum dialokasikan.`
                : 'Masukkan jumlah gaji terlebih dahulu.'}
            </Text>
          </View>

          {/* Slots */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Pos Pengeluaran</Text>
            <TouchableOpacity onPress={addSlot} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Tambah</Text>
            </TouchableOpacity>
          </View>

          {slots.map((slot, idx) => {
            return (
              <View key={idx} style={[styles.slotCard, { borderLeftColor: slot.color }]}>
                {/* Emoji picker */}
                <View style={styles.slotTopRow}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.emojiScroll}
                    contentContainerStyle={styles.emojiScrollContent}>
                    {EMOJI_OPTIONS.map(e => (
                      <TouchableOpacity
                        key={e}
                        onPress={() => updateSlot(idx, 'emoji', e)}
                        style={[styles.emojiOpt, slot.emoji === e && styles.emojiOptActive]}>
                        <Text style={styles.emojiOptText}>{e}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Name input */}
                <TextInput
                  style={styles.slotNameInput}
                  placeholder="Nama pos (misal: Makan)"
                  placeholderTextColor={Colors.textTertiary}
                  value={slot.name}
                  onChangeText={v => updateSlot(idx, 'name', v)}
                />

                {/* Nominal input + color + delete */}
                <View style={styles.slotBottomRow}>
                  <View style={styles.nominalWrapper}>
                    <Text style={styles.nominalPrefix}>Rp</Text>
                    <TextInput
                      style={styles.nominalInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={Colors.textTertiary}
                      value={slot.amount > 0 ? formatInputAmount(String(slot.amount)) : ''}
                      onChangeText={v => updateSlot(idx, 'amount', Number(v.replace(/\D/g, '')) || 0)}
                    />
                  </View>

                  {/* Formatted label */}
                  {slot.amount > 0 && (
                    <Text style={[styles.nominalFormatted, { color: slot.color }]} numberOfLines={1}>
                      {formatRupiah(Number(slot.amount))}
                    </Text>
                  )}

                  {/* Color dots */}
                  <View style={styles.colorRow}>
                    {COLOR_OPTIONS.slice(0, 5).map(c => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => updateSlot(idx, 'color', c)}
                        style={[styles.colorDot, { backgroundColor: c }, slot.color === c && styles.colorDotActive]}
                      />
                    ))}
                  </View>

                  <TouchableOpacity onPress={() => removeSlot(idx)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Summary breakdown */}
          {slots.length > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📊 Ringkasan Alokasi</Text>
              {slots.map((slot, idx) => {
                const barPct = incomeNum > 0 ? Math.min((Number(slot.amount) / incomeNum) * 100, 100) : 0;
                return (
                  <View key={idx} style={styles.summaryRow}>
                    <Text style={styles.summaryEmoji}>{slot.emoji}</Text>
                    <Text style={styles.summaryName} numberOfLines={1}>{slot.name || '—'}</Text>
                    <View style={styles.summaryBarBg}>
                      <View style={[styles.summaryBarFill, {
                        width: `${barPct}%` as any,
                        backgroundColor: slot.color,
                      }]} />
                    </View>
                    <Text style={[styles.summaryAmount, { color: slot.color }]}>
                      {formatRupiah(Number(slot.amount))}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  headerTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  saveBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.weightBold,
    color: '#fff',
  },

  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },

  card: {
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weightSemiBold,
    marginBottom: Spacing.sm,
  },
  walletOpt: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    minWidth: 140,
  },
  walletOptActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '11',
  },
  walletOptName: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  walletOptBalance: {
    fontSize: Typography.md,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.weightBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addBtn: {
    backgroundColor: Colors.primary + '33',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '66',
  },
  addBtnText: {
    fontSize: Typography.xs,
    color: Colors.primaryLight,
    fontWeight: Typography.weightBold,
  },


  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weightMedium,
  },
  progressPct: {
    fontSize: Typography.sm,
    fontWeight: Typography.weightExtraBold,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressNote: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },

  // Slot card
  slotCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
  },
  slotTopRow: {
    marginBottom: Spacing.sm,
  },
  emojiScroll: { maxHeight: 36 },
  emojiScrollContent: { gap: 6 },
  emojiOpt: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgCardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '22',
  },
  emojiOptText: { fontSize: 16 },

  slotNameInput: {
    fontSize: Typography.md,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },

  slotBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nominalWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  nominalPrefix: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weightBold,
  },
  nominalInput: {
    fontSize: Typography.sm,
    fontWeight: Typography.weightExtraBold,
    color: Colors.textPrimary,
    minWidth: 60,
  },
  nominalFormatted: {
    flex: 1,
    fontSize: Typography.xs,
    fontWeight: Typography.weightBold,
    textAlign: 'right',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 5,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  colorDotActive: {
    borderWidth: 2.5,
    borderColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
  deleteBtn: {
    padding: 4,
    backgroundColor: Colors.expense + '22',
    borderRadius: Radius.sm,
  },
  deleteBtnText: {
    fontSize: Typography.xs,
    color: Colors.expense,
    fontWeight: Typography.weightBold,
  },

  // Summary
  summaryCard: {
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  summaryTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryEmoji: { fontSize: 16, width: 22 },
  summaryName: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    width: 80,
  },
  summaryBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  summaryAmount: {
    fontSize: Typography.xs,
    fontWeight: Typography.weightBold,
    textAlign: 'right',
    width: 80,
  },
});

export default BudgetScreen;
