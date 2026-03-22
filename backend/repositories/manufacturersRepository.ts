import type Database from 'better-sqlite3'
import type { ManufacturerRecord } from '../types/domain'

type ManufacturerRow = Omit<ManufacturerRecord, 'isActive'> & { isActive: number }

export class ManufacturersRepository {
  constructor(private readonly db: Database.Database) {}

  list(): ManufacturerRecord[] {
    const rows = this.db
      .prepare(`
        SELECT
          id,
          name,
          contact_person AS contactPerson,
          email,
          phone,
          category,
          address,
          is_active AS isActive,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM manufacturers
        ORDER BY name ASC
      `)
      .all() as ManufacturerRow[]

    return rows.map((row) => ({ ...row, isActive: Boolean(row.isActive) }))
  }
}
