import type Database from 'better-sqlite3'
import { INVENTORY_DB } from '../../frontend/lib/mockData'
import { hashPassword } from '../auth/password'

const SEED_USERS = [
  {
    username: 'admin',
    fullName: 'System Administrator',
    email: 'admin@botikaplus.local',
    role: 'ADMIN',
    status: 'ACTIVE',
    phone: '09170000001',
    address: 'BotikaPlus Main Branch',
    password: 'admin123',
  },
  {
    username: 'manager',
    fullName: 'Branch Manager',
    email: 'manager@botikaplus.local',
    role: 'MANAGER',
    status: 'ACTIVE',
    phone: '09170000002',
    address: 'BotikaPlus Main Branch',
    password: 'manager123',
  },
  {
    username: 'staff',
    fullName: 'Branch Staff',
    email: 'staff@botikaplus.local',
    role: 'STAFF',
    status: 'ACTIVE',
    phone: '09170000003',
    address: 'BotikaPlus Main Branch',
    password: 'staff123',
  },
] as const

const SEED_MANUFACTURERS = [
  { name: 'PharmaTech', contactPerson: 'Mr. Cruz', email: 'contact@pharmatech.local', phone: '09171111111', category: 'Pharmaceutical', address: 'Makati City' },
  { name: 'Vitamins Plus', contactPerson: 'Ms. Bautista', email: 'sales@vitaminsplus.local', phone: '09172222222', category: 'Supplements', address: 'Pasig City' },
  { name: 'Generic Pharma', contactPerson: 'Mr. Lim', email: 'sales@genericpharma.local', phone: '09173333333', category: 'Pharmaceutical', address: 'Taguig City' },
  { name: 'AllergyCare', contactPerson: 'Ms. Reyes', email: 'care@allergycare.local', phone: '09174444444', category: 'Pharmaceutical', address: 'Quezon City' },
  { name: 'Respiratory Care', contactPerson: 'Mr. Garcia', email: 'orders@respiratorycare.local', phone: '09175555555', category: 'Pharmaceutical', address: 'Mandaluyong City' },
  { name: 'Unilab', contactPerson: 'Mr. Cruz', email: 'unilab@botikaplus.local', phone: '09176666666', category: 'Pharmaceutical', address: 'Mandaluyong City' },
  { name: 'Pfizer', contactPerson: 'Ms. Tan', email: 'pfizer@botikaplus.local', phone: '09177777777', category: 'Pharmaceutical', address: 'Makati City' },
  { name: 'TGP Generics', contactPerson: 'Mr. Garcia', email: 'tgp@botikaplus.local', phone: '09178888888', category: 'Pharmaceutical', address: 'Pasay City' },
  { name: 'GSK', contactPerson: 'Ms. Reyes', email: 'gsk@botikaplus.local', phone: '09179999999', category: 'Pharmaceutical', address: 'Taguig City' },
  { name: 'Bayer', contactPerson: 'Mr. Lim', email: 'bayer@botikaplus.local', phone: '09170000004', category: 'Pharmaceutical', address: 'Makati City' },
] as const

