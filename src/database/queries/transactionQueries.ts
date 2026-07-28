// ─────────────────────────────────────────────
//  Transaction Queries
// ─────────────────────────────────────────────
import getDB from '../db';
import {
  Transaction,
  TransactionType,
  MonthlySummary,
  CategoryExpense,
  GroupedTransactions,
} from '../../types';
import {Colors} from '../../utils/theme';
import {relativeDateLabel} from '../../utils/date';

// ── Fetch transactions for a month, joined with category & wallet ──
export const getTransactionsByMonth = (
  yearMonth: string, // e.g. "2026-07"
): Transaction[] => {
  const db = getDB();
  const start = `${yearMonth}-01`;
  const end = `${yearMonth}-31`;
  const {rows} = db.execute(
    `SELECT
      t.*,
      c.name  AS category_name,
      c.icon_name AS category_icon,
      w.name  AS wallet_name,
      w.color_code AS wallet_color
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN wallets    w ON t.wallet_id   = w.id
     WHERE t.transaction_date BETWEEN ? AND ?
     ORDER BY t.transaction_date DESC, t.id DESC;`,
    [start, end],
  );
  const result: Transaction[] = [];
  for (let i = 0; i < (rows?.length ?? 0); i++) {
    result.push(rows!.item(i) as Transaction);
  }
  return result;
};

// ── Recent transactions (for Dashboard) ──
export const getRecentTransactions = (limit = 5): Transaction[] => {
  const db = getDB();
  const {rows} = db.execute(
    `SELECT
      t.*,
      c.name  AS category_name,
      c.icon_name AS category_icon,
      w.name  AS wallet_name,
      w.color_code AS wallet_color
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN wallets    w ON t.wallet_id   = w.id
     ORDER BY t.transaction_date DESC, t.id DESC
     LIMIT ?;`,
    [limit],
  );
  const result: Transaction[] = [];
  for (let i = 0; i < (rows?.length ?? 0); i++) {
    result.push(rows!.item(i) as Transaction);
  }
  return result;
};

// ── Monthly Summary: total income / expense / net ──
export const getMonthlySummary = (yearMonth: string): MonthlySummary => {
  const db = getDB();
  const start = `${yearMonth}-01`;
  const end = `${yearMonth}-31`;
  const {rows} = db.execute(
    `SELECT
       COALESCE(SUM(CASE WHEN type='INCOME'  THEN amount ELSE 0 END),0) AS total_income,
       COALESCE(SUM(CASE WHEN type='EXPENSE' THEN amount ELSE 0 END),0) AS total_expense
     FROM transactions
     WHERE transaction_date BETWEEN ? AND ?;`,
    [start, end],
  );
  const row = rows?.item(0);
  const income  = row?.total_income  ?? 0;
  const expense = row?.total_expense ?? 0;
  return {
    total_income: income,
    total_expense: expense,
    net_balance: income - expense,
  };
};

// ── Expense breakdown per category (for Pie Chart) ──
export const getCategoryExpenses = (yearMonth: string): CategoryExpense[] => {
  const db = getDB();
  const start = `${yearMonth}-01`;
  const end = `${yearMonth}-31`;
  const {rows} = db.execute(
    `SELECT
       c.id   AS category_id,
       c.name AS category_name,
       c.icon_name,
       SUM(t.amount) AS total
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.type = 'EXPENSE'
       AND t.transaction_date BETWEEN ? AND ?
     GROUP BY c.id
     ORDER BY total DESC;`,
    [start, end],
  );

  const items: {category_id: number; category_name: string; icon_name: string; total: number}[] = [];
  for (let i = 0; i < (rows?.length ?? 0); i++) {
    items.push(rows!.item(i));
  }
  const grandTotal = items.reduce((s, r) => s + r.total, 0);
  return items.map((r, idx) => ({
    ...r,
    percentage: grandTotal > 0 ? (r.total / grandTotal) * 100 : 0,
    color: Colors.chartColors[idx % Colors.chartColors.length],
  }));
};

// ── Group transactions by date for FlashList ──
export const groupByDate = (txs: Transaction[]): GroupedTransactions[] => {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const day = tx.transaction_date.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(tx);
  }
  return Array.from(map.entries()).map(([date, transactions]) => ({
    date,
    displayDate: relativeDateLabel(date),
    transactions,
    dailyTotal: transactions.reduce(
      (s, t) => s + (t.type === 'INCOME' ? t.amount : -t.amount),
      0,
    ),
  }));
};

// ── CRUD ──
export const createTransaction = (
  wallet_id: number,
  category_id: number,
  type: TransactionType,
  amount: number,
  transaction_date: string,
  notes: string | null,
): number => {
  const db = getDB();
  const {insertId} = db.execute(
    `INSERT INTO transactions (wallet_id, category_id, type, amount, transaction_date, notes)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [wallet_id, category_id, type, amount, transaction_date, notes],
  );
  return insertId ?? 0;
};

export const updateTransaction = (
  id: number,
  wallet_id: number,
  category_id: number,
  type: TransactionType,
  amount: number,
  transaction_date: string,
  notes: string | null,
): void => {
  const db = getDB();
  db.execute(
    `UPDATE transactions SET wallet_id=?, category_id=?, type=?, amount=?, transaction_date=?, notes=?
     WHERE id=?;`,
    [wallet_id, category_id, type, amount, transaction_date, notes, id],
  );
};

export const deleteTransaction = (id: number): void => {
  const db = getDB();
  db.execute(`DELETE FROM transactions WHERE id = ?;`, [id]);
};
