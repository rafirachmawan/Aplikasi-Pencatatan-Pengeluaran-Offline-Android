// ─────────────────────────────────────────────
//  Global TypeScript Types & Interfaces
// ─────────────────────────────────────────────

export type TransactionType = 'INCOME' | 'EXPENSE';
export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Wallet {
  id: number;
  name: string;
  initial_balance: number;
  color_code: string;
  is_active: number; // 1 = active, 0 = soft deleted
  // calculated at runtime
  current_balance?: number;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  icon_name: string;
  is_active: number;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  category_id: number;
  type: TransactionType;
  amount: number;
  transaction_date: string; // ISO8601
  notes: string | null;
  // joined fields (for display)
  category_name?: string;
  category_icon?: string;
  wallet_name?: string;
  wallet_color?: string;
}

export interface Transfer {
  id: number;
  from_wallet_id: number;
  to_wallet_id: number;
  amount: number;
  transfer_date: string;
  // joined fields
  from_wallet_name?: string;
  to_wallet_name?: string;
}

export interface MonthlySummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
}

export interface CategoryExpense {
  category_id: number;
  category_name: string;
  icon_name: string;
  total: number;
  percentage: number;
  color: string;
}

export interface GroupedTransactions {
  date: string; // e.g. "2026-07-28"
  displayDate: string; // e.g. "Senin, 28 Jul 2026"
  transactions: Transaction[];
  dailyTotal: number;
}