const SEED_PURCHASE_ORDERS = [
  {
    orderCode: 'PO-2026-0048',
    manufacturerName: 'Unilab',
    contactPerson: 'Mr. Cruz',
    total: 4200,
    status: 'In Transit',
    etaDate: '2026-03-22',
    placedDate: '2026-03-18',
    priority: 'Normal',
    orderedByName: 'Branch Manager',
    remarks: null,
    items: [
      { productName: 'Biogesic 500mg', quantityUnits: 10, unitLabel: 'boxes', estimatedCost: 2600, remarks: null },
      { productName: 'Neozep Forte', quantityUnits: 5, unitLabel: 'boxes', estimatedCost: 1600, remarks: null },
    ],
  },
  {
    orderCode: 'PO-2026-0047',
    manufacturerName: 'Pfizer',
    contactPerson: 'Ms. Tan',
    total: 8500,
    status: 'Processing',
    etaDate: '2026-03-25',
    placedDate: '2026-03-19',
    priority: 'Normal',
    orderedByName: 'System Administrator',
    remarks: 'Awaiting stock replenishment from supplier warehouse.',
    items: [
      { productName: 'Amoxicillin 500mg', quantityUnits: 20, unitLabel: 'boxes', estimatedCost: 8500, remarks: null },
    ],
  },
  {
    orderCode: 'PO-2026-0046',
    manufacturerName: 'TGP Generics',
    contactPerson: 'Mr. Garcia',
    total: 12400,
    status: 'In Transit',
    etaDate: '2026-03-21',
    placedDate: '2026-03-16',
    priority: 'Urgent',
    orderedByName: 'Branch Staff',
    remarks: null,
    items: [
      { productName: 'Paracetamol 500mg', quantityUnits: 50, unitLabel: 'boxes', estimatedCost: 6200, remarks: null },
      { productName: 'Ibuprofen 400mg', quantityUnits: 30, unitLabel: 'boxes', estimatedCost: 3800, remarks: null },
      { productName: 'Mefenamic Acid', quantityUnits: 20, unitLabel: 'boxes', estimatedCost: 2400, remarks: null },
    ],
  },
] as const

const SEED_RECEIPT_SETTINGS = {
  storeName: 'BOTIKAPLUS',
  address: '123 Health Ave, Makati City',
  contact: '0912 345 6789',
  tin: '000-123-456-000',
  footerMessage: 'Thank you for your business!\nPlease come again.',
  paperSize: '80mm',
  showTxnId: 1,
  showCashier: 1,
  showDate: 1,
} as const

function nowIso(): string {
  return new Date().toISOString()
}

export function seedDatabase(db: Database.Database): void {
  const seed = db.transaction(() => {
    seedUsers(db)
    seedManufacturers(db)
    seedProducts(db)
    seedReceiptSettings(db)
    seedAppSettings(db)
    seedPurchaseOrders(db)
  })

  seed()
}

