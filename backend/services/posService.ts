import type { InventoryListQuery, PaginatedResult, CheckoutPayload } from '../types/api'
import type { ProductRecord } from '../types/domain'
import { InventoryRepository } from '../repositories/inventoryRepository'
import { SalesRepository } from '../repositories/salesRepository'

export class PosService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly salesRepository: SalesRepository
  ) {}

  listCatalog(query?: InventoryListQuery): PaginatedResult<ProductRecord> {
    return this.inventoryRepository.list({
      ...query,
      includeInactive: false,
      onlySellable: true,
    })
  }

  checkout(payload: CheckoutPayload): void {
    if (!payload.items || payload.items.length === 0) {
      throw new Error('Cannot checkout with an empty cart')
    }
    
    // Validate prescription requirement
    if (payload.requiresPrescription) {
      if (!payload.doctorName || !payload.doctorLicense) {
        throw new Error('Doctor information is required for prescription items')
      }
    }

    this.salesRepository.createSale(payload)
  }
}
