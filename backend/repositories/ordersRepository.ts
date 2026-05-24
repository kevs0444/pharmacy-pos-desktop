import type Database from 'better-sqlite3'
import type { OrderListQuery, PaginatedResult } from '../types/api'
import type { OrderStatus, PurchaseOrderItemRecord, PurchaseOrderRecord } from '../types/domain'
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
          WHERE poi.purchase_order_id = po.id AND poi.stock_name LIKE @search ESCAPE '\\'
        )
      )`)
    }

    if (query?.period) {
      params.period = `${query.period}%`
      whereClauses.push('po.placed_date LIKE @period')
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

  getItems(orderId: number): PurchaseOrderItemRecord[] {
    return this.db
      .prepare(
        `SELECT
          id,
          purchase_order_id AS purchaseOrderId,
          product_id AS productId,
          stock_no AS stockNo,
          stock_name AS stockName,
          order_unit AS orderUnit,
          pkg_qty AS pkgQty,
          quantity,
          unit_cost AS unitCost,
          disc_percent AS discPercent,
          net_ucost AS netUCost,
          ext_cost AS extCost,
          recvd,
          pr_num AS prNum,
          remarks
        FROM purchase_order_items
        WHERE purchase_order_id = @orderId`
      )
      .all({ orderId }) as PurchaseOrderItemRecord[]
  }

  saveOrder(order: any, items: any[]): void {
    const timestamp = new Date().toISOString()
    
    this.db.transaction(() => {
      let orderId = order.id
      
      if (orderId) {
        // Update existing
        this.db.prepare(`
          UPDATE purchase_orders SET
            manufacturer_id = @manufacturerId,
            manufacturer_name = @manufacturerName,
            contact_person = @contactPerson,
            total = @total,
            status = @status,
            eta_date = @etaDate,
            priority = @priority,
            remarks = @remarks,
            fax_email_remarks = @faxEmailRemarks,
            noted_by = @notedBy,
            approved_by = @approvedBy,
            qty_to_order = @qtyToOrder,
            terms_days = @termsDays,
            pay_due_date = @payDueDate,
            updated_at = @updatedAt
          WHERE id = @id
        `).run({
          ...order,
          updatedAt: timestamp
        })
        
        // Delete all old items
        this.db.prepare('DELETE FROM purchase_order_items WHERE purchase_order_id = ?').run(orderId)
      } else {
        // Generate new order code if missing
        let orderCode = order.orderCode
        if (!orderCode) {
          const year = new Date().getFullYear()
          const ms = Date.now().toString().slice(-6)
          orderCode = `PO-${year}-${ms}`
        }

        const result = this.db.prepare(`
          INSERT INTO purchase_orders (
            order_code, manufacturer_id, manufacturer_name, contact_person,
            total, status, eta_date, placed_date, priority,
            ordered_by_user_id, ordered_by_name, remarks, fax_email_remarks,
            noted_by, approved_by, qty_to_order, terms_days, pay_due_date,
            created_at, updated_at
          ) VALUES (
            @orderCode, @manufacturerId, @manufacturerName, @contactPerson,
            @total, @status, @etaDate, @placedDate, @priority,
            @orderedByUserId, @orderedByName, @remarks, @faxEmailRemarks,
            @notedBy, @approvedBy, @qtyToOrder, @termsDays, @payDueDate,
            @createdAt, @updatedAt
          )
        `).run({
          ...order,
          orderCode,
          placedDate: order.placedDate || timestamp.split('T')[0],
          createdAt: timestamp,
          updatedAt: timestamp
        })
        orderId = result.lastInsertRowid
      }

      // Insert new items
      const insertItem = this.db.prepare(`
        INSERT INTO purchase_order_items (
          purchase_order_id, product_id, stock_no, stock_name, order_unit,
          pkg_qty, quantity, unit_cost, disc_percent, net_ucost, ext_cost,
          recvd, pr_num, remarks
        ) VALUES (
          @purchaseOrderId, @productId, @stockNo, @stockName, @orderUnit,
          @pkgQty, @quantity, @unitCost, @discPercent, @netUCost, @extCost,
          @recvd, @prNum, @remarks
        )
      `)

      for (const item of items) {
        insertItem.run({
          ...item,
          purchaseOrderId: orderId,
          recvd: item.recvd || 0,
          pkgQty: item.pkgQty || 1
        })
      }
    })()
  }

  deleteOrder(orderId: number): void {
    this.db.transaction(() => {
      this.db.prepare('DELETE FROM purchase_order_items WHERE purchase_order_id = ?').run(orderId)
      const result = this.db.prepare('DELETE FROM purchase_orders WHERE id = ?').run(orderId)
      if (result.changes === 0) {
        throw new Error(`Purchase order with ID ${orderId} not found`)
      }
    })()
  }
}
