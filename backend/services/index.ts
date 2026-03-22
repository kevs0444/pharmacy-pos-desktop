import { DatabaseManager } from '../db/DatabaseManager'
import { AdminService } from './adminService'
import { InventoryService } from './inventoryService'
import { OrdersService } from './ordersService'
import { PosService } from './posService'
import { SettingsService } from './settingsService'
import { SystemService } from './systemService'
import { InventoryRepository } from '../repositories/inventoryRepository'
import { ManufacturersRepository } from '../repositories/manufacturersRepository'
import { OrdersRepository } from '../repositories/ordersRepository'
import { SettingsRepository } from '../repositories/settingsRepository'
import { SystemRepository } from '../repositories/systemRepository'
import { UsersRepository } from '../repositories/usersRepository'

export interface AppServices {
  systemService: SystemService
  inventoryService: InventoryService
  posService: PosService
  ordersService: OrdersService
  adminService: AdminService
  settingsService: SettingsService
}

export function createAppServices(databaseManager: DatabaseManager): AppServices {
  const inventoryRepository = new InventoryRepository(databaseManager.db)
  const usersRepository = new UsersRepository(databaseManager.db)
  const manufacturersRepository = new ManufacturersRepository(databaseManager.db)
  const ordersRepository = new OrdersRepository(databaseManager.db)
  const settingsRepository = new SettingsRepository(databaseManager.db)
  const systemRepository = new SystemRepository(
    databaseManager.db,
    databaseManager.dbPath,
    databaseManager.backupDir,
    databaseManager.getAppliedMigrationCount(),
  )

  return {
    systemService: new SystemService(systemRepository),
    inventoryService: new InventoryService(inventoryRepository),
    posService: new PosService(inventoryRepository),
    ordersService: new OrdersService(ordersRepository),
    adminService: new AdminService(usersRepository, manufacturersRepository),
    settingsService: new SettingsService(settingsRepository),
  }
}
