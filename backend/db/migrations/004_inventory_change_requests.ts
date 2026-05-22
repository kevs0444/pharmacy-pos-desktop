import type { Migration } from './types'

export const inventoryChangeRequestsMigration: Migration = {
  id: '004',
  name: 'inventory_change_requests',
  up: `
    CREATE TABLE IF NOT EXISTS inventory_change_requests (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      request_type    TEXT NOT NULL CHECK(request_type IN ('CREATE','UPDATE','DELETE')),
      status          TEXT NOT NULL DEFAULT 'PENDING'
                      CHECK(status IN ('PENDING','APPROVED','REJECTED')),
      product_id      INTEGER,
      payload         TEXT NOT NULL,
      submitted_by_name TEXT,
      submitted_at    TEXT NOT NULL,
      reviewed_by_name TEXT,
      reviewed_at     TEXT,
      reviewer_note   TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_change_requests_status ON inventory_change_requests (status, submitted_at);
  `,
}
