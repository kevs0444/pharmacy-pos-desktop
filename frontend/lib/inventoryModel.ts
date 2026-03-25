import type { ProductBatchRecord } from '../../backend/types/domain'

export type BrandType = 'Branded' | 'Generic' | 'Others'
export type ProductCategory =
  | 'Medicine'
  | 'Vitamins & Supplements'
  | 'Medical Devices'
  | 'Medical Supplies'
  | 'Personal Care'
  | 'Baby & Mom'
export type ProductSubCategory =
  | 'Prescription (Rx)'
  | 'OTC'
  | 'Herbal & Traditional'
  | 'Skincare'
  | 'Haircare'
  | 'Dental'
  | 'None'

export interface ProductBatch {
  batchId: string
  lotNumber: string
  manufacturingDate: string
  expiryDate: string
  stockPieces: number
  receivedDate: string
}

export interface InventoryItem {
  id: number
  code: string
  name: string
  genericName?: string
  manufacturer?: string
  brandType: BrandType
  category: ProductCategory
  subCategory: ProductSubCategory
  packagingUnit: string
  baseUnit: string
  piecesPerUnit: number
  totalStockPieces: number
  unitPriceCost: number
  sellingPricePerUnit: number
  sellingPricePerPiece: number
  discount?: number
  batches: ProductBatch[]
  isActive: boolean
  status: string
  salesCount: number
}

export function mapBatchRecordToInventoryBatch(batch: ProductBatchRecord): ProductBatch {
  return {
    batchId: batch.batchCode,
    lotNumber: batch.lotNumber,
    manufacturingDate: batch.manufacturingDate ?? batch.receivedDate,
    expiryDate: batch.expiryDate,
    stockPieces: batch.stockPieces,
    receivedDate: batch.receivedDate,
  }
}

export function daysUntilExpiry(expiryDate: string): number {
  const exp = new Date(expiryDate).getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((exp - now) / (1000 * 60 * 60 * 24))
}

export function getActiveBatches(item: InventoryItem): ProductBatch[] {
  return [...item.batches].filter((b) => b.stockPieces > 0).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
}

export function getSellableBatches(item: InventoryItem): ProductBatch[] {
  return getActiveBatches(item).filter((b) => daysUntilExpiry(b.expiryDate) >= 0)
}

export function getNextBatch(item: InventoryItem): ProductBatch | null {
  return getActiveBatches(item)[0] ?? null
}

export function getExpiryStatus(item: InventoryItem): 'expired' | 'critical' | 'warning' | 'monitor' | 'good' | 'none' {
  const next = getNextBatch(item)
  if (!next) return 'none'
  const d = daysUntilExpiry(next.expiryDate)
  if (d < 0) return 'expired'
  if (d <= 90) return 'critical'
  if (d <= 180) return 'warning'
  if (d <= 365) return 'monitor'
  return 'good'
}
