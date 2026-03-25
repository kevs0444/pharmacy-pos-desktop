import { ipcMain } from 'electron'
import type {
  AdminUserListQuery,
  CreateProductInput,
  InventoryListQuery,
  OrderListQuery,
  UpdateProductInput,
} from '../types/api'
import type { AppServices } from '../services'

function registerHandler<TPayload>(channel: string, handler: (payload: TPayload) => unknown): void {
  ipcMain.removeHandler(channel)
  ipcMain.handle(channel, (_event, payload: TPayload) => handler(payload))
}

export function registerIpcHandlers(services: AppServices): void {
  registerHandler('system:getStatus', () => services.systemService.getStatus())
  registerHandler<InventoryListQuery | undefined>('inventory:list', (query) => services.inventoryService.list(query))
  registerHandler('inventory:getSummary', () => services.inventoryService.getSummary())
  registerHandler<CreateProductInput>('inventory:create', (payload) => services.inventoryService.create(payload))
  registerHandler<{ id: number; payload: UpdateProductInput }>('inventory:update', ({ id, payload }) =>
    services.inventoryService.update(id, payload),
  )
  registerHandler<number>('inventory:remove', (id) => services.inventoryService.remove(id))
  registerHandler<{ id: number; isActive: boolean }>('inventory:setActive', ({ id, isActive }) =>
    services.inventoryService.setActive(id, isActive),
  )
  registerHandler<number>('inventory:listBatches', (productId) => services.inventoryService.listBatches(productId))
  registerHandler<InventoryListQuery | undefined>('pos:listCatalog', (query) => services.posService.listCatalog(query))
  registerHandler<OrderListQuery | undefined>('orders:list', (query) => services.ordersService.list(query))
  registerHandler<AdminUserListQuery | undefined>('admin:listUsers', (query) => services.adminService.listUsers(query))
  registerHandler('admin:listManufacturers', () => services.adminService.listManufacturers())
  registerHandler<any>('admin:createManufacturer', (payload) => services.adminService.createManufacturer(payload))
  registerHandler('settings:getReceiptSettings', () => services.settingsService.getReceiptSettings())
}
