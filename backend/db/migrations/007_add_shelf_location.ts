import type { Migration } from './types'

export const addShelfLocationMigration: Migration = {
  id: '007',
  name: 'add_shelf_location',
  up: `
    ALTER TABLE products ADD COLUMN shelf_location TEXT DEFAULT NULL;
  `,
}
