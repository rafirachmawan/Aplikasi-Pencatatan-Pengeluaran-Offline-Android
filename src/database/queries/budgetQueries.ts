// ─────────────────────────────────────────────
//  Queries: Budget Planner
// ─────────────────────────────────────────────
import { getDB } from '../db';

export interface BudgetSlot {
  id?: number;
  plan_id?: number;
  name: string;
  emoji: string;
  amount: number;
  color: string;
}

export interface BudgetPlan {
  id?: number;
  wallet_id: number;
  slots: BudgetSlot[];
}

// ─── Load current plan (latest) ───────────────
export const loadBudgetPlan = (): BudgetPlan | null => {
  const db = getDB();
  const plan = db.getFirstSync(
    `SELECT id, wallet_id FROM budget_plans ORDER BY id DESC LIMIT 1;`
  ) as { id: number; wallet_id: number } | undefined;
  if (!plan) return null;

  const slots = db.getAllSync(
    `SELECT id, plan_id, name, emoji, amount, color FROM budget_slots WHERE plan_id = ? ORDER BY id ASC;`,
    [plan.id]
  ) as BudgetSlot[];

  return { id: plan.id, wallet_id: plan.wallet_id, slots };
};

// ─── Save (upsert) plan ────────────────────────
export const saveBudgetPlan = (walletId: number, slots: Omit<BudgetSlot, 'id' | 'plan_id'>[]): void => {
  const db = getDB();

  db.runSync(`DELETE FROM budget_slots WHERE plan_id IN (SELECT id FROM budget_plans);`);
  db.runSync(`DELETE FROM budget_plans;`);

  const result = db.runSync(
    `INSERT INTO budget_plans (wallet_id, updated_at) VALUES (?, date('now'));`,
    [walletId]
  );
  const planId = result.lastInsertRowId;

  for (const slot of slots) {
    db.runSync(
      `INSERT INTO budget_slots (plan_id, name, emoji, amount, color) VALUES (?, ?, ?, ?, ?);`,
      [planId, slot.name, slot.emoji, slot.amount, slot.color]
    );
  }
};
