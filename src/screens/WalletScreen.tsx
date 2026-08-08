// ─────────────────────────────────────────────
//  Screen: Wallet Management
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
import {useWalletStore} from '../store/useWalletStore';
import {Wallet} from '../types';

const WALLET_COLORS = [
  '#818CF8', '#4ADE80', '#F87171', '#FBBF24',
  '#60A5FA', '#F472B6', '#34D399', '#FB923C',
];

const WalletScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Wallet'>>();
  const {wallets, fetchWallets, addWallet, editWallet, removeWallet} = useWalletStore();

  // Add / Edit Wallet Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newColor, setNewColor] = useState(WALLET_COLORS[0]);

  // Custom Popup Modal State
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type?: 'confirm_delete' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleOpenAddModal = () => {
    setEditingWallet(null);
    setNewName('');
    setNewBalance('');
    setNewColor(WALLET_COLORS[0]);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setNewName(wallet.name);
    setNewBalance(wallet.initial_balance ? formatInputAmount(String(wallet.initial_balance)) : '');
    setNewColor(wallet.color_code || WALLET_COLORS[0]);
    setShowAddModal(true);
  };

  const handleSaveWallet = () => {
    if (!newName.trim()) {
      setModalConfig({
        visible: true,
        type: 'warning',
        title: 'Nama Kosong',
        message: 'Silakan masukkan nama sumber pemasukan terlebih dahulu.',
        confirmText: 'Mengerti',
        onConfirm: closeModal,
      });
      return;
    }
    const balance = parseFloat(newBalance.replace(/\D/g, '') || '0');
    if (editingWallet) {
      editWallet(editingWallet.id, newName.trim(), newColor, balance);
    } else {
      addWallet(newName.trim(), balance, newColor);
    }
    setEditingWallet(null);
    setNewName('');
    setNewBalance('');
    setNewColor(WALLET_COLORS[0]);
    setShowAddModal(false);
  };

  const handleDeleteWallet = (wallet: Wallet) => {
    setModalConfig({
      visible: true,
      type: 'confirm_delete',
      title: 'Hapus Pemasukan?',
      message: `Apakah Anda yakin ingin menghapus sumber pemasukan "${wallet.name}"? Data transaksi terkait tetap tersimpan.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onConfirm: () => {
        removeWallet(wallet.id);
        closeModal();
      },
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header Navbar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sumber Pemasukan</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👛</Text>
            <Text style={styles.emptyText}>Belum ada sumber pemasukan</Text>
            <Text style={styles.emptySubtext}>
              Ketuk "+ Pemasukan Baru" untuk membuat sumber pemasukan pertama
            </Text>
          </View>
        ) : (
          wallets.map(w => (
            <View key={w.id} style={[styles.walletRow, {borderLeftColor: w.color_code ?? Colors.primary}]}>
              <View style={styles.walletInfo}>
                <View style={[styles.colorDot, {backgroundColor: w.color_code ?? Colors.primary}]} />
                <View style={{ flex: 1 }}>
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
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    onPress={() => handleOpenEditModal(w)}
                    style={styles.actionIconButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionIconText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteWallet(w)}
                    style={styles.actionIconButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionIconText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {/* ── Action Buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleOpenAddModal} activeOpacity={0.8}>
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.income + '15' }]}>
              <Text style={{ fontSize: 20, color: Colors.income, fontWeight: 'bold' }}>＋</Text>
            </View>
            <Text style={styles.actionBtnText}>Pemasukan Baru</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Add / Edit Wallet Modal ── */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingWallet ? 'Edit Pemasukan' : 'Tambah Pemasukan'}</Text>

            <Text style={styles.inputLabel}>Nama Pemasukan</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="contoh: Gaji, Bonus, Freelance..."
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
                onPress={handleSaveWallet}>
                <Text style={styles.modalSaveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Modern Popup Modal */}
      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalCard}>
            {/* Badge Icon */}
            <View style={[
              styles.confirmModalIconBadge,
              modalConfig.type === 'confirm_delete' && { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
              modalConfig.type === 'warning' && { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
              modalConfig.type === 'success' && { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
              modalConfig.type === 'error' && { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
            ]}>
              <Text style={styles.confirmModalIconText}>
                {modalConfig.type === 'confirm_delete' ? '🗑️' : modalConfig.type === 'success' ? '🎉' : modalConfig.type === 'error' ? '❌' : '⚠️'}
              </Text>
            </View>

            {/* Title & Message */}
            <Text style={styles.confirmModalTitle}>{modalConfig.title}</Text>
            <Text style={styles.confirmModalMessage}>{modalConfig.message}</Text>

            {/* Action Buttons */}
            <View style={styles.confirmModalActionRow}>
              {modalConfig.cancelText ? (
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.confirmModalCancelBtn}
                  activeOpacity={0.8}>
                  <Text style={styles.confirmModalCancelText}>{modalConfig.cancelText}</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={modalConfig.onConfirm || closeModal}
                style={[
                  styles.confirmModalConfirmBtn,
                  modalConfig.type === 'confirm_delete' && { backgroundColor: Colors.expense },
                  modalConfig.type === 'success' && { backgroundColor: Colors.income },
                ]}
                activeOpacity={0.8}>
                <Text style={styles.confirmModalConfirmText}>{modalConfig.confirmText || 'OK'}</Text>
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
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: Typography.base + 1,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  scroll: {padding: Spacing.lg, gap: Spacing.sm},

  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.card,
  },
  walletInfo: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1},
  colorDot: {width: 12, height: 12, borderRadius: Radius.full},
  walletName: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontSemiBold,
  },
  walletSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
    marginTop: 1,
  },
  walletRight: {alignItems: 'flex-end', gap: 4},
  walletBalance: {
    fontSize: Typography.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fontExtraBold,
    letterSpacing: -0.4,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  actionIconButton: {
    padding: 4,
    borderRadius: Radius.sm,
  },
  actionIconText: {
    fontSize: 15,
  },

  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs + 2,
  },
  actionBtnText: {
    fontSize: Typography.sm + 1,
    color: Colors.textPrimary,
    fontFamily: Typography.fontExtraBold,
  },

  emptyState: {alignItems: 'center', paddingVertical: Spacing['4xl']},
  emptyEmoji: {fontSize: 48, marginBottom: Spacing.md},
  emptyText: {fontSize: Typography.md, color: Colors.textPrimary, fontFamily: Typography.fontBold, marginBottom: Spacing.xs},
  emptySubtext: {fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: Typography.fontRegular, textAlign: 'center'},

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
  modalTitle: {fontSize: Typography.lg, color: Colors.textPrimary, fontFamily: Typography.fontExtraBold, marginBottom: Spacing.sm},
  inputLabel: {fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: Typography.fontMedium},
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontSemiBold,
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
    fontFamily: Typography.fontBold,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontExtraBold,
  },
  colorRow: {flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, flexWrap: 'wrap'},
  colorSwatch: {width: 28, height: 28, borderRadius: Radius.full},
  colorSwatchSelected: {borderWidth: 3, borderColor: '#fff'},
  modalActions: {flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md},
  modalCancel: {
    flex: 1, borderRadius: Radius.full, paddingVertical: Spacing.md,
    alignItems: 'center', backgroundColor: Colors.bgCard,
  },
  modalCancelText: {fontSize: Typography.base, color: Colors.textSecondary, fontFamily: Typography.fontSemiBold},
  modalSave: {
    flex: 2, borderRadius: Radius.full, paddingVertical: Spacing.md,
    alignItems: 'center', backgroundColor: Colors.primary,
  },
  modalSaveText: {fontSize: Typography.base, color: '#fff', fontFamily: Typography.fontExtraBold},
  chipBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    backgroundColor: Colors.bgCard, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm,
  },
  chipBtnActive: {borderColor: Colors.primary, backgroundColor: Colors.primary + '22'},
  chipBtnText: {fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: Typography.fontMedium},

  // Custom Modal Styles
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  confirmModalCard: {
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
  confirmModalIconBadge: {
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: Spacing.sm + 2,
  },
  confirmModalIconText: {
    fontSize: 26,
  },
  confirmModalTitle: {
    fontSize: Typography.base + 1,
    fontFamily: Typography.fontExtraBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  confirmModalMessage: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.lg,
  },
  confirmModalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  confirmModalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalCancelText: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontBold,
    color: Colors.textSecondary,
  },
  confirmModalConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  confirmModalConfirmText: {
    fontSize: Typography.xs + 1,
    fontFamily: Typography.fontExtraBold,
    color: '#FFFFFF',
  },
});

export default WalletScreen;
