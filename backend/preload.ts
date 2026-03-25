import { ipcRenderer, contextBridge } from 'electron';
import type {
  AdminUserListQuery,
  CreateProductInput,
  InventoryListQuery,
  OrderListQuery,
  PharmacyApi,
  ProductBatchInput,
  UpdateProductInput,
} from './types/api'
import type { OrderStatus } from './types/domain'

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
  },
  pos: {
    listCatalog: (query?: InventoryListQuery) => ipcRenderer.invoke('pos:listCatalog', query),
  },
  orders: {
    list: (query?: OrderListQuery) => ipcRenderer.invoke('orders:list', query),
    updateStatus: (orderId: number, status: OrderStatus) => ipcRenderer.invoke('orders:updateStatus', { orderId, status }),
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
