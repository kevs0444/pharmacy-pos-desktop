import type Database from 'better-sqlite3'
import type { InventoryListQuery, InventorySummary, PaginatedResult } from '../types/api'
import type { ProductRecord } from '../types/domain'
import { buildPaginatedResult, escapeLike, normalizePagination } from './helpers'

type ProductRow = {
  id: number
  code: string
  name: string
  genericName: string | null
  manufacturerId: number | null
  manufacturerName: string | null
  brandType: ProductRecord['brandType']
  category: ProductRecord['category']
  subCategory: ProductRecord['subCategory']
  packagingUnit: string
  baseUnit: string
  piecesPerUnit: number
  totalStockPieces: number
  unitPriceCost: number
  sellingPricePerUnit: number
  sellingPricePerPiece: number
  discount: number | null
  isActive: number
  salesCount: number
  status: string
  nextBatchLotNumber: string | null
  nextBatchExpiryDate: string | null
}

export class InventoryRepository {
  constructor(private readonly db: Database.Database) {}

  list(query?: InventoryListQuery): PaginatedResult<ProductRecord> {
    const { page, pageSize, offset } = normalizePagination(query)
    const params: Record<string, unknown> = { limit: pageSize, offset }
    const whereClauses: string[] = []

    if (query?.search?.trim()) {
      params.search = `%${escapeLike(query.search.trim())}%`
      whereClauses.push(`(
        p.name LIKE @search ESCAPE '\\'
        OR p.code LIKE @search ESCAPE '\\'
        OR COALESCE(p.generic_name, '') LIKE @search ESCAPE '\\'
        OR COALESCE(m.name, '') LIKE @search ESCAPE '\\'
      )`)
    }

    if (query?.category && query.category !== 'All' && query.category !== 'All Products') {
      params.category = query.category
      whereClauses.push('p.category = @category')
    }

    if (query?.subCategory && query.subCategory !== 'All') {
      params.subCategory = query.subCategory
      whereClauses.push('p.sub_category = @subCategory')
    }

    if (!query?.includeInactive) {
      whereClauses.push('p.is_active = 1')
    }

    if (query?.onlySellable) {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM product_batches pb
        WHERE pb.product_id = p.id
          AND pb.is_active = 1
          AND pb.stock_pieces > 0
          AND date(pb.expiry_date) >= date('now')
      )`)
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sortOrder = query?.sortOrder === 'desc' ? 'DESC' : 'ASC'
    const joinsSql = 'FROM products p LEFT JOIN manufacturers m ON m.id = p.manufacturer_id'

    const totalRow = this.db
      .prepare(`SELECT COUNT(*) AS count ${joinsSql} ${whereSql}`)
      .get(params) as { count: number }

    const rows = this.db
      .prepare(`
        SELECT
          p.id,
          p.code,
          p.name,
          p.generic_name AS genericName,
          p.manufacturer_id AS manufacturerId,
          m.name AS manufacturerName,
          p.brand_type AS brandType,
          p.category,
          p.sub_category AS subCategory,
          p.packaging_unit AS packagingUnit,
          p.base_unit AS baseUnit,
          p.pieces_per_unit AS piecesPerUnit,
          p.total_stock_pieces AS totalStockPieces,
          p.unit_price_cost AS unitPriceCost,
          p.selling_price_per_unit AS sellingPricePerUnit,
          p.selling_price_per_piece AS sellingPricePerPiece,
          p.discount,
          p.is_active AS isActive,
          p.sales_count AS salesCount,
          p.status,
          (
            SELECT pb.lot_number
            FROM product_batches pb
            WHERE pb.product_id = p.id AND pb.is_active = 1 AND pb.stock_pieces > 0
            ORDER BY date(pb.expiry_date) ASC
            LIMIT 1
          ) AS nextBatchLotNumber,
          (
            SELECT pb.expiry_date
            FROM product_batches pb
            WHERE pb.product_id = p.id AND pb.is_active = 1 AND pb.stock_pieces > 0
            ORDER BY date(pb.expiry_date) ASC
            LIMIT 1
          ) AS nextBatchExpiryDate
        ${joinsSql}
        ${whereSql}
        ORDER BY p.name ${sortOrder}
        LIMIT @limit OFFSET @offset
      `)
      .all(params) as ProductRow[]

    const items = rows.map((row) => this.mapProduct(row))
    return buildPaginatedResult(items, totalRow.count, page, pageSize)
  }

  getSummary(): InventorySummary {
    const row = this.db
      .prepare(`
        SELECT
          COUNT(*) AS totalProducts,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS activeProducts,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS disabledProducts,
          SUM(CASE WHEN total_stock_pieces > 0 AND total_stock_pieces <= pieces_per_unit THEN 1 ELSE 0 END) AS lowStockProducts,
          SUM(
            CASE WHEN EXISTS (
              SELECT 1
              FROM product_batches pb
              WHERE pb.product_id = products.id
                AND pb.stock_pieces > 0
                AND date(pb.expiry_date) <= date('now', '+90 day')
            ) THEN 1 ELSE 0 END
          ) AS nearExpiryProducts
        FROM products
      `)
      .get() as InventorySummary

    return row
  }

  private mapProduct(row: ProductRow): ProductRecord {
    return {
      ...row,
      isActive: Boolean(row.isActive),
    }
  }
}
