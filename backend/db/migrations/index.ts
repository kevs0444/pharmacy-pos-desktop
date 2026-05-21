import { initialSchemaMigration } from './001_initialSchema'
import { fixCategoriesMigration } from './002_fix_categories'
import type { Migration } from './types'

export const migrations: Migration[] = [initialSchemaMigration, fixCategoriesMigration]

export type { Migration } from './types'
