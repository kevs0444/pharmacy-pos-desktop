import type Database from 'better-sqlite3'
import type { AdminUserListQuery, PaginatedResult } from '../types/api'
import type { UserRecord } from '../types/domain'
import { buildPaginatedResult, escapeLike, normalizePagination } from './helpers'

type UserSummaryRow = Omit<UserRecord, 'passwordHash'>

export class UsersRepository {
  constructor(private readonly db: Database.Database) {}

  list(query?: AdminUserListQuery): PaginatedResult<UserSummaryRow> {
    const { page, pageSize, offset } = normalizePagination(query)
    const params: Record<string, unknown> = { limit: pageSize, offset }
    const whereClauses: string[] = []

    if (query?.search?.trim()) {
      params.search = `%${escapeLike(query.search.trim())}%`
      whereClauses.push(`(
        full_name LIKE @search ESCAPE '\\'
        OR username LIKE @search ESCAPE '\\'
        OR COALESCE(email, '') LIKE @search ESCAPE '\\'
      )`)
    }

    if (query?.role && query.role !== 'All') {
      params.role = query.role
      whereClauses.push('role = @role')
    }

    if (query?.status && query.status !== 'All') {
      params.status = query.status
      whereClauses.push('status = @status')
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const totalRow = this.db.prepare(`SELECT COUNT(*) AS count FROM users ${whereSql}`).get(params) as { count: number }

    const items = this.db
      .prepare(`
        SELECT
          id,
          username,
          full_name AS fullName,
          email,
          role,
          status,
          phone,
          address,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM users
        ${whereSql}
        ORDER BY full_name ASC
        LIMIT @limit OFFSET @offset
      `)
      .all(params) as UserSummaryRow[]

    return buildPaginatedResult(items, totalRow.count, page, pageSize)
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }
    return row.count
  }
}
