// ─────────────────────────────────────────────
//  SQLite Database — Singleton, Schema & Seeder (Expo)
// ─────────────────────────────────────────────
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'offline_pencatatan.db';
let db: any = null;

export const getDB = (): any => {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);

    // Polyfill `execute` to make it compatible with existing react-native-quick-sqlite queries
    db.execute = (sql: string, params: any[] = []) => {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const items = db.getAllSync(sql, params);
        return {
          rows: {
            length: items.length,
            item: (i: number) => items[i],
          },
          insertId: undefined,
        };
      } else {
        const res = db.runSync(sql, params);
        return {
          insertId: res.lastInsertRowId,
          rowsAffected: res.changes,
          rows: {
            length: 0,
            item: () => null,
          }
        };
      }
    };

    initSchema();
    seedDefaultCategories();
  }
  return db;
};

// ─── DDL Schema ───────────────────────────────
const initSchema = () => {
  const database = db!;

  database.execSync(`
    CREATE TABLE IF NOT EXISTS wallets (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      initial_balance REAL DEFAULT 0.0,
      color_code   TEXT,
      is_active    INTEGER DEFAULT 1
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS categories (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      type      TEXT    CHECK(type IN ('INCOME','EXPENSE')),
      icon_name TEXT,
      is_active INTEGER DEFAULT 1
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_id        INTEGER NOT NULL,
      category_id      INTEGER NOT NULL,
      type             TEXT    CHECK(type IN ('INCOME','EXPENSE')),
      amount           REAL    NOT NULL,
      transaction_date TEXT    NOT NULL,
      notes            TEXT,
      FOREIGN KEY (wallet_id)   REFERENCES wallets(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS transfers (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      from_wallet_id INTEGER NOT NULL,
      to_wallet_id   INTEGER NOT NULL,
      amount         REAL    NOT NULL,
      transfer_date  TEXT    NOT NULL,
      FOREIGN KEY (from_wallet_id) REFERENCES wallets(id),
      FOREIGN KEY (to_wallet_id)   REFERENCES wallets(id)
    );
  `);

  // Indexes for performance
  database.execSync(`CREATE INDEX IF NOT EXISTS idx_tx_date   ON transactions(transaction_date);`);
  database.execSync(`CREATE INDEX IF NOT EXISTS idx_tx_wallet ON transactions(wallet_id);`);
  database.execSync(`CREATE INDEX IF NOT EXISTS idx_tx_cat    ON transactions(category_id);`);
};

// ─── Seeder — Default Categories ──────────────
const DEFAULT_CATEGORIES = [
  // EXPENSE
  {name: 'Makanan & Minuman', type: 'EXPENSE', icon: 'fast-food-outline'},
  {name: 'Transportasi',      type: 'EXPENSE', icon: 'car-outline'},
  {name: 'Belanja',           type: 'EXPENSE', icon: 'cart-outline'},
  {name: 'Kesehatan',         type: 'EXPENSE', icon: 'medkit-outline'},
  {name: 'Pendidikan',        type: 'EXPENSE', icon: 'school-outline'},
  {name: 'Hiburan',           type: 'EXPENSE', icon: 'game-controller-outline'},
  {name: 'Tagihan & Listrik', type: 'EXPENSE', icon: 'flash-outline'},
  {name: 'Kos & Tempat Tinggal', type: 'EXPENSE', icon: 'home-outline'},
  {name: 'Lain-lain',         type: 'EXPENSE', icon: 'ellipsis-horizontal-outline'},
  // INCOME
  {name: 'Gaji',              type: 'INCOME', icon: 'briefcase-outline'},
  {name: 'Uang Saku',         type: 'INCOME', icon: 'cash-outline'},
  {name: 'Freelance',         type: 'INCOME', icon: 'laptop-outline'},
  {name: 'Investasi',         type: 'INCOME', icon: 'trending-up-outline'},
  {name: 'Lainnya',           type: 'INCOME', icon: 'add-circle-outline'},
];

const seedDefaultCategories = () => {
  const database = db!;
  const res = (database as SQLite.SQLiteDatabase).getFirstSync<{count: number}>('SELECT COUNT(*) as count FROM categories;');
  const count = res?.count ?? 0;
  if (count > 0) return; // already seeded

  for (const cat of DEFAULT_CATEGORIES) {
    database.runSync(
      `INSERT INTO categories (name, type, icon_name) VALUES (?, ?, ?);`,
      cat.name, cat.type, cat.icon
    );
  }
};

export default getDB;
