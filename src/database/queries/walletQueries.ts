// ─────────────────────────────────────────────
//  Wallet Queries (CRUD + Balance Calculation)
// ─────────────────────────────────────────────
import getDB from '../db';
import {Wallet} from '../../types';

export const getAllWallets = (): Wallet[] => {
  const db = getDB();
  const {rows} = db.execute(`
    SELECT
      w.id, w.name, w.initial_balance, w.color_code, w.is_active,
      (
        w.initial_balance
        + COALESCE((SELECT SUM(amount) FROM transactions WHERE wallet_id = w.id AND type = 'INCOME'), 0)
        - COALESCE((SELECT SUM(amount) FROM transactions WHERE wallet_id = w.id AND type = 'EXPENSE'), 0)
        + COALESCE((SELECT SUM(amount) FROM transfers WHERE to_wallet_id = w.id), 0)
        - COALESCE((SELECT SUM(amount) FROM transfers WHERE from_wallet_id = w.id), 0)
      ) AS current_balance
    FROM wallets w
    WHERE w.is_active = 1
    ORDER BY w.id ASC;
  `);
  const result: Wallet[] = [];
  for (let i = 0; i < (rows?.length ?? 0); i++) {
    result.push(rows!.item(i) as Wallet);
  }
  return result;
};

export const createWallet = (
  name: string,
  initial_balance: number,
  color_code: string,
): number => {
  const db = getDB();
  const {insertId} = db.execute(
    `INSERT INTO wallets (name, initial_balance, color_code) VALUES (?, ?, ?);`,
    [name, initial_balance, color_code],
  );
  return insertId ?? 0;
};

export const updateWallet = (
  id: number,
  name: string,
  color_code: string,
): void => {
  const db = getDB();
  db.execute(`UPDATE wallets SET name = ?, color_code = ? WHERE id = ?;`, [
    name,
    color_code,
    id,
  ]);
};

export const softDeleteWallet = (id: number): void => {
  const db = getDB();
  db.execute(`UPDATE wallets SET is_active = 0 WHERE id = ?;`, [id]);
};

export const getTotalBalance = (): number => {
  const db = getDB();
  const {rows} = db.execute(`
    SELECT
      COALESCE(SUM(
        w.initial_balance
        + COALESCE((SELECT SUM(amount) FROM transactions WHERE wallet_id = w.id AND type = 'INCOME'), 0)
        - COALESCE((SELECT SUM(amount) FROM transactions WHERE wallet_id = w.id AND type = 'EXPENSE'), 0)
        + COALESCE((SELECT SUM(amount) FROM transfers WHERE to_wallet_id = w.id), 0)
        - COALESCE((SELECT SUM(amount) FROM transfers WHERE from_wallet_id = w.id), 0)
      ), 0) AS total
    FROM wallets w WHERE w.is_active = 1;
  `);
  return rows?.item(0)?.total ?? 0;
};
