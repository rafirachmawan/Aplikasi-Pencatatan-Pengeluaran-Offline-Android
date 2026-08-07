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
  period_month?: string;
  slots: BudgetSlot[];
}

// ─── Load plan by period (strict match when period given) ─
export const loadBudgetPlan = (periodMonth?: string): BudgetPlan | null => {
  const db = getDB();
  let plan: { id: number; wallet_id: number; period_month?: string } | undefined;

  if (periodMonth) {
    // Strict match: only return plan for the requested period
    plan = db.getFirstSync(
      `SELECT id, wallet_id, period_month FROM budget_plans WHERE period_month = ? ORDER BY id DESC LIMIT 1;`,
      [periodMonth]
    ) as { id: number; wallet_id: number; period_month?: string } | undefined;
  } else {
    // No period specified: return the latest plan
    plan = db.getFirstSync(
      `SELECT id, wallet_id, period_month FROM budget_plans ORDER BY id DESC LIMIT 1;`
    ) as { id: number; wallet_id: number; period_month?: string } | undefined;
  }

  if (!plan) return null;

  const slots = db.getAllSync(
    `SELECT id, plan_id, name, emoji, amount, color FROM budget_slots WHERE plan_id = ? ORDER BY id ASC;`,
    [plan.id]
  ) as BudgetSlot[];

  return { id: plan.id, wallet_id: plan.wallet_id, period_month: plan.period_month, slots };
};

// ─── Save (upsert) plan by period ──────────────
export const saveBudgetPlan = (
  walletId: number,
  slots: Omit<BudgetSlot, 'id' | 'plan_id'>[],
  periodMonth?: string
): void => {
  const db = getDB();
  const period = periodMonth || new Date().toISOString().slice(0, 7);

  // Delete existing plan for this period
  db.runSync(
    `DELETE FROM budget_slots WHERE plan_id IN (SELECT id FROM budget_plans WHERE period_month = ?);`,
    [period]
  );
  db.runSync(`DELETE FROM budget_plans WHERE period_month = ?;`, [period]);

  if (slots.length === 0) return;

  const result = db.runSync(
    `INSERT INTO budget_plans (wallet_id, period_month, updated_at) VALUES (?, ?, date('now'));`,
    [walletId, period]
  );
  const planId = result.lastInsertRowId;

  for (const slot of slots) {
    db.runSync(
      `INSERT INTO budget_slots (plan_id, name, emoji, amount, color) VALUES (?, ?, ?, ?, ?);`,
      [planId, slot.name, slot.emoji, slot.amount, slot.color]
    );
  }
};
