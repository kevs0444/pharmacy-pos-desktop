import type Database from 'better-sqlite3'
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

function generateMockPurchaseOrders() {
  const orders = []
  const statuses = ['Processing', 'In Transit', 'Delivered', 'Cancelled']
  const priorities = ['Normal', 'Urgent']
  const manufacturers = [
    { name: 'Unilab', contact: 'Mr. Cruz' },
    { name: 'Pfizer', contact: 'Ms. Tan' },
    { name: 'TGP Generics', contact: 'Mr. Garcia' },
    { name: 'PharmaTech', contact: 'Mr. Cruz' },
    { name: 'Vitamins Plus', contact: 'Ms. Bautista' },
    { name: 'Bayer', contact: 'Mr. Lim' }
  ]

  for (let i = 1; i <= 100; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const mfg = manufacturers[Math.floor(Math.random() * manufacturers.length)]
    const user = '01-MAIN'
    
    let itemsCount = 10;
    const r = Math.random();
    if (r < 0.05) itemsCount = 1000;
    else if (r < 0.20) itemsCount = Math.floor(Math.random() * 200) + 100;
    else itemsCount = Math.floor(Math.random() * 11) + 10;
    const items = []
    let total = 0
    
    const prefixes = ['Amoxi', 'Ceti', 'Para', 'Ibu', 'Losar', 'Omepra', 'Salbu', 'Metfor', 'Amlodi', 'Vitam', 'Aspi'];
    const suffixes = ['cillin', 'rizine', 'cetamol', 'profen', 'tan', 'zole', 'tamol', 'min', 'pine', 'in C', 'rin'];
    
    for (let j = 0; j < itemsCount; j++) {
      const quantity = Math.floor(Math.random() * 50) + 10
      const unitCost = Math.floor(Math.random() * 500) + 50
      const extCost = quantity * unitCost
      total += extCost
      
      const pref = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suff = suffixes[Math.floor(Math.random() * suffixes.length)];
      const dose = [50, 100, 250, 500][Math.floor(Math.random() * 4)];
      
      items.push({
        stockName: `${pref}${suff} ${dose}mg Tablet`,
        orderUnit: 'boxes',
        pkgQty: 1,
        quantity,
        unitCost,
        discPercent: 0,
        netUcost: unitCost,
        extCost,
        recvd: 0,
        prNum: null,
        remarks: null
      })
    }

    const padI = String(i).padStart(4, '0')
    const now = new Date();
    now.setMonth(now.getMonth() - (i % 4)); // spread over last 4 months
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const placedDate = `${y}-${m}-${d}`;
    const etaDate = `${y}-${m}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    
    orders.push({
      orderCode: `PO-${y}-MOCK${padI}`,
      manufacturerName: mfg.name,
      contactPerson: mfg.contact,
      total,
      status,
      etaDate,
      placedDate,
      priority,
      orderedByName: user,
      remarks: null,
      faxEmailRemarks: null,
      notedBy: null,
      approvedBy: null,
      qtyToOrder: '1 month',
      sysGen: 0,
      termsDays: 30,
      payDueDate: null,
      isClosed: 0,
      isLocked: 0,
      items
    })
  }

  return orders
}

const SEED_PURCHASE_ORDERS = generateMockPurchaseOrders()

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
  const existingUsers = db.prepare('SELECT username FROM users').all() as Array<{ username: string }>
  const existingUsernames = new Set(existingUsers.map(u => u.username))

  const insert = db.prepare(`
    INSERT INTO users (
      username, full_name, email, password_hash, role, status, phone, address, created_at, updated_at
    ) VALUES (
      @username, @fullName, @email, @passwordHash, @role, @status, @phone, @address, @createdAt, @updatedAt
    )
  `)

  for (const user of SEED_USERS) {
    if (existingUsernames.has(user.username)) continue

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
  const existingMfrs = db.prepare('SELECT name FROM manufacturers').all() as Array<{ name: string }>
  const existingNames = new Set(existingMfrs.map(m => m.name))

  const insert = db.prepare(`
    INSERT INTO manufacturers (
      name, contact_person, email, phone, category, address, is_active, created_at, updated_at
    ) VALUES (
      @name, @contactPerson, @email, @phone, @category, @address, 1, @createdAt, @updatedAt
    )
  `)

  for (const manufacturer of SEED_MANUFACTURERS) {
    if (existingNames.has(manufacturer.name)) continue

    const timestamp = nowIso()
    insert.run({
      ...manufacturer,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  }
}

const SEED_PHARMA_PRODUCTS = [
  {
    code: 'PRD-0001',
    name: 'Biogesic 500mg',
    genericName: 'Paracetamol',
    manufacturerName: 'Unilab',
    brandType: 'Branded',
    category: 'Medicine',
    subCategory: 'OTC',
    packagingUnit: 'Box',
    baseUnit: 'Tablet',
    piecesPerUnit: 100,
    unitPriceCost: 400,
    sellingPricePerUnit: 500,
    sellingPricePerPiece: 5.5,
    discount: 0,
    salesCount: 150,
  },
  {
    code: 'PRD-0002',
    name: 'Neozep Forte',
    genericName: 'Phenylephrine HCl + Chlorphenamine Maleate + Paracetamol',
    manufacturerName: 'Unilab',
    brandType: 'Branded',
    category: 'Medicine',
    subCategory: 'OTC',
    packagingUnit: 'Box',
    baseUnit: 'Tablet',
    piecesPerUnit: 100,
    unitPriceCost: 500,
    sellingPricePerUnit: 650,
    sellingPricePerPiece: 7.0,
    discount: 0,
    salesCount: 120,
  },
  {
    code: 'PRD-0003',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    manufacturerName: 'Generic Pharma',
    brandType: 'Generic',
    category: 'Medicine',
    subCategory: 'Prescription (Rx)',
    packagingUnit: 'Box',
    baseUnit: 'Capsule',
    piecesPerUnit: 100,
    unitPriceCost: 200,
    sellingPricePerUnit: 350,
    sellingPricePerPiece: 4.0,
    discount: 0,
    salesCount: 85,
  },
  {
    code: 'PRD-0004',
    name: 'Alaxan FR',
    genericName: 'Ibuprofen + Paracetamol',
    manufacturerName: 'Unilab',
    brandType: 'Branded',
    category: 'Medicine',
    subCategory: 'OTC',
    packagingUnit: 'Box',
    baseUnit: 'Capsule',
    piecesPerUnit: 100,
    unitPriceCost: 650,
    sellingPricePerUnit: 800,
    sellingPricePerPiece: 8.5,
    discount: 5,
    salesCount: 210,
  },
  {
    code: 'PRD-0005',
    name: 'Losartan Potassium 50mg',
    genericName: 'Losartan',
    manufacturerName: 'TGP Generics',
    brandType: 'Generic',
    category: 'Medicine',
    subCategory: 'Prescription (Rx)',
    packagingUnit: 'Box',
    baseUnit: 'Tablet',
    piecesPerUnit: 100,
    unitPriceCost: 300,
    sellingPricePerUnit: 450,
    sellingPricePerPiece: 5.0,
    discount: 0,
    salesCount: 300,
  },
  {
    code: 'PRD-0006',
    name: 'Diatabs 2mg',
    genericName: 'Loperamide',
    manufacturerName: 'Unilab',
    brandType: 'Branded',
    category: 'Medicine',
    subCategory: 'OTC',
    packagingUnit: 'Box',
    baseUnit: 'Capsule',
    piecesPerUnit: 100,
    unitPriceCost: 500,
    sellingPricePerUnit: 650,
    sellingPricePerPiece: 7.5,
    discount: 0,
    salesCount: 60,
  }
] as const

function generateMockProducts() {
  const products: any[] = [...SEED_PHARMA_PRODUCTS];
  let codeCounter = 1000;
  const nextCode = () => `PRD-${String(codeCounter++).padStart(4, '0')}`;
  const manufacturers = ['Unilab', 'Pfizer', 'Generic Pharma', 'TGP Generics', 'GSK', 'Bayer', 'PharmaTech', 'Vitamins Plus', 'AllergyCare', 'Respiratory Care'];

  // 1. Medicines (~500)
  const medPrefixes = ['Amoxi', 'Para', 'Ibu', 'Cef', 'Losar', 'Amlodi', 'Metfor', 'Clinda', 'Azithro', 'Cetiri', 'Loxa', 'Ome', 'Panto', 'Lans', 'Rosi'];
  const medSuffixes = ['cillin', 'cetamol', 'profen', 'alexin', 'tan', 'pine', 'min', 'mycin', 'zine', 'prazole', 'statin', 'olol'];
  for (let i = 0; i < 500; i++) {
    const pre = medPrefixes[i % medPrefixes.length];
    const suf = medSuffixes[(i * 3) % medSuffixes.length];
    const mg = [100, 250, 500, 1000][i % 4];
    const unitPrice = 50 + (i % 50) * 10;
    products.push({
      code: nextCode(),
      name: `${pre}${suf} ${mg}mg`,
      genericName: `${pre}${suf}`,
      manufacturerName: manufacturers[i % manufacturers.length],
      brandType: i % 3 === 0 ? 'Generic' : 'Branded',
      category: 'Medicine',
      subCategory: i % 2 === 0 ? 'Prescription (Rx)' : 'OTC',
      packagingUnit: 'Box',
      baseUnit: 'Tablet',
      piecesPerUnit: 100,
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.5,
      sellingPricePerPiece: (unitPrice * 1.5) / 100,
      discount: i % 10 === 0 ? 10 : 0,
      salesCount: Math.floor(Math.random() * 500)
    });
  }

  // 2. Vitamins & Supplements (~100)
  const vits = ['Vitamin C', 'Vitamin B Complex', 'Multivitamins', 'Zinc', 'Calcium', 'Iron', 'Fish Oil', 'Vitamin D3', 'Magnesium', 'Folic Acid'];
  for (let i = 0; i < 100; i++) {
    const vit = vits[i % vits.length];
    const unitPrice = 100 + (i % 20) * 10;
    products.push({
      code: nextCode(),
      name: `${vit} ${[500, 1000, 100][i%3]}mg`,
      genericName: vit,
      manufacturerName: manufacturers[(i+2) % manufacturers.length],
      brandType: i % 4 === 0 ? 'Generic' : 'Branded',
      category: 'Vitamins & Supplements',
      subCategory: 'OTC',
      packagingUnit: 'Bottle',
      baseUnit: 'Capsule',
      piecesPerUnit: 30,
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.6,
      sellingPricePerPiece: (unitPrice * 1.6) / 30,
      discount: 0,
      salesCount: Math.floor(Math.random() * 300)
    });
  }

  // 3. Medical Devices (~50)
  const devices = ['Blood Pressure Monitor', 'Glucometer', 'Thermometer', 'Pulse Oximeter', 'Nebulizer', 'Stethoscope', 'Weighing Scale'];
  for (let i = 0; i < 50; i++) {
    const dev = devices[i % devices.length];
    const unitPrice = 500 + (i % 10) * 200;
    products.push({
      code: nextCode(),
      name: `${dev} Model-${i+1}`,
      genericName: dev,
      manufacturerName: manufacturers[(i+3) % manufacturers.length],
      brandType: 'Branded',
      category: 'Medical Devices',
      subCategory: 'None',
      packagingUnit: 'Box',
      baseUnit: 'Unit',
      piecesPerUnit: 1,
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.3,
      sellingPricePerPiece: unitPrice * 1.3,
      discount: i % 5 === 0 ? 5 : 0,
      salesCount: Math.floor(Math.random() * 50)
    });
  }

  // 4. Medical Supplies (~100)
  const supplies = ['Syringe 3ml', 'Surgical Mask', 'Gauze Pad', 'Alcohol Swab', 'Band-Aid', 'Cotton Roll', 'Micropore Tape', 'Gloves (Medium)'];
  for (let i = 0; i < 100; i++) {
    const sup = supplies[i % supplies.length];
    const unitPrice = 20 + (i % 10) * 5;
    products.push({
      code: nextCode(),
      name: `${sup} x${[10, 50, 100][i%3]}`,
      genericName: sup,
      manufacturerName: manufacturers[(i+4) % manufacturers.length],
      brandType: 'Others',
      category: 'Medical Supplies',
      subCategory: 'None',
      packagingUnit: 'Pack',
      baseUnit: 'Piece',
      piecesPerUnit: [10, 50, 100][i%3],
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.4,
      sellingPricePerPiece: (unitPrice * 1.4) / [10, 50, 100][i%3],
      discount: 0,
      salesCount: Math.floor(Math.random() * 400)
    });
  }

  // 5. Personal Care (~100)
  const pc = ['Shampoo', 'Soap', 'Toothpaste', 'Deodorant', 'Body Wash', 'Mouthwash', 'Lotion', 'Sunblock'];
  for (let i = 0; i < 100; i++) {
    const p = pc[i % pc.length];
    const sub = ['Skincare', 'Haircare', 'Dental'][i % 3];
    const unitPrice = 80 + (i % 15) * 10;
    products.push({
      code: nextCode(),
      name: `${p} ${[100, 250, 500][i%3]}ml`,
      genericName: p,
      manufacturerName: manufacturers[(i+5) % manufacturers.length],
      brandType: 'Branded',
      category: 'Personal Care',
      subCategory: sub,
      packagingUnit: 'Bottle',
      baseUnit: 'Unit',
      piecesPerUnit: 1,
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.5,
      sellingPricePerPiece: unitPrice * 1.5,
      discount: i % 8 === 0 ? 15 : 0,
      salesCount: Math.floor(Math.random() * 250)
    });
  }

  // 6. Baby & Mom (~50)
  const bm = ['Diapers (M)', 'Diapers (L)', 'Baby Wipes', 'Baby Powder', 'Baby Oil', 'Maternity Pads', 'Breast Pump', 'Baby Wash'];
  for (let i = 0; i < 50; i++) {
    const b = bm[i % bm.length];
    const unitPrice = 150 + (i % 10) * 30;
    products.push({
      code: nextCode(),
      name: `${b} ${[30, 50, 100][i%3]}s`,
      genericName: b,
      manufacturerName: manufacturers[(i+1) % manufacturers.length],
      brandType: 'Branded',
      category: 'Baby & Mom',
      subCategory: 'None',
      packagingUnit: 'Pack',
      baseUnit: 'Piece',
      piecesPerUnit: [30, 50, 100][i%3],
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.4,
      sellingPricePerPiece: (unitPrice * 1.4) / [30, 50, 100][i%3],
      discount: 0,
      salesCount: Math.floor(Math.random() * 150)
    });
  }

  return products;
}

const ALL_SEED_PRODUCTS = generateMockProducts();

function seedProducts(db: Database.Database): void {
  const existingProducts = db.prepare('SELECT code FROM products').all() as Array<{ code: string }>
  const existingCodes = new Set(existingProducts.map(p => p.code))

  const manufacturerLookup = new Map<string, number>()
  const manufacturers = db.prepare('SELECT id, name FROM manufacturers').all() as Array<{ id: number; name: string }>
  for (const manufacturer of manufacturers) {
    manufacturerLookup.set(manufacturer.name, manufacturer.id)
  }

  const insertProduct = db.prepare(`
    INSERT INTO products (
      code, name, generic_name, manufacturer_id, brand_type, category, sub_category,
      packaging_unit, base_unit, pieces_per_unit, total_stock_pieces, unit_price_cost,
      selling_price_per_unit, selling_price_per_piece, discount, sales_count, status,
      created_at, updated_at
    ) VALUES (
      @code, @name, @genericName, @manufacturerId, @brandType, @category, @subCategory,
      @packagingUnit, @baseUnit, @piecesPerUnit, @totalStockPieces, @unitPriceCost,
      @sellingPricePerUnit, @sellingPricePerPiece, @discount, @salesCount, @status,
      @createdAt, @updatedAt
    )
  `)

  const insertBatch = db.prepare(`
    INSERT INTO product_batches (
      product_id, batch_code, lot_number, manufacturing_date, expiry_date,
      stock_pieces, received_date, created_at, updated_at
    ) VALUES (
      @productId, @batchCode, @lotNumber, @manufacturingDate, @expiryDate,
      @stockPieces, @receivedDate, @createdAt, @updatedAt
    )
  `)

  const insertMovement = db.prepare(`
    INSERT INTO inventory_movements (
      product_id, product_batch_id, movement_type, quantity_pieces, reason, created_at
    ) VALUES (
      @productId, @productBatchId, 'OPENING_BALANCE', @quantityPieces, 'Initial seed data', @createdAt
    )
  `)

  for (let i = 0; i < ALL_SEED_PRODUCTS.length; i++) {
    const p = ALL_SEED_PRODUCTS[i]
    if (existingCodes.has(p.code)) continue

    const timestamp = nowIso()
    
    // Give each product 2 boxes worth of stock to start
    let initialStockPieces = p.piecesPerUnit * 2 
    let expiryDate = '2027-01-10'
    let status = 'In Stock'

    if (i % 25 === 0) {
      // Out of Stock
      initialStockPieces = 0;
      status = 'Out of Stock';
    } else if (i % 15 === 0) {
      // Low Stock (e.g., 5 pieces)
      initialStockPieces = Math.min(5, p.piecesPerUnit); 
      status = 'Low Stock';
    } else if (i % 18 === 0) {
      // Expiring Soon (30 days from now)
      const date = new Date();
      date.setDate(date.getDate() + 30);
      expiryDate = date.toISOString().split('T')[0];
    }

    const result = insertProduct.run({
      ...p,
      manufacturerId: manufacturerLookup.get(p.manufacturerName) ?? null,
      totalStockPieces: initialStockPieces,
      status: status,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const productId = Number(result.lastInsertRowid)

    // Create a batch for this stock
    const batchResult = insertBatch.run({
      productId,
      batchCode: `BATCH-${p.code}-001`,
      lotNumber: `LOT${Math.floor(Math.random() * 90000) + 10000}`,
      manufacturingDate: '2025-01-10',
      expiryDate: expiryDate,
      stockPieces: initialStockPieces,
      receivedDate: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const productBatchId = Number(batchResult.lastInsertRowid)

    // Insert opening movement
    insertMovement.run({
      productId,
      productBatchId,
      quantityPieces: initialStockPieces,
      createdAt: timestamp
    })
  }

  // Generate 1000 realistic dummy products for performance testing
  const generateCount = 1000;
  if (existingCodes.size < generateCount) {
    const manufacturerIds = Array.from(manufacturerLookup.values());
    const manufacturerId = manufacturerIds.length > 0 ? manufacturerIds[0] : null;

    const prefixes = ['Amoxi', 'Ceti', 'Para', 'Ibu', 'Losar', 'Omepra', 'Salbu', 'Metfor', 'Amlodi', 'Vitam', 'Aspi', 'Doxa', 'Lisin', 'Simva', 'Azythro', 'Cipro', 'Flucon', 'Gabapen', 'Levothy', 'Predni', 'Cef', 'Rosi', 'Panto', 'Enalo', 'Clopido'];
    const suffixes = ['cillin', 'rizine', 'cetamol', 'profen', 'tan', 'zole', 'tamol', 'min', 'pine', 'in C', 'rin', 'zosin', 'pril', 'statin', 'mycin', 'floxacin', 'azole', 'tin', 'roxine', 'sone', 'roxime', 'glitazone'];
    const dosages = ['5mg', '10mg', '20mg', '25mg', '50mg', '100mg', '200mg', '250mg', '500mg', '800mg', '1g'];
    const units = ['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Cream'];
    const brandNames = ['Pfizer', 'GSK', 'Unilab', 'RiteMed', 'Novartis', 'Sanofi', 'Bayer', 'TGP', 'Generic'];

    for (let i = 1; i <= generateCount; i++) {
      const pref = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suff = suffixes[Math.floor(Math.random() * suffixes.length)];
      const dose = dosages[Math.floor(Math.random() * dosages.length)];
      const unit = units[Math.floor(Math.random() * units.length)];
      const brand = brandNames[Math.floor(Math.random() * brandNames.length)];

      const code = `PRD-${(3000 + i).toString()}`;
      if (existingCodes.has(code)) continue;

      const genericName = `${pref}${suff}`;
      const name = `${genericName} ${dose} ${unit} (${brand})`;

      const timestamp = nowIso();
      const basePrice = Math.floor(Math.random() * 500) + 50;
      const ppu = 100;
      const initialStockPieces = ppu * 5; // 5 boxes

      const result = insertProduct.run({
        code,
        name,
        genericName,
        manufacturerId,
        brandType: brand === 'Generic' ? 'Generic' : 'Branded',
        category: 'Pharmaceutical',
        subCategory: 'Over-the-Counter (OTC)',
        packagingUnit: 'Box',
        baseUnit: 'Tablet',
        piecesPerUnit: ppu,
        totalStockPieces: initialStockPieces,
        unitPriceCost: basePrice * 0.8,
        sellingPricePerUnit: basePrice,
        sellingPricePerPiece: (basePrice / ppu) * 1.5,
        discount: 0,
        salesCount: Math.floor(Math.random() * 100),
        status: 'In Stock',
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      const productId = Number(result.lastInsertRowid);

      const batchResult = insertBatch.run({
        productId,
        batchCode: `BATCH-${code}-001`,
        lotNumber: `LOT${Math.floor(Math.random() * 90000) + 10000}`,
        manufacturingDate: '2025-01-10',
        expiryDate: '2027-01-10',
        stockPieces: initialStockPieces,
        receivedDate: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      insertMovement.run({
        productId,
        productBatchId: Number(batchResult.lastInsertRowid),
        quantityPieces: initialStockPieces,
        createdAt: timestamp
      });
    }
  }
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
  const existingPos = db.prepare('SELECT order_code FROM purchase_orders').all() as Array<{ order_code: string }>
  const existingCodes = new Set(existingPos.map(p => p.order_code))

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
      fax_email_remarks, noted_by, approved_by, qty_to_order, sys_gen, terms_days,
      pay_due_date, is_closed, is_locked, created_at, updated_at
    ) VALUES (
      @orderCode, @manufacturerId, @manufacturerName, @contactPerson, @total, @status,
      @etaDate, @placedDate, @priority, @orderedByUserId, @orderedByName, @remarks,
      @faxEmailRemarks, @notedBy, @approvedBy, @qtyToOrder, @sysGen, @termsDays,
      @payDueDate, @isClosed, @isLocked, @createdAt, @updatedAt
    )
  `)

  const insertItem = db.prepare(`
    INSERT INTO purchase_order_items (
      purchase_order_id, stock_name, order_unit, pkg_qty, quantity, unit_cost,
      disc_percent, net_ucost, ext_cost, recvd, pr_num, remarks
    ) VALUES (
      @purchaseOrderId, @stockName, @orderUnit, @pkgQty, @quantity, @unitCost,
      @discPercent, @netUcost, @extCost, @recvd, @prNum, @remarks
    )
  `)

  for (const order of SEED_PURCHASE_ORDERS) {
    if (existingCodes.has(order.orderCode)) continue

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
