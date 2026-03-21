export type BrandType = "Branded" | "Generic" | "Others";
export type ProductCategory = "Medicine" | "Vitamins & Supplements" | "Medical Devices" | "Personal Care" | "Baby & Mom" | "Medical Supplies";
export type ProductSubCategory = "Prescription (Rx)" | "OTC" | "Herbal & Traditional" | "Skincare" | "Haircare" | "Dental" | "None";

export interface InventoryItem {
  id: number;
  code: string;
  name: string; 
  genericName?: string; 
  manufacturer?: string; 
  brandType: BrandType;
  category: ProductCategory;
  subCategory: ProductSubCategory;
  
  // Packaging Hierarchy
  packagingUnit: string; // e.g., "Box", "Bottle", "Tube", "Pack"
  baseUnit: string; // e.g., "Tablet", "Capsule", "ml", "g", "Piece"
  piecesPerUnit: number; // e.g., 100 for tablets in a box, 1 for a bottle of syrup
  
  // Financials & Stock tracking (Tracked by total base units)
  totalStockPieces: number; // e.g., 125 tablets (renders as 1 Box, 25 Tablets)
  unitPriceCost: number; // Cost to store per packagingUnit
  sellingPricePerUnit: number; // Selling price per full packagingUnit
  sellingPricePerPiece: number; // Selling price per single baseUnit
  
  discount?: number;
  status: string;
  expiryDate?: string;
  salesCount: number; 
}

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
    totalStockPieces: 215, // 2 Boxes, 15 Caps
    unitPriceCost: 400.00, 
    sellingPricePerUnit: 550.00,
    sellingPricePerPiece: 6.00, 
    status: "Good",
    salesCount: 1450
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
    totalStockPieces: 450, // 4 Boxes, 50 Tabs
    unitPriceCost: 200.00, 
    sellingPricePerUnit: 350.00,
    sellingPricePerPiece: 4.00,
    discount: 10,
    status: "Good",
    salesCount: 890
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
    totalStockPieces: 10, // 10 Tabs (Out of boxes)
    unitPriceCost: 150.00, 
    sellingPricePerUnit: 250.00, 
    sellingPricePerPiece: 3.00, 
    status: "Critical",
    salesCount: 2100
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
    totalStockPieces: 280, // 5 Boxes, 30 Tabs
    unitPriceCost: 100.00, 
    sellingPricePerUnit: 180.00, 
    sellingPricePerPiece: 5.00, 
    status: "Good",
    salesCount: 1200
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
    piecesPerUnit: 1, // Individual sale only
    totalStockPieces: 26, 
    unitPriceCost: 150.00, 
    sellingPricePerUnit: 220.00, 
    sellingPricePerPiece: 220.00, 
    status: "Good",
    salesCount: 450
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
    piecesPerUnit: 1, // Independent liquid bottle
    totalStockPieces: 19, 
    unitPriceCost: 120.00, 
    sellingPricePerUnit: 180.00, 
    sellingPricePerPiece: 180.00, 
    status: "Moderate",
    salesCount: 520
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
    totalStockPieces: 180, // 3 Bottles
    unitPriceCost: 300.00, 
    sellingPricePerUnit: 500.00, 
    sellingPricePerPiece: 10.00, // Sold largely per bottle
    discount: 20, 
    status: "Good",
    salesCount: 670
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
    totalStockPieces: 115, // 1 Box, 15 Tabs
    unitPriceCost: 500.00, 
    sellingPricePerUnit: 800.00, 
    sellingPricePerPiece: 10.00, 
    status: "Moderate",
    salesCount: 950
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
    packagingUnit: "Box", // Or Unit
    baseUnit: "Piece",
    piecesPerUnit: 1,
    totalStockPieces: 12, 
    unitPriceCost: 150.00, 
    sellingPricePerUnit: 250.00, 
    sellingPricePerPiece: 250.00, 
    status: "Moderate",
    salesCount: 150
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
    packagingUnit: "Bottle", // Or Unit
    baseUnit: "Piece",
    piecesPerUnit: 1,
    totalStockPieces: 45, 
    unitPriceCost: 180.00, 
    sellingPricePerUnit: 320.00, 
    sellingPricePerPiece: 320.00, 
    status: "Good",
    salesCount: 310
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
    packagingUnit: "Pack", // Or Unit
    baseUnit: "Piece",
    piecesPerUnit: 1,
    totalStockPieces: 110, 
    unitPriceCost: 50.00, 
    sellingPricePerUnit: 85.00, 
    sellingPricePerPiece: 85.00, 
    status: "Good",
    salesCount: 880
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
    totalStockPieces: 50, // 0 Boxes, 50 Caps
    unitPriceCost: 200.00, 
    sellingPricePerUnit: 400.00, 
    sellingPricePerPiece: 5.00, 
    status: "Moderate",
    salesCount: 1800
  }
];
