import { initialSchemaMigration } from './001_initialSchema'
import type { Migration } from './types'

export const migrations: Migration[] = [initialSchemaMigration]

export type { Migration } from './types'
