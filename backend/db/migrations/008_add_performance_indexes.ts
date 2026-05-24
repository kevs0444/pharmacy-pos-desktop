import type { Migration } from './types'

export const addPerformanceIndexesMigration: Migration = {
  id: '008',
  name: 'add_performance_indexes',
  up: `
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_placed_date ON purchase_orders(placed_date);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_code ON purchase_orders(order_code);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
    CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
    CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  `,
}
