import { ipcRenderer, contextBridge } from 'electron';
import type {
  AdminUserListQuery,
  InventoryListQuery,
  OrderListQuery,
  PharmacyApi,
} from './types/api'

const api: PharmacyApi = {
  system: {
    getStatus: () => ipcRenderer.invoke('system:getStatus'),
  },
  inventory: {
    list: (query?: InventoryListQuery) => ipcRenderer.invoke('inventory:list', query),
    getSummary: () => ipcRenderer.invoke('inventory:getSummary'),
  },
  pos: {
    listCatalog: (query?: InventoryListQuery) => ipcRenderer.invoke('pos:listCatalog', query),
  },
  orders: {
    list: (query?: OrderListQuery) => ipcRenderer.invoke('orders:list', query),
  },
  admin: {
    listUsers: (query?: AdminUserListQuery) => ipcRenderer.invoke('admin:listUsers', query),
    listManufacturers: () => ipcRenderer.invoke('admin:listManufacturers'),
  },
  settings: {
    getReceiptSettings: () => ipcRenderer.invoke('settings:getReceiptSettings'),
  },
}

contextBridge.exposeInMainWorld('api', api)
