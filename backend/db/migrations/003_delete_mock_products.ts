import type { Migration } from './types'

export const deleteMockProductsMigration: Migration = {
  id: '003',
  name: 'delete_mock_products',
  up: `
    DELETE FROM inventory_movements WHERE product_id IN (SELECT id FROM products WHERE code LIKE 'PRD-1%');
    DELETE FROM product_batches WHERE product_id IN (SELECT id FROM products WHERE code LIKE 'PRD-1%');
    DELETE FROM products WHERE code LIKE 'PRD-1%';
  `,
}