function seedUsers(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }

  if (count.count > 0) {
    return
  }

  const insert = db.prepare(`
    INSERT INTO users (
      username, full_name, email, password_hash, role, status, phone, address, created_at, updated_at
    ) VALUES (
      @username, @fullName, @email, @passwordHash, @role, @status, @phone, @address, @createdAt, @updatedAt
    )
  `)

  for (const user of SEED_USERS) {
    const timestamp = nowIso()
    insert.run({
      ...user,
      passwordHash: hashPassword(user.password),
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  }
}

function seedManufacturers(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) AS count FROM manufacturers').get() as { count: number }

  if (count.count > 0) {
    return
  }

  const insert = db.prepare(`
    INSERT INTO manufacturers (
      name, contact_person, email, phone, category, address, is_active, created_at, updated_at
    ) VALUES (
      @name, @contactPerson, @email, @phone, @category, @address, 1, @createdAt, @updatedAt
    )
  `)

  for (const manufacturer of SEED_MANUFACTURERS) {
    const timestamp = nowIso()
    insert.run({
      ...manufacturer,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  }
}

function seedProducts(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) AS count FROM products').get() as { count: number }

  if (count.count > 0) {
    return
  }

  const manufacturerLookup = new Map<string, number>()
  const manufacturerRows = db.prepare('SELECT id, name FROM manufacturers').all() as Array<{ id: number; name: string }>

  for (const row of manufacturerRows) {
    manufacturerLookup.set(row.name, row.id)
  }

  const insertProduct = db.prepare(`
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

  const insertBatch = db.prepare(`
    INSERT INTO product_batches (
      product_id, batch_code, lot_number, manufacturing_date, expiry_date,
      stock_pieces, received_date, is_active, created_at, updated_at
    ) VALUES (
      @productId, @batchCode, @lotNumber, @manufacturingDate, @expiryDate,
      @stockPieces, @receivedDate, 1, @createdAt, @updatedAt
    )
  `)

  const insertMovement = db.prepare(`
    INSERT INTO inventory_movements (
      product_id, product_batch_id, movement_type, quantity_pieces, reference_type,
      reference_id, reason, performed_by_user_id, created_at
    ) VALUES (
      @productId, @productBatchId, @movementType, @quantityPieces, @referenceType,
      @referenceId, @reason, @performedByUserId, @createdAt
    )
  `)

  for (const product of INVENTORY_DB) {
    const timestamp = nowIso()
    const manufacturerId = product.manufacturer ? manufacturerLookup.get(product.manufacturer) ?? null : null
    const productResult = insertProduct.run({
      code: product.code,
      name: product.name,
      genericName: product.genericName ?? null,
      manufacturerId,
      brandType: product.brandType,
      category: product.category,
      subCategory: product.subCategory,
      packagingUnit: product.packagingUnit,
      baseUnit: product.baseUnit,
      piecesPerUnit: product.piecesPerUnit,
      totalStockPieces: product.totalStockPieces,
      unitPriceCost: product.unitPriceCost,
      sellingPricePerUnit: product.sellingPricePerUnit,
      sellingPricePerPiece: product.sellingPricePerPiece,
      discount: product.discount ?? null,
      isActive: product.isActive ? 1 : 0,
      salesCount: product.salesCount,
      status: product.status,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const productId = Number(productResult.lastInsertRowid)

    for (const batch of product.batches) {
      const batchTimestamp = nowIso()
      const batchResult = insertBatch.run({
        productId,
        batchCode: batch.batchId,
        lotNumber: batch.lotNumber,
        manufacturingDate: batch.manufacturingDate,
        expiryDate: batch.expiryDate,
        stockPieces: batch.stockPieces,
        receivedDate: batch.receivedDate,
        createdAt: batchTimestamp,
        updatedAt: batchTimestamp,
      })

      insertMovement.run({
        productId,
        productBatchId: Number(batchResult.lastInsertRowid),
        movementType: 'OPENING_BALANCE',
        quantityPieces: batch.stockPieces,
        referenceType: 'SEED',
        referenceId: batch.batchId,
        reason: 'Initial seeded inventory from approved UI prototype data',
        performedByUserId: 1,
        createdAt: batchTimestamp,
      })
    }
  }

  // --- START OF TEST DATA GENERATION ---
  // Generate 1000 test products to help validate UI scalability
  for (let i = 1; i <= 1000; i++) {
    const timestamp = nowIso()
    const manufacturerId = Array.from(manufacturerLookup.values())[i % manufacturerLookup.size] ?? null
    
    const productResult = insertProduct.run({
      code: `TST-${String(i).padStart(4, '0')}`,
      name: `Test Medicine ${i} 500mg`,
      genericName: `Test Generic ${i}`,
      manufacturerId,
      brandType: i % 2 === 0 ? 'Branded' : 'Generic',
      category: 'Pharmaceutical',
      subCategory: 'Test Data',
      packagingUnit: 'Box',
      baseUnit: 'Piece',
      piecesPerUnit: 10,
      totalStockPieces: 50,
      unitPriceCost: 100,
      sellingPricePerUnit: 1500,
      sellingPricePerPiece: 150,
      discount: null,
      isActive: 1,
      salesCount: 0,
      status: 'Active',
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const productId = Number(productResult.lastInsertRowid)
    const batchTimestamp = nowIso()
    
    const batchResult = insertBatch.run({
      productId,
      batchCode: `TB-${String(i).padStart(4, '0')}`,
      lotNumber: `LOT-T${i}`,
      manufacturingDate: '2026-01-01',
      expiryDate: '2028-12-31',
      stockPieces: 50,
      receivedDate: '2026-03-01',
      createdAt: batchTimestamp,
      updatedAt: batchTimestamp,
    })

    insertMovement.run({
      productId,
      productBatchId: Number(batchResult.lastInsertRowid),
      movementType: 'OPENING_BALANCE',
      quantityPieces: 50,
      referenceType: 'SEED',
      referenceId: `TB-${String(i).padStart(4, '0')}`,
      reason: '1000 Scale Test Data',
      performedByUserId: 1,
      createdAt: batchTimestamp,
    })
  }
  // --- END OF TEST DATA GENERATION ---
}

function seedReceiptSettings(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) AS count FROM receipt_settings').get() as { count: number }

  if (count.count > 0) {
    return
  }

  db.prepare(`
    INSERT INTO receipt_settings (
      id, store_name, address, contact, tin, footer_message, paper_size,
      show_txn_id, show_cashier, show_date, updated_at
    ) VALUES (
      1, @storeName, @address, @contact, @tin, @footerMessage, @paperSize,
      @showTxnId, @showCashier, @showDate, @updatedAt
    )
  `).run({
    ...SEED_RECEIPT_SETTINGS,
    updatedAt: nowIso(),
  })
}

function seedAppSettings(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) AS count FROM app_settings').get() as { count: number }

  if (count.count > 0) {
    return
  }

  const insert = db.prepare(`
    INSERT INTO app_settings (setting_key, setting_value, setting_type, updated_at)
    VALUES (@settingKey, @settingValue, @settingType, @updatedAt)
  `)

  const timestamp = nowIso()
  insert.run({ settingKey: 'app.mode', settingValue: 'offline', settingType: 'string', updatedAt: timestamp })
  insert.run({ settingKey: 'inventory.low_stock_threshold_mode', settingValue: 'pieces_per_unit', settingType: 'string', updatedAt: timestamp })
  insert.run({ settingKey: 'backup.auto_enabled', settingValue: 'false', settingType: 'boolean', updatedAt: timestamp })
}

function seedPurchaseOrders(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) AS count FROM purchase_orders').get() as { count: number }

  if (count.count > 0) {
    return
  }

  const manufacturerLookup = new Map<string, number>()
  const userLookup = new Map<string, number>()
  const manufacturers = db.prepare('SELECT id, name FROM manufacturers').all() as Array<{ id: number; name: string }>
  const users = db.prepare('SELECT id, full_name FROM users').all() as Array<{ id: number; full_name: string }>

  for (const manufacturer of manufacturers) {
    manufacturerLookup.set(manufacturer.name, manufacturer.id)
  }

  for (const user of users) {
    userLookup.set(user.full_name, user.id)
  }

  const insertOrder = db.prepare(`
    INSERT INTO purchase_orders (
      order_code, manufacturer_id, manufacturer_name, contact_person, total, status,
      eta_date, placed_date, priority, ordered_by_user_id, ordered_by_name, remarks,
      created_at, updated_at
    ) VALUES (
      @orderCode, @manufacturerId, @manufacturerName, @contactPerson, @total, @status,
      @etaDate, @placedDate, @priority, @orderedByUserId, @orderedByName, @remarks,
      @createdAt, @updatedAt
    )
  `)

  const insertItem = db.prepare(`
    INSERT INTO purchase_order_items (
      purchase_order_id, product_name, quantity_units, unit_label, estimated_cost, remarks
    ) VALUES (
      @purchaseOrderId, @productName, @quantityUnits, @unitLabel, @estimatedCost, @remarks
    )
  `)

  for (const order of SEED_PURCHASE_ORDERS) {
    const timestamp = nowIso()
    const orderResult = insertOrder.run({
      ...order,
      manufacturerId: manufacturerLookup.get(order.manufacturerName) ?? null,
      orderedByUserId: userLookup.get(order.orderedByName) ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const purchaseOrderId = Number(orderResult.lastInsertRowid)

    for (const item of order.items) {
      insertItem.run({
        purchaseOrderId,
        ...item,
      })
    }
  }
}
