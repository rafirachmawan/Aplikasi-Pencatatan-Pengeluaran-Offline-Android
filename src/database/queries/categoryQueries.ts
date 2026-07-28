// ─────────────────────────────────────────────
//  Category Queries (CRUD)
// ─────────────────────────────────────────────
import getDB from '../db';
import {Category, CategoryType} from '../../types';

export const getAllCategories = (type?: CategoryType): Category[] => {
  const db = getDB();
  const query = type
    ? `SELECT * FROM categories WHERE is_active = 1 AND type = ? ORDER BY id ASC;`
    : `SELECT * FROM categories WHERE is_active = 1 ORDER BY type DESC, id ASC;`;
  const {rows} = type
    ? db.execute(query, [type])
    : db.execute(query);
  const result: Category[] = [];
  for (let i = 0; i < (rows?.length ?? 0); i++) {
    result.push(rows!.item(i) as Category);
  }
  return result;
};

export const createCategory = (
  name: string,
  type: CategoryType,
  icon_name: string,
): number => {
  const db = getDB();
  const {insertId} = db.execute(
    `INSERT INTO categories (name, type, icon_name) VALUES (?, ?, ?);`,
    [name, type, icon_name],
  );
  return insertId ?? 0;
};

export const updateCategory = (
  id: number,
  name: string,
  icon_name: string,
): void => {
  const db = getDB();
  db.execute(`UPDATE categories SET name = ?, icon_name = ? WHERE id = ?;`, [
    name,
    icon_name,
    id,
  ]);
};

export const softDeleteCategory = (id: number): void => {
  const db = getDB();
  db.execute(`UPDATE categories SET is_active = 0 WHERE id = ?;`, [id]);
};
