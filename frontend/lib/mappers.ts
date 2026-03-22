import type { ProductRecord, PurchaseOrderRecord } from '../../backend/types/domain';
import type { InventoryItem } from './mockData';

// Future-proof mapper: As the backend database evolves, we only update this single function
// rather than rewriting every single React component that relies on product shapes.
export function mapProductRecordToInventoryItem(pr: ProductRecord): InventoryItem {
  return {
    id: pr.id,
    code: pr.code || `PRD-${pr.id}`,
    name: pr.name,
    genericName: pr.genericName || "",
    manufacturer: pr.manufacturerName || "",
    brandType: pr.brandType,
    category: pr.category,
    subCategory: pr.subCategory,
    packagingUnit: pr.packagingUnit,
    baseUnit: pr.baseUnit,
    piecesPerUnit: pr.piecesPerUnit,
    totalStockPieces: pr.totalStockPieces,
    unitPriceCost: pr.unitPriceCost,
    sellingPricePerUnit: pr.sellingPricePerUnit,
    sellingPricePerPiece: pr.sellingPricePerPiece,
    discount: pr.discount || 0,
    isActive: Boolean(pr.isActive),
    salesCount: pr.salesCount,
    status: pr.totalStockPieces <= 0 ? "Out of Stock" : pr.totalStockPieces <= pr.piecesPerUnit ? "Low Stock" : "In Stock",
    batches: pr.totalStockPieces > 0 ? [{
      batchId: "B" + (pr.nextBatchLotNumber || "1"),
      lotNumber: pr.nextBatchLotNumber || "LOT-1",
      manufacturingDate: "2024-01-01",
      expiryDate: pr.nextBatchExpiryDate || "2030-12-31",
      stockPieces: pr.totalStockPieces,
      receivedDate: new Date().toISOString()
    }] : []
  } as InventoryItem;
}

export function mapPurchaseOrderRecordToPurchaseOrder(po: PurchaseOrderRecord): any {
  return {
    id: po.orderCode,
    manufacturer: po.manufacturerName || "Unknown",
    items: ["Assorted items (Live DB link pending)"],
    total: po.total,
    status: po.status,
    eta: po.etaDate || "TBD",
    placed: po.placedDate,
    priority: po.priority,
    orderedBy: po.orderedByName || "System",
    contactPerson: po.contactPerson || "N/A",
    remarks: po.remarks || ""
  };
}
