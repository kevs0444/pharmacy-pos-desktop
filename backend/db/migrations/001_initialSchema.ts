import type { Migration } from './types'

export const initialSchemaMigration: Migration = {
  id: '001',
  name: 'initial_schema',
  up: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
      phone TEXT,
      address TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT NOT NULL UNIQUE,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      last_seen_at TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS manufacturers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      category TEXT,
      address TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      generic_name TEXT,
      manufacturer_id INTEGER,
      brand_type TEXT NOT NULL CHECK (brand_type IN ('Branded', 'Generic', 'Others')),
      category TEXT NOT NULL,
      sub_category TEXT NOT NULL,
      packaging_unit TEXT NOT NULL,
      base_unit TEXT NOT NULL,
      pieces_per_unit INTEGER NOT NULL,
      total_stock_pieces INTEGER NOT NULL DEFAULT 0,
      unit_price_cost REAL NOT NULL DEFAULT 0,
      selling_price_per_unit REAL NOT NULL DEFAULT 0,
      selling_price_per_piece REAL NOT NULL DEFAULT 0,
      discount REAL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sales_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'In Stock',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id)
    );

    CREATE TABLE IF NOT EXISTS product_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      batch_code TEXT NOT NULL,
      lot_number TEXT NOT NULL,
      manufacturing_date TEXT,
      expiry_date TEXT NOT NULL,
      stock_pieces INTEGER NOT NULL,
      received_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      UNIQUE (product_id, batch_code)
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      product_batch_id INTEGER,
      movement_type TEXT NOT NULL CHECK (
        movement_type IN ('OPENING_BALANCE', 'RECEIVE', 'SALE', 'ADJUSTMENT', 'VOID', 'RETURN', 'WRITE_OFF')
      ),
      quantity_pieces INTEGER NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      reason TEXT,
      performed_by_user_id INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products (id),
      FOREIGN KEY (product_batch_id) REFERENCES product_batches (id),
      FOREIGN KEY (performed_by_user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS sales_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_code TEXT NOT NULL UNIQUE,
      cashier_user_id INTEGER,
      customer_name TEXT,
      subtotal REAL NOT NULL,
      discount_type TEXT,
      discount_value REAL,
      discount_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      cash_tendered REAL,
      change_amount REAL,
      payment_status TEXT NOT NULL DEFAULT 'COMPLETED',
      requires_prescription INTEGER NOT NULL DEFAULT 0,
      doctor_name TEXT,
      doctor_license TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      voided_at TEXT,
      FOREIGN KEY (cashier_user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS sales_transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_transaction_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_batch_id INTEGER,
      product_name TEXT NOT NULL,
      lot_number TEXT,
      expiry_date TEXT,
      quantity INTEGER NOT NULL,
      sell_by_piece INTEGER NOT NULL DEFAULT 0,
      unit_label TEXT NOT NULL,
      unit_price REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      line_total REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (sales_transaction_id) REFERENCES sales_transactions (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id),
      FOREIGN KEY (product_batch_id) REFERENCES product_batches (id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_transaction_id INTEGER NOT NULL,
      method TEXT NOT NULL CHECK (method IN ('Cash', 'GCash', 'Card', 'Other')),
      amount REAL NOT NULL,
      reference_number TEXT,
      received_by_user_id INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (sales_transaction_id) REFERENCES sales_transactions (id) ON DELETE CASCADE,
      FOREIGN KEY (received_by_user_id) REFERENCES users (id)
    );

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

    CREATE TABLE IF NOT EXISTS receipt_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      store_name TEXT NOT NULL,
      address TEXT NOT NULL,
      contact TEXT NOT NULL,
      tin TEXT NOT NULL,
      footer_message TEXT NOT NULL,
      paper_size TEXT NOT NULL CHECK (paper_size IN ('80mm', '58mm')),
      show_txn_id INTEGER NOT NULL DEFAULT 1,
      show_cashier INTEGER NOT NULL DEFAULT 1,
      show_date INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT NOT NULL,
      setting_type TEXT NOT NULL DEFAULT 'string',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (actor_user_id) REFERENCES users (id)
    );

    CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
    CREATE INDEX IF NOT EXISTS idx_products_code ON products (code);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products (category, sub_category);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active);
    CREATE INDEX IF NOT EXISTS idx_batches_product_expiry ON product_batches (product_id, expiry_date);
    CREATE INDEX IF NOT EXISTS idx_batches_expiry ON product_batches (expiry_date);
    CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements (product_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_sales_transactions_created ON sales_transactions (created_at);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders (status, placed_date);
    CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, status);
  `,
}
