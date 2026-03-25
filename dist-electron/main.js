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
  updateStatus(orderId, status) {
    this.ordersRepository.updateStatus(orderId, status);
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
  updateStatus(orderId, status) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const result = this.db.prepare("UPDATE purchase_orders SET status = @status, updated_at = @updatedAt WHERE id = @id").run({ id: orderId, status, updatedAt: timestamp });
    if (result.changes === 0) {
      throw new Error(`Purchase order with ID ${orderId} not found`);
    }
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
  registerHandler("orders:list", (query) => services.ordersService.list(query));
  registerHandler(
    "orders:updateStatus",
    ({ orderId, status }) => services.ordersService.updateStatus(orderId, status)
  );
  registerHandler("admin:listUsers", (query) => services.adminService.listUsers(query));
  registerHandler("admin:listManufacturers", () => services.adminService.listManufacturers());
  registerHandler("admin:createManufacturer", (payload) => services.adminService.createManufacturer(payload));
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
      preload: path.join(__dirname$1, "preload.cjs"),
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
