var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ipcMain, Menu, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
const initialSchemaMigration = {
  id: "001",
  name: "initial_schema",
  up: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
      phone TEXT,
      address TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT NOT NULL UNIQUE,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      last_seen_at TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS manufacturers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      category TEXT,
      address TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      generic_name TEXT,
      manufacturer_id INTEGER,
      brand_type TEXT NOT NULL CHECK (brand_type IN ('Branded', 'Generic', 'Others')),
      category TEXT NOT NULL,
      sub_category TEXT NOT NULL,
      packaging_unit TEXT NOT NULL,
      base_unit TEXT NOT NULL,
      pieces_per_unit INTEGER NOT NULL,
      total_stock_pieces INTEGER NOT NULL DEFAULT 0,
      unit_price_cost REAL NOT NULL DEFAULT 0,
      selling_price_per_unit REAL NOT NULL DEFAULT 0,
      selling_price_per_piece REAL NOT NULL DEFAULT 0,
      discount REAL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sales_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'In Stock',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id)
    );

    CREATE TABLE IF NOT EXISTS product_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      batch_code TEXT NOT NULL,
      lot_number TEXT NOT NULL,
      manufacturing_date TEXT,
      expiry_date TEXT NOT NULL,
      stock_pieces INTEGER NOT NULL,
      received_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      UNIQUE (product_id, batch_code)
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      product_batch_id INTEGER,
      movement_type TEXT NOT NULL CHECK (
        movement_type IN ('OPENING_BALANCE', 'RECEIVE', 'SALE', 'ADJUSTMENT', 'VOID', 'RETURN', 'WRITE_OFF')
      ),
      quantity_pieces INTEGER NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      reason TEXT,
      performed_by_user_id INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products (id),
      FOREIGN KEY (product_batch_id) REFERENCES product_batches (id),
      FOREIGN KEY (performed_by_user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS sales_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_code TEXT NOT NULL UNIQUE,
      cashier_user_id INTEGER,
      customer_name TEXT,
      subtotal REAL NOT NULL,
      discount_type TEXT,
      discount_value REAL,
      discount_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      cash_tendered REAL,
      change_amount REAL,
      payment_status TEXT NOT NULL DEFAULT 'COMPLETED',
      requires_prescription INTEGER NOT NULL DEFAULT 0,
      doctor_name TEXT,
      doctor_license TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      voided_at TEXT,
      FOREIGN KEY (cashier_user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS sales_transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_transaction_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_batch_id INTEGER,
      product_name TEXT NOT NULL,
      lot_number TEXT,
      expiry_date TEXT,
      quantity INTEGER NOT NULL,
      sell_by_piece INTEGER NOT NULL DEFAULT 0,
      unit_label TEXT NOT NULL,
      unit_price REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      line_total REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (sales_transaction_id) REFERENCES sales_transactions (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id),
      FOREIGN KEY (product_batch_id) REFERENCES product_batches (id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_transaction_id INTEGER NOT NULL,
      method TEXT NOT NULL CHECK (method IN ('Cash', 'GCash', 'Card', 'Other')),
      amount REAL NOT NULL,
      reference_number TEXT,
      received_by_user_id INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (sales_transaction_id) REFERENCES sales_transactions (id) ON DELETE CASCADE,
      FOREIGN KEY (received_by_user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL UNIQUE,
      manufacturer_id INTEGER,
      manufacturer_name TEXT NOT NULL,
      contact_person TEXT,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('Processing', 'In Transit', 'Delivered', 'Cancelled')),
      eta_date TEXT,
      placed_date TEXT NOT NULL,
      priority TEXT NOT NULL CHECK (priority IN ('Low', 'Normal', 'Urgent')),
      ordered_by_user_id INTEGER,
      ordered_by_name TEXT,
      remarks TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id),
      FOREIGN KEY (ordered_by_user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_order_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity_units INTEGER NOT NULL DEFAULT 0,
      unit_label TEXT,
      estimated_cost REAL NOT NULL DEFAULT 0,
      remarks TEXT,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS receipt_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      store_name TEXT NOT NULL,
      address TEXT NOT NULL,
      contact TEXT NOT NULL,
      tin TEXT NOT NULL,
      footer_message TEXT NOT NULL,
      paper_size TEXT NOT NULL CHECK (paper_size IN ('80mm', '58mm')),
      show_txn_id INTEGER NOT NULL DEFAULT 1,
      show_cashier INTEGER NOT NULL DEFAULT 1,
      show_date INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT NOT NULL,
      setting_type TEXT NOT NULL DEFAULT 'string',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (actor_user_id) REFERENCES users (id)
    );

    CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
    CREATE INDEX IF NOT EXISTS idx_products_code ON products (code);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products (category, sub_category);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active);
    CREATE INDEX IF NOT EXISTS idx_batches_product_expiry ON product_batches (product_id, expiry_date);
    CREATE INDEX IF NOT EXISTS idx_batches_expiry ON product_batches (expiry_date);
    CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements (product_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_sales_transactions_created ON sales_transactions (created_at);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders (status, placed_date);
    CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, status);
  `
};
const migrations = [initialSchemaMigration];
const INVENTORY_DB = [
  {
    id: 1,
    code: "PRD-X91A",
    name: "Amoxicillin 500mg",
    genericName: "Antibiotic",
    manufacturer: "PharmaTech",
    brandType: "Generic",
    category: "Medicine",
    subCategory: "Prescription (Rx)",
    packagingUnit: "Box",
    baseUnit: "Capsule",
    piecesPerUnit: 100,
    totalStockPieces: 215,
    unitPriceCost: 400,
    sellingPricePerUnit: 550,
    sellingPricePerPiece: 6,
    salesCount: 1450,
    status: "In Stock",
    isActive: true,
    batches: [
      { batchId: "AMX-B001", lotNumber: "LOT-2024-AMX-01", manufacturingDate: "2024-02-01", expiryDate: "2026-02-28", stockPieces: 15, receivedDate: "2024-02-10" },
      { batchId: "AMX-B002", lotNumber: "LOT-2025-AMX-02", manufacturingDate: "2025-01-15", expiryDate: "2027-01-14", stockPieces: 100, receivedDate: "2025-01-20" },
      { batchId: "AMX-B003", lotNumber: "LOT-2025-AMX-03", manufacturingDate: "2025-08-01", expiryDate: "2027-07-31", stockPieces: 100, receivedDate: "2025-08-05" }
    ]
  },
  {
    id: 2,
    code: "PRD-V002",
    name: "Vitamin C 500mg (Ascorbic Acid)",
    genericName: "Vitamin Supplement",
    manufacturer: "Vitamins Plus",
    brandType: "Branded",
    category: "Vitamins & Supplements",
    subCategory: "OTC",
    packagingUnit: "Box",
    baseUnit: "Tablet",
    piecesPerUnit: 100,
    totalStockPieces: 450,
    unitPriceCost: 200,
    sellingPricePerUnit: 350,
    sellingPricePerPiece: 4,
    discount: 10,
    salesCount: 890,
    status: "In Stock",
    isActive: true,
    batches: [
      { batchId: "VTC-B001", lotNumber: "VTC-LOT-2025-01", manufacturingDate: "2025-01-10", expiryDate: "2027-01-09", stockPieces: 250, receivedDate: "2025-01-15" },
      { batchId: "VTC-B002", lotNumber: "VTC-LOT-2025-02", manufacturingDate: "2025-06-01", expiryDate: "2027-05-31", stockPieces: 200, receivedDate: "2025-06-05" }
    ]
  },
  {
    id: 3,
    code: "PRD-C119",
    name: "Paracetamol 500mg",
    genericName: "Pain reliever / fever reducer",
    manufacturer: "Generic Pharma",
    brandType: "Generic",
    category: "Medicine",
    subCategory: "OTC",
    packagingUnit: "Box",
    baseUnit: "Tablet",
    piecesPerUnit: 100,
    totalStockPieces: 10,
    unitPriceCost: 150,
    sellingPricePerUnit: 250,
    sellingPricePerPiece: 3,
    salesCount: 2100,
    status: "Out of Stock",
    isActive: true,
    batches: [
      // Only partial batch left — near expiry
      { batchId: "PCM-B001", lotNumber: "PCM-LOT-2024-03", manufacturingDate: "2024-03-01", expiryDate: "2026-03-31", stockPieces: 10, receivedDate: "2024-03-05" }
    ]
  },
  {
    id: 4,
    code: "PRD-B445",
    name: "Cetirizine 10mg",
    genericName: "Antihistamine",
    manufacturer: "AllergyCare",
    brandType: "Generic",
    category: "Medicine",
    subCategory: "OTC",
    packagingUnit: "Box",
    baseUnit: "Tablet",
    piecesPerUnit: 50,
    totalStockPieces: 280,
    unitPriceCost: 100,
    sellingPricePerUnit: 180,
    sellingPricePerPiece: 5,
    salesCount: 1200,
    status: "In Stock",
    isActive: true,
    batches: [
      { batchId: "CTZ-B001", lotNumber: "CTZ-2025-01", manufacturingDate: "2025-02-01", expiryDate: "2027-01-31", stockPieces: 150, receivedDate: "2025-02-10" },
      { batchId: "CTZ-B002", lotNumber: "CTZ-2025-02", manufacturingDate: "2025-09-01", expiryDate: "2027-08-31", stockPieces: 130, receivedDate: "2025-09-10" }
    ]
  },
  {
    id: 5,
    code: "PRD-S010",
    name: "Saline Nasal Spray",
    genericName: "Decongestant relief",
    manufacturer: "Respiratory Care",
    brandType: "Branded",
    category: "Medicine",
    subCategory: "OTC",
    packagingUnit: "Bottle",
    baseUnit: "Piece",
    piecesPerUnit: 1,
    totalStockPieces: 26,
    unitPriceCost: 150,
    sellingPricePerUnit: 220,
    sellingPricePerPiece: 220,
    salesCount: 450,
    status: "In Stock",
    isActive: true,
    batches: [
      { batchId: "SNS-B001", lotNumber: "SNS-2025-01", manufacturingDate: "2025-03-01", expiryDate: "2027-02-28", stockPieces: 26, receivedDate: "2025-03-10" }
    ]
  },
  {
    id: 6,
    code: "PRD-C120",
    name: "Cough Syrup 120ml",
    genericName: "Dextromethorphan",
    manufacturer: "CoughRelief Inc",
    brandType: "Branded",
    category: "Medicine",
    subCategory: "OTC",
    packagingUnit: "Bottle",
    baseUnit: "Piece",
    piecesPerUnit: 1,
    totalStockPieces: 19,
    unitPriceCost: 120,
    sellingPricePerUnit: 180,
    sellingPricePerPiece: 180,
    salesCount: 520,
    status: "Low Stock",
    isActive: true,
    batches: [
      { batchId: "CSY-B001", lotNumber: "CSY-2026-01", manufacturingDate: "2026-01-01", expiryDate: "2026-06-30", stockPieces: 8, receivedDate: "2026-01-05" },
      // ⚠️ Near expiry!
      { batchId: "CSY-B002", lotNumber: "CSY-2026-02", manufacturingDate: "2026-02-01", expiryDate: "2027-01-31", stockPieces: 11, receivedDate: "2026-02-10" }
    ]
  },
  {
    id: 7,
    code: "PRD-Ca600",
    name: "Calcium 600mg",
    genericName: "Bone health supplement",
    manufacturer: "Vitamins Plus",
    brandType: "Generic",
    category: "Vitamins & Supplements",
    subCategory: "OTC",
    packagingUnit: "Bottle",
    baseUnit: "Tablet",
    piecesPerUnit: 60,
    totalStockPieces: 180,
    unitPriceCost: 300,
    sellingPricePerUnit: 500,
    sellingPricePerPiece: 10,
    discount: 20,
    salesCount: 670,
    status: "In Stock",
    isActive: true,
    batches: [
      { batchId: "CAL-B001", lotNumber: "CAL-2025-01", manufacturingDate: "2025-01-01", expiryDate: "2027-12-31", stockPieces: 180, receivedDate: "2025-01-10" }
    ]
  },
  {
    id: 8,
    code: "PRD-D780",
    name: "Losartan 50mg",
    genericName: "Blood pressure medication",
    manufacturer: "HeartHealth",
    brandType: "Generic",
    category: "Medicine",
    subCategory: "Prescription (Rx)",
    packagingUnit: "Box",
    baseUnit: "Tablet",
    piecesPerUnit: 100,
    totalStockPieces: 115,
    unitPriceCost: 500,
    sellingPricePerUnit: 800,
    sellingPricePerPiece: 10,
    salesCount: 950,
    status: "Low Stock",
    isActive: true,
    batches: [
      { batchId: "LST-B001", lotNumber: "LST-2025-01", manufacturingDate: "2025-03-01", expiryDate: "2027-02-28", stockPieces: 15, receivedDate: "2025-03-05" },
      { batchId: "LST-B002", lotNumber: "LST-2025-02", manufacturingDate: "2025-07-01", expiryDate: "2027-06-30", stockPieces: 100, receivedDate: "2025-07-10" }
    ]
  },
  {
    id: 9,
    code: "PRD-T001",
    name: "Thermometer Digital",
    genericName: "Medical device",
    manufacturer: "MedTech",
    brandType: "Others",
    category: "Medical Devices",
    subCategory: "None",
    packagingUnit: "Box",
    baseUnit: "Piece",
    piecesPerUnit: 1,
    totalStockPieces: 12,
    unitPriceCost: 150,
    sellingPricePerUnit: 250,
    sellingPricePerPiece: 250,
    salesCount: 150,
    status: "Low Stock",
    isActive: true,
    batches: [
      { batchId: "THM-B001", lotNumber: "THM-2025-01", manufacturingDate: "2025-01-01", expiryDate: "2030-01-01", stockPieces: 12, receivedDate: "2025-01-15" }
    ]
  },
  {
    id: 10,
    code: "PRD-HC01",
    name: "Ketoconazole 2% Shampoo",
    genericName: "Antifungal shampoo",
    manufacturer: "DermaCare",
    brandType: "Generic",
    category: "Personal Care",
    subCategory: "Haircare",
    packagingUnit: "Bottle",
    baseUnit: "Piece",
    piecesPerUnit: 1,
    totalStockPieces: 45,
    unitPriceCost: 180,
    sellingPricePerUnit: 320,
    sellingPricePerPiece: 320,
    salesCount: 310,
    status: "In Stock",
    isActive: true,
    batches: [
      { batchId: "KTO-B001", lotNumber: "KTO-2025-01", manufacturingDate: "2025-02-01", expiryDate: "2027-01-31", stockPieces: 45, receivedDate: "2025-02-05" }
    ]
  },
  {
    id: 11,
    code: "PRD-B005",
    name: "Baby Wipes 80s",
    genericName: "Hypoallergenic wipes",
    manufacturer: "PureBaby",
    brandType: "Branded",
    category: "Baby & Mom",
    subCategory: "None",
    packagingUnit: "Pack",
    baseUnit: "Piece",
    piecesPerUnit: 1,
    totalStockPieces: 110,
    unitPriceCost: 50,
    sellingPricePerUnit: 85,
    sellingPricePerPiece: 85,
    salesCount: 880,
    status: "In Stock",
    isActive: true,
    batches: [
      { batchId: "BWP-B001", lotNumber: "BWP-2025-01", manufacturingDate: "2025-04-01", expiryDate: "2027-03-31", stockPieces: 110, receivedDate: "2025-04-10" }
    ]
  },
  {
    id: 12,
    code: "PRD-I200",
    name: "Ibuprofen 200mg",
    genericName: "Anti-inflammatory",
    manufacturer: "MedCorp",
    brandType: "Branded",
    category: "Medicine",
    subCategory: "OTC",
    packagingUnit: "Box",
    baseUnit: "Capsule",
    piecesPerUnit: 100,
    totalStockPieces: 50,
    unitPriceCost: 200,
    sellingPricePerUnit: 400,
    sellingPricePerPiece: 5,
    salesCount: 1800,
    status: "Low Stock",
    isActive: true,
    batches: [
      { batchId: "IBU-B001", lotNumber: "IBU-2025-01", manufacturingDate: "2025-05-01", expiryDate: "2027-04-30", stockPieces: 50, receivedDate: "2025-05-05" }
    ]
  }
];
const KEY_LENGTH = 64;
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}
const SEED_USERS = [
  {
    username: "admin",
    fullName: "System Administrator",
    email: "admin@botikaplus.local",
    role: "ADMIN",
    status: "ACTIVE",
    phone: "09170000001",
    address: "BotikaPlus Main Branch",
    password: "admin123"
  },
  {
    username: "manager",
    fullName: "Branch Manager",
    email: "manager@botikaplus.local",
    role: "MANAGER",
    status: "ACTIVE",
    phone: "09170000002",
    address: "BotikaPlus Main Branch",
    password: "manager123"
  },
  {
    username: "staff",
    fullName: "Branch Staff",
    email: "staff@botikaplus.local",
    role: "STAFF",
    status: "ACTIVE",
    phone: "09170000003",
    address: "BotikaPlus Main Branch",
    password: "staff123"
  }
];
const SEED_MANUFACTURERS = [
  { name: "PharmaTech", contactPerson: "Mr. Cruz", email: "contact@pharmatech.local", phone: "09171111111", category: "Pharmaceutical", address: "Makati City" },
  { name: "Vitamins Plus", contactPerson: "Ms. Bautista", email: "sales@vitaminsplus.local", phone: "09172222222", category: "Supplements", address: "Pasig City" },
  { name: "Generic Pharma", contactPerson: "Mr. Lim", email: "sales@genericpharma.local", phone: "09173333333", category: "Pharmaceutical", address: "Taguig City" },
  { name: "AllergyCare", contactPerson: "Ms. Reyes", email: "care@allergycare.local", phone: "09174444444", category: "Pharmaceutical", address: "Quezon City" },
  { name: "Respiratory Care", contactPerson: "Mr. Garcia", email: "orders@respiratorycare.local", phone: "09175555555", category: "Pharmaceutical", address: "Mandaluyong City" },
  { name: "Unilab", contactPerson: "Mr. Cruz", email: "unilab@botikaplus.local", phone: "09176666666", category: "Pharmaceutical", address: "Mandaluyong City" },
  { name: "Pfizer", contactPerson: "Ms. Tan", email: "pfizer@botikaplus.local", phone: "09177777777", category: "Pharmaceutical", address: "Makati City" },
  { name: "TGP Generics", contactPerson: "Mr. Garcia", email: "tgp@botikaplus.local", phone: "09178888888", category: "Pharmaceutical", address: "Pasay City" },
  { name: "GSK", contactPerson: "Ms. Reyes", email: "gsk@botikaplus.local", phone: "09179999999", category: "Pharmaceutical", address: "Taguig City" },
  { name: "Bayer", contactPerson: "Mr. Lim", email: "bayer@botikaplus.local", phone: "09170000004", category: "Pharmaceutical", address: "Makati City" }
];
const SEED_PURCHASE_ORDERS = [
  {
    orderCode: "PO-2026-0048",
    manufacturerName: "Unilab",
    contactPerson: "Mr. Cruz",
    total: 4200,
    status: "In Transit",
    etaDate: "2026-03-22",
    placedDate: "2026-03-18",
    priority: "Normal",
    orderedByName: "Branch Manager",
    remarks: null,
    items: [
      { productName: "Biogesic 500mg", quantityUnits: 10, unitLabel: "boxes", estimatedCost: 2600, remarks: null },
      { productName: "Neozep Forte", quantityUnits: 5, unitLabel: "boxes", estimatedCost: 1600, remarks: null }
    ]
  },
  {
    orderCode: "PO-2026-0047",
    manufacturerName: "Pfizer",
    contactPerson: "Ms. Tan",
    total: 8500,
    status: "Processing",
    etaDate: "2026-03-25",
    placedDate: "2026-03-19",
    priority: "Normal",
    orderedByName: "System Administrator",
    remarks: "Awaiting stock replenishment from supplier warehouse.",
    items: [
      { productName: "Amoxicillin 500mg", quantityUnits: 20, unitLabel: "boxes", estimatedCost: 8500, remarks: null }
    ]
  },
  {
    orderCode: "PO-2026-0046",
    manufacturerName: "TGP Generics",
    contactPerson: "Mr. Garcia",
    total: 12400,
    status: "In Transit",
    etaDate: "2026-03-21",
    placedDate: "2026-03-16",
    priority: "Urgent",
    orderedByName: "Branch Staff",
    remarks: null,
    items: [
      { productName: "Paracetamol 500mg", quantityUnits: 50, unitLabel: "boxes", estimatedCost: 6200, remarks: null },
      { productName: "Ibuprofen 400mg", quantityUnits: 30, unitLabel: "boxes", estimatedCost: 3800, remarks: null },
      { productName: "Mefenamic Acid", quantityUnits: 20, unitLabel: "boxes", estimatedCost: 2400, remarks: null }
    ]
  }
];
const SEED_RECEIPT_SETTINGS = {
  storeName: "BOTIKAPLUS",
  address: "123 Health Ave, Makati City",
  contact: "0912 345 6789",
  tin: "000-123-456-000",
  footerMessage: "Thank you for your business!\nPlease come again.",
  paperSize: "80mm",
  showTxnId: 1,
  showCashier: 1,
  showDate: 1
};
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function seedDatabase(db) {
  const seed = db.transaction(() => {
    seedUsers(db);
    seedManufacturers(db);
    seedProducts(db);
    seedReceiptSettings(db);
    seedAppSettings(db);
    seedPurchaseOrders(db);
  });
  seed();
}
function seedUsers(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM users").get();
  if (count.count > 0) {
    return;
  }
  const insert = db.prepare(`
    INSERT INTO users (
      username, full_name, email, password_hash, role, status, phone, address, created_at, updated_at
    ) VALUES (
      @username, @fullName, @email, @passwordHash, @role, @status, @phone, @address, @createdAt, @updatedAt
    )
  `);
  for (const user of SEED_USERS) {
    const timestamp = nowIso();
    insert.run({
      ...user,
      passwordHash: hashPassword(user.password),
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }
}
function seedManufacturers(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM manufacturers").get();
  if (count.count > 0) {
    return;
  }
  const insert = db.prepare(`
    INSERT INTO manufacturers (
      name, contact_person, email, phone, category, address, is_active, created_at, updated_at
    ) VALUES (
      @name, @contactPerson, @email, @phone, @category, @address, 1, @createdAt, @updatedAt
    )
  `);
  for (const manufacturer of SEED_MANUFACTURERS) {
    const timestamp = nowIso();
    insert.run({
      ...manufacturer,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }
}
function seedProducts(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM products").get();
  if (count.count > 0) {
    return;
  }
  const manufacturerLookup = /* @__PURE__ */ new Map();
  const manufacturerRows = db.prepare("SELECT id, name FROM manufacturers").all();
  for (const row of manufacturerRows) {
    manufacturerLookup.set(row.name, row.id);
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
  `);
  const insertBatch = db.prepare(`
    INSERT INTO product_batches (
      product_id, batch_code, lot_number, manufacturing_date, expiry_date,
      stock_pieces, received_date, is_active, created_at, updated_at
    ) VALUES (
      @productId, @batchCode, @lotNumber, @manufacturingDate, @expiryDate,
      @stockPieces, @receivedDate, 1, @createdAt, @updatedAt
    )
  `);
  const insertMovement = db.prepare(`
    INSERT INTO inventory_movements (
      product_id, product_batch_id, movement_type, quantity_pieces, reference_type,
      reference_id, reason, performed_by_user_id, created_at
    ) VALUES (
      @productId, @productBatchId, @movementType, @quantityPieces, @referenceType,
      @referenceId, @reason, @performedByUserId, @createdAt
    )
  `);
  for (const product of INVENTORY_DB) {
    const timestamp = nowIso();
    const manufacturerId = product.manufacturer ? manufacturerLookup.get(product.manufacturer) ?? null : null;
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
      updatedAt: timestamp
    });
    const productId = Number(productResult.lastInsertRowid);
    for (const batch of product.batches) {
      const batchTimestamp = nowIso();
      const batchResult = insertBatch.run({
        productId,
        batchCode: batch.batchId,
        lotNumber: batch.lotNumber,
        manufacturingDate: batch.manufacturingDate,
        expiryDate: batch.expiryDate,
        stockPieces: batch.stockPieces,
        receivedDate: batch.receivedDate,
        createdAt: batchTimestamp,
        updatedAt: batchTimestamp
      });
      insertMovement.run({
        productId,
        productBatchId: Number(batchResult.lastInsertRowid),
        movementType: "OPENING_BALANCE",
        quantityPieces: batch.stockPieces,
        referenceType: "SEED",
        referenceId: batch.batchId,
        reason: "Initial seeded inventory from approved UI prototype data",
        performedByUserId: 1,
        createdAt: batchTimestamp
      });
    }
  }
  for (let i = 1; i <= 1e3; i++) {
    const timestamp = nowIso();
    const manufacturerId = Array.from(manufacturerLookup.values())[i % manufacturerLookup.size] ?? null;
    const productResult = insertProduct.run({
      code: `TST-${String(i).padStart(4, "0")}`,
      name: `Test Medicine ${i} 500mg`,
      genericName: `Test Generic ${i}`,
      manufacturerId,
      brandType: i % 2 === 0 ? "Branded" : "Generic",
      category: "Pharmaceutical",
      subCategory: "Test Data",
      packagingUnit: "Box",
      baseUnit: "Piece",
      piecesPerUnit: 10,
      totalStockPieces: 50,
      unitPriceCost: 100,
      sellingPricePerUnit: 1500,
      sellingPricePerPiece: 150,
      discount: null,
      isActive: 1,
      salesCount: 0,
      status: "Active",
      createdAt: timestamp,
      updatedAt: timestamp
    });
    const productId = Number(productResult.lastInsertRowid);
    const batchTimestamp = nowIso();
    const batchResult = insertBatch.run({
      productId,
      batchCode: `TB-${String(i).padStart(4, "0")}`,
      lotNumber: `LOT-T${i}`,
      manufacturingDate: "2026-01-01",
      expiryDate: "2028-12-31",
      stockPieces: 50,
      receivedDate: "2026-03-01",
      createdAt: batchTimestamp,
      updatedAt: batchTimestamp
    });
    insertMovement.run({
      productId,
      productBatchId: Number(batchResult.lastInsertRowid),
      movementType: "OPENING_BALANCE",
      quantityPieces: 50,
      referenceType: "SEED",
      referenceId: `TB-${String(i).padStart(4, "0")}`,
      reason: "1000 Scale Test Data",
      performedByUserId: 1,
      createdAt: batchTimestamp
    });
  }
}
function seedReceiptSettings(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM receipt_settings").get();
  if (count.count > 0) {
    return;
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
    updatedAt: nowIso()
  });
}
function seedAppSettings(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM app_settings").get();
  if (count.count > 0) {
    return;
  }
  const insert = db.prepare(`
    INSERT INTO app_settings (setting_key, setting_value, setting_type, updated_at)
    VALUES (@settingKey, @settingValue, @settingType, @updatedAt)
  `);
  const timestamp = nowIso();
  insert.run({ settingKey: "app.mode", settingValue: "offline", settingType: "string", updatedAt: timestamp });
  insert.run({ settingKey: "inventory.low_stock_threshold_mode", settingValue: "pieces_per_unit", settingType: "string", updatedAt: timestamp });
  insert.run({ settingKey: "backup.auto_enabled", settingValue: "false", settingType: "boolean", updatedAt: timestamp });
}
function seedPurchaseOrders(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM purchase_orders").get();
  if (count.count > 0) {
    return;
  }
  const manufacturerLookup = /* @__PURE__ */ new Map();
  const userLookup = /* @__PURE__ */ new Map();
  const manufacturers = db.prepare("SELECT id, name FROM manufacturers").all();
  const users = db.prepare("SELECT id, full_name FROM users").all();
  for (const manufacturer of manufacturers) {
    manufacturerLookup.set(manufacturer.name, manufacturer.id);
  }
  for (const user of users) {
    userLookup.set(user.full_name, user.id);
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
  `);
  const insertItem = db.prepare(`
    INSERT INTO purchase_order_items (
      purchase_order_id, product_name, quantity_units, unit_label, estimated_cost, remarks
    ) VALUES (
      @purchaseOrderId, @productName, @quantityUnits, @unitLabel, @estimatedCost, @remarks
    )
  `);
  for (const order of SEED_PURCHASE_ORDERS) {
    const timestamp = nowIso();
    const orderResult = insertOrder.run({
      ...order,
      manufacturerId: manufacturerLookup.get(order.manufacturerName) ?? null,
      orderedByUserId: userLookup.get(order.orderedByName) ?? null,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    const purchaseOrderId = Number(orderResult.lastInsertRowid);
    for (const item of order.items) {
      insertItem.run({
        purchaseOrderId,
        ...item
      });
    }
  }
}
const require$1 = createRequire(import.meta.url);
const BetterSqlite3 = require$1("better-sqlite3");
class DatabaseManager {
  constructor(dbPath, backupDir) {
    __publicField(this, "database");
    __publicField(this, "dbPath");
    __publicField(this, "backupDir");
    this.dbPath = dbPath;
    this.backupDir = backupDir;
    this.database = new BetterSqlite3(dbPath);
    this.configure();
    this.runMigrations();
    seedDatabase(this.database);
  }
  static bootstrap(electronApp) {
    const dataDir = path.join(electronApp.getPath("userData"), "data");
    const backupDir = path.join(electronApp.getPath("userData"), "backups");
    mkdirSync(dataDir, { recursive: true });
    mkdirSync(backupDir, { recursive: true });
    const dbPath = path.join(dataDir, "botikaplus.sqlite");
    return new DatabaseManager(dbPath, backupDir);
  }
  get db() {
    return this.database;
  }
  close() {
    if (this.database.open) {
      this.database.close();
    }
  }
  getAppliedMigrationCount() {
    const row = this.database.prepare("SELECT COUNT(*) AS count FROM schema_migrations").get();
    return row.count;
  }
  configure() {
    this.database.pragma("journal_mode = WAL");
    this.database.pragma("foreign_keys = ON");
    this.database.pragma("synchronous = NORMAL");
    this.database.pragma("temp_store = MEMORY");
  }
  runMigrations() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )
    `);
    const getMigration = this.database.prepare("SELECT id FROM schema_migrations WHERE id = ?");
    const insertMigration = this.database.prepare(`
      INSERT INTO schema_migrations (id, name, applied_at)
      VALUES (?, ?, ?)
    `);
    for (const migration of migrations) {
      const existing = getMigration.get(migration.id);
      if (existing) {
        continue;
      }
      const applyMigration = this.database.transaction(() => {
        this.database.exec(migration.up);
        insertMigration.run(migration.id, migration.name, (/* @__PURE__ */ new Date()).toISOString());
      });
      applyMigration();
    }
  }
}
class AdminService {
  constructor(usersRepository, manufacturersRepository) {
    this.usersRepository = usersRepository;
    this.manufacturersRepository = manufacturersRepository;
  }
  listUsers(query) {
    return this.usersRepository.list(query);
  }
  listManufacturers() {
    return this.manufacturersRepository.list();
  }
}
class InventoryService {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }
  list(query) {
    return this.inventoryRepository.list(query);
  }
  getSummary() {
    return this.inventoryRepository.getSummary();
  }
}
class OrdersService {
  constructor(ordersRepository) {
    this.ordersRepository = ordersRepository;
  }
  list(query) {
    return this.ordersRepository.list(query);
  }
}
class PosService {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }
  listCatalog(query) {
    return this.inventoryRepository.list({
      ...query,
      includeInactive: false,
      onlySellable: true
    });
  }
}
class SettingsService {
  constructor(settingsRepository) {
    this.settingsRepository = settingsRepository;
  }
  getReceiptSettings() {
    return this.settingsRepository.getReceiptSettings();
  }
}
class SystemService {
  constructor(systemRepository) {
    this.systemRepository = systemRepository;
  }
  getStatus() {
    return this.systemRepository.getStatus();
  }
}
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
function normalizePagination(query) {
  const page = Math.max(DEFAULT_PAGE, Math.trunc((query == null ? void 0 : query.page) ?? DEFAULT_PAGE));
  const requestedPageSize = Math.trunc((query == null ? void 0 : query.pageSize) ?? DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedPageSize));
  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize
  };
}
function buildPaginatedResult(items, total, page, pageSize) {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}
function escapeLike(value) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
class InventoryRepository {
  constructor(db) {
    this.db = db;
  }
  list(query) {
    var _a;
    const { page, pageSize, offset } = normalizePagination(query);
    const params = { limit: pageSize, offset };
    const whereClauses = [];
    if ((_a = query == null ? void 0 : query.search) == null ? void 0 : _a.trim()) {
      params.search = `%${escapeLike(query.search.trim())}%`;
      whereClauses.push(`(
        p.name LIKE @search ESCAPE '\\'
        OR p.code LIKE @search ESCAPE '\\'
        OR COALESCE(p.generic_name, '') LIKE @search ESCAPE '\\'
        OR COALESCE(m.name, '') LIKE @search ESCAPE '\\'
      )`);
    }
    if ((query == null ? void 0 : query.category) && query.category !== "All" && query.category !== "All Products") {
      params.category = query.category;
      whereClauses.push("p.category = @category");
    }
    if ((query == null ? void 0 : query.subCategory) && query.subCategory !== "All") {
      params.subCategory = query.subCategory;
      whereClauses.push("p.sub_category = @subCategory");
    }
    if (!(query == null ? void 0 : query.includeInactive)) {
      whereClauses.push("p.is_active = 1");
    }
    if (query == null ? void 0 : query.onlySellable) {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM product_batches pb
        WHERE pb.product_id = p.id
          AND pb.is_active = 1
          AND pb.stock_pieces > 0
          AND date(pb.expiry_date) >= date('now')
      )`);
    }
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const sortOrder = (query == null ? void 0 : query.sortOrder) === "desc" ? "DESC" : "ASC";
    const joinsSql = "FROM products p LEFT JOIN manufacturers m ON m.id = p.manufacturer_id";
    const totalRow = this.db.prepare(`SELECT COUNT(*) AS count ${joinsSql} ${whereSql}`).get(params);
    const rows = this.db.prepare(`
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
      `).all(params);
    const items = rows.map((row) => this.mapProduct(row));
    return buildPaginatedResult(items, totalRow.count, page, pageSize);
  }
  getSummary() {
    const row = this.db.prepare(`
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
      `).get();
    return row;
  }
  mapProduct(row) {
    return {
      ...row,
      isActive: Boolean(row.isActive)
    };
  }
}
class ManufacturersRepository {
  constructor(db) {
    this.db = db;
  }
  list() {
    const rows = this.db.prepare(`
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
      `).all();
    return rows.map((row) => ({ ...row, isActive: Boolean(row.isActive) }));
  }
}
class OrdersRepository {
  constructor(db) {
    this.db = db;
  }
  list(query) {
    var _a;
    const { page, pageSize, offset } = normalizePagination(query);
    const params = { limit: pageSize, offset };
    const whereClauses = [];
    if ((_a = query == null ? void 0 : query.search) == null ? void 0 : _a.trim()) {
      params.search = `%${escapeLike(query.search.trim())}%`;
      whereClauses.push(`(
        po.order_code LIKE @search ESCAPE '\\'
        OR po.manufacturer_name LIKE @search ESCAPE '\\'
        OR EXISTS (
          SELECT 1 FROM purchase_order_items poi
          WHERE poi.purchase_order_id = po.id AND poi.product_name LIKE @search ESCAPE '\\'
        )
      )`);
    }
    if ((query == null ? void 0 : query.manufacturer) && query.manufacturer !== "All") {
      params.manufacturer = query.manufacturer;
      whereClauses.push("po.manufacturer_name = @manufacturer");
    }
    if ((query == null ? void 0 : query.status) && query.status !== "All") {
      params.status = query.status;
      whereClauses.push("po.status = @status");
    }
    if ((query == null ? void 0 : query.priority) && query.priority !== "All") {
      params.priority = query.priority;
      whereClauses.push("po.priority = @priority");
    }
    if ((query == null ? void 0 : query.orderedBy) && query.orderedBy !== "All") {
      params.orderedBy = query.orderedBy;
      whereClauses.push("COALESCE(po.ordered_by_name, u.full_name) = @orderedBy");
    }
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const sortOrder = (query == null ? void 0 : query.sortOrder) === "asc" ? "ASC" : "DESC";
    const joinsSql = "FROM purchase_orders po LEFT JOIN users u ON u.id = po.ordered_by_user_id";
    const totalRow = this.db.prepare(`SELECT COUNT(*) AS count ${joinsSql} ${whereSql}`).get(params);
    const items = this.db.prepare(`
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
      `).all(params);
    return buildPaginatedResult(items, totalRow.count, page, pageSize);
  }
}
class SettingsRepository {
  constructor(db) {
    this.db = db;
  }
  getReceiptSettings() {
    const row = this.db.prepare(`
        SELECT
          id,
          store_name AS storeName,
          address,
          contact,
          tin,
          footer_message AS footerMessage,
          paper_size AS paperSize,
          show_txn_id AS showTxnId,
          show_cashier AS showCashier,
          show_date AS showDate,
          updated_at AS updatedAt
        FROM receipt_settings
        WHERE id = 1
      `).get();
    if (!row) {
      throw new Error("Receipt settings not found");
    }
    return {
      ...row,
      showTxnId: Boolean(row.showTxnId),
      showCashier: Boolean(row.showCashier),
      showDate: Boolean(row.showDate)
    };
  }
}
class SystemRepository {
  constructor(db, dbPath, backupDir, migrationCount) {
    this.db = db;
    this.dbPath = dbPath;
    this.backupDir = backupDir;
    this.migrationCount = migrationCount;
  }
  getStatus() {
    const productRow = this.db.prepare("SELECT COUNT(*) AS count FROM products").get();
    const userRow = this.db.prepare("SELECT COUNT(*) AS count FROM users").get();
    return {
      dbPath: this.dbPath,
      backupDir: this.backupDir,
      isInitialized: true,
      migrationCount: this.migrationCount,
      seededProductCount: productRow.count,
      seededUserCount: userRow.count
    };
  }
}
class UsersRepository {
  constructor(db) {
    this.db = db;
  }
  list(query) {
    var _a;
    const { page, pageSize, offset } = normalizePagination(query);
    const params = { limit: pageSize, offset };
    const whereClauses = [];
    if ((_a = query == null ? void 0 : query.search) == null ? void 0 : _a.trim()) {
      params.search = `%${escapeLike(query.search.trim())}%`;
      whereClauses.push(`(
        full_name LIKE @search ESCAPE '\\'
        OR username LIKE @search ESCAPE '\\'
        OR COALESCE(email, '') LIKE @search ESCAPE '\\'
      )`);
    }
    if ((query == null ? void 0 : query.role) && query.role !== "All") {
      params.role = query.role;
      whereClauses.push("role = @role");
    }
    if ((query == null ? void 0 : query.status) && query.status !== "All") {
      params.status = query.status;
      whereClauses.push("status = @status");
    }
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const totalRow = this.db.prepare(`SELECT COUNT(*) AS count FROM users ${whereSql}`).get(params);
    const items = this.db.prepare(`
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
      `).all(params);
    return buildPaginatedResult(items, totalRow.count, page, pageSize);
  }
  count() {
    const row = this.db.prepare("SELECT COUNT(*) AS count FROM users").get();
    return row.count;
  }
}
function createAppServices(databaseManager2) {
  const inventoryRepository = new InventoryRepository(databaseManager2.db);
  const usersRepository = new UsersRepository(databaseManager2.db);
  const manufacturersRepository = new ManufacturersRepository(databaseManager2.db);
  const ordersRepository = new OrdersRepository(databaseManager2.db);
  const settingsRepository = new SettingsRepository(databaseManager2.db);
  const systemRepository = new SystemRepository(
    databaseManager2.db,
    databaseManager2.dbPath,
    databaseManager2.backupDir,
    databaseManager2.getAppliedMigrationCount()
  );
  return {
    systemService: new SystemService(systemRepository),
    inventoryService: new InventoryService(inventoryRepository),
    posService: new PosService(inventoryRepository),
    ordersService: new OrdersService(ordersRepository),
    adminService: new AdminService(usersRepository, manufacturersRepository),
    settingsService: new SettingsService(settingsRepository)
  };
}
function registerHandler(channel, handler) {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, (_event, payload) => handler(payload));
}
function registerIpcHandlers(services) {
  registerHandler("system:getStatus", () => services.systemService.getStatus());
  registerHandler("inventory:list", (query) => services.inventoryService.list(query));
  registerHandler("inventory:getSummary", () => services.inventoryService.getSummary());
  registerHandler("pos:listCatalog", (query) => services.posService.listCatalog(query));
  registerHandler("orders:list", (query) => services.ordersService.list(query));
  registerHandler("admin:listUsers", (query) => services.adminService.listUsers(query));
  registerHandler("admin:listManufacturers", () => services.adminService.listManufacturers());
  registerHandler("settings:getReceiptSettings", () => services.settingsService.getReceiptSettings());
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let databaseManager = null;
Menu.setApplicationMenu(null);
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "BotikaPlus",
    icon: path.join(process.env.APP_ROOT, "frontend", "assets", "logos", "logo.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.setMenuBarVisibility(false);
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
async function bootstrapApplication() {
  databaseManager = DatabaseManager.bootstrap(app);
  const services = createAppServices(databaseManager);
  registerIpcHandlers(services);
  createWindow();
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    databaseManager == null ? void 0 : databaseManager.close();
    app.quit();
    win = null;
  }
});
app.on("before-quit", () => {
  databaseManager == null ? void 0 : databaseManager.close();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(bootstrapApplication);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
