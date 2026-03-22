import type { OrderListQuery, PaginatedResult } from '../types/api'
import type { PurchaseOrderRecord } from '../types/domain'
import { OrdersRepository } from '../repositories/ordersRepository'

export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  list(query?: OrderListQuery): PaginatedResult<PurchaseOrderRecord> {
    return this.ordersRepository.list(query)
  }
}
