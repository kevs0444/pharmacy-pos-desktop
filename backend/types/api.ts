import type {
  DatabaseStatus,
  ManufacturerRecord,
  OrderPriority,
  OrderStatus,
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
