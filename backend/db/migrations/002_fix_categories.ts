import type { Migration } from './types'

export const fixCategoriesMigration: Migration = {
  id: '002',
  name: 'fix_categories',
  up: `
    UPDATE products SET category = 'Medicine' WHERE category = 'Pharmaceutical';
    UPDATE products SET category = 'Vitamins & Supplements' WHERE category = 'Supplements';
    UPDATE products SET category = 'Medical Devices' WHERE category = 'Medical Device';
    UPDATE products SET sub_category = 'OTC' WHERE sub_category = 'Over-the-Counter (OTC)';
    UPDATE products SET sub_category = 'Prescription (Rx)' WHERE sub_category = 'Prescription';
  `,
}
