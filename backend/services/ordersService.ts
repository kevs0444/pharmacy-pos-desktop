import type { OrderListQuery, PaginatedResult, SaveOrderInput } from '../types/api'
import type { OrderStatus, PurchaseOrderItemRecord, PurchaseOrderRecord } from '../types/domain'
import { OrdersRepository } from '../repositories/ordersRepository'

const DEFAULT_ORDER_UNIT = 'EACH'

function toOrderUpper(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).toUpperCase()
}

function toTrimmedOrderUpper(value: unknown): string {
  return toOrderUpper(value).trim()
}

function nullableOrderUpper(value: unknown): string | null {
  const normalized = toTrimmedOrderUpper(value)
  return normalized || null
}

function formatFiveDigitStockNo(value: unknown, fallback?: unknown): string | null {
  const rawDigits = value === null || value === undefined ? '' : String(value).replace(/\D/g, '')
  const fallbackDigits = fallback === null || fallback === undefined ? '' : String(fallback).replace(/\D/g, '')
  const digits = rawDigits || fallbackDigits

  if (!digits) return null

  const parsed = Number.parseInt(digits, 10)
  if (!Number.isFinite(parsed)) return null

  return String(parsed).padStart(5, '0').slice(-5)
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

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

  save(input: SaveOrderInput): void {
    const { items, ...order } = input
    const manufacturerName = toTrimmedOrderUpper(order.manufacturerName)

    if (!manufacturerName) {
      throw new Error('Supplier is required')
    }

    const normalizedItems = (items ?? [])
      .map((item, index) => {
        const stockName = toTrimmedOrderUpper(item.stockName)
        const quantity = toFiniteNumber(item.quantity, stockName ? 1 : 0)
        const unitCost = toFiniteNumber(item.unitCost)
        const discPercent = toFiniteNumber(item.discPercent)
        const computedNetUCost = unitCost * (1 - discPercent / 100)
        const netUCost = toFiniteNumber(item.netUCost) || computedNetUCost
        const extCost = toFiniteNumber(item.extCost) || quantity * netUCost

        return {
          ...item,
          productId: item.productId ?? null,
          stockNo: formatFiveDigitStockNo(item.stockNo, index + 1),
          stockName,
          orderUnit: nullableOrderUpper(item.orderUnit) || DEFAULT_ORDER_UNIT,
          pkgQty: toFiniteNumber(item.pkgQty, 1) || 1,
          quantity: quantity || 1,
          unitCost,
          discPercent,
          netUCost,
          extCost,
          recvd: toFiniteNumber(item.recvd),
          prNum: nullableOrderUpper(item.prNum),
          remarks: nullableOrderUpper(item.remarks),
        }
      })
      .filter((item) => item.stockName)

    if (normalizedItems.length === 0) {
      throw new Error('At least one order item is required')
    }

    this.ordersRepository.saveOrder(
      {
        ...order,
        manufacturerName,
        total: normalizedItems.reduce((sum, item) => sum + item.extCost, 0),
        contactPerson: nullableOrderUpper(order.contactPerson),
        orderedByName: nullableOrderUpper(order.orderedByName),
        remarks: nullableOrderUpper(order.remarks),
        faxEmailRemarks: nullableOrderUpper(order.faxEmailRemarks),
        notedBy: nullableOrderUpper(order.notedBy),
        approvedBy: nullableOrderUpper(order.approvedBy),
        qtyToOrder: nullableOrderUpper(order.qtyToOrder),
        sysGen: Boolean(order.sysGen),
        isClosed: Boolean(order.isClosed),
        isLocked: Boolean(order.isLocked),
      },
      normalizedItems,
    )
  }

  delete(orderId: number): void {
    this.ordersRepository.deleteOrder(orderId)
  }

  receive(orderId: number): void {
    this.ordersRepository.receiveOrder(orderId)
  }
}
