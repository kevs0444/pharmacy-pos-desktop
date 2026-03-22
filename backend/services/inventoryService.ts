import type { InventoryListQuery, InventorySummary, PaginatedResult } from '../types/api'
import type { ProductRecord } from '../types/domain'
import { InventoryRepository } from '../repositories/inventoryRepository'

export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  list(query?: InventoryListQuery): PaginatedResult<ProductRecord> {
    return this.inventoryRepository.list(query)
  }

  getSummary(): InventorySummary {
    return this.inventoryRepository.getSummary()
  }
}
