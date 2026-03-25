import type Database from 'better-sqlite3'
import type { OrderListQuery, PaginatedResult } from '../types/api'
import type { OrderStatus, PurchaseOrderRecord } from '../types/domain'
import { buildPaginatedResult, escapeLike, normalizePagination } from './helpers'

export class OrdersRepository {
  constructor(private readonly db: Database.Database) {}

  list(query?: OrderListQuery): PaginatedResult<PurchaseOrderRecord> {
    const { page, pageSize, offset } = normalizePagination(query)
    const params: Record<string, unknown> = { limit: pageSize, offset }
    const whereClauses: string[] = []

    if (query?.search?.trim()) {
      params.search = `%${escapeLike(query.search.trim())}%`
      whereClauses.push(`(
        po.order_code LIKE @search ESCAPE '\\'
        OR po.manufacturer_name LIKE @search ESCAPE '\\'
        OR EXISTS (
          SELECT 1 FROM purchase_order_items poi
          WHERE poi.purchase_order_id = po.id AND poi.product_name LIKE @search ESCAPE '\\'
        )
      )`)
    }

    if (query?.manufacturer && query.manufacturer !== 'All') {
      params.manufacturer = query.manufacturer
      whereClauses.push('po.manufacturer_name = @manufacturer')
    }

    if (query?.status && query.status !== 'All') {
      params.status = query.status
      whereClauses.push('po.status = @status')
    }

    if (query?.priority && query.priority !== 'All') {
      params.priority = query.priority
      whereClauses.push('po.priority = @priority')
    }

    if (query?.orderedBy && query.orderedBy !== 'All') {
      params.orderedBy = query.orderedBy
      whereClauses.push('COALESCE(po.ordered_by_name, u.full_name) = @orderedBy')
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sortOrder = query?.sortOrder === 'asc' ? 'ASC' : 'DESC'
    const joinsSql = 'FROM purchase_orders po LEFT JOIN users u ON u.id = po.ordered_by_user_id'

    const totalRow = this.db
      .prepare(`SELECT COUNT(*) AS count ${joinsSql} ${whereSql}`)
      .get(params) as { count: number }

    const items = this.db
      .prepare(`
        SELECT
          po.id,
          po.order_code AS orderCode,
          po.manufacturer_id AS manufacturerId,
          po.manufacturer_name AS manufacturerName,
          po.contact_person AS contactPerson,
          po.total,
          po.status,
          po.eta_date AS etaDate,
          po.placed_date AS placedDate,
          po.priority,
          po.ordered_by_user_id AS orderedByUserId,
          COALESCE(po.ordered_by_name, u.full_name) AS orderedByName,
          po.remarks,
          po.created_at AS createdAt,
          po.updated_at AS updatedAt
        ${joinsSql}
        ${whereSql}
        ORDER BY po.placed_date ${sortOrder}, po.id ${sortOrder}
        LIMIT @limit OFFSET @offset
      `)
      .all(params) as PurchaseOrderRecord[]

    return buildPaginatedResult(items, totalRow.count, page, pageSize)
  }

  updateStatus(orderId: number, status: OrderStatus): void {
    const timestamp = new Date().toISOString()
    const result = this.db
      .prepare('UPDATE purchase_orders SET status = @status, updated_at = @updatedAt WHERE id = @id')
      .run({ id: orderId, status, updatedAt: timestamp })

    if (result.changes === 0) {
      throw new Error(`Purchase order with ID ${orderId} not found`)
    }
  }
}
