import type { InventoryListQuery, PaginatedResult } from '../types/api'
import type { ProductRecord } from '../types/domain'
import { InventoryRepository } from '../repositories/inventoryRepository'

export class PosService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  listCatalog(query?: InventoryListQuery): PaginatedResult<ProductRecord> {
    return this.inventoryRepository.list({
      ...query,
      includeInactive: false,
      onlySellable: true,
    })
  }
}
