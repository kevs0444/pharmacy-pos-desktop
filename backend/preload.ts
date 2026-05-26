import { contextBridge, ipcRenderer } from 'electron';
import type {
  AdminUserListQuery,
  CheckoutPayload,
  CreateProductInput,
  InventoryListQuery,
  OrderListQuery,
  PharmacyApi,
  ProductBatchInput,
  ReviewChangeRequestInput,
  SubmitChangeRequestInput,
  UpdateProductInput,
  CustomerSearchQuery,
  CustomerSaveInput,
} from './types/api'
import type { ChangeRequestStatus, OrderStatus } from './types/domain'

const api: PharmacyApi = {
  system: {
    getStatus: () => ipcRenderer.invoke('system:getStatus'),
  },
  inventory: {
    list: (query?: InventoryListQuery) => ipcRenderer.invoke('inventory:list', query),
    getSummary: () => ipcRenderer.invoke('inventory:getSummary'),
    getAlerts: () => ipcRenderer.invoke('inventory:getAlerts'),
    create: (payload: CreateProductInput) => ipcRenderer.invoke('inventory:create', payload),
    update: (id: number, payload: UpdateProductInput) => ipcRenderer.invoke('inventory:update', { id, payload }),
    remove: (id: number) => ipcRenderer.invoke('inventory:remove', id),
    setActive: (id: number, isActive: boolean) => ipcRenderer.invoke('inventory:setActive', { id, isActive }),
    listBatches: (productId: number) => ipcRenderer.invoke('inventory:listBatches', productId),
    receiveBatch: (productId: number, batch: ProductBatchInput) => ipcRenderer.invoke('inventory:receiveBatch', { productId, batch }),
    submitChangeRequest: (input: SubmitChangeRequestInput) => ipcRenderer.invoke('inventory:submitChangeRequest', input),
    listChangeRequests: (status?: ChangeRequestStatus) => ipcRenderer.invoke('inventory:listChangeRequests', status),
    reviewChangeRequest: (id: number, input: ReviewChangeRequestInput) => ipcRenderer.invoke('inventory:reviewChangeRequest', { id, input }),
  },
  pos: {
    listCatalog: (query?: InventoryListQuery) => ipcRenderer.invoke('pos:listCatalog', query),
    checkout: (payload: CheckoutPayload) => ipcRenderer.invoke('pos:checkout', payload),
    searchCustomers: (query: CustomerSearchQuery) => ipcRenderer.invoke('pos:searchCustomers', query),
    saveCustomer: (input: CustomerSaveInput) => ipcRenderer.invoke('pos:saveCustomer', input),
  },
  orders: {
    list: (query?: OrderListQuery) => ipcRenderer.invoke('orders:list', query),
    getItems: (orderId: number) => ipcRenderer.invoke('orders:getItems', orderId),
    updateStatus: (orderId: number, status: OrderStatus) => ipcRenderer.invoke('orders:updateStatus', { orderId, status }),
    save: (input: any) => ipcRenderer.invoke('orders:save', input),
    delete: (orderId: number) => ipcRenderer.invoke('orders:delete', orderId),
    receive: (orderId: number) => ipcRenderer.invoke('orders:receive', orderId),
  },
  admin: {
    listUsers: (query?: AdminUserListQuery) => ipcRenderer.invoke('admin:listUsers', query),
    listManufacturers: () => ipcRenderer.invoke('admin:listManufacturers'),
    createManufacturer: (payload: any) => ipcRenderer.invoke('admin:createManufacturer', payload),
  },
  settings: {
    getReceiptSettings: () => ipcRenderer.invoke('settings:getReceiptSettings'),
  },
}

contextBridge.exposeInMainWorld('api', api)
