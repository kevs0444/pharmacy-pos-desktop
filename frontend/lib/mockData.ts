// ─────────────────────────────────────────────────────────────────────────────
// PHARMACY INVENTORY DATA MODEL
// Supports FEFO (First Expired, First Out) — the FDA-required pharmacy standard.
//
// Each product maintains a `batches[]` array. Every delivery creates a new batch
// with its own Lot Number, Mfg Date, and Expiry Date. Stock is tracked per batch.
// When selling, the system automatically picks the earliest-expiring batch first.
//
// Phase 2: Replace array state with SQLite queries like:
//   SELECT * FROM product_batches WHERE product_id = ? ORDER BY expiry_date ASC
// ─────────────────────────────────────────────────────────────────────────────

export type BrandType = "Branded" | "Generic" | "Others";
export type ProductCategory =
  | "Medicine"
  | "Vitamins & Supplements"
  | "Medical Devices"
  | "Medical Supplies"
  | "Personal Care"
  | "Baby & Mom";
export type ProductSubCategory =
  | "Prescription (Rx)"
  | "OTC"
  | "Herbal & Traditional"
  | "Skincare"
  | "Haircare"
  | "Dental"
  | "None";

// ─── Batch / Lot ───────────────────────────────────────────────────────────
export interface ProductBatch {
  batchId: string;          // Internal unique ID e.g. "AMX-B001"
  lotNumber: string;        // Manufacturer's lot/batch number
  manufacturingDate: string; // ISO "2026-01-15"
  expiryDate: string;       // ISO "2026-08-31" — drives FEFO ordering
  stockPieces: number;      // Remaining pieces in THIS batch
  receivedDate: string;     // When we received this delivery
}

// ─── Product (Master Record) ──────────────────────────────────────────────
export interface InventoryItem {
  id: number;
  code: string;             // Barcode / SKU
  name: string;
  genericName?: string;
  manufacturer?: string;
  brandType: BrandType;
  category: ProductCategory;
  subCategory: ProductSubCategory;

  // Packaging Hierarchy
  packagingUnit: string;    // "Box", "Bottle", "Pack", "Tube"
  baseUnit: string;         // "Tablet", "Capsule", "ml", "Piece"
  piecesPerUnit: number;    // How many base units fit in one packaging unit

  // Stock — computed from batches; kept for backward compat / quick reads
  totalStockPieces: number; // = sum of all batch.stockPieces

  // Pricing
  unitPriceCost: number;       // Cost to us per packagingUnit
  sellingPricePerUnit: number; // Retail price per packagingUnit
  sellingPricePerPiece: number; // Retail price per baseUnit
  discount?: number;            // Product-level discount %

  // Batch tracking (FEFO)
  batches: ProductBatch[];      // Sorted by expiryDate ASC (FEFO-ready)

  // Availability
  isActive: boolean;            // false = hidden from POS, visible in Inventory as "Disabled"

