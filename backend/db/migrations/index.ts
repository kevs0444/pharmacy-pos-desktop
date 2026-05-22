import { initialSchemaMigration } from './001_initialSchema'
import { fixCategoriesMigration } from './002_fix_categories'
import { deleteMockProductsMigration } from './003_delete_mock_products'
import { inventoryChangeRequestsMigration } from './004_inventory_change_requests'
import { customersMigration } from './005_customers'
import type { Migration } from './types'

export const migrations: Migration[] = [
  initialSchemaMigration,
  fixCategoriesMigration,
  deleteMockProductsMigration,
  inventoryChangeRequestsMigration,
  customersMigration,
]

export type { Migration } from './types'
