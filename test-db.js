const Database = require('better-sqlite3');
const db = new Database(':memory:');

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 1. Create original schema
db.exec(`
    CREATE TABLE manufacturers ( id INTEGER PRIMARY KEY AUTOINCREMENT );
    CREATE TABLE users ( id INTEGER PRIMARY KEY AUTOINCREMENT );
    CREATE TABLE products ( id INTEGER PRIMARY KEY AUTOINCREMENT );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL UNIQUE,
      manufacturer_id INTEGER,
      manufacturer_name TEXT NOT NULL,
      contact_person TEXT,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('Processing', 'In Transit', 'Delivered', 'Cancelled')),
      eta_date TEXT,
      placed_date TEXT NOT NULL,
      priority TEXT NOT NULL CHECK (priority IN ('Low', 'Normal', 'Urgent')),
      ordered_by_user_id INTEGER,
      ordered_by_name TEXT,
      remarks TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id),
      FOREIGN KEY (ordered_by_user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_order_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity_units INTEGER NOT NULL DEFAULT 0,
      unit_label TEXT,
      estimated_cost REAL NOT NULL DEFAULT 0,
      remarks TEXT,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE
    );
`);

// 2. Try migration
const migration = `
    DROP TABLE IF EXISTS purchase_order_items;
    DROP TABLE IF EXISTS purchase_orders;

    CREATE TABLE purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL UNIQUE,
      manufacturer_id INTEGER,
      manufacturer_name TEXT NOT NULL,
      contact_person TEXT,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('Processing', 'In Transit', 'Delivered', 'Cancelled')),
      eta_date TEXT,
      placed_date TEXT NOT NULL,
      priority TEXT NOT NULL CHECK (priority IN ('Low', 'Normal', 'Urgent')),
      ordered_by_user_id INTEGER,
      ordered_by_name TEXT,
      remarks TEXT,
      fax_email_remarks TEXT,
      noted_by TEXT,
      approved_by TEXT,
      qty_to_order TEXT,
      sys_gen INTEGER NOT NULL DEFAULT 0,
      terms_days INTEGER NOT NULL DEFAULT 30,
      pay_due_date TEXT,
      is_closed INTEGER NOT NULL DEFAULT 0,
      is_locked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id),
      FOREIGN KEY (ordered_by_user_id) REFERENCES users (id)
    );

    CREATE TABLE purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_order_id INTEGER NOT NULL,
      product_id INTEGER,
      stock_no TEXT,
      stock_name TEXT NOT NULL,
      order_unit TEXT,
      pkg_qty INTEGER NOT NULL DEFAULT 1,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit_cost REAL NOT NULL DEFAULT 0,
      disc_percent REAL NOT NULL DEFAULT 0,
      net_ucost REAL NOT NULL DEFAULT 0,
      ext_cost REAL NOT NULL DEFAULT 0,
      recvd INTEGER NOT NULL DEFAULT 0,
      pr_num TEXT,
      remarks TEXT,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
`;

try {
  db.transaction(() => {
    db.exec(migration);
  })();
  console.log("SUCCESS!");
} catch (e) {
  console.error("MIGRATION ERROR:", e);
}
