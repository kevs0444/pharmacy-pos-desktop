import type { OrderListQuery, PaginatedResult } from '../types/api'
import type { OrderStatus, PurchaseOrderItemRecord, PurchaseOrderRecord } from '../types/domain'
import { OrdersRepository } from '../repositories/ordersRepository'

export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  list(query?: OrderListQuery): PaginatedResult<PurchaseOrderRecord> {
    return this.ordersRepository.list(query)
  }

  getItems(orderId: number): PurchaseOrderItemRecord[] {
    return this.ordersRepository.getItems(orderId)
  }

  updateStatus(orderId: number, status: OrderStatus): void {
    this.ordersRepository.updateStatus(orderId, status)
  }
}
