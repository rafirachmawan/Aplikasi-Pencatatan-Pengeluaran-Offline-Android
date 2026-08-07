// ─────────────────────────────────────────────
//  Zustand Store — Wallets
// ─────────────────────────────────────────────
import {create} from 'zustand';
import {Wallet} from '../types';
import {
  getAllWallets,
  createWallet,
  updateWallet,
  softDeleteWallet,
  getTotalBalance,
} from '../database/queries/walletQueries';

interface WalletState {
  wallets: Wallet[];
  totalBalance: number;
  isLoading: boolean;
  fetchWallets: () => void;
  addWallet: (name: string, initial_balance: number, color_code: string) => void;
  editWallet: (id: number, name: string, color_code: string, initial_balance?: number) => void;
  removeWallet: (id: number) => void;
}

export const useWalletStore = create<WalletState>(set => ({
  wallets: [],
  totalBalance: 0,
  isLoading: false,

  fetchWallets: () => {
    set({isLoading: true});
    try {
      const wallets = getAllWallets();
      const totalBalance = getTotalBalance();
      set({wallets, totalBalance, isLoading: false});
    } catch (e) {
      set({isLoading: false});
    }
  },

  addWallet: (name, initial_balance, color_code) => {
    createWallet(name, initial_balance, color_code);
    const wallets = getAllWallets();
    const totalBalance = getTotalBalance();
    set({wallets, totalBalance});
  },

  editWallet: (id, name, color_code, initial_balance) => {
    updateWallet(id, name, color_code, initial_balance);
    const wallets = getAllWallets();
    const totalBalance = getTotalBalance();
    set({wallets, totalBalance});
  },

  removeWallet: id => {
    softDeleteWallet(id);
    const wallets = getAllWallets();
    const totalBalance = getTotalBalance();
    set({wallets, totalBalance});
  },
}));
