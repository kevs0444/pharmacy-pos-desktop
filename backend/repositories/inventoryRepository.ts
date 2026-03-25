import type Database from 'better-sqlite3'
import type {
  CreateProductInput,
  InventoryAlerts,
  InventoryListQuery,
  InventorySummary,
  PaginatedResult,
  ProductBatchInput,
  UpdateProductInput,
} from '../types/api'
import type { ProductBatchRecord, ProductRecord } from '../types/domain'
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

  create(input: CreateProductInput): ProductRecord {
    this.validateProductInput(input)
    const timestamp = new Date().toISOString()
    const totalStockPieces = input.initialBatch ? input.initialBatch.stockPieces : input.totalStockPieces
    const status = this.computeStatus(totalStockPieces, input.piecesPerUnit)

    const createTxn = this.db.transaction(() => {
      const manufacturerId = this.resolveManufacturerId(input.manufacturerName ?? null, timestamp)
      const insertProduct = this.db.prepare(`
        INSERT INTO products (
          code, name, generic_name, manufacturer_id, brand_type, category, sub_category,
          packaging_unit, base_unit, pieces_per_unit, total_stock_pieces, unit_price_cost,
          selling_price_per_unit, selling_price_per_piece, discount, is_active, sales_count,
          status, created_at, updated_at
        ) VALUES (
          @code, @name, @genericName, @manufacturerId, @brandType, @category, @subCategory,
          @packagingUnit, @baseUnit, @piecesPerUnit, @totalStockPieces, @unitPriceCost,
          @sellingPricePerUnit, @sellingPricePerPiece, @discount, @isActive, @salesCount,
          @status, @createdAt, @updatedAt
        )
      `)

      const productResult = insertProduct.run({
        code: input.code,
        name: input.name,
        genericName: input.genericName ?? null,
        manufacturerId,
        brandType: input.brandType,
        category: input.category,
        subCategory: input.subCategory,
        packagingUnit: input.packagingUnit,
        baseUnit: input.baseUnit,
        piecesPerUnit: input.piecesPerUnit,
        totalStockPieces,
        unitPriceCost: input.unitPriceCost,
        sellingPricePerUnit: input.sellingPricePerUnit,
        sellingPricePerPiece: input.sellingPricePerPiece,
        discount: input.discount ?? null,
        isActive: input.isActive === false ? 0 : 1,
        salesCount: input.salesCount ?? 0,
        status,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      const productId = Number(productResult.lastInsertRowid)

      if (input.initialBatch && input.initialBatch.stockPieces > 0) {
        const batchCode = `B-${productId}-${Date.now()}`
        const insertBatch = this.db.prepare(`
          INSERT INTO product_batches (
            product_id, batch_code, lot_number, manufacturing_date, expiry_date,
            stock_pieces, received_date, is_active, created_at, updated_at
          ) VALUES (
            @productId, @batchCode, @lotNumber, @manufacturingDate, @expiryDate,
            @stockPieces, @receivedDate, 1, @createdAt, @updatedAt
          )
        `)

        const batchResult = insertBatch.run({
          productId,
          batchCode,
          lotNumber: input.initialBatch.lotNumber,
          manufacturingDate: input.initialBatch.manufacturingDate ?? null,
          expiryDate: input.initialBatch.expiryDate,
          stockPieces: input.initialBatch.stockPieces,
          receivedDate: input.initialBatch.receivedDate ?? timestamp.slice(0, 10),
          createdAt: timestamp,
          updatedAt: timestamp,
        })

        this.db.prepare(`
          INSERT INTO inventory_movements (
            product_id, product_batch_id, movement_type, quantity_pieces, reference_type,
            reference_id, reason, performed_by_user_id, created_at
          ) VALUES (
            @productId, @productBatchId, 'OPENING_BALANCE', @quantityPieces, 'CREATE_PRODUCT',
            @referenceId, @reason, NULL, @createdAt
          )
        `).run({
          productId,
          productBatchId: Number(batchResult.lastInsertRowid),
          quantityPieces: input.initialBatch.stockPieces,
          referenceId: input.code,
          reason: 'Initial stock on product creation',
          createdAt: timestamp,
        })
      }

      return productId
    })

    const createdId = createTxn()
    return this.getById(createdId)
  }

  update(id: number, input: UpdateProductInput): ProductRecord {
    this.validateProductInput(input)
    const timestamp = new Date().toISOString()
    const manufacturerId = this.resolveManufacturerId(input.manufacturerName ?? null, timestamp)
    const status = this.computeStatus(input.totalStockPieces, input.piecesPerUnit)

    const result = this.db.prepare(`
      UPDATE products
      SET
        code = @code,
        name = @name,
        generic_name = @genericName,
        manufacturer_id = @manufacturerId,
        brand_type = @brandType,
        category = @category,
        sub_category = @subCategory,
        packaging_unit = @packagingUnit,
        base_unit = @baseUnit,
        pieces_per_unit = @piecesPerUnit,
        total_stock_pieces = @totalStockPieces,
        unit_price_cost = @unitPriceCost,
        selling_price_per_unit = @sellingPricePerUnit,
        selling_price_per_piece = @sellingPricePerPiece,
        discount = @discount,
        is_active = @isActive,
        sales_count = @salesCount,
        status = @status,
        updated_at = @updatedAt
      WHERE id = @id
    `).run({
      id,
      code: input.code,
      name: input.name,
      genericName: input.genericName ?? null,
      manufacturerId,
      brandType: input.brandType,
      category: input.category,
      subCategory: input.subCategory,
      packagingUnit: input.packagingUnit,
      baseUnit: input.baseUnit,
      piecesPerUnit: input.piecesPerUnit,
      totalStockPieces: input.totalStockPieces,
      unitPriceCost: input.unitPriceCost,
      sellingPricePerUnit: input.sellingPricePerUnit,
      sellingPricePerPiece: input.sellingPricePerPiece,
      discount: input.discount ?? null,
      isActive: input.isActive ? 1 : 0,
      salesCount: input.salesCount,
      status,
      updatedAt: timestamp,
    })

    if (result.changes === 0) {
      throw new Error(`Product with ID ${id} was not found`)
    }

    return this.getById(id)
  }

  remove(id: number): void {
    const salesItemRow = this.db
      .prepare('SELECT COUNT(*) AS count FROM sales_transaction_items WHERE product_id = ?')
      .get(id) as { count: number }

    if (salesItemRow.count > 0) {
      throw new Error('Cannot delete product with sales history')
    }

    const removeTxn = this.db.transaction(() => {
      this.db.prepare('DELETE FROM inventory_movements WHERE product_id = ?').run(id)
      this.db.prepare('DELETE FROM product_batches WHERE product_id = ?').run(id)
      const result = this.db.prepare('DELETE FROM products WHERE id = ?').run(id)
      if (result.changes === 0) {
        throw new Error(`Product with ID ${id} was not found`)
      }
    })

    removeTxn()
  }

  setActive(id: number, isActive: boolean): ProductRecord {
    const existing = this.getById(id)
    const status = this.computeStatus(existing.totalStockPieces, existing.piecesPerUnit)
    const result = this.db.prepare(`
      UPDATE products
      SET is_active = @isActive, status = @status, updated_at = @updatedAt
      WHERE id = @id
    `).run({
      id,
      isActive: isActive ? 1 : 0,
      status,
      updatedAt: new Date().toISOString(),
    })

    if (result.changes === 0) {
      throw new Error(`Product with ID ${id} was not found`)
    }

    return this.getById(id)
  }

  listBatches(productId: number): ProductBatchRecord[] {
    const rows = this.db.prepare(`
      SELECT
        id,
        product_id AS productId,
        batch_code AS batchCode,
        lot_number AS lotNumber,
        manufacturing_date AS manufacturingDate,
        expiry_date AS expiryDate,
        stock_pieces AS stockPieces,
        received_date AS receivedDate,
        is_active AS isActive,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM product_batches
      WHERE product_id = @productId
      ORDER BY date(expiry_date) ASC, id ASC
    `).all({ productId }) as Array<Omit<ProductBatchRecord, 'isActive'> & { isActive: number }>

    return rows.map((row) => ({ ...row, isActive: Boolean(row.isActive) }))
  }

  private getById(id: number): ProductRecord {
    const row = this.db.prepare(`
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
      FROM products p
      LEFT JOIN manufacturers m ON m.id = p.manufacturer_id
      WHERE p.id = @id
    `).get({ id }) as ProductRow | undefined

    if (!row) {
      throw new Error(`Product with ID ${id} was not found`)
    }

    return this.mapProduct(row)
  }

  private resolveManufacturerId(manufacturerName: string | null, timestamp: string): number | null {
    const normalizedName = manufacturerName?.trim()
    if (!normalizedName) {
      return null
    }

    const existing = this.db
      .prepare('SELECT id FROM manufacturers WHERE lower(name) = lower(?) LIMIT 1')
      .get(normalizedName) as { id: number } | undefined

    if (existing) {
      return existing.id
    }

    this.db.prepare(`
      INSERT INTO manufacturers (name, contact_person, email, phone, category, address, is_active, created_at, updated_at)
      VALUES (@name, NULL, NULL, NULL, NULL, NULL, 1, @createdAt, @updatedAt)
    `).run({
      name: normalizedName,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const created = this.db
      .prepare('SELECT id FROM manufacturers WHERE lower(name) = lower(?) LIMIT 1')
      .get(normalizedName) as { id: number } | undefined

    if (!created) {
      throw new Error('Failed to resolve manufacturer')
    }

    return created.id
  }

  private computeStatus(totalStockPieces: number, piecesPerUnit: number): string {
    if (totalStockPieces <= 0) {
      return 'Out of Stock'
    }

    if (totalStockPieces <= piecesPerUnit) {
      return 'Low Stock'
    }

    return 'In Stock'
  }

  private validateProductInput(input: CreateProductInput | UpdateProductInput): void {
    if (!input.code.trim()) {
      throw new Error('Product code is required')
    }
    if (!input.name.trim()) {
      throw new Error('Product name is required')
    }
    if (!input.packagingUnit.trim() || !input.baseUnit.trim()) {
      throw new Error('Packaging and base units are required')
    }
    if (!Number.isInteger(input.piecesPerUnit) || input.piecesPerUnit < 1) {
      throw new Error('Pieces per unit must be a positive integer')
    }
    if (!Number.isFinite(input.totalStockPieces) || input.totalStockPieces < 0) {
      throw new Error('Total stock must be zero or positive')
    }
    if (!Number.isFinite(input.unitPriceCost) || input.unitPriceCost < 0) {
      throw new Error('Cost price must be zero or positive')
    }
    if (!Number.isFinite(input.sellingPricePerUnit) || input.sellingPricePerUnit < 0) {
      throw new Error('Selling price per unit must be zero or positive')
    }
    if (!Number.isFinite(input.sellingPricePerPiece) || input.sellingPricePerPiece < 0) {
      throw new Error('Selling price per piece must be zero or positive')
    }
    if (input.discount !== null && input.discount !== undefined) {
      if (!Number.isFinite(input.discount) || input.discount < 0 || input.discount > 100) {
        throw new Error('Discount must be between 0 and 100')
      }
    }
    if ('initialBatch' in input && input.initialBatch) {
      if (!input.initialBatch.lotNumber.trim()) {
        throw new Error('Initial batch lot number is required')
      }
      if (!input.initialBatch.expiryDate.trim()) {
        throw new Error('Initial batch expiry date is required')
      }
      if (!Number.isFinite(input.initialBatch.stockPieces) || input.initialBatch.stockPieces < 0) {
        throw new Error('Initial batch stock must be zero or positive')
      }
    }
  }

  private mapProduct(row: ProductRow): ProductRecord {
    return {
      ...row,
      isActive: Boolean(row.isActive),
    }
  }

  getAlerts(): InventoryAlerts {
    // Products that need restocking (low or out of stock)
    const needsRestockRows = this.db
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
          NULL AS nextBatchLotNumber,
          NULL AS nextBatchExpiryDate
        FROM products p
        LEFT JOIN manufacturers m ON m.id = p.manufacturer_id
        WHERE p.is_active = 1
          AND (p.status = 'Low Stock' OR p.status = 'Out of Stock')
        ORDER BY p.total_stock_pieces ASC
        LIMIT 20
      `)
      .all() as ProductRow[]

    // Products expiring soon (within 90 days)
    const expiringSoonRows = this.db
      .prepare(`
        SELECT DISTINCT
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
          pb.lot_number AS nextBatchLotNumber,
          pb.expiry_date AS nextBatchExpiryDate
        FROM products p
        LEFT JOIN manufacturers m ON m.id = p.manufacturer_id
        INNER JOIN product_batches pb ON pb.product_id = p.id
        WHERE p.is_active = 1
          AND pb.is_active = 1
          AND pb.stock_pieces > 0
          AND date(pb.expiry_date) > date('now')
          AND date(pb.expiry_date) <= date('now', '+90 days')
        ORDER BY date(pb.expiry_date) ASC
        LIMIT 20
      `)
      .all() as ProductRow[]

    // Products from delivered orders waiting to be received into inventory
    // (This is a placeholder - will be enhanced when order-to-inventory flow is implemented)
    const pendingReceiptRows = this.db
      .prepare(`
        SELECT DISTINCT
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
          NULL AS nextBatchLotNumber,
          NULL AS nextBatchExpiryDate
        FROM products p
        LEFT JOIN manufacturers m ON m.id = p.manufacturer_id
        INNER JOIN purchase_order_items poi ON poi.product_id = p.id
        INNER JOIN purchase_orders po ON po.id = poi.purchase_order_id
        WHERE po.status = 'Delivered'
          AND p.is_active = 1
        ORDER BY po.updated_at DESC
        LIMIT 20
      `)
      .all() as ProductRow[]

    return {
      needsRestock: needsRestockRows.map((row) => this.mapProduct(row)),
      expiringSoon: expiringSoonRows.map((row) => this.mapProduct(row)),
      pendingReceipt: pendingReceiptRows.map((row) => this.mapProduct(row)),
    }
  }

  receiveBatch(productId: number, batch: ProductBatchInput): void {
    const timestamp = new Date().toISOString()
    
    const receiveTxn = this.db.transaction(() => {
      // Verify product exists
      const product = this.db
        .prepare('SELECT id, pieces_per_unit, total_stock_pieces FROM products WHERE id = ?')
        .get(productId) as { id: number; pieces_per_unit: number; total_stock_pieces: number } | undefined

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`)
      }

      // Create batch
      const batchCode = `B-${productId}-${Date.now()}`
      const insertBatch = this.db.prepare(`
        INSERT INTO product_batches (
          product_id, batch_code, lot_number, manufacturing_date, expiry_date,
          stock_pieces, received_date, is_active, created_at, updated_at
        ) VALUES (
          @productId, @batchCode, @lotNumber, @manufacturingDate, @expiryDate,
          @stockPieces, @receivedDate, 1, @createdAt, @updatedAt
        )
      `)

      const batchResult = insertBatch.run({
        productId,
        batchCode,
        lotNumber: batch.lotNumber,
        manufacturingDate: batch.manufacturingDate ?? null,
        expiryDate: batch.expiryDate,
        stockPieces: batch.stockPieces,
        receivedDate: batch.receivedDate ?? timestamp.slice(0, 10),
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      const batchId = Number(batchResult.lastInsertRowid)

      // Update product total stock
      const newTotalStock = product.total_stock_pieces + batch.stockPieces
      const newStatus = this.computeStatus(newTotalStock, product.pieces_per_unit)

      this.db.prepare(`
        UPDATE products
        SET total_stock_pieces = @totalStockPieces,
            status = @status,
            updated_at = @updatedAt
        WHERE id = @id
      `).run({
        id: productId,
        totalStockPieces: newTotalStock,
        status: newStatus,
        updatedAt: timestamp,
      })

      // Record inventory movement
      this.db.prepare(`
        INSERT INTO inventory_movements (
          product_id, product_batch_id, movement_type, quantity_pieces, reference_type,
          reference_id, reason, performed_by_user_id, created_at
        ) VALUES (
          @productId, @productBatchId, 'RECEIVE', @quantityPieces, 'BATCH_RECEIPT',
          @referenceId, @reason, NULL, @createdAt
        )
      `).run({
        productId,
        productBatchId: batchId,
        quantityPieces: batch.stockPieces,
        referenceId: batchCode,
        reason: `Received batch ${batch.lotNumber}`,
        createdAt: timestamp,
      })
    })

    receiveTxn()
  }

}
