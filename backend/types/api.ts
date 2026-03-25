import type {
  DatabaseStatus,
  ManufacturerRecord,
  OrderPriority,
  OrderStatus,
  ProductBatchRecord,
  ProductBrandType,
  ProductCategory,
  ProductRecord,
  ProductSubCategory,
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

export interface OrderListQuery extends PaginationQuery {
  search?: string
  manufacturer?: string
  status?: OrderStatus | 'All'
  priority?: OrderPriority | 'All'
  orderedBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AdminUserListQuery extends PaginationQuery {
  search?: string
  role?: UserRole | 'All'
  status?: UserStatus | 'All'
}

export interface PharmacyApi {
  system: {
    getStatus: () => Promise<DatabaseStatus>
  }
  inventory: {
    list: (query?: InventoryListQuery) => Promise<PaginatedResult<ProductRecord>>
    getSummary: () => Promise<InventorySummary>
    create: (payload: CreateProductInput) => Promise<ProductRecord>
    update: (id: number, payload: UpdateProductInput) => Promise<ProductRecord>
    remove: (id: number) => Promise<void>
    setActive: (id: number, isActive: boolean) => Promise<ProductRecord>
    listBatches: (productId: number) => Promise<ProductBatchRecord[]>
  }
  pos: {
    listCatalog: (query?: InventoryListQuery) => Promise<PaginatedResult<ProductRecord>>
  }
  orders: {
    list: (query?: OrderListQuery) => Promise<PaginatedResult<PurchaseOrderRecord>>
  }
  admin: {
    listUsers: (query?: AdminUserListQuery) => Promise<PaginatedResult<Omit<UserRecord, 'passwordHash'>>>
    listManufacturers: () => Promise<ManufacturerRecord[]>
  }
  settings: {
    getReceiptSettings: () => Promise<ReceiptSettingsRecord>
  }
}
