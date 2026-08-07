import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import dayjs from 'dayjs';
import { formatRupiah, formatInputAmount } from '../utils/currency';
import { loadBudgetPlan, saveBudgetPlan, BudgetSlot } from '../database/queries/budgetQueries';
import { useWalletStore } from '../store/useWalletStore';

const EMOJI_OPTIONS = ['🏠','🍜','🚌','💰','🎮','📚','💊','👗','🛒','🎵','✈️','💻','📦','🎁','🌱'];
const COLOR_OPTIONS = ['#818CF8','#4ADE80','#F87171','#FBBF24','#60A5FA','#F472B6','#34D399','#FB923C','#A78BFA','#22D3EE'];

interface ModalConfig {
  visible: boolean;
  type: 'confirm_delete' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

const BudgetScreen: React.FC = () => {
  const navigation = useNavigation();
  const { wallets, totalBalance } = useWalletStore();

  const [selectedPeriod, setSelectedPeriod] = useState(() => dayjs().format('YYYY-MM'));
  // Single Unified Slots State
  const [slots, setSlots] = useState<Omit<BudgetSlot, 'id' | 'plan_id'>[]>([]);
  // Which item index is currently being edited (null = all collapsed in summary view)
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [activeEmojiPickerIdx, setActiveEmojiPickerIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Custom Modern Modal State
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    type: 'warning',
    title: '',
    message: '',
  });

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

  // Load saved plan whenever selectedPeriod changes
  useEffect(() => {
    const plan = loadBudgetPlan(selectedPeriod);
    if (plan && plan.slots.length > 0) {
      const mapped = plan.slots.map(s => ({
        name: s.name,
        emoji: s.emoji,
        amount: s.amount,
        color: s.color,
      }));
      setSlots(mapped);
    } else {
      setSlots([]);
    }
    setEditingIdx(null);
    setActiveEmojiPickerIdx(null);
  }, [selectedPeriod]);

  const handlePrevMonth = () => {
    setSelectedPeriod(prev => dayjs(prev + '-01').subtract(1, 'month').format('YYYY-MM'));
  };

  const handleNextMonth = () => {
    setSelectedPeriod(prev => dayjs(prev + '-01').add(1, 'month').format('YYYY-MM'));
  };

  const incomeNum = totalBalance || 0;
  const totalAllocated = slots.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const remaining = incomeNum - totalAllocated;
  const fillPct = incomeNum > 0 ? Math.min((totalAllocated / incomeNum) * 100, 100) : 0;

  // ─── Slot CRUD ─────
  const addSlot = () => {
    const newIdx = slots.length;
    setSlots(prev => [
      ...prev,
      { name: '', emoji: EMOJI_OPTIONS[prev.length % EMOJI_OPTIONS.length], amount: 0, color: COLOR_OPTIONS[prev.length % COLOR_OPTIONS.length] },
    ]);
    setEditingIdx(newIdx);
  };

