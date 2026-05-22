import type { ChangeRequestRecord, ChangeRequestStatus } from '../types/domain'
import type {
  CreateProductInput,
  ReviewChangeRequestInput,
  SubmitChangeRequestInput,
  UpdateProductInput,
} from '../types/api'
import { ChangeRequestRepository } from '../repositories/changeRequestRepository'
import { InventoryService } from './inventoryService'

export class ChangeRequestService {
  constructor(
    private readonly changeRequestRepository: ChangeRequestRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  submit(input: SubmitChangeRequestInput): ChangeRequestRecord {
    return this.changeRequestRepository.insert(input)
  }

  list(status?: ChangeRequestStatus): ChangeRequestRecord[] {
    return this.changeRequestRepository.listByStatus(status)
  }

  countPending(): number {
    return this.changeRequestRepository.countPending()
  }

  review(id: number, input: ReviewChangeRequestInput): void {
    const request = this.changeRequestRepository.getById(id)
    if (!request) throw new Error(`Change request ${id} not found`)
    if (request.status !== 'PENDING') throw new Error(`Change request ${id} is already ${request.status}`)

    if (input.approved) {
      const payload = JSON.parse(request.payload)

      if (request.requestType === 'CREATE') {
        this.inventoryService.create(payload as CreateProductInput)
      } else if (request.requestType === 'UPDATE') {
        if (!request.productId) throw new Error('UPDATE request is missing productId')
        this.inventoryService.update(request.productId, payload as UpdateProductInput)
      } else if (request.requestType === 'DELETE') {
        const { productId } = payload as { productId: number }
        this.inventoryService.remove(productId)
      }
    }

    this.changeRequestRepository.markReviewed(id, input)
  }
}
