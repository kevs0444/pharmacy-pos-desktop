export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF'
export type UserStatus = 'ACTIVE' | 'INACTIVE'
export type ProductBrandType = 'Branded' | 'Generic' | 'Others'
export type ProductCategory =
  | 'Medicine'
  | 'Vitamins & Supplements'
  | 'Medical Devices'
  | 'Medical Supplies'
  | 'Personal Care'
  | 'Baby & Mom'
export type ProductSubCategory =
  | 'Prescription (Rx)'
  | 'OTC'
  | 'Herbal & Traditional'
  | 'Skincare'
  | 'Haircare'
  | 'Dental'
  | 'None'
export type OrderStatus = 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled'
export type OrderPriority = 'Low' | 'Normal' | 'Urgent'
export type InventoryMovementType =
  | 'OPENING_BALANCE'
  | 'RECEIVE'
  | 'SALE'
  | 'ADJUSTMENT'
  | 'VOID'
  | 'RETURN'
  | 'WRITE_OFF'
export type PaymentMethod = 'Cash' | 'GCash' | 'Card' | 'Other'
export type ReceiptPaperSize = '80mm' | '58mm'

export interface ManufacturerRecord {
  id: number
  name: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  category: string | null
  address: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserRecord {
  id: number
  username: string
  fullName: string
  email: string | null
  passwordHash: string
  role: UserRole
  status: UserStatus
  phone: string | null
  address: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductBatchRecord {
  id: number
  productId: number
  batchCode: string
  lotNumber: string
  manufacturingDate: string | null
  expiryDate: string
  stockPieces: number
  receivedDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductRecord {
  id: number
  code: string
  name: string
  genericName: string | null
  manufacturerId: number | null
  manufacturerName: string | null
  brandType: ProductBrandType
  category: ProductCategory
  subCategory: ProductSubCategory
  packagingUnit: string
  baseUnit: string
  piecesPerUnit: number
  totalStockPieces: number
  unitPriceCost: number
  sellingPricePerUnit: number
  sellingPricePerPiece: number
  discount: number | null
  isActive: boolean
  salesCount: number
  status: string
  nextBatchLotNumber: string | null
  nextBatchExpiryDate: string | null
}

export interface PurchaseOrderRecord {
  id: number
  orderCode: string
  manufacturerId: number | null
  manufacturerName: string
  contactPerson: string | null
  total: number
  status: OrderStatus
  etaDate: string | null
  placedDate: string
  priority: OrderPriority
  orderedByUserId: number | null
  orderedByName: string | null
  remarks: string | null
  createdAt: string
  updatedAt: string
}

export interface ReceiptSettingsRecord {
  id: number
  storeName: string
  address: string
  contact: string
  tin: string
  footerMessage: string
  paperSize: ReceiptPaperSize
  showTxnId: boolean
  showCashier: boolean
  showDate: boolean
  updatedAt: string
}

export interface DatabaseStatus {
  dbPath: string
  backupDir: string
  isInitialized: boolean
  migrationCount: number
  seededProductCount: number
  seededUserCount: number
}