  const removeSlot = (idx: number) => {
    const slotTarget = slots[idx];
    setModalConfig({
      visible: true,
      type: 'confirm_delete',
      title: 'Hapus Pos Alokasi?',
      message: `Apakah Anda yakin ingin menghapus pos "${slotTarget?.name || 'ini'}"?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onConfirm: () => {
        const updated = slots.filter((_, i) => i !== idx);
        setSlots(updated);
        if (editingIdx === idx) setEditingIdx(null);
        if (activeEmojiPickerIdx === idx) setActiveEmojiPickerIdx(null);

        // Langsung simpan perubahan penghapusan ke database SQLite
        const dummyWalletId = wallets.length > 0 ? wallets[0].id! : 0;
        saveBudgetPlan(dummyWalletId, updated, selectedPeriod);

        closeModal();
      },
    });
  };

  const updateSlot = (idx: number, field: keyof Omit<BudgetSlot, 'id' | 'plan_id'>, value: string | number) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  // ─── Save ─────────────────────────────────────
  const handleSave = useCallback(() => {
    if (incomeNum <= 0 && slots.length > 0) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Saldo Kosong',
        message: 'Total saldo saat ini 0. Tambahkan saldo dompet terlebih dahulu.',
        confirmText: 'Mengerti',
        onConfirm: closeModal,
      });
      return;
    }
    if (slots.some(s => !s.name.trim())) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Nama Pos Kosong',
        message: 'Semua pos alokasi wajib memiliki nama.',
        confirmText: 'Mengerti',
        onConfirm: closeModal,
      });
      return;
    }

    if (totalAllocated > incomeNum) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Melebihi Saldo',
        message: `Total alokasi ${formatRupiah(totalAllocated)} melebihi saldo tersedia ${formatRupiah(incomeNum)}.`,
        confirmText: 'Perbaiki',
        onConfirm: closeModal,
      });
      return;
    }

    setSaving(true);
    try {
      const dummyWalletId = wallets.length > 0 ? wallets[0].id! : 0;
      saveBudgetPlan(dummyWalletId, slots, selectedPeriod);
      setEditingIdx(null);

      setModalConfig({
        visible: true,
        type: 'success',
        title: 'Berhasil Disimpan! 🎉',
        message: `Rencana alokasi untuk periode ${dayjs(selectedPeriod + '-01').format('MMMM YYYY')} tersimpan dengan rapi.`,
        confirmText: 'Selesai',
        onConfirm: () => {
          closeModal();
          navigation.goBack();
        },
      });
    } catch (e) {
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan rencana alokasi.',
        confirmText: 'Tutup',
        onConfirm: closeModal,
      });
    } finally {
      setSaving(false);
    }
  }, [incomeNum, slots, totalAllocated, navigation, wallets, selectedPeriod]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header Navbar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alokasi Dana</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* ── Dark Hero Overview Card ── */}
          <View style={styles.heroOverviewCard}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroLabel}>SUMBER DANA (TOTAL DOMPET)</Text>
                <Text style={styles.heroAmount}>{formatRupiah(incomeNum)}</Text>
              </View>
              <View style={styles.heroPctBadge}>
                <Text style={styles.heroPctText}>
                  {incomeNum > 0 ? Math.round((totalAllocated / incomeNum) * 100) : 0}%
                </Text>
              </View>
            </View>

            <View style={styles.heroProgressHeader}>
              <Text style={styles.heroProgressLabel}>Total Dialokasikan</Text>
              <Text style={[
                styles.heroProgressAmount,
                { color: totalAllocated > incomeNum ? '#F87171' : '#4ADE80' }
              ]}>
                {formatRupiah(totalAllocated)}
              </Text>
            </View>

            {/* Glowing Progress Bar */}
            <View style={styles.heroProgressBarBg}>
              <View style={[
                styles.heroProgressBarFill,
                {
                  width: `${fillPct}%` as any,
                  backgroundColor: totalAllocated > incomeNum ? '#F87171' : totalAllocated === incomeNum ? '#4ADE80' : '#818CF8',
                }
              ]} />
            </View>

            {/* Status Note Pill */}
            <View style={styles.heroNoteBox}>
              <Text style={styles.heroNoteText}>
                {totalAllocated === incomeNum && incomeNum > 0
                  ? '✅ Semua dana telah dialokasikan dengan pas.'
                  : totalAllocated > incomeNum
                  ? `⚠️ Melebihi saldo sebesar ${formatRupiah(totalAllocated - incomeNum)}.`
                  : incomeNum > 0
                  ? `ℹ️ Sisa ${formatRupiah(remaining)} belum dialokasikan.`
                  : 'Belum ada saldo dompet yang tersedia.'}
              </Text>
            </View>
          </View>

          {/* ── Month Switcher Card ── */}
          <View style={styles.monthSelectorCard}>
            <Text style={styles.monthSelectorLabel}>PERIODE ALOKASI</Text>
            <View style={styles.monthPillRow}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrowBtn} activeOpacity={0.7}>
                <Text style={styles.monthArrowText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthPillText}>
                📅 {dayjs(selectedPeriod + '-01').format('MMMM YYYY')}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrowBtn} activeOpacity={0.7}>
                <Text style={styles.monthArrowText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Unified Allocation Card ── */}
          <View style={styles.mainAllocationCard}>
            {/* Header row inside card */}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>📊 Pos Alokasi Dana</Text>
              <View style={styles.cardHeaderActions}>
                <TouchableOpacity onPress={addSlot} style={styles.addPosBtnSmall} activeOpacity={0.8}>
                  <Text style={styles.addPosBtnSmallText}>+ Tambah</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.saveBtnSmall, saving && { opacity: 0.6 }]}
                  activeOpacity={0.8}
                  disabled={saving}>
                  <Text style={styles.saveBtnSmallText}>{saving ? '...' : '💾 Simpan'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* List of Allocation Pos */}
            {slots.length === 0 ? (
              <View style={styles.emptyCardBox}>
                <Text style={styles.emptyCardEmoji}>💡</Text>
                <Text style={styles.emptyCardTitle}>Belum ada alokasi</Text>
                <Text style={styles.emptyCardSub}>
                  Tekan "+ Tambah" untuk membagi anggaran {dayjs(selectedPeriod + '-01').format('MMMM YYYY')}
                </Text>
              </View>
            ) : (
              slots.map((slot, idx) => {
                const isEditing = editingIdx === idx;
                const isPickerOpen = activeEmojiPickerIdx === idx;
                const barPct = incomeNum > 0 ? Math.min((Number(slot.amount) / incomeNum) * 100, 100) : 0;

                if (isEditing) {
                  // Expanded Edit Mode Row
                  return (
                    <View key={idx} style={[styles.editingRowCard, { borderLeftColor: slot.color }]}>
                      {/* Top Edit Row: Emoji + Name Input + Delete */}
                      <View style={styles.slotMainRow}>
                        <TouchableOpacity
                          onPress={() => setActiveEmojiPickerIdx(isPickerOpen ? null : idx)}
                          style={[styles.emojiBadge, { backgroundColor: slot.color + '1A' }]}
                          activeOpacity={0.7}>
                          <Text style={styles.emojiBadgeText}>{slot.emoji}</Text>
                        </TouchableOpacity>

                        <View style={styles.nameInputWrap}>
                          <TextInput
                            style={styles.slotNameInput}
                            placeholder="Nama Pos (misal: Makan)"
                            placeholderTextColor={Colors.textTertiary}
                            value={slot.name}
                            onChangeText={v => updateSlot(idx, 'name', v)}
                            autoFocus
                          />
                        </View>

                        <TouchableOpacity
                          onPress={() => removeSlot(idx)}
                          style={styles.deleteIconBtn}
                          activeOpacity={0.7}>
                          <Text style={styles.deleteIconText}>🗑</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Expandable Emoji Picker */}
                      {isPickerOpen && (
                        <View style={styles.emojiPickerBox}>
                          <Text style={styles.emojiPickerLabel}>Pilih Ikon:</Text>
                          <View style={styles.emojiGrid}>
                            {EMOJI_OPTIONS.map(e => (
                              <TouchableOpacity
                                key={e}
                                onPress={() => {
                                  updateSlot(idx, 'emoji', e);
                                  setActiveEmojiPickerIdx(null);
                                }}
                                style={[styles.emojiOptBtn, slot.emoji === e && styles.emojiOptBtnActive]}>
                                <Text style={styles.emojiOptBtnText}>{e}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Nominal + Color Swatches + Done Btn */}
                      <View style={styles.slotBottomRow}>
                        <View style={styles.amountInputWrap}>
                          <Text style={styles.rpText}>Rp</Text>
                          <TextInput
                            style={styles.amountInput}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={Colors.textTertiary}
                            value={slot.amount > 0 ? formatInputAmount(String(slot.amount)) : ''}
                            onChangeText={v => updateSlot(idx, 'amount', Number(v.replace(/\D/g, '')) || 0)}
                          />
                        </View>

                        <View style={styles.colorSwatchesRow}>
                          {COLOR_OPTIONS.slice(0, 5).map(c => (
                            <TouchableOpacity
                              key={c}
                              onPress={() => updateSlot(idx, 'color', c)}
                              style={[
                                styles.colorDot,
                                { backgroundColor: c },
                                slot.color === c && styles.colorDotSelected,
                              ]}
                            />
                          ))}
                        </View>

                        <TouchableOpacity
                          onPress={() => setEditingIdx(null)}
                          style={styles.doneBtn}
                          activeOpacity={0.8}>
                          <Text style={styles.doneBtnText}>✓</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }

                // Standard Summary View Row with Edit & Delete Buttons
                return (
                  <View key={idx} style={styles.summaryItemRow}>
                    <Text style={styles.summaryEmoji}>{slot.emoji}</Text>
                    <View style={styles.summaryInfoCol}>
                      <View style={styles.summaryTopLine}>
                        <Text style={styles.summaryName} numberOfLines={1}>{slot.name || '—'}</Text>
                        <Text style={[styles.summaryAmount, { color: slot.color }]}>
                          {formatRupiah(Number(slot.amount))}
                        </Text>
                      </View>
                      <View style={styles.summaryBarBg}>
                        <View style={[styles.summaryBarFill, {
                          width: `${barPct}%` as any,
                          backgroundColor: slot.color,
                        }]} />
                      </View>
                    </View>

                    {/* Action Buttons: Edit & Delete */}
                    <View style={styles.rowActionGroup}>
                      <TouchableOpacity
                        onPress={() => setEditingIdx(idx)}
                        style={styles.editActionBtn}
                        activeOpacity={0.7}>
                        <Text style={styles.editActionText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeSlot(idx)}
                        style={styles.deleteActionBtn}
                        activeOpacity={0.7}>
                        <Text style={styles.deleteActionText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Modern Popup Modal */}
      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Badge Icon */}
            <View style={[
              styles.modalIconBadge,
              modalConfig.type === 'confirm_delete' && { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
              modalConfig.type === 'warning' && { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
              modalConfig.type === 'success' && { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
              modalConfig.type === 'error' && { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
            ]}>
              <Text style={styles.modalIconText}>
                {modalConfig.type === 'confirm_delete' ? '🗑️' : modalConfig.type === 'success' ? '🎉' : modalConfig.type === 'error' ? '❌' : '⚠️'}
              </Text>
            </View>

            {/* Title & Message */}
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>

            {/* Action Buttons */}
            <View style={styles.modalActionRow}>
              {modalConfig.cancelText ? (
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.modalCancelBtn}
                  activeOpacity={0.8}>
                  <Text style={styles.modalCancelText}>{modalConfig.cancelText}</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={modalConfig.onConfirm || closeModal}
                style={[
                  styles.modalConfirmBtn,
                  modalConfig.type === 'confirm_delete' && { backgroundColor: Colors.expense },
                  modalConfig.type === 'success' && { backgroundColor: Colors.income },
                ]}
                activeOpacity={0.8}>
                <Text style={styles.modalConfirmText}>{modalConfig.confirmText || 'OK'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  backBtn: { padding: Spacing.xs },
  backIcon: { fontSize: 22, color: Colors.textPrimary, fontWeight: '700' },
  headerTitle: {
    fontSize: Typography.base + 1,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textPrimary,
  },

  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  // Hero Overview Card (Dark Slate #0F172A)
  heroOverviewCard: {
    backgroundColor: Colors.heroBg,
    borderRadius: Radius.xl,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.heroBorder,
    ...Shadow.hero,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  heroLabel: {
    fontSize: Typography.xs - 1,
    fontFamily: Typography.fontBold,
    color: Colors.heroTextSecondary,
    letterSpacing: 0.8,
  },
  heroAmount: {
    fontSize: Typography.xl + 2,
    fontFamily: Typography.fontExtraBold,
    color: Colors.heroTextPrimary,
    marginTop: 2,
  },
  heroPctBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroPctText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: Colors.heroTextPrimary,
  },

  heroProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  heroProgressLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.heroTextSecondary,
  },
  heroProgressAmount: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontExtraBold,
  },

  heroProgressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm + 2,
  },
  heroProgressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },

  heroNoteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroNoteText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.heroTextSecondary,
  },

  // Month Selector Card (Dibawah Hero Card)
  monthSelectorCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadow.card,
  },
  monthSelectorLabel: {
    fontSize: Typography.xs - 1,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textSecondary,
    letterSpacing: 1.0,
    marginBottom: 6,
  },
  monthPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm + 2,
  },
  monthArrowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  monthArrowText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  monthPillText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textPrimary,
  },

  // Main Allocation Card (Unified)
  mainAllocationCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm + 2,
    ...Shadow.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: Typography.sm + 1,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textPrimary,
  },
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addPosBtnSmall: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.full,
    ...Shadow.soft,
  },
  addPosBtnSmallText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: '#FFFFFF',
  },
  saveBtnSmall: {
    backgroundColor: Colors.income,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.full,
    ...Shadow.soft,
  },
  saveBtnSmallText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontExtraBold,
    color: '#FFFFFF',
  },

  // Empty Box
  emptyCardBox: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyCardEmoji: { fontSize: 28, marginBottom: 4 },
  emptyCardTitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  emptyCardSub: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Summary Row (Read Mode with Edit & Hapus Buttons)
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  summaryEmoji: { fontSize: 20 },
  summaryInfoCol: {
    flex: 1,
    gap: 4,
  },
  summaryTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryName: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  summaryAmount: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontExtraBold,
  },
  summaryBarBg: {
    height: 6,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },

  rowActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 4,
  },
  editActionBtn: {
    padding: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput,
  },
  editActionText: { fontSize: 13 },
  deleteActionBtn: {
    padding: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.expenseLight,
  },
  deleteActionText: { fontSize: 13 },

  // Expanded Editing Card Row
  editingRowCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginVertical: 4,
    ...Shadow.card,
  },
  slotMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emojiBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emojiBadgeText: { fontSize: 18 },
  nameInputWrap: {
    flex: 1,
  },
  slotNameInput: {
    fontSize: Typography.sm + 1,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  deleteIconBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    backgroundColor: Colors.expenseLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconText: { fontSize: 13 },

  emojiPickerBox: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emojiPickerLabel: {
    fontSize: Typography.xs - 1,
    fontFamily: Typography.fontBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emojiOptBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptBtnActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  emojiOptBtnText: { fontSize: 16 },

  slotBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    gap: 4,
  },
  rpText: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontBold,
    color: Colors.textSecondary,
  },
  amountInput: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textPrimary,
    flex: 1,
  },

  colorSwatchesRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: Radius.full,
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    transform: [{ scale: 1.15 }],
  },

  doneBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Custom Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl + 4,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  modalIconBadge: {
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: Spacing.sm + 2,
  },
  modalIconText: {
    fontSize: 26,
  },
  modalTitle: {
    fontSize: Typography.base + 1,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.lg,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontBold,
    color: Colors.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  modalConfirmText: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontExtraBold,
    color: '#FFFFFF',
  },
});

export default BudgetScreen;
