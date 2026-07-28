// ─────────────────────────────────────────────
//  Screen: Category Management
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
import {useNavigation} from '@react-navigation/native';
import {Colors, Typography, Spacing, Radius, Shadow} from '../utils/theme';
import {useCategoryStore} from '../store/useCategoryStore';
import {CategoryType} from '../types';

const ICONS = [
  'fast-food-outline', 'car-outline', 'cart-outline', 'medkit-outline',
  'school-outline', 'game-controller-outline', 'flash-outline', 'home-outline',
  'briefcase-outline', 'cash-outline', 'laptop-outline', 'trending-up-outline',
  'add-circle-outline', 'ellipsis-horizontal-outline',
];

const ICON_EMOJI_MAP: Record<string, string> = {
  'fast-food-outline': '🍜', 'car-outline': '🚗', 'cart-outline': '🛒',
  'medkit-outline': '💊', 'school-outline': '📚', 'game-controller-outline': '🎮',
  'flash-outline': '⚡', 'home-outline': '🏠', 'briefcase-outline': '💼',
  'cash-outline': '💵', 'laptop-outline': '💻', 'trending-up-outline': '📈',
  'add-circle-outline': '➕', 'ellipsis-horizontal-outline': '•••',
};

const CategoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const {categories, fetchCategories, addCategory, removeCategory} = useCategoryStore();

  const [activeTab, setActiveTab] = useState<CategoryType>('EXPENSE');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState(ICONS[0]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter(c => c.type === activeTab);

  const handleAdd = () => {
    if (!newName.trim()) {
      Alert.alert('Nama kosong', 'Masukkan nama kategori.');
      return;
    }
    addCategory(newName.trim(), activeTab, newIcon);
    setNewName('');
    setNewIcon(ICONS[0]);
    setShowModal(false);
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Nonaktifkan Kategori',
      `Nonaktifkan "${name}"? Transaksi yang sudah ada tidak terpengaruh.`,
      [
        {text: 'Batal', style: 'cancel'},
        {text: 'Nonaktifkan', style: 'destructive', onPress: () => removeCategory(id)},
      ],
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kategori</Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text style={styles.addBtn}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Tab */}
      <View style={styles.tabRow}>
        {(['EXPENSE', 'INCOME'] as CategoryType[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === 'EXPENSE' ? '↓ Pengeluaran' : '↑ Pemasukan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.map(cat => (
          <View key={cat.id} style={styles.categoryRow}>
            <View style={styles.catInfo}>
              <Text style={styles.catEmoji}>{ICON_EMOJI_MAP[cat.icon_name] ?? '💳'}</Text>
              <Text style={styles.catName}>{cat.name}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(cat.id, cat.name)}>
              <Text style={styles.deleteBtn}>🗑</Text>
            </TouchableOpacity>
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Belum ada kategori</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Tambah Kategori {activeTab === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'}
            </Text>

            <Text style={styles.inputLabel}>Nama</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Nama kategori baru..."
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.inputLabel}>Ikon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: Spacing.md}}>
              {ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconChip, newIcon === icon && styles.iconChipSelected]}
                  onPress={() => setNewIcon(icon)}>
                  <Text style={styles.iconChipEmoji}>{ICON_EMOJI_MAP[icon] ?? '💳'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleAdd}>
                <Text style={styles.modalSaveText}>Tambah</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {fontSize: Typography.base, color: Colors.primary, fontWeight: Typography.weightSemiBold},
  headerTitle: {fontSize: Typography.md, color: Colors.textPrimary, fontWeight: Typography.weightBold},
  addBtn: {fontSize: Typography.base, color: Colors.income, fontWeight: Typography.weightSemiBold},

  tabRow: {
    flexDirection: 'row', backgroundColor: Colors.bgCard, margin: Spacing.lg,
    borderRadius: Radius.full, padding: 4,
  },
  tab: {flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.full},
  tabActive: {backgroundColor: Colors.bgCardElevated, ...Shadow.card},
  tabText: {fontSize: Typography.base, color: Colors.textSecondary, fontWeight: Typography.weightMedium},
  tabTextActive: {color: Colors.textPrimary, fontWeight: Typography.weightBold},

  list: {paddingHorizontal: Spacing.lg, gap: Spacing.sm},
  categoryRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md,
  },
  catInfo: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  catEmoji: {fontSize: 22},
  catName: {fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.weightMedium},
  deleteBtn: {fontSize: Typography.base},

  emptyState: {alignItems: 'center', paddingVertical: Spacing['3xl']},
  emptyText: {fontSize: Typography.base, color: Colors.textSecondary},

  // Modal
  modalOverlay: {flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end'},
  modalCard: {
    backgroundColor: Colors.bgCardElevated, borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.sm,
  },
  modalTitle: {fontSize: Typography.lg, color: Colors.textPrimary, fontWeight: Typography.weightBold, marginBottom: Spacing.sm},
  inputLabel: {fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.weightMedium},
  input: {
    backgroundColor: Colors.bgInput, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: Typography.base, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
  },
  iconChip: {
    width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  iconChipSelected: {borderColor: Colors.primary, backgroundColor: Colors.primary + '22'},
  iconChipEmoji: {fontSize: 22},
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
});

export default CategoryScreen;
