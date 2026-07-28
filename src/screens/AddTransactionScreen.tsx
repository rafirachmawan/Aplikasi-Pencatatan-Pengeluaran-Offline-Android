// ─────────────────────────────────────────────
//  Screen: Add / Edit Transaction (Fast Entry)
// ─────────────────────────────────────────────
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Colors, Typography, Spacing, Radius, Shadow} from '../utils/theme';
import {formatInputAmount, parseAmount} from '../utils/currency';
import {today} from '../utils/date';
import {useCategoryStore} from '../store/useCategoryStore';
import {useWalletStore} from '../store/useWalletStore';
import {useTransactionStore} from '../store/useTransactionStore';
import {Category, TransactionType, Wallet} from '../types';
import CategoryGrid from '../components/CategoryGrid';

const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // State
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [notes, setNotes] = useState('');
  const [txDate] = useState(today());

  // Store
  const {incomeCategories, expenseCategories, fetchCategories} = useCategoryStore();
  const {wallets, fetchWallets} = useWalletStore();
  const {addTransaction} = useTransactionStore();

  useEffect(() => {
    fetchCategories();
    fetchWallets();
  }, []);

  // Auto-select first wallet
  useEffect(() => {
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0]);
    }
  }, [wallets]);

  const categories =
    type === 'INCOME' ? incomeCategories : expenseCategories;

  const handleTypeToggle = (t: TransactionType) => {
    setType(t);
    setSelectedCategory(null);
  };

  const handleAmountChange = (text: string) => {
    setAmountDisplay(formatInputAmount(text));
  };

  const handleSave = useCallback(() => {
    const amount = parseAmount(amountDisplay);
    if (amount <= 0) {
      Alert.alert('Nominal kosong', 'Masukkan nominal transaksi terlebih dahulu.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Pilih kategori', 'Silakan pilih kategori untuk transaksi ini.');
      return;
    }
    if (!selectedWallet) {
      Alert.alert('Pilih dompet', 'Silakan pilih dompet/kas untuk transaksi ini.');
      return;
    }

    addTransaction(
      selectedWallet.id,
      selectedCategory.id,
      type,
      amount,
      txDate,
      notes.trim() || null,
    );

    // Refresh wallet balances
    useWalletStore.getState().fetchWallets();

    navigation.goBack();
  }, [amountDisplay, selectedCategory, selectedWallet, type, notes, txDate]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Catat Transaksi</Text>
          <View style={{width: 28}} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* ── Type Toggle ── */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'EXPENSE' && styles.typeBtnActive,
                type === 'EXPENSE' && {backgroundColor: Colors.expense + '33'},
              ]}
              onPress={() => handleTypeToggle('EXPENSE')}>
              <Text
                style={[
                  styles.typeBtnText,
                  type === 'EXPENSE' && {color: Colors.expense},
                ]}>
                ↓ Pengeluaran
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'INCOME' && styles.typeBtnActive,
                type === 'INCOME' && {backgroundColor: Colors.income + '33'},
              ]}
              onPress={() => handleTypeToggle('INCOME')}>
              <Text
                style={[
                  styles.typeBtnText,
                  type === 'INCOME' && {color: Colors.income},
                ]}>
                ↑ Pemasukan
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Nominal Input ── */}
          <View style={styles.amountContainer}>
            <Text style={styles.currencyPrefix}>Rp</Text>
            <TextInput
              style={styles.amountInput}
              value={amountDisplay}
              onChangeText={handleAmountChange}
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          {/* ── Kategori ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Kategori</Text>
            <CategoryGrid
              categories={categories}
              selectedId={selectedCategory?.id ?? null}
              onSelect={setSelectedCategory}
            />
          </View>

          {/* ── Dompet ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dompet / Kas</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.walletRow}>
              {wallets.map(w => {
                const isSelected = selectedWallet?.id === w.id;
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[
                      styles.walletChip,
                      isSelected && {
                        borderColor: w.color_code ?? Colors.primary,
                        backgroundColor: (w.color_code ?? Colors.primary) + '22',
                      },
                    ]}
                    onPress={() => setSelectedWallet(w)}>
                    <View
                      style={[
                        styles.walletDot,
                        {backgroundColor: w.color_code ?? Colors.primary},
                      ]}
                    />
                    <Text
                      style={[
                        styles.walletChipText,
                        isSelected && {color: Colors.textPrimary},
                      ]}>
                      {w.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Tanggal ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tanggal</Text>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>📅  {txDate}</Text>
            </View>
          </View>

          {/* ── Catatan ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Catatan (opsional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Tambahkan catatan..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              maxLength={200}
            />
          </View>

          {/* ── Simpan Button ── */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              {
                backgroundColor:
                  type === 'INCOME' ? Colors.income : Colors.expense,
              },
            ]}
            onPress={handleSave}
            activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Simpan Transaksi</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  closeBtn: {
    fontSize: Typography.lg,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontSize: Typography.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weightBold,
  },

  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },

  // Toggle
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  typeBtnActive: {
    ...Shadow.card,
  },
  typeBtnText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weightSemiBold,
  },

  // Amount
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencyPrefix: {
    fontSize: Typography.xl,
    color: Colors.textSecondary,
    fontWeight: Typography.weightBold,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: Typography['3xl'],
    color: Colors.textPrimary,
    fontWeight: Typography.weightExtraBold,
    minHeight: 60,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weightSemiBold,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Wallet chips
  walletRow: {gap: Spacing.sm},
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  walletDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  walletChipText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weightMedium,
  },

  // Date
  dateDisplay: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  dateText: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weightMedium,
  },

  // Notes
  notesInput: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Save
  saveBtn: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.elevated,
  },
  saveBtnText: {
    fontSize: Typography.md,
    color: '#fff',
    fontWeight: Typography.weightBold,
  },
});

export default AddTransactionScreen;
