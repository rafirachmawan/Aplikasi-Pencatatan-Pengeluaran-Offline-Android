// ─────────────────────────────────────────────
//  Screen: Wallet Management + Transfer
// ─────────────────────────────────────────────
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Colors, Typography, Spacing, Radius, Shadow} from '../utils/theme';
import {formatRupiah, formatInputAmount} from '../utils/currency';
import {today} from '../utils/date';
import {useWalletStore} from '../store/useWalletStore';
import {createTransfer} from '../database/queries/transferQueries';
import {Wallet} from '../types';

const WALLET_COLORS = [
  '#818CF8', '#4ADE80', '#F87171', '#FBBF24',
  '#60A5FA', '#F472B6', '#34D399', '#FB923C',
];

const WalletScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Wallet'>>();
  const {wallets, fetchWallets, addWallet, removeWallet} = useWalletStore();

  // Add Wallet Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newColor, setNewColor] = useState(WALLET_COLORS[0]);

  // Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [fromWallet, setFromWallet] = useState<Wallet | null>(null);
  const [toWallet, setToWallet] = useState<Wallet | null>(null);
  const [transferAmount, setTransferAmount] = useState('');

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleAddWallet = () => {
    if (!newName.trim()) {
      Alert.alert('Nama kosong', 'Masukkan nama dompet.');
      return;
    }
    const balance = parseFloat(newBalance.replace(/\D/g, '') || '0');
    addWallet(newName.trim(), balance, newColor);
    setNewName('');
    setNewBalance('');
    setNewColor(WALLET_COLORS[0]);
    setShowAddModal(false);
  };

  const handleTransfer = () => {
    if (!fromWallet || !toWallet) {
      Alert.alert('Pilih dompet', 'Pilih dompet asal dan tujuan.');
      return;
    }
    if (fromWallet.id === toWallet.id) {
      Alert.alert('Sama', 'Dompet asal dan tujuan tidak boleh sama.');
      return;
    }
    const amount = parseFloat(transferAmount.replace(/\D/g, '') || '0');
    if (amount <= 0) {
      Alert.alert('Nominal', 'Masukkan nominal transfer.');
      return;
    }
    createTransfer(fromWallet.id, toWallet.id, amount, today());
    fetchWallets();
    setShowTransferModal(false);
    setTransferAmount('');
    Alert.alert('Berhasil', `Transfer Rp ${formatRupiah(amount)} berhasil.`);
  };

  const handleDeleteWallet = (wallet: Wallet) => {
    Alert.alert(
      'Hapus Dompet',
      `Yakin hapus "${wallet.name}"? Data transaksi terkait tetap tersimpan.`,
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => removeWallet(wallet.id),
        },
      ],
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
        <Text style={styles.headerTitle}>Dompet & Kas</Text>
        <View style={{width: 60}} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👛</Text>
            <Text style={styles.emptyText}>Belum ada dompet</Text>
            <Text style={styles.emptySubtext}>
              Ketuk "+ Tambah" untuk membuat dompet pertama
            </Text>
          </View>
        ) : (
          wallets.map(w => (
            <View key={w.id} style={[styles.walletRow, {borderLeftColor: w.color_code ?? Colors.primary}]}>
              <View style={styles.walletInfo}>
                <View style={[styles.colorDot, {backgroundColor: w.color_code ?? Colors.primary}]} />
                <View>
                  <Text style={styles.walletName}>{w.name}</Text>
                  <Text style={styles.walletSub}>
                    Saldo awal: {formatRupiah(w.initial_balance)}
                  </Text>
                </View>
              </View>
              <View style={styles.walletRight}>
                <Text style={styles.walletBalance}>
                  {formatRupiah(w.current_balance ?? w.initial_balance)}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteWallet(w)}>
                  <Text style={styles.deleteBtn}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* ── Action Buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.income + '15' }]}>
              <Text style={{ fontSize: 20, color: Colors.income, fontWeight: 'bold' }}>＋</Text>
            </View>
            <Text style={styles.actionBtnText}>Dompet Baru</Text>
          </TouchableOpacity>

          {wallets.length >= 2 && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowTransferModal(true)} activeOpacity={0.8}>
              <View style={[styles.actionIconWrap, { backgroundColor: Colors.transfer + '15' }]}>
                <Text style={{ fontSize: 20, color: Colors.transfer, fontWeight: 'bold' }}>⇄</Text>
              </View>
              <Text style={styles.actionBtnText}>Transfer</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── Add Wallet Modal ── */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tambah Dompet</Text>

            <Text style={styles.inputLabel}>Nama Dompet</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="contoh: BCA, ShopeePay..."
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.inputLabel}>Saldo Awal</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.rpPrefix}>Rp</Text>
              <TextInput
                style={styles.amountInput}
                value={newBalance}
                onChangeText={(text) => setNewBalance(formatInputAmount(text))}
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.inputLabel}>Warna</Text>
            <View style={styles.colorRow}>
              {WALLET_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorSwatch,
                    {backgroundColor: c},
                    newColor === c && styles.colorSwatchSelected,
                  ]}
                  onPress={() => setNewColor(c)}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleAddWallet}>
                <Text style={styles.modalSaveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Transfer Modal ── */}
      <Modal
        visible={showTransferModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTransferModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Transfer Antar Dompet</Text>

            <Text style={styles.inputLabel}>Dari Dompet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: Spacing.sm}}>
              {wallets.map(w => (
                <TouchableOpacity
                  key={w.id}
                  style={[styles.chipBtn, fromWallet?.id === w.id && styles.chipBtnActive]}
                  onPress={() => setFromWallet(w)}>
                  <Text style={styles.chipBtnText}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Ke Dompet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: Spacing.sm}}>
              {wallets.map(w => (
                <TouchableOpacity
                  key={w.id}
                  style={[styles.chipBtn, toWallet?.id === w.id && styles.chipBtnActive]}
                  onPress={() => setToWallet(w)}>
                  <Text style={styles.chipBtnText}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Nominal</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.rpPrefix}>Rp</Text>
              <TextInput
                style={styles.amountInput}
                value={transferAmount}
                onChangeText={(text) => setTransferAmount(formatInputAmount(text))}
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowTransferModal(false)}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, {backgroundColor: Colors.transfer}]}
                onPress={handleTransfer}>
                <Text style={styles.modalSaveText}>Transfer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {fontSize: Typography.base, color: Colors.income, fontWeight: Typography.weightSemiBold},

  scroll: {padding: Spacing.lg, gap: Spacing.sm},

  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    ...Shadow.card,
  },
  walletInfo: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1},
  colorDot: {width: 12, height: 12, borderRadius: Radius.full},
  walletName: {fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.weightSemiBold},
  walletSub: {fontSize: Typography.xs, color: Colors.textTertiary},
  walletRight: {alignItems: 'flex-end', gap: Spacing.xs},
  walletBalance: {fontSize: Typography.md, color: Colors.textPrimary, fontWeight: Typography.weightBold},
  deleteBtn: {fontSize: Typography.base},

  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionBtnText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weightBold,
  },

  emptyState: {alignItems: 'center', paddingVertical: Spacing['4xl']},
  emptyEmoji: {fontSize: 48, marginBottom: Spacing.md},
  emptyText: {fontSize: Typography.md, color: Colors.textPrimary, fontWeight: Typography.weightBold, marginBottom: Spacing.xs},
  emptySubtext: {fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center'},

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  modalTitle: {fontSize: Typography.lg, color: Colors.textPrimary, fontWeight: Typography.weightBold, marginBottom: Spacing.sm},
  inputLabel: {fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.weightMedium},
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  rpPrefix: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weightBold,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weightBold,
  },
  colorRow: {flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, flexWrap: 'wrap'},
  colorSwatch: {width: 28, height: 28, borderRadius: Radius.full},
  colorSwatchSelected: {borderWidth: 3, borderColor: '#fff'},
  modalActions: {flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md},
  modalCancel: {
    flex: 1, borderRadius: Radius.full, paddingVertical: Spacing.md,
    alignItems: 'center', backgroundColor: Colors.bgCard,
  },
  modalCancelText: {fontSize: Typography.base, color: Colors.textSecondary, fontWeight: Typography.weightSemiBold},
  modalSave: {
    flex: 2, borderRadius: Radius.full, paddingVertical: Spacing.md,
    alignItems: 'center', backgroundColor: Colors.primary,
  },
  modalSaveText: {fontSize: Typography.base, color: '#fff', fontWeight: Typography.weightBold},
  chipBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    backgroundColor: Colors.bgCard, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm,
  },
  chipBtnActive: {borderColor: Colors.primary, backgroundColor: Colors.primary + '22'},
  chipBtnText: {fontSize: Typography.sm, color: Colors.textSecondary},
});

export default WalletScreen;
