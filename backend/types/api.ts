import type {
  ChangeRequestRecord,
  ChangeRequestStatus,
  ChangeRequestType,
  CustomerRecord,
  DatabaseStatus,
  ManufacturerRecord,
  OrderPriority,
  OrderStatus,
  ProductBatchRecord,
  ProductBrandType,
  ProductCategory,
  ProductRecord,
  ProductSubCategory,
  PurchaseOrderItemRecord,
  PurchaseOrderRecord,
  ReceiptSettingsRecord,
  UserRecord,
  UserRole,
  UserStatus,
} from './domain'

export interface PaginationQuery {
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface InventoryListQuery extends PaginationQuery {
  search?: string
  category?: ProductCategory | 'All' | 'All Products'
  subCategory?: ProductSubCategory | 'All'
  sortOrder?: 'asc' | 'desc'
  includeInactive?: boolean
  onlySellable?: boolean
}

export interface InventorySummary {
  totalProducts: number
  activeProducts: number
  disabledProducts: number
  lowStockProducts: number
  nearExpiryProducts: number
}

export interface InventoryAlerts {
  needsRestock: ProductRecord[]
  expiringSoon: ProductRecord[]
  pendingReceipt: ProductRecord[]
}

export interface ProductBatchInput {
  lotNumber: string
  manufacturingDate?: string | null
  expiryDate: string
  stockPieces: number
  receivedDate?: string | null
}

export interface CreateProductInput {
  code: string
  name: string
  genericName?: string | null
  manufacturerName?: string | null
  brandType: ProductBrandType
  category: ProductCategory
  subCategory: ProductSubCategory
  shelfLocation?: string | null
  packagingUnit: string
  baseUnit: string
  piecesPerUnit: number
  totalStockPieces: number
  unitPriceCost: number
  sellingPricePerUnit: number
  sellingPricePerPiece: number
  discount?: number | null
  isActive?: boolean
  salesCount?: number
  initialBatch?: ProductBatchInput
}

export interface UpdateProductInput {
  code: string
  name: string
  genericName?: string | null
  manufacturerName?: string | null
  brandType: ProductBrandType
  category: ProductCategory
  subCategory: ProductSubCategory
  shelfLocation?: string | null
  packagingUnit: string
  baseUnit: string
  piecesPerUnit: number
  totalStockPieces: number
  unitPriceCost: number
  sellingPricePerUnit: number
  sellingPricePerPiece: number
  discount?: number | null
  isActive: boolean
  salesCount: number
}

export interface SubmitChangeRequestInput {
  requestType: ChangeRequestType
  productId?: number
  submittedByName?: string
  payload: CreateProductInput | UpdateProductInput | { productId: number }
}

export interface ReviewChangeRequestInput {
  approved: boolean
  reviewedByName?: string
  reviewerNote?: string
}

export interface CustomerSearchQuery {
  query: string
  idType?: 'Senior' | 'PWD'
}

export interface CustomerSaveInput {
  name: string
  idType: 'Senior' | 'PWD'
  idNumber: string
}

export interface OrderListQuery extends PaginationQuery {
  search?: string
  period?: string
  manufacturer?: string
  status?: OrderStatus | 'All'
  priority?: OrderPriority | 'All'
  orderedBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SaveOrderItemInput {
  productId?: number | null
  stockNo?: string | null
  stockName: string
  orderUnit?: string | null
  pkgQty: number
  quantity: number
  unitCost: number
  discPercent: number
  netUCost: number
  extCost: number
  prNum?: string | null
  remarks?: string | null
}

export interface SaveOrderInput {
  id?: number
  manufacturerId?: number | null
  manufacturerName: string
  contactPerson?: string | null
  total: number
  status: OrderStatus
  etaDate?: string | null
  placedDate: string
  priority: OrderPriority
  orderedByUserId?: number | null
  orderedByName?: string | null
  remarks?: string | null
  faxEmailRemarks?: string | null
  notedBy?: string | null
  approvedBy?: string | null
  qtyToOrder?: string | null
  termsDays: number
  payDueDate?: string | null
  items: SaveOrderItemInput[]
}

export interface AdminUserListQuery extends PaginationQuery {
  search?: string
  role?: UserRole | 'All'
  status?: UserStatus | 'All'
}

export interface CheckoutItemInput {
  productId: number
  productBatchId?: number
  productName: string
  lotNumber?: string
  expiryDate?: string
  quantity: number
  sellByPiece: boolean
  unitLabel: string
  unitPrice: number
  discountAmount: number
  lineTotal: number
}

export interface CheckoutPayload {
  cashierUserId?: number
  customerName?: string
  subtotal: number
  discountType?: string
  discountValue?: number
  discountAmount: number
  total: number
  cashTendered: number
  changeAmount: number
  paymentMethod: 'Cash' | 'GCash' | 'Card' | 'Other'
  requiresPrescription: boolean
  doctorName?: string
  doctorLicense?: string
  items: CheckoutItemInput[]
}

export interface PharmacyApi {
  system: {
    getStatus: () => Promise<DatabaseStatus>
  }
  inventory: {
    list: (query?: InventoryListQuery) => Promise<PaginatedResult<ProductRecord>>
    getSummary: () => Promise<InventorySummary>
    getAlerts: () => Promise<InventoryAlerts>
    create: (payload: CreateProductInput) => Promise<ProductRecord>
    update: (id: number, payload: UpdateProductInput) => Promise<ProductRecord>
    remove: (id: number) => Promise<void>
    setActive: (id: number, isActive: boolean) => Promise<ProductRecord>
    listBatches: (productId: number) => Promise<ProductBatchRecord[]>
    receiveBatch: (productId: number, batch: ProductBatchInput) => Promise<void>
    submitChangeRequest: (input: SubmitChangeRequestInput) => Promise<ChangeRequestRecord>
    listChangeRequests: (status?: ChangeRequestStatus) => Promise<ChangeRequestRecord[]>
    reviewChangeRequest: (id: number, input: ReviewChangeRequestInput) => Promise<void>
  }
  pos: {
    listCatalog: (query?: InventoryListQuery) => Promise<PaginatedResult<ProductRecord>>
    checkout: (payload: CheckoutPayload) => Promise<void>
    searchCustomers: (query: CustomerSearchQuery) => Promise<CustomerRecord[]>
    saveCustomer: (input: CustomerSaveInput) => Promise<CustomerRecord>
  }
  orders: {
    list: (query?: OrderListQuery) => Promise<PaginatedResult<PurchaseOrderRecord>>
    getItems: (orderId: number) => Promise<PurchaseOrderItemRecord[]>
    updateStatus: (orderId: number, status: OrderStatus) => Promise<void>
    save: (input: SaveOrderInput) => Promise<void>
    delete: (orderId: number) => Promise<void>
  }
  admin: {
    listUsers: (query?: AdminUserListQuery) => Promise<PaginatedResult<Omit<UserRecord, 'passwordHash'>>>
    listManufacturers: () => Promise<ManufacturerRecord[]>
    createManufacturer: (payload: any) => Promise<number>
  }
  settings: {
    getReceiptSettings: () => Promise<ReceiptSettingsRecord>
  }
}
