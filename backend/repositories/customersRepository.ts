import type Database from 'better-sqlite3'
import type { CustomerRecord } from '../types/domain'
import type { CustomerSaveInput, CustomerSearchQuery } from '../types/api'

interface CustomerRow {
  id: number
  name: string
  id_type: string
  id_number: string
  created_at: string
  updated_at: string
}

function mapRow(row: CustomerRow): CustomerRecord {
  return {
    id: row.id,
    name: row.name,
    idType: row.id_type as 'Senior' | 'PWD',
    idNumber: row.id_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class CustomersRepository {
  constructor(private readonly db: Database.Database) {}

  search(query: CustomerSearchQuery): CustomerRecord[] {
    const searchParam = `%${query.query}%`
    
    let sql = `
      SELECT * FROM customers 
      WHERE (name LIKE @search OR id_number LIKE @search)
    `
    const params: any = { search: searchParam }

    if (query.idType) {
      sql += ` AND id_type = @idType`
      params.idType = query.idType
    }

    sql += ` ORDER BY name ASC LIMIT 10`

    const rows = this.db.prepare(sql).all(params) as CustomerRow[]
    return rows.map(mapRow)
  }

  upsert(input: CustomerSaveInput): CustomerRecord {
    const now = new Date().toISOString()
    
    this.db.prepare(`
      INSERT INTO customers (name, id_type, id_number, created_at, updated_at)
      VALUES (@name, @idType, @idNumber, @now, @now)
      ON CONFLICT(id_number) DO UPDATE SET
        name = excluded.name,
        id_type = excluded.id_type,
        updated_at = excluded.updated_at
    `).run({
      name: input.name,
      idType: input.idType,
      idNumber: input.idNumber,
      now,
    })

    const row = this.db.prepare(`SELECT * FROM customers WHERE id_number = ?`).get(input.idNumber) as CustomerRow
    return mapRow(row)
  }
}
