// ─────────────────────────────────────────────
//  Zustand Store — Transactions
// ─────────────────────────────────────────────
import {create} from 'zustand';
import {Transaction, MonthlySummary, TransactionType} from '../types';
import {
  getTransactionsByMonth,
  getRecentTransactions,
  getMonthlySummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../database/queries/transactionQueries';
import dayjs from 'dayjs';

interface TransactionState {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  summary: MonthlySummary;
  selectedMonth: string; // e.g. "2026-07"
  isLoading: boolean;
  fetchTransactions: (yearMonth?: string) => void;
  fetchRecent: () => void;
  addTransaction: (
    wallet_id: number,
    category_id: number,
    type: TransactionType,
    amount: number,
    transaction_date: string,
    notes: string | null,
  ) => void;
  editTransaction: (
    id: number,
    wallet_id: number,
    category_id: number,
    type: TransactionType,
    amount: number,
    transaction_date: string,
    notes: string | null,
  ) => void;
  removeTransaction: (id: number) => void;
  setMonth: (yearMonth: string) => void;
}

const currentMonth = dayjs().format('YYYY-MM');

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  recentTransactions: [],
  summary: {total_income: 0, total_expense: 0, net_balance: 0},
  selectedMonth: currentMonth,
  isLoading: false,

  fetchTransactions: (yearMonth?: string) => {
    const month = yearMonth ?? get().selectedMonth;
    set({isLoading: true, selectedMonth: month});
    try {
      const transactions = getTransactionsByMonth(month);
      const summary = getMonthlySummary(month);
      set({transactions, summary, isLoading: false});
    } catch {
      set({isLoading: false});
    }
  },

  fetchRecent: () => {
    const recentTransactions = getRecentTransactions(5);
    set({recentTransactions});
  },

  addTransaction: (wallet_id, category_id, type, amount, transaction_date, notes) => {
    createTransaction(wallet_id, category_id, type, amount, transaction_date, notes);
    get().fetchTransactions();
    get().fetchRecent();
  },

  editTransaction: (id, wallet_id, category_id, type, amount, transaction_date, notes) => {
    updateTransaction(id, wallet_id, category_id, type, amount, transaction_date, notes);
    get().fetchTransactions();
    get().fetchRecent();
  },

  removeTransaction: id => {
    deleteTransaction(id);
    get().fetchTransactions();
    get().fetchRecent();
  },

  setMonth: yearMonth => {
    get().fetchTransactions(yearMonth);
  },
}));