  status: string;               // Derived: "Good" | "Moderate" | "Critical"
  salesCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FEFO HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Returns today as ISO string "YYYY-MM-DD" */
export function today(): string {
  return new Date().toISOString().split("T")[0];
}

/** Days until expiry from today. Negative = already expired. */
export function daysUntilExpiry(expiryDate: string): number {
  const exp = new Date(expiryDate).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((exp - now) / (1000 * 60 * 60 * 24));
}

/** Active batches with stock > 0, sorted by expiryDate ASC (FEFO order). */
export function getActiveBatches(item: InventoryItem): ProductBatch[] {
  return [...item.batches]
    .filter(b => b.stockPieces > 0)
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
}

/** The batch to sell from next — earliest expiry with stock (FEFO). */
export function getNextBatch(item: InventoryItem): ProductBatch | null {
  return getActiveBatches(item)[0] ?? null;
}

/** Batches expiring within `days` days. Returns sorted by expiry ASC. */
export function getNearExpiryBatches(item: InventoryItem, days = 90): ProductBatch[] {
  return getActiveBatches(item).filter(b => daysUntilExpiry(b.expiryDate) <= days);
}

/** Classify expiry urgency from earliest active batch. */
export function getExpiryStatus(item: InventoryItem): "expired" | "critical" | "warning" | "ok" | "none" {
  const next = getNextBatch(item);
  if (!next) return "none";
  const d = daysUntilExpiry(next.expiryDate);
  if (d < 0)   return "expired";
  if (d <= 30)  return "critical";
  if (d <= 90)  return "warning";
  return "ok";
}

/**
 * Simulate FEFO deduction across batches (pure function for UI preview).
 * Returns updated batches array after deducting `pieces` using FEFO.
 */
export function deductFEFO(item: InventoryItem, pieces: number): ProductBatch[] {
  const sorted = getActiveBatches(item);
  let remaining = pieces;
  const updated = item.batches.map(b => ({ ...b }));

  for (const batch of sorted) {
    if (remaining <= 0) break;
    const target = updated.find(b => b.batchId === batch.batchId)!;
    const deduct = Math.min(target.stockPieces, remaining);
    target.stockPieces -= deduct;
    remaining -= deduct;
  }

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATABASE (Phase 1 — will be replaced by SQLite in Phase 2)
// ─────────────────────────────────────────────────────────────────────────────

export const INVENTORY_DB: InventoryItem[] = [
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
    unitPriceCost: 400.00,
    sellingPricePerUnit: 550.00,
    sellingPricePerPiece: 6.00,
    salesCount: 1450,
    status: "Good",
    isActive: true,
    batches: [
      { batchId: "AMX-B001", lotNumber: "LOT-2024-AMX-01", manufacturingDate: "2024-02-01", expiryDate: "2026-02-28", stockPieces: 15, receivedDate: "2024-02-10" },
      { batchId: "AMX-B002", lotNumber: "LOT-2025-AMX-02", manufacturingDate: "2025-01-15", expiryDate: "2027-01-14", stockPieces: 100, receivedDate: "2025-01-20" },
      { batchId: "AMX-B003", lotNumber: "LOT-2025-AMX-03", manufacturingDate: "2025-08-01", expiryDate: "2027-07-31", stockPieces: 100, receivedDate: "2025-08-05" },
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
    unitPriceCost: 200.00,
    sellingPricePerUnit: 350.00,
    sellingPricePerPiece: 4.00,
    discount: 10,
    salesCount: 890,
    status: "Good",
    isActive: true,
    batches: [
      { batchId: "VTC-B001", lotNumber: "VTC-LOT-2025-01", manufacturingDate: "2025-01-10", expiryDate: "2027-01-09", stockPieces: 250, receivedDate: "2025-01-15" },
      { batchId: "VTC-B002", lotNumber: "VTC-LOT-2025-02", manufacturingDate: "2025-06-01", expiryDate: "2027-05-31", stockPieces: 200, receivedDate: "2025-06-05" },
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
    unitPriceCost: 150.00,
    sellingPricePerUnit: 250.00,
    sellingPricePerPiece: 3.00,
    salesCount: 2100,
    status: "Critical",
    isActive: true,
    batches: [
      // Only partial batch left — near expiry
      { batchId: "PCM-B001", lotNumber: "PCM-LOT-2024-03", manufacturingDate: "2024-03-01", expiryDate: "2026-03-31", stockPieces: 10, receivedDate: "2024-03-05" },
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
    unitPriceCost: 100.00,
    sellingPricePerUnit: 180.00,
    sellingPricePerPiece: 5.00,
    salesCount: 1200,
    status: "Good",
    isActive: true,
    batches: [
      { batchId: "CTZ-B001", lotNumber: "CTZ-2025-01", manufacturingDate: "2025-02-01", expiryDate: "2027-01-31", stockPieces: 150, receivedDate: "2025-02-10" },
      { batchId: "CTZ-B002", lotNumber: "CTZ-2025-02", manufacturingDate: "2025-09-01", expiryDate: "2027-08-31", stockPieces: 130, receivedDate: "2025-09-10" },
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
    unitPriceCost: 150.00,
    sellingPricePerUnit: 220.00,
    sellingPricePerPiece: 220.00,
    salesCount: 450,
    status: "Good",
    isActive: true,
    batches: [
      { batchId: "SNS-B001", lotNumber: "SNS-2025-01", manufacturingDate: "2025-03-01", expiryDate: "2027-02-28", stockPieces: 26, receivedDate: "2025-03-10" },
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
    unitPriceCost: 120.00,
    sellingPricePerUnit: 180.00,
    sellingPricePerPiece: 180.00,
    salesCount: 520,
    status: "Moderate",
    isActive: true,
    batches: [
      { batchId: "CSY-B001", lotNumber: "CSY-2026-01", manufacturingDate: "2026-01-01", expiryDate: "2026-06-30", stockPieces: 8, receivedDate: "2026-01-05" }, // ⚠️ Near expiry!
      { batchId: "CSY-B002", lotNumber: "CSY-2026-02", manufacturingDate: "2026-02-01", expiryDate: "2027-01-31", stockPieces: 11, receivedDate: "2026-02-10" },
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
    unitPriceCost: 300.00,
    sellingPricePerUnit: 500.00,
    sellingPricePerPiece: 10.00,
    discount: 20,
    salesCount: 670,
    status: "Good",
    isActive: true,
    batches: [
      { batchId: "CAL-B001", lotNumber: "CAL-2025-01", manufacturingDate: "2025-01-01", expiryDate: "2027-12-31", stockPieces: 180, receivedDate: "2025-01-10" },
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
    unitPriceCost: 500.00,
    sellingPricePerUnit: 800.00,
    sellingPricePerPiece: 10.00,
    salesCount: 950,
    status: "Moderate",
    isActive: true,
    batches: [
      { batchId: "LST-B001", lotNumber: "LST-2025-01", manufacturingDate: "2025-03-01", expiryDate: "2027-02-28", stockPieces: 15, receivedDate: "2025-03-05" },
      { batchId: "LST-B002", lotNumber: "LST-2025-02", manufacturingDate: "2025-07-01", expiryDate: "2027-06-30", stockPieces: 100, receivedDate: "2025-07-10" },
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
    unitPriceCost: 150.00,
    sellingPricePerUnit: 250.00,
    sellingPricePerPiece: 250.00,
    salesCount: 150,
    status: "Moderate",
    isActive: true,
    batches: [
      { batchId: "THM-B001", lotNumber: "THM-2025-01", manufacturingDate: "2025-01-01", expiryDate: "2030-01-01", stockPieces: 12, receivedDate: "2025-01-15" },
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
    unitPriceCost: 180.00,
    sellingPricePerUnit: 320.00,
    sellingPricePerPiece: 320.00,
    salesCount: 310,
    status: "Good",
    isActive: true,
    batches: [
      { batchId: "KTO-B001", lotNumber: "KTO-2025-01", manufacturingDate: "2025-02-01", expiryDate: "2027-01-31", stockPieces: 45, receivedDate: "2025-02-05" },
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
    unitPriceCost: 50.00,
    sellingPricePerUnit: 85.00,
    sellingPricePerPiece: 85.00,
    salesCount: 880,
    status: "Good",
    isActive: true,
    batches: [
      { batchId: "BWP-B001", lotNumber: "BWP-2025-01", manufacturingDate: "2025-04-01", expiryDate: "2027-03-31", stockPieces: 110, receivedDate: "2025-04-10" },
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
    unitPriceCost: 200.00,
    sellingPricePerUnit: 400.00,
    sellingPricePerPiece: 5.00,
    salesCount: 1800,
    status: "Moderate",
    isActive: true,
    batches: [
      { batchId: "IBU-B001", lotNumber: "IBU-2025-01", manufacturingDate: "2025-05-01", expiryDate: "2027-04-30", stockPieces: 50, receivedDate: "2025-05-05" },
    ]
  },
];
