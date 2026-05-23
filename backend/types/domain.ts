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
  | 'BRD'
  | 'BUNDLE'
  | 'CG'
  | 'GALE'
  | 'GEN'
  | 'MSUP'
  | 'REF'
  | 'STORE USE'
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
export type ChangeRequestType = 'CREATE' | 'UPDATE' | 'DELETE'
export type ChangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'


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
  shelfLocation: string | null
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
  status: 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled'
  etaDate: string | null
  placedDate: string
  priority: 'Low' | 'Normal' | 'Urgent'
  orderedByUserId: number | null
  orderedByName: string | null
  remarks: string | null
  faxEmailRemarks: string | null
  notedBy: string | null
  approvedBy: string | null
  qtyToOrder: string | null
  sysGen: boolean
  termsDays: number
  payDueDate: string | null
  isClosed: boolean
  isLocked: boolean
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItemRecord {
  id: number
  purchaseOrderId: number
  productId: number | null
  stockNo: string | null
  stockName: string
  orderUnit: string | null
  pkgQty: number
  quantity: number
  unitCost: number
  discPercent: number
  netUCost: number
  extCost: number
  recvd: number
  prNum: string | null
  remarks: string | null
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

export interface ChangeRequestRecord {
  id: number
  requestType: ChangeRequestType
  status: ChangeRequestStatus
  productId: number | null
  payload: string
  submittedByName: string | null
  submittedAt: string
  reviewedByName: string | null
  reviewedAt: string | null
  reviewerNote: string | null
}

export interface CustomerRecord {
  id: number
  name: string
  idType: 'Senior' | 'PWD'
  idNumber: string
  createdAt: string
  updatedAt: string
}

