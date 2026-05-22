import type { Migration } from './types'

export const customersMigration: Migration = {
  id: '005',
  name: 'customers',
  up: `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      id_type TEXT NOT NULL CHECK (id_type IN ('Senior', 'PWD')),
      id_number TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (name);
    CREATE INDEX IF NOT EXISTS idx_customers_id_number ON customers (id_number);
  `,
}
