import { ipcMain } from 'electron'
import type {
  AdminUserListQuery,
  CheckoutPayload,
  CreateProductInput,
  InventoryListQuery,
  OrderListQuery,
  ProductBatchInput,
  ReviewChangeRequestInput,
  SubmitChangeRequestInput,
  UpdateProductInput,
  CustomerSearchQuery,
  CustomerSaveInput,
} from '../types/api'
import type { ChangeRequestStatus, OrderStatus } from '../types/domain'
import type { AppServices } from '../services'

function registerHandler<TPayload>(channel: string, handler: (payload: TPayload) => unknown): void {
  ipcMain.removeHandler(channel)
  ipcMain.handle(channel, (_event, payload: TPayload) => handler(payload))
}

export function registerIpcHandlers(services: AppServices): void {
  registerHandler('system:getStatus', () => services.systemService.getStatus())
  registerHandler<InventoryListQuery | undefined>('inventory:list', (query) => services.inventoryService.list(query))
  registerHandler('inventory:getSummary', () => services.inventoryService.getSummary())
  registerHandler('inventory:getAlerts', () => services.inventoryService.getAlerts())
  registerHandler<CreateProductInput>('inventory:create', (payload) => services.inventoryService.create(payload))
  registerHandler<{ id: number; payload: UpdateProductInput }>('inventory:update', ({ id, payload }) =>
    services.inventoryService.update(id, payload),
  )
  registerHandler<number>('inventory:remove', (id) => services.inventoryService.remove(id))
  registerHandler<{ id: number; isActive: boolean }>('inventory:setActive', ({ id, isActive }) =>
    services.inventoryService.setActive(id, isActive),
  )
  registerHandler<number>('inventory:listBatches', (productId) => services.inventoryService.listBatches(productId))
  registerHandler<{ productId: number; batch: ProductBatchInput }>('inventory:receiveBatch', ({ productId, batch }) =>
    services.inventoryService.receiveBatch(productId, batch),
  )
  registerHandler<InventoryListQuery | undefined>('pos:listCatalog', (query) => services.posService.listCatalog(query))
  registerHandler<CheckoutPayload>('pos:checkout', (payload) => services.posService.checkout(payload))
  registerHandler<CustomerSearchQuery>('pos:searchCustomers', (query) => services.customersService.search(query))
  registerHandler<CustomerSaveInput>('pos:saveCustomer', (input) => services.customersService.save(input))
  registerHandler<OrderListQuery | undefined>('orders:list', (query) => services.ordersService.list(query))
  registerHandler<number>('orders:getItems', (orderId) => services.ordersService.getItems(orderId))
  registerHandler<{ orderId: number; status: OrderStatus }>('orders:updateStatus', ({ orderId, status }) =>
    services.ordersService.updateStatus(orderId, status),
  )
  registerHandler<any>('orders:save', (payload) => services.ordersService.save(payload))
  registerHandler<AdminUserListQuery | undefined>('admin:listUsers', (query) => services.adminService.listUsers(query))
  registerHandler('admin:listManufacturers', () => services.adminService.listManufacturers())
  registerHandler<any>('admin:createManufacturer', (payload) => services.adminService.createManufacturer(payload))
  registerHandler('settings:getReceiptSettings', () => services.settingsService.getReceiptSettings())
  registerHandler<SubmitChangeRequestInput>('inventory:submitChangeRequest', (input) =>
    services.changeRequestService.submit(input),
  )
  registerHandler<ChangeRequestStatus | undefined>('inventory:listChangeRequests', (status) =>
    services.changeRequestService.list(status),
  )
  registerHandler<{ id: number; input: ReviewChangeRequestInput }>('inventory:reviewChangeRequest', ({ id, input }) =>
    services.changeRequestService.review(id, input),
  )
}
