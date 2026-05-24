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
const fixCategoriesMigration = {
  id: "002",
  name: "fix_categories",
  up: `
    UPDATE products SET category = 'Medicine' WHERE category = 'Pharmaceutical';
    UPDATE products SET category = 'Vitamins & Supplements' WHERE category = 'Supplements';
    UPDATE products SET category = 'Medical Devices' WHERE category = 'Medical Device';
    UPDATE products SET sub_category = 'OTC' WHERE sub_category = 'Over-the-Counter (OTC)';
    UPDATE products SET sub_category = 'Prescription (Rx)' WHERE sub_category = 'Prescription';
  `
};
const deleteMockProductsMigration = {
  id: "003",
  name: "delete_mock_products",
  up: `
    DELETE FROM inventory_movements WHERE product_id IN (SELECT id FROM products WHERE code LIKE 'PRD-1%');
    DELETE FROM product_batches WHERE product_id IN (SELECT id FROM products WHERE code LIKE 'PRD-1%');
    DELETE FROM products WHERE code LIKE 'PRD-1%';
  `
};
const inventoryChangeRequestsMigration = {
  id: "004",
  name: "inventory_change_requests",
  up: `
    CREATE TABLE IF NOT EXISTS inventory_change_requests (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      request_type    TEXT NOT NULL CHECK(request_type IN ('CREATE','UPDATE','DELETE')),
      status          TEXT NOT NULL DEFAULT 'PENDING'
                      CHECK(status IN ('PENDING','APPROVED','REJECTED')),
      product_id      INTEGER,
      payload         TEXT NOT NULL,
      submitted_by_name TEXT,
      submitted_at    TEXT NOT NULL,
      reviewed_by_name TEXT,
      reviewed_at     TEXT,
      reviewer_note   TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_change_requests_status ON inventory_change_requests (status, submitted_at);
  `
};
const customersMigration = {
  id: "005",
  name: "customers",
  up: `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      id_type TEXT NOT NULL CHECK (id_type IN ('Senior', 'PWD')),
      id_number TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (name);
    CREATE INDEX IF NOT EXISTS idx_customers_id_number ON customers (id_number);
  `
};
const purchaseOrdersSchemaUpdateMigration = {
  id: "006",
  name: "purchase_orders_schema_update",
  up: `
    -- Drop existing tables to recreate with the dense schema
    DROP TABLE IF EXISTS purchase_order_items;
    DROP TABLE IF EXISTS purchase_orders;

    CREATE TABLE purchase_orders (
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
      fax_email_remarks TEXT,
      noted_by TEXT,
      approved_by TEXT,
      qty_to_order TEXT,
      sys_gen INTEGER NOT NULL DEFAULT 0,
      terms_days INTEGER NOT NULL DEFAULT 30,
      pay_due_date TEXT,
      is_closed INTEGER NOT NULL DEFAULT 0,
      is_locked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id),
      FOREIGN KEY (ordered_by_user_id) REFERENCES users (id)
    );

    CREATE TABLE purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_order_id INTEGER NOT NULL,
      product_id INTEGER,
      stock_no TEXT,
      stock_name TEXT NOT NULL,
      order_unit TEXT,
      pkg_qty INTEGER NOT NULL DEFAULT 1,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit_cost REAL NOT NULL DEFAULT 0,
      disc_percent REAL NOT NULL DEFAULT 0,
      net_ucost REAL NOT NULL DEFAULT 0,
      ext_cost REAL NOT NULL DEFAULT 0,
      recvd INTEGER NOT NULL DEFAULT 0,
      pr_num TEXT,
      remarks TEXT,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `
};
const addShelfLocationMigration = {
  id: "007",
  name: "add_shelf_location",
  up: `
    ALTER TABLE products ADD COLUMN shelf_location TEXT DEFAULT NULL;
  `
};
const addPerformanceIndexesMigration = {
  id: "008",
  name: "add_performance_indexes",
  up: `
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_placed_date ON purchase_orders(placed_date);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_code ON purchase_orders(order_code);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
    CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
    CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  `
};
const migrations = [
  initialSchemaMigration,
  fixCategoriesMigration,
  deleteMockProductsMigration,
  inventoryChangeRequestsMigration,
  customersMigration,
  purchaseOrdersSchemaUpdateMigration,
  addShelfLocationMigration,
  addPerformanceIndexesMigration
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
function generateMockPurchaseOrders() {
  const orders = [];
  const statuses = ["Processing", "In Transit", "Delivered", "Cancelled"];
  const priorities = ["Normal", "Urgent"];
  const manufacturers = [
    { name: "Unilab", contact: "Mr. Cruz" },
    { name: "Pfizer", contact: "Ms. Tan" },
    { name: "TGP Generics", contact: "Mr. Garcia" },
    { name: "PharmaTech", contact: "Mr. Cruz" },
    { name: "Vitamins Plus", contact: "Ms. Bautista" },
    { name: "Bayer", contact: "Mr. Lim" }
  ];
  for (let i = 1; i <= 100; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const mfg = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const user = "01-MAIN";
    let itemsCount = 10;
    const r = Math.random();
    if (r < 0.05) itemsCount = 1e3;
    else if (r < 0.2) itemsCount = Math.floor(Math.random() * 200) + 100;
    else itemsCount = Math.floor(Math.random() * 11) + 10;
    const items = [];
    let total = 0;
    const prefixes = ["Amoxi", "Ceti", "Para", "Ibu", "Losar", "Omepra", "Salbu", "Metfor", "Amlodi", "Vitam", "Aspi"];
    const suffixes = ["cillin", "rizine", "cetamol", "profen", "tan", "zole", "tamol", "min", "pine", "in C", "rin"];
    for (let j = 0; j < itemsCount; j++) {
      const quantity = Math.floor(Math.random() * 50) + 10;
      const unitCost = Math.floor(Math.random() * 500) + 50;
      const extCost = quantity * unitCost;
      total += extCost;
      const pref = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suff = suffixes[Math.floor(Math.random() * suffixes.length)];
      const dose = [50, 100, 250, 500][Math.floor(Math.random() * 4)];
      items.push({
        stockName: `${pref}${suff} ${dose}mg Tablet`,
        orderUnit: "boxes",
        pkgQty: 1,
        quantity,
        unitCost,
        discPercent: 0,
        netUcost: unitCost,
        extCost,
        recvd: 0,
        prNum: null,
        remarks: null
      });
    }
    const padI = String(i).padStart(4, "0");
    const now = /* @__PURE__ */ new Date();
    now.setMonth(now.getMonth() - i % 4);
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    const placedDate = `${y}-${m}-${d}`;
    const etaDate = `${y}-${m}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`;
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
      qtyToOrder: "1 month",
      sysGen: 0,
      termsDays: 30,
      payDueDate: null,
      isClosed: 0,
      isLocked: 0,
      items
    });
  }
  return orders;
}
const SEED_PURCHASE_ORDERS = generateMockPurchaseOrders();
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
  const existingUsers = db.prepare("SELECT username FROM users").all();
  const existingUsernames = new Set(existingUsers.map((u) => u.username));
  const insert = db.prepare(`
    INSERT INTO users (
      username, full_name, email, password_hash, role, status, phone, address, created_at, updated_at
    ) VALUES (
      @username, @fullName, @email, @passwordHash, @role, @status, @phone, @address, @createdAt, @updatedAt
    )
  `);
  for (const user of SEED_USERS) {
    if (existingUsernames.has(user.username)) continue;
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
  const existingMfrs = db.prepare("SELECT name FROM manufacturers").all();
  const existingNames = new Set(existingMfrs.map((m) => m.name));
  const insert = db.prepare(`
    INSERT INTO manufacturers (
      name, contact_person, email, phone, category, address, is_active, created_at, updated_at
    ) VALUES (
      @name, @contactPerson, @email, @phone, @category, @address, 1, @createdAt, @updatedAt
    )
  `);
  for (const manufacturer of SEED_MANUFACTURERS) {
    if (existingNames.has(manufacturer.name)) continue;
    const timestamp = nowIso();
    insert.run({
      ...manufacturer,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }
}
const SEED_PHARMA_PRODUCTS = [
  {
    code: "PRD-0001",
    name: "Biogesic 500mg",
    genericName: "Paracetamol",
    manufacturerName: "Unilab",
    brandType: "Branded",
    category: "Medicine",
    subCategory: "OTC",
    packagingUnit: "Box",
    baseUnit: "Tablet",
    piecesPerUnit: 100,
    unitPriceCost: 400,
    sellingPricePerUnit: 500,
    sellingPricePerPiece: 5.5,
    discount: 0,
    salesCount: 150
  },
  {
    code: "PRD-0002",
    name: "Neozep Forte",
    genericName: "Phenylephrine HCl + Chlorphenamine Maleate + Paracetamol",
    manufacturerName: "Unilab",
    brandType: "Branded",
    category: "Medicine",
    subCategory: "OTC",
    packagingUnit: "Box",
    baseUnit: "Tablet",
    piecesPerUnit: 100,
    unitPriceCost: 500,
    sellingPricePerUnit: 650,
    sellingPricePerPiece: 7,
    discount: 0,
    salesCount: 120
  },
  {
    code: "PRD-0003",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin Trihydrate",
    manufacturerName: "Generic Pharma",
    brandType: "Generic",
    category: "Medicine",
    subCategory: "Prescription (Rx)",
    packagingUnit: "Box",
    baseUnit: "Capsule",
    piecesPerUnit: 100,
    unitPriceCost: 200,
    sellingPricePerUnit: 350,
    sellingPricePerPiece: 4,
    discount: 0,
    salesCount: 85
  },
  {
    code: "PRD-0004",
    name: "Alaxan FR",
    genericName: "Ibuprofen + Paracetamol",
    manufacturerName: "Unilab",
    brandType: "Branded",
    category: "Medicine",
    subCategory: "OTC",
    packagingUnit: "Box",
    baseUnit: "Capsule",
    piecesPerUnit: 100,
    unitPriceCost: 650,
    sellingPricePerUnit: 800,
    sellingPricePerPiece: 8.5,
    discount: 5,
    salesCount: 210
  },
  {
    code: "PRD-0005",
    name: "Losartan Potassium 50mg",
    genericName: "Losartan",
    manufacturerName: "TGP Generics",
    brandType: "Generic",
    category: "Medicine",
    subCategory: "Prescription (Rx)",
    packagingUnit: "Box",
    baseUnit: "Tablet",
    piecesPerUnit: 100,
    unitPriceCost: 300,
    sellingPricePerUnit: 450,
    sellingPricePerPiece: 5,
    discount: 0,
    salesCount: 300
  },
  {
    code: "PRD-0006",
    name: "Diatabs 2mg",
    genericName: "Loperamide",
    manufacturerName: "Unilab",
    brandType: "Branded",
    category: "Medicine",
    subCategory: "OTC",
    packagingUnit: "Box",
    baseUnit: "Capsule",
    piecesPerUnit: 100,
    unitPriceCost: 500,
    sellingPricePerUnit: 650,
    sellingPricePerPiece: 7.5,
    discount: 0,
    salesCount: 60
  }
];
function generateMockProducts() {
  const products = [...SEED_PHARMA_PRODUCTS];
  let codeCounter = 1e3;
  const nextCode = () => `PRD-${String(codeCounter++).padStart(4, "0")}`;
  const manufacturers = ["Unilab", "Pfizer", "Generic Pharma", "TGP Generics", "GSK", "Bayer", "PharmaTech", "Vitamins Plus", "AllergyCare", "Respiratory Care"];
  const medPrefixes = ["Amoxi", "Para", "Ibu", "Cef", "Losar", "Amlodi", "Metfor", "Clinda", "Azithro", "Cetiri", "Loxa", "Ome", "Panto", "Lans", "Rosi"];
  const medSuffixes = ["cillin", "cetamol", "profen", "alexin", "tan", "pine", "min", "mycin", "zine", "prazole", "statin", "olol"];
  for (let i = 0; i < 500; i++) {
    const pre = medPrefixes[i % medPrefixes.length];
    const suf = medSuffixes[i * 3 % medSuffixes.length];
    const mg = [100, 250, 500, 1e3][i % 4];
    const unitPrice = 50 + i % 50 * 10;
    products.push({
      code: nextCode(),
      name: `${pre}${suf} ${mg}mg`,
      genericName: `${pre}${suf}`,
      manufacturerName: manufacturers[i % manufacturers.length],
      brandType: i % 3 === 0 ? "Generic" : "Branded",
      category: "Medicine",
      subCategory: i % 2 === 0 ? "Prescription (Rx)" : "OTC",
      packagingUnit: "Box",
      baseUnit: "Tablet",
      piecesPerUnit: 100,
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.5,
      sellingPricePerPiece: unitPrice * 1.5 / 100,
      discount: i % 10 === 0 ? 10 : 0,
      salesCount: Math.floor(Math.random() * 500)
    });
  }
  const vits = ["Vitamin C", "Vitamin B Complex", "Multivitamins", "Zinc", "Calcium", "Iron", "Fish Oil", "Vitamin D3", "Magnesium", "Folic Acid"];
  for (let i = 0; i < 100; i++) {
    const vit = vits[i % vits.length];
    const unitPrice = 100 + i % 20 * 10;
    products.push({
      code: nextCode(),
      name: `${vit} ${[500, 1e3, 100][i % 3]}mg`,
      genericName: vit,
      manufacturerName: manufacturers[(i + 2) % manufacturers.length],
      brandType: i % 4 === 0 ? "Generic" : "Branded",
      category: "Vitamins & Supplements",
      subCategory: "OTC",
      packagingUnit: "Bottle",
      baseUnit: "Capsule",
      piecesPerUnit: 30,
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.6,
      sellingPricePerPiece: unitPrice * 1.6 / 30,
      discount: 0,
      salesCount: Math.floor(Math.random() * 300)
    });
  }
  const devices = ["Blood Pressure Monitor", "Glucometer", "Thermometer", "Pulse Oximeter", "Nebulizer", "Stethoscope", "Weighing Scale"];
  for (let i = 0; i < 50; i++) {
    const dev = devices[i % devices.length];
    const unitPrice = 500 + i % 10 * 200;
    products.push({
      code: nextCode(),
      name: `${dev} Model-${i + 1}`,
      genericName: dev,
      manufacturerName: manufacturers[(i + 3) % manufacturers.length],
      brandType: "Branded",
      category: "Medical Devices",
      subCategory: "None",
      packagingUnit: "Box",
      baseUnit: "Unit",
      piecesPerUnit: 1,
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.3,
      sellingPricePerPiece: unitPrice * 1.3,
      discount: i % 5 === 0 ? 5 : 0,
      salesCount: Math.floor(Math.random() * 50)
    });
  }
  const supplies = ["Syringe 3ml", "Surgical Mask", "Gauze Pad", "Alcohol Swab", "Band-Aid", "Cotton Roll", "Micropore Tape", "Gloves (Medium)"];
  for (let i = 0; i < 100; i++) {
    const sup = supplies[i % supplies.length];
    const unitPrice = 20 + i % 10 * 5;
    products.push({
      code: nextCode(),
      name: `${sup} x${[10, 50, 100][i % 3]}`,
      genericName: sup,
      manufacturerName: manufacturers[(i + 4) % manufacturers.length],
      brandType: "Others",
      category: "Medical Supplies",
      subCategory: "None",
      packagingUnit: "Pack",
      baseUnit: "Piece",
      piecesPerUnit: [10, 50, 100][i % 3],
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.4,
      sellingPricePerPiece: unitPrice * 1.4 / [10, 50, 100][i % 3],
      discount: 0,
      salesCount: Math.floor(Math.random() * 400)
    });
  }
  const pc = ["Shampoo", "Soap", "Toothpaste", "Deodorant", "Body Wash", "Mouthwash", "Lotion", "Sunblock"];
  for (let i = 0; i < 100; i++) {
    const p = pc[i % pc.length];
    const sub = ["Skincare", "Haircare", "Dental"][i % 3];
    const unitPrice = 80 + i % 15 * 10;
    products.push({
      code: nextCode(),
      name: `${p} ${[100, 250, 500][i % 3]}ml`,
      genericName: p,
      manufacturerName: manufacturers[(i + 5) % manufacturers.length],
      brandType: "Branded",
      category: "Personal Care",
      subCategory: sub,
      packagingUnit: "Bottle",
      baseUnit: "Unit",
      piecesPerUnit: 1,
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.5,
      sellingPricePerPiece: unitPrice * 1.5,
      discount: i % 8 === 0 ? 15 : 0,
      salesCount: Math.floor(Math.random() * 250)
    });
  }
  const bm = ["Diapers (M)", "Diapers (L)", "Baby Wipes", "Baby Powder", "Baby Oil", "Maternity Pads", "Breast Pump", "Baby Wash"];
  for (let i = 0; i < 50; i++) {
    const b = bm[i % bm.length];
    const unitPrice = 150 + i % 10 * 30;
    products.push({
      code: nextCode(),
      name: `${b} ${[30, 50, 100][i % 3]}s`,
      genericName: b,
      manufacturerName: manufacturers[(i + 1) % manufacturers.length],
      brandType: "Branded",
      category: "Baby & Mom",
      subCategory: "None",
      packagingUnit: "Pack",
      baseUnit: "Piece",
      piecesPerUnit: [30, 50, 100][i % 3],
      unitPriceCost: unitPrice,
      sellingPricePerUnit: unitPrice * 1.4,
      sellingPricePerPiece: unitPrice * 1.4 / [30, 50, 100][i % 3],
      discount: 0,
      salesCount: Math.floor(Math.random() * 150)
    });
  }
  return products;
}
const ALL_SEED_PRODUCTS = generateMockProducts();
function seedProducts(db) {
  const existingProducts = db.prepare("SELECT code FROM products").all();
  const existingCodes = new Set(existingProducts.map((p) => p.code));
  const manufacturerLookup = /* @__PURE__ */ new Map();
  const manufacturers = db.prepare("SELECT id, name FROM manufacturers").all();
  for (const manufacturer of manufacturers) {
    manufacturerLookup.set(manufacturer.name, manufacturer.id);
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
  `);
  const insertBatch = db.prepare(`
    INSERT INTO product_batches (
      product_id, batch_code, lot_number, manufacturing_date, expiry_date,
      stock_pieces, received_date, created_at, updated_at
    ) VALUES (
      @productId, @batchCode, @lotNumber, @manufacturingDate, @expiryDate,
      @stockPieces, @receivedDate, @createdAt, @updatedAt
    )
  `);
  const insertMovement = db.prepare(`
    INSERT INTO inventory_movements (
      product_id, product_batch_id, movement_type, quantity_pieces, reason, created_at
    ) VALUES (
      @productId, @productBatchId, 'OPENING_BALANCE', @quantityPieces, 'Initial seed data', @createdAt
    )
  `);
  for (let i = 0; i < ALL_SEED_PRODUCTS.length; i++) {
    const p = ALL_SEED_PRODUCTS[i];
    if (existingCodes.has(p.code)) continue;
    const timestamp = nowIso();
    let initialStockPieces = p.piecesPerUnit * 2;
    let expiryDate = "2027-01-10";
    let status = "In Stock";
    if (i % 25 === 0) {
      initialStockPieces = 0;
      status = "Out of Stock";
    } else if (i % 15 === 0) {
      initialStockPieces = Math.min(5, p.piecesPerUnit);
      status = "Low Stock";
    } else if (i % 18 === 0) {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() + 30);
      expiryDate = date.toISOString().split("T")[0];
    }
    const result = insertProduct.run({
      ...p,
      manufacturerId: manufacturerLookup.get(p.manufacturerName) ?? null,
      totalStockPieces: initialStockPieces,
      status,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    const productId = Number(result.lastInsertRowid);
    const batchResult = insertBatch.run({
      productId,
      batchCode: `BATCH-${p.code}-001`,
      lotNumber: `LOT${Math.floor(Math.random() * 9e4) + 1e4}`,
      manufacturingDate: "2025-01-10",
      expiryDate,
      stockPieces: initialStockPieces,
      receivedDate: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    const productBatchId = Number(batchResult.lastInsertRowid);
    insertMovement.run({
      productId,
      productBatchId,
      quantityPieces: initialStockPieces,
      createdAt: timestamp
    });
  }
  const generateCount = 1e3;
  if (existingCodes.size < generateCount) {
    const manufacturerIds = Array.from(manufacturerLookup.values());
    const manufacturerId = manufacturerIds.length > 0 ? manufacturerIds[0] : null;
    const prefixes = ["Amoxi", "Ceti", "Para", "Ibu", "Losar", "Omepra", "Salbu", "Metfor", "Amlodi", "Vitam", "Aspi", "Doxa", "Lisin", "Simva", "Azythro", "Cipro", "Flucon", "Gabapen", "Levothy", "Predni", "Cef", "Rosi", "Panto", "Enalo", "Clopido"];
    const suffixes = ["cillin", "rizine", "cetamol", "profen", "tan", "zole", "tamol", "min", "pine", "in C", "rin", "zosin", "pril", "statin", "mycin", "floxacin", "azole", "tin", "roxine", "sone", "roxime", "glitazone"];
    const dosages = ["5mg", "10mg", "20mg", "25mg", "50mg", "100mg", "200mg", "250mg", "500mg", "800mg", "1g"];
    const units = ["Tablet", "Capsule", "Syrup", "Suspension", "Injection", "Cream"];
    const brandNames = ["Pfizer", "GSK", "Unilab", "RiteMed", "Novartis", "Sanofi", "Bayer", "TGP", "Generic"];
    for (let i = 1; i <= generateCount; i++) {
      const pref = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suff = suffixes[Math.floor(Math.random() * suffixes.length)];
      const dose = dosages[Math.floor(Math.random() * dosages.length)];
      const unit = units[Math.floor(Math.random() * units.length)];
      const brand = brandNames[Math.floor(Math.random() * brandNames.length)];
      const code = `PRD-${(3e3 + i).toString()}`;
      if (existingCodes.has(code)) continue;
      const genericName = `${pref}${suff}`;
      const name = `${genericName} ${dose} ${unit} (${brand})`;
      const timestamp = nowIso();
      const basePrice = Math.floor(Math.random() * 500) + 50;
      const ppu = 100;
      const initialStockPieces = ppu * 5;
      const result = insertProduct.run({
        code,
        name,
        genericName,
        manufacturerId,
        brandType: brand === "Generic" ? "Generic" : "Branded",
        category: "Pharmaceutical",
        subCategory: "Over-the-Counter (OTC)",
        packagingUnit: "Box",
        baseUnit: "Tablet",
        piecesPerUnit: ppu,
        totalStockPieces: initialStockPieces,
        unitPriceCost: basePrice * 0.8,
        sellingPricePerUnit: basePrice,
        sellingPricePerPiece: basePrice / ppu * 1.5,
        discount: 0,
        salesCount: Math.floor(Math.random() * 100),
        status: "In Stock",
        createdAt: timestamp,
        updatedAt: timestamp
      });
      const productId = Number(result.lastInsertRowid);
      const batchResult = insertBatch.run({
        productId,
        batchCode: `BATCH-${code}-001`,
        lotNumber: `LOT${Math.floor(Math.random() * 9e4) + 1e4}`,
        manufacturingDate: "2025-01-10",
        expiryDate: "2027-01-10",
        stockPieces: initialStockPieces,
        receivedDate: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
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
  const existingPos = db.prepare("SELECT order_code FROM purchase_orders").all();
  const existingCodes = new Set(existingPos.map((p) => p.order_code));
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
      fax_email_remarks, noted_by, approved_by, qty_to_order, sys_gen, terms_days,
      pay_due_date, is_closed, is_locked, created_at, updated_at
    ) VALUES (
      @orderCode, @manufacturerId, @manufacturerName, @contactPerson, @total, @status,
      @etaDate, @placedDate, @priority, @orderedByUserId, @orderedByName, @remarks,
      @faxEmailRemarks, @notedBy, @approvedBy, @qtyToOrder, @sysGen, @termsDays,
      @payDueDate, @isClosed, @isLocked, @createdAt, @updatedAt
    )
  `);
  const insertItem = db.prepare(`
    INSERT INTO purchase_order_items (
      purchase_order_id, stock_name, order_unit, pkg_qty, quantity, unit_cost,
      disc_percent, net_ucost, ext_cost, recvd, pr_num, remarks
    ) VALUES (
      @purchaseOrderId, @stockName, @orderUnit, @pkgQty, @quantity, @unitCost,
      @discPercent, @netUcost, @extCost, @recvd, @prNum, @remarks
    )
  `);
  for (const order of SEED_PURCHASE_ORDERS) {
    if (existingCodes.has(order.orderCode)) continue;
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
  createManufacturer(data) {
    return this.manufacturersRepository.create(data);
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
  getAlerts() {
    return this.inventoryRepository.getAlerts();
  }
  create(input) {
    return this.inventoryRepository.create(input);
  }
  update(id, input) {
    return this.inventoryRepository.update(id, input);
  }
  remove(id) {
    this.inventoryRepository.remove(id);
  }
  setActive(id, isActive) {
    return this.inventoryRepository.setActive(id, isActive);
  }
  listBatches(productId) {
    return this.inventoryRepository.listBatches(productId);
  }
  receiveBatch(productId, batch) {
    this.inventoryRepository.receiveBatch(productId, batch);
  }
}
class OrdersService {
  constructor(ordersRepository) {
    this.ordersRepository = ordersRepository;
  }
  list(query) {
    return this.ordersRepository.list(query);
  }
  getItems(orderId) {
    return this.ordersRepository.getItems(orderId);
  }
  updateStatus(orderId, status) {
    this.ordersRepository.updateStatus(orderId, status);
  }
  save(input) {
    const { items, ...order } = input;
    this.ordersRepository.saveOrder(order, items);
  }
  delete(orderId) {
    this.ordersRepository.deleteOrder(orderId);
  }
}
class PosService {
  constructor(inventoryRepository, salesRepository) {
    this.inventoryRepository = inventoryRepository;
    this.salesRepository = salesRepository;
  }
  listCatalog(query) {
    return this.inventoryRepository.list({
      ...query,
      includeInactive: false,
      onlySellable: true
    });
  }
  checkout(payload) {
    if (!payload.items || payload.items.length === 0) {
      throw new Error("Cannot checkout with an empty cart");
    }
    if (payload.requiresPrescription) {
      if (!payload.doctorName || !payload.doctorLicense) {
        throw new Error("Doctor information is required for prescription items");
      }
    }
    this.salesRepository.createSale(payload);
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
class ChangeRequestService {
  constructor(changeRequestRepository, inventoryService) {
    this.changeRequestRepository = changeRequestRepository;
    this.inventoryService = inventoryService;
  }
  submit(input) {
    return this.changeRequestRepository.insert(input);
  }
  list(status) {
    return this.changeRequestRepository.listByStatus(status);
  }
  countPending() {
    return this.changeRequestRepository.countPending();
  }
  review(id, input) {
    const request = this.changeRequestRepository.getById(id);
    if (!request) throw new Error(`Change request ${id} not found`);
    if (request.status !== "PENDING") throw new Error(`Change request ${id} is already ${request.status}`);
    if (input.approved) {
      const payload = JSON.parse(request.payload);
      if (request.requestType === "CREATE") {
        this.inventoryService.create(payload);
      } else if (request.requestType === "UPDATE") {
        if (!request.productId) throw new Error("UPDATE request is missing productId");
        this.inventoryService.update(request.productId, payload);
      } else if (request.requestType === "DELETE") {
        const { productId } = payload;
        this.inventoryService.remove(productId);
      }
    }
    this.changeRequestRepository.markReviewed(id, input);
  }
}
class CustomersService {
  constructor(customersRepository) {
    this.customersRepository = customersRepository;
  }
  search(query) {
    if (!query.query || query.query.length < 2) return [];
    return this.customersRepository.search(query);
  }
  save(input) {
    return this.customersRepository.upsert(input);
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
          p.shelf_location AS shelfLocation,
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
  create(input) {
    this.validateProductInput(input);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const totalStockPieces = input.initialBatch ? input.initialBatch.stockPieces : input.totalStockPieces;
    const status = this.computeStatus(totalStockPieces, input.piecesPerUnit);
    const createTxn = this.db.transaction(() => {
      const manufacturerId = this.resolveManufacturerId(input.manufacturerName ?? null, timestamp);
      const insertProduct = this.db.prepare(`
        INSERT INTO products (
          code, name, generic_name, manufacturer_id, brand_type, category, sub_category,
          shelf_location, packaging_unit, base_unit, pieces_per_unit, total_stock_pieces, unit_price_cost,
          selling_price_per_unit, selling_price_per_piece, discount, is_active, sales_count,
          status, created_at, updated_at
        ) VALUES (
          @code, @name, @genericName, @manufacturerId, @brandType, @category, @subCategory,
          @shelfLocation, @packagingUnit, @baseUnit, @piecesPerUnit, @totalStockPieces, @unitPriceCost,
          @sellingPricePerUnit, @sellingPricePerPiece, @discount, @isActive, @salesCount,
          @status, @createdAt, @updatedAt
        )
      `);
      const productResult = insertProduct.run({
        code: input.code,
        name: input.name,
        genericName: input.genericName ?? null,
        manufacturerId,
        brandType: input.brandType,
        category: input.category,
        subCategory: input.subCategory,
        shelfLocation: input.shelfLocation ?? null,
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
        updatedAt: timestamp
      });
      const productId = Number(productResult.lastInsertRowid);
      if (input.initialBatch && input.initialBatch.stockPieces > 0) {
        const batchCode = `B-${productId}-${Date.now()}`;
        const insertBatch = this.db.prepare(`
          INSERT INTO product_batches (
            product_id, batch_code, lot_number, manufacturing_date, expiry_date,
            stock_pieces, received_date, is_active, created_at, updated_at
          ) VALUES (
            @productId, @batchCode, @lotNumber, @manufacturingDate, @expiryDate,
            @stockPieces, @receivedDate, 1, @createdAt, @updatedAt
          )
        `);
        const batchResult = insertBatch.run({
          productId,
          batchCode,
          lotNumber: input.initialBatch.lotNumber,
          manufacturingDate: input.initialBatch.manufacturingDate ?? null,
          expiryDate: input.initialBatch.expiryDate,
          stockPieces: input.initialBatch.stockPieces,
          receivedDate: input.initialBatch.receivedDate ?? timestamp.slice(0, 10),
          createdAt: timestamp,
          updatedAt: timestamp
        });
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
          reason: "Initial stock on product creation",
          createdAt: timestamp
        });
      }
      return productId;
    });
    const createdId = createTxn();
    return this.getById(createdId);
  }
  update(id, input) {
    this.validateProductInput(input);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const manufacturerId = this.resolveManufacturerId(input.manufacturerName ?? null, timestamp);
    const status = this.computeStatus(input.totalStockPieces, input.piecesPerUnit);
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
        shelf_location = @shelfLocation,
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
      shelfLocation: input.shelfLocation ?? null,
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
      updatedAt: timestamp
    });
    if (result.changes === 0) {
      throw new Error(`Product with ID ${id} was not found`);
    }
    return this.getById(id);
  }
  remove(id) {
    const salesItemRow = this.db.prepare("SELECT COUNT(*) AS count FROM sales_transaction_items WHERE product_id = ?").get(id);
    if (salesItemRow.count > 0) {
      throw new Error("Cannot delete product with sales history");
    }
    const removeTxn = this.db.transaction(() => {
      this.db.prepare("DELETE FROM inventory_movements WHERE product_id = ?").run(id);
      this.db.prepare("DELETE FROM product_batches WHERE product_id = ?").run(id);
      const result = this.db.prepare("DELETE FROM products WHERE id = ?").run(id);
      if (result.changes === 0) {
        throw new Error(`Product with ID ${id} was not found`);
      }
    });
    removeTxn();
  }
  setActive(id, isActive) {
    const existing = this.getById(id);
    const status = this.computeStatus(existing.totalStockPieces, existing.piecesPerUnit);
    const result = this.db.prepare(`
      UPDATE products
      SET is_active = @isActive, status = @status, updated_at = @updatedAt
      WHERE id = @id
    `).run({
      id,
      isActive: isActive ? 1 : 0,
      status,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (result.changes === 0) {
      throw new Error(`Product with ID ${id} was not found`);
    }
    return this.getById(id);
  }
  listBatches(productId) {
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
    `).all({ productId });
    return rows.map((row) => ({ ...row, isActive: Boolean(row.isActive) }));
  }
  getById(id) {
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
    `).get({ id });
    if (!row) {
      throw new Error(`Product with ID ${id} was not found`);
    }
    return this.mapProduct(row);
  }
  resolveManufacturerId(manufacturerName, timestamp) {
    const normalizedName = manufacturerName == null ? void 0 : manufacturerName.trim();
    if (!normalizedName) {
      return null;
    }
    const existing = this.db.prepare("SELECT id FROM manufacturers WHERE lower(name) = lower(?) LIMIT 1").get(normalizedName);
    if (existing) {
      return existing.id;
    }
    this.db.prepare(`
      INSERT INTO manufacturers (name, contact_person, email, phone, category, address, is_active, created_at, updated_at)
      VALUES (@name, NULL, NULL, NULL, NULL, NULL, 1, @createdAt, @updatedAt)
    `).run({
      name: normalizedName,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    const created = this.db.prepare("SELECT id FROM manufacturers WHERE lower(name) = lower(?) LIMIT 1").get(normalizedName);
    if (!created) {
      throw new Error("Failed to resolve manufacturer");
    }
    return created.id;
  }
  computeStatus(totalStockPieces, piecesPerUnit) {
    if (totalStockPieces <= 0) {
      return "Out of Stock";
    }
    if (totalStockPieces <= piecesPerUnit) {
      return "Low Stock";
    }
    return "In Stock";
  }
  validateProductInput(input) {
    if (!input.code.trim()) {
      throw new Error("Product code is required");
    }
    if (!input.name.trim()) {
      throw new Error("Product name is required");
    }
    if (!input.packagingUnit.trim() || !input.baseUnit.trim()) {
      throw new Error("Packaging and base units are required");
    }
    if (!Number.isInteger(input.piecesPerUnit) || input.piecesPerUnit < 1) {
      throw new Error("Pieces per unit must be a positive integer");
    }
    if (!Number.isFinite(input.totalStockPieces) || input.totalStockPieces < 0) {
      throw new Error("Total stock must be zero or positive");
    }
    if (!Number.isFinite(input.unitPriceCost) || input.unitPriceCost < 0) {
      throw new Error("Cost price must be zero or positive");
    }
    if (!Number.isFinite(input.sellingPricePerUnit) || input.sellingPricePerUnit < 0) {
      throw new Error("Selling price per unit must be zero or positive");
    }
    if (!Number.isFinite(input.sellingPricePerPiece) || input.sellingPricePerPiece < 0) {
      throw new Error("Selling price per piece must be zero or positive");
    }
    if (input.discount !== null && input.discount !== void 0) {
      if (!Number.isFinite(input.discount) || input.discount < 0 || input.discount > 100) {
        throw new Error("Discount must be between 0 and 100");
      }
    }
    if ("initialBatch" in input && input.initialBatch) {
      if (!input.initialBatch.lotNumber.trim()) {
        throw new Error("Initial batch lot number is required");
      }
      if (!input.initialBatch.expiryDate.trim()) {
        throw new Error("Initial batch expiry date is required");
      }
      if (!Number.isFinite(input.initialBatch.stockPieces) || input.initialBatch.stockPieces < 0) {
        throw new Error("Initial batch stock must be zero or positive");
      }
    }
  }
  mapProduct(row) {
    return {
      ...row,
      isActive: Boolean(row.isActive)
    };
  }
  getAlerts() {
    const needsRestockRows = this.db.prepare(`
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
          p.shelf_location AS shelfLocation,
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
      `).all();
    const expiringSoonRows = this.db.prepare(`
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
          p.shelf_location AS shelfLocation,
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
      `).all();
    const pendingReceiptRows = this.db.prepare(`
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
          p.shelf_location AS shelfLocation,
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
      `).all();
    return {
      needsRestock: needsRestockRows.map((row) => this.mapProduct(row)),
      expiringSoon: expiringSoonRows.map((row) => this.mapProduct(row)),
      pendingReceipt: pendingReceiptRows.map((row) => this.mapProduct(row))
    };
  }
  receiveBatch(productId, batch) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const receiveTxn = this.db.transaction(() => {
      const product = this.db.prepare("SELECT id, pieces_per_unit, total_stock_pieces FROM products WHERE id = ?").get(productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      const batchCode = `B-${productId}-${Date.now()}`;
      const insertBatch = this.db.prepare(`
        INSERT INTO product_batches (
          product_id, batch_code, lot_number, manufacturing_date, expiry_date,
          stock_pieces, received_date, is_active, created_at, updated_at
        ) VALUES (
          @productId, @batchCode, @lotNumber, @manufacturingDate, @expiryDate,
          @stockPieces, @receivedDate, 1, @createdAt, @updatedAt
        )
      `);
      const batchResult = insertBatch.run({
        productId,
        batchCode,
        lotNumber: batch.lotNumber,
        manufacturingDate: batch.manufacturingDate ?? null,
        expiryDate: batch.expiryDate,
        stockPieces: batch.stockPieces,
        receivedDate: batch.receivedDate ?? timestamp.slice(0, 10),
        createdAt: timestamp,
        updatedAt: timestamp
      });
      const batchId = Number(batchResult.lastInsertRowid);
      const newTotalStock = product.total_stock_pieces + batch.stockPieces;
      const newStatus = this.computeStatus(newTotalStock, product.pieces_per_unit);
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
        updatedAt: timestamp
      });
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
        createdAt: timestamp
      });
    });
    receiveTxn();
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
  create(data) {
    const stmt = this.db.prepare(`
      INSERT INTO manufacturers (name, contact_person, email, phone, category, address, is_active, remarks)
      VALUES (@name, @contactPerson, @email, @phone, @category, @address, @isActive, @remarks)
    `);
    const res = stmt.run({
      name: data.name,
      contactPerson: data.contactPerson,
      email: data.email || null,
      phone: data.phone || null,
      category: data.category || "Supplier",
      address: data.address || null,
      isActive: data.isActive === false ? 0 : 1,
      remarks: data.remarks || null
    });
    return res.lastInsertRowid;
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
          WHERE poi.purchase_order_id = po.id AND poi.stock_name LIKE @search ESCAPE '\\'
        )
      )`);
    }
    if (query == null ? void 0 : query.period) {
      params.period = `${query.period}%`;
      whereClauses.push("po.placed_date LIKE @period");
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
  updateStatus(orderId, status) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const result = this.db.prepare("UPDATE purchase_orders SET status = @status, updated_at = @updatedAt WHERE id = @id").run({ id: orderId, status, updatedAt: timestamp });
    if (result.changes === 0) {
      throw new Error(`Purchase order with ID ${orderId} not found`);
    }
  }
  getItems(orderId) {
    return this.db.prepare(
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
    ).all({ orderId });
  }
  saveOrder(order, items) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    this.db.transaction(() => {
      let orderId = order.id;
      if (orderId) {
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
        });
        this.db.prepare("DELETE FROM purchase_order_items WHERE purchase_order_id = ?").run(orderId);
      } else {
        let orderCode = order.orderCode;
        if (!orderCode) {
          const year = (/* @__PURE__ */ new Date()).getFullYear();
          const ms = Date.now().toString().slice(-6);
          orderCode = `PO-${year}-${ms}`;
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
          placedDate: order.placedDate || timestamp.split("T")[0],
          createdAt: timestamp,
          updatedAt: timestamp
        });
        orderId = result.lastInsertRowid;
      }
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
      `);
      for (const item of items) {
        insertItem.run({
          ...item,
          purchaseOrderId: orderId,
          recvd: item.recvd || 0,
          pkgQty: item.pkgQty || 1
        });
      }
    })();
  }
  deleteOrder(orderId) {
    this.db.transaction(() => {
      this.db.prepare("DELETE FROM purchase_order_items WHERE purchase_order_id = ?").run(orderId);
      const result = this.db.prepare("DELETE FROM purchase_orders WHERE id = ?").run(orderId);
      if (result.changes === 0) {
        throw new Error(`Purchase order with ID ${orderId} not found`);
      }
    })();
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
class SalesRepository {
  constructor(db) {
    this.db = db;
  }
  createSale(payload) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const txn = this.db.transaction(() => {
      const txnCode = `TXN-${Date.now()}`;
      const insertSalesTxn = this.db.prepare(`
        INSERT INTO sales_transactions (
          transaction_code, cashier_user_id, customer_name, subtotal, discount_type,
          discount_value, discount_amount, total, cash_tendered, change_amount,
          payment_status, requires_prescription, doctor_name, doctor_license, created_at
        ) VALUES (
          @txnCode, @cashierUserId, @customerName, @subtotal, @discountType,
          @discountValue, @discountAmount, @total, @cashTendered, @changeAmount,
          'COMPLETED', @requiresPrescription, @doctorName, @doctorLicense, @createdAt
        )
      `);
      const salesResult = insertSalesTxn.run({
        txnCode,
        cashierUserId: payload.cashierUserId ?? null,
        customerName: payload.customerName ?? null,
        subtotal: payload.subtotal,
        discountType: payload.discountType ?? null,
        discountValue: payload.discountValue ?? null,
        discountAmount: payload.discountAmount,
        total: payload.total,
        cashTendered: payload.cashTendered,
        changeAmount: payload.changeAmount,
        requiresPrescription: payload.requiresPrescription ? 1 : 0,
        doctorName: payload.doctorName ?? null,
        doctorLicense: payload.doctorLicense ?? null,
        createdAt: timestamp
      });
      const salesTxnId = Number(salesResult.lastInsertRowid);
      const insertPayment = this.db.prepare(`
        INSERT INTO payments (
          sales_transaction_id, method, amount, received_by_user_id, created_at
        ) VALUES (
          @salesTxnId, @method, @amount, @receivedByUserId, @createdAt
        )
      `);
      insertPayment.run({
        salesTxnId,
        method: payload.paymentMethod,
        amount: payload.total,
        // Store the actual amount paid for the sale
        receivedByUserId: payload.cashierUserId ?? null,
        createdAt: timestamp
      });
      const insertItem = this.db.prepare(`
        INSERT INTO sales_transaction_items (
          sales_transaction_id, product_id, product_batch_id, product_name,
          lot_number, expiry_date, quantity, sell_by_piece, unit_label,
          unit_price, discount_amount, line_total, created_at
        ) VALUES (
          @salesTxnId, @productId, @productBatchId, @productName,
          @lotNumber, @expiryDate, @quantity, @sellByPiece, @unitLabel,
          @unitPrice, @discountAmount, @lineTotal, @createdAt
        )
      `);
      const updateBatch = this.db.prepare(`
        UPDATE product_batches 
        SET stock_pieces = stock_pieces - @pieces, updated_at = @updatedAt
        WHERE id = @batchId
      `);
      const updateProduct = this.db.prepare(`
        UPDATE products
        SET total_stock_pieces = total_stock_pieces - @pieces, sales_count = sales_count + @quantity, updated_at = @updatedAt
        WHERE id = @productId
      `);
      const insertMovement = this.db.prepare(`
        INSERT INTO inventory_movements (
          product_id, product_batch_id, movement_type, quantity_pieces, reference_type,
          reference_id, reason, performed_by_user_id, created_at
        ) VALUES (
          @productId, @productBatchId, 'SALE', @pieces, 'SALES_TRANSACTION',
          @referenceId, 'Sold via POS', @userId, @createdAt
        )
      `);
      for (const item of payload.items) {
        insertItem.run({
          salesTxnId,
          productId: item.productId,
          productBatchId: item.productBatchId ?? null,
          productName: item.productName,
          lotNumber: item.lotNumber ?? null,
          expiryDate: item.expiryDate ?? null,
          quantity: item.quantity,
          sellByPiece: item.sellByPiece ? 1 : 0,
          unitLabel: item.unitLabel,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          lineTotal: item.lineTotal,
          createdAt: timestamp
        });
        if (item.productBatchId) {
          const p = this.db.prepare("SELECT pieces_per_unit FROM products WHERE id = ?").get(item.productId);
          const pieces = item.sellByPiece ? item.quantity : item.quantity * p.pieces_per_unit;
          updateBatch.run({ pieces, updatedAt: timestamp, batchId: item.productBatchId });
          updateProduct.run({ pieces, quantity: item.quantity, updatedAt: timestamp, productId: item.productId });
          insertMovement.run({
            productId: item.productId,
            productBatchId: item.productBatchId,
            pieces,
            // Positive value for quantity
            referenceId: txnCode,
            userId: payload.cashierUserId ?? null,
            createdAt: timestamp
          });
          const updatedP = this.db.prepare("SELECT total_stock_pieces, pieces_per_unit FROM products WHERE id = ?").get(item.productId);
          let status = "In Stock";
          if (updatedP.total_stock_pieces <= 0) status = "Out of Stock";
          else if (updatedP.total_stock_pieces <= updatedP.pieces_per_unit) status = "Low Stock";
          this.db.prepare("UPDATE products SET status = ? WHERE id = ?").run(status, item.productId);
        }
      }
    });
    txn();
  }
}
function mapRow$1(row) {
  return {
    id: row.id,
    requestType: row.request_type,
    status: row.status,
    productId: row.product_id,
    payload: row.payload,
    submittedByName: row.submitted_by_name,
    submittedAt: row.submitted_at,
    reviewedByName: row.reviewed_by_name,
    reviewedAt: row.reviewed_at,
    reviewerNote: row.reviewer_note
  };
}
class ChangeRequestRepository {
  constructor(db) {
    this.db = db;
  }
  insert(input) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const result = this.db.prepare(`
      INSERT INTO inventory_change_requests
        (request_type, status, product_id, payload, submitted_by_name, submitted_at)
      VALUES
        (@requestType, 'PENDING', @productId, @payload, @submittedByName, @submittedAt)
    `).run({
      requestType: input.requestType,
      productId: input.productId ?? null,
      payload: JSON.stringify(input.payload),
      submittedByName: input.submittedByName ?? null,
      submittedAt: now
    });
    return this.getById(Number(result.lastInsertRowid));
  }
  listByStatus(status) {
    const rows = status ? this.db.prepare(
      "SELECT * FROM inventory_change_requests WHERE status = ? ORDER BY submitted_at DESC"
    ).all(status) : this.db.prepare(
      "SELECT * FROM inventory_change_requests ORDER BY submitted_at DESC"
    ).all();
    return rows.map(mapRow$1);
  }
  getById(id) {
    const row = this.db.prepare(
      "SELECT * FROM inventory_change_requests WHERE id = ?"
    ).get(id);
    return row ? mapRow$1(row) : null;
  }
  markReviewed(id, input) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE inventory_change_requests
      SET status = @status,
          reviewed_by_name = @reviewedByName,
          reviewed_at = @reviewedAt,
          reviewer_note = @reviewerNote
      WHERE id = @id
    `).run({
      id,
      status: input.approved ? "APPROVED" : "REJECTED",
      reviewedByName: input.reviewedByName ?? null,
      reviewedAt: now,
      reviewerNote: input.reviewerNote ?? null
    });
  }
  countPending() {
    const row = this.db.prepare(
      "SELECT COUNT(*) AS count FROM inventory_change_requests WHERE status = 'PENDING'"
    ).get();
    return row.count;
  }
}
function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    idType: row.id_type,
    idNumber: row.id_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
class CustomersRepository {
  constructor(db) {
    this.db = db;
  }
  search(query) {
    const searchParam = `%${query.query}%`;
    let sql = `
      SELECT * FROM customers 
      WHERE (name LIKE @search OR id_number LIKE @search)
    `;
    const params = { search: searchParam };
    if (query.idType) {
      sql += ` AND id_type = @idType`;
      params.idType = query.idType;
    }
    sql += ` ORDER BY name ASC LIMIT 10`;
    const rows = this.db.prepare(sql).all(params);
    return rows.map(mapRow);
  }
  upsert(input) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
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
      now
    });
    const row = this.db.prepare(`SELECT * FROM customers WHERE id_number = ?`).get(input.idNumber);
    return mapRow(row);
  }
}
function createAppServices(databaseManager2) {
  const inventoryRepository = new InventoryRepository(databaseManager2.db);
  const usersRepository = new UsersRepository(databaseManager2.db);
  const manufacturersRepository = new ManufacturersRepository(databaseManager2.db);
  const ordersRepository = new OrdersRepository(databaseManager2.db);
  const settingsRepository = new SettingsRepository(databaseManager2.db);
  const salesRepository = new SalesRepository(databaseManager2.db);
  const changeRequestRepository = new ChangeRequestRepository(databaseManager2.db);
  const customersRepository = new CustomersRepository(databaseManager2.db);
  const systemRepository = new SystemRepository(
    databaseManager2.db,
    databaseManager2.dbPath,
    databaseManager2.backupDir,
    databaseManager2.getAppliedMigrationCount()
  );
  const inventoryService = new InventoryService(inventoryRepository);
  return {
    systemService: new SystemService(systemRepository),
    inventoryService,
    posService: new PosService(inventoryRepository, salesRepository),
    ordersService: new OrdersService(ordersRepository),
    adminService: new AdminService(usersRepository, manufacturersRepository),
    settingsService: new SettingsService(settingsRepository),
    changeRequestService: new ChangeRequestService(changeRequestRepository, inventoryService),
    customersService: new CustomersService(customersRepository)
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
  registerHandler("inventory:getAlerts", () => services.inventoryService.getAlerts());
  registerHandler("inventory:create", (payload) => services.inventoryService.create(payload));
  registerHandler(
    "inventory:update",
    ({ id, payload }) => services.inventoryService.update(id, payload)
  );
  registerHandler("inventory:remove", (id) => services.inventoryService.remove(id));
  registerHandler(
    "inventory:setActive",
    ({ id, isActive }) => services.inventoryService.setActive(id, isActive)
  );
  registerHandler("inventory:listBatches", (productId) => services.inventoryService.listBatches(productId));
  registerHandler(
    "inventory:receiveBatch",
    ({ productId, batch }) => services.inventoryService.receiveBatch(productId, batch)
  );
  registerHandler("pos:listCatalog", (query) => services.posService.listCatalog(query));
  registerHandler("pos:checkout", (payload) => services.posService.checkout(payload));
  registerHandler("pos:searchCustomers", (query) => services.customersService.search(query));
  registerHandler("pos:saveCustomer", (input) => services.customersService.save(input));
  registerHandler("orders:list", (query) => services.ordersService.list(query));
  registerHandler("orders:getItems", (orderId) => services.ordersService.getItems(orderId));
  registerHandler(
    "orders:updateStatus",
    ({ orderId, status }) => services.ordersService.updateStatus(orderId, status)
  );
  registerHandler("orders:save", (payload) => services.ordersService.save(payload));
  registerHandler("orders:delete", (orderId) => services.ordersService.delete(orderId));
  registerHandler("admin:listUsers", (query) => services.adminService.listUsers(query));
  registerHandler("admin:listManufacturers", () => services.adminService.listManufacturers());
  registerHandler("admin:createManufacturer", (payload) => services.adminService.createManufacturer(payload));
  registerHandler("settings:getReceiptSettings", () => services.settingsService.getReceiptSettings());
  registerHandler(
    "inventory:submitChangeRequest",
    (input) => services.changeRequestService.submit(input)
  );
  registerHandler(
    "inventory:listChangeRequests",
    (status) => services.changeRequestService.list(status)
  );
  registerHandler(
    "inventory:reviewChangeRequest",
    ({ id, input }) => services.changeRequestService.review(id, input)
  );
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let splash = null;
let databaseManager = null;
Menu.setApplicationMenu(null);
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "BotikaPlus",
    icon: path.join(process.env.APP_ROOT, "frontend", "assets", "logos", "logo.png"),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.maximize();
  win.setMenuBarVisibility(false);
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
function createSplashWindow() {
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    icon: path.join(process.env.APP_ROOT, "frontend", "assets", "logos", "logo.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  const splashPath = path.join(process.env.VITE_PUBLIC, "splash.html");
  splash.loadFile(splashPath);
  splash.once("ready-to-show", () => {
    splash == null ? void 0 : splash.show();
  });
}
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function bootstrapApplication() {
  createSplashWindow();
  await sleep(100);
  if (splash) {
    splash.webContents.executeJavaScript(`window.updateStatus && window.updateStatus("Initializing database...")`).catch(() => {
    });
  }
  await sleep(50);
  databaseManager = DatabaseManager.bootstrap(app);
  if (splash) {
    splash.webContents.executeJavaScript(`window.updateStatus && window.updateStatus("Optimizing performance...")`).catch(() => {
    });
  }
  await sleep(50);
  const services = createAppServices(databaseManager);
  registerIpcHandlers(services);
  if (splash) {
    splash.webContents.executeJavaScript(`window.updateStatus && window.updateStatus("Starting application UI...")`).catch(() => {
    });
  }
  await sleep(50);
  createWindow();
  if (win) {
    win.once("ready-to-show", () => {
      if (splash) {
        splash.close();
        splash = null;
      }
      win == null ? void 0 : win.show();
      win == null ? void 0 : win.maximize();
    });
  }
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
app.on("web-contents-created", (_event, contents) => {
  contents.on("preload-error", (_e, preloadPath, error) => {
    console.error(`
[CRITICAL ERROR] Preload script failed: ${preloadPath}`);
    console.error(error);
  });
});
app.whenReady().then(bootstrapApplication);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
