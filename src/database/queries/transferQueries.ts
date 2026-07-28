// ─────────────────────────────────────────────
//  Transfer Queries
// ─────────────────────────────────────────────
import getDB from '../db';
import {Transfer} from '../../types';

export const createTransfer = (
  from_wallet_id: number,
  to_wallet_id: number,
  amount: number,
  transfer_date: string,
): number => {
  const db = getDB();
  const {insertId} = db.execute(
    `INSERT INTO transfers (from_wallet_id, to_wallet_id, amount, transfer_date)
     VALUES (?, ?, ?, ?);`,
    [from_wallet_id, to_wallet_id, amount, transfer_date],
  );
  return insertId ?? 0;
};

export const getTransfersByMonth = (yearMonth: string): Transfer[] => {
  const db = getDB();
  const start = `${yearMonth}-01`;
  const end = `${yearMonth}-31`;
  const {rows} = db.execute(
    `SELECT
       tr.*,
       wf.name AS from_wallet_name,
       wt.name AS to_wallet_name
     FROM transfers tr
     LEFT JOIN wallets wf ON tr.from_wallet_id = wf.id
     LEFT JOIN wallets wt ON tr.to_wallet_id   = wt.id
     WHERE tr.transfer_date BETWEEN ? AND ?
     ORDER BY tr.transfer_date DESC;`,
    [start, end],
  );
  const result: Transfer[] = [];
  for (let i = 0; i < (rows?.length ?? 0); i++) {
    result.push(rows!.item(i) as Transfer);
  }
  return result;
};
