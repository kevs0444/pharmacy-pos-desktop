import type {
  CreateProductInput,
  InventoryListQuery,
  InventorySummary,
  PaginatedResult,
  UpdateProductInput,
} from '../types/api'
import type { ProductBatchRecord, ProductRecord } from '../types/domain'
import { InventoryRepository } from '../repositories/inventoryRepository'

export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  list(query?: InventoryListQuery): PaginatedResult<ProductRecord> {
    return this.inventoryRepository.list(query)
  }

  getSummary(): InventorySummary {
    return this.inventoryRepository.getSummary()
  }

  create(input: CreateProductInput): ProductRecord {
    return this.inventoryRepository.create(input)
  }

  update(id: number, input: UpdateProductInput): ProductRecord {
    return this.inventoryRepository.update(id, input)
  }

  remove(id: number): void {
    this.inventoryRepository.remove(id)
  }

  setActive(id: number, isActive: boolean): ProductRecord {
    return this.inventoryRepository.setActive(id, isActive)
  }

  listBatches(productId: number): ProductBatchRecord[] {
    return this.inventoryRepository.listBatches(productId)
  }
}
