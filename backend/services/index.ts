import { DatabaseManager } from '../db/DatabaseManager'
import { AdminService } from './adminService'
import { InventoryService } from './inventoryService'
import { OrdersService } from './ordersService'
import { PosService } from './posService'
import { SettingsService } from './settingsService'
import { SystemService } from './systemService'
import { ChangeRequestService } from './changeRequestService'
import { CustomersService } from './customersService'
import { InventoryRepository } from '../repositories/inventoryRepository'
import { ManufacturersRepository } from '../repositories/manufacturersRepository'
import { OrdersRepository } from '../repositories/ordersRepository'
import { SettingsRepository } from '../repositories/settingsRepository'
import { SystemRepository } from '../repositories/systemRepository'
import { UsersRepository } from '../repositories/usersRepository'
import { SalesRepository } from '../repositories/salesRepository'
import { ChangeRequestRepository } from '../repositories/changeRequestRepository'
import { CustomersRepository } from '../repositories/customersRepository'

export interface AppServices {
  systemService: SystemService
  inventoryService: InventoryService
  posService: PosService
  ordersService: OrdersService
  adminService: AdminService
  settingsService: SettingsService
  changeRequestService: ChangeRequestService
  customersService: CustomersService
}

export function createAppServices(databaseManager: DatabaseManager): AppServices {
  const inventoryRepository = new InventoryRepository(databaseManager.db)
  const usersRepository = new UsersRepository(databaseManager.db)
  const manufacturersRepository = new ManufacturersRepository(databaseManager.db)
  const ordersRepository = new OrdersRepository(databaseManager.db)
  const settingsRepository = new SettingsRepository(databaseManager.db)
  const salesRepository = new SalesRepository(databaseManager.db)
  const changeRequestRepository = new ChangeRequestRepository(databaseManager.db)
  const customersRepository = new CustomersRepository(databaseManager.db)
  const systemRepository = new SystemRepository(
    databaseManager.db,
    databaseManager.dbPath,
    databaseManager.backupDir,
    databaseManager.getAppliedMigrationCount(),
  )

  const inventoryService = new InventoryService(inventoryRepository)

  return {
    systemService: new SystemService(systemRepository),
    inventoryService,
    posService: new PosService(inventoryRepository, salesRepository),
    ordersService: new OrdersService(ordersRepository),
    adminService: new AdminService(usersRepository, manufacturersRepository),
    settingsService: new SettingsService(settingsRepository),
    changeRequestService: new ChangeRequestService(changeRequestRepository, inventoryService),
    customersService: new CustomersService(customersRepository),
  }
}

