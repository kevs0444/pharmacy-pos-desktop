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

  create(data: Omit<ManufacturerRecord, 'id' | 'createdAt' | 'updatedAt'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO manufacturers (name, contact_person, email, phone, category, address, is_active, remarks)
      VALUES (@name, @contactPerson, @email, @phone, @category, @address, @isActive, @remarks)
    `)
    const res = stmt.run({
      name: data.name,
      contactPerson: data.contactPerson,
      email: data.email || null,
      phone: data.phone || null,
      category: data.category || 'Supplier',
      address: data.address || null,
      isActive: data.isActive === false ? 0 : 1,
      remarks: (data as any).remarks || null
    })
    return res.lastInsertRowid as number
  }
}
