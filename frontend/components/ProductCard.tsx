import {
  Pill, Syringe, HeartPulse, Stethoscope,
  ChevronRight, TriangleAlert, Plus, Baby, Droplets, Package, AlertOctagon
} from "lucide-react";
import { cn } from "../lib/utils";
import { InventoryItem, getNextBatch, getExpiryStatus, daysUntilExpiry } from "../lib/mockData";

// ─── Category Icon ──────────────────────────────────────────────────────────
export function getCategoryIcon(category: string) {
  switch (category) {
    case "Medicine":              return Pill;
    case "Vitamins & Supplements": return HeartPulse;
    case "Medical Devices":       return Stethoscope;
    case "Medical Supplies":      return Syringe;
    case "Personal Care":         return Droplets;
    case "Baby & Mom":            return Baby;
    default:                      return Package;
  }
}

// ─── Stock Formatter ─────────────────────────────────────────────────────────
/** e.g. 215 tablets in 100-ct boxes → "2 Boxes, 15 Tablets" */
export function formatStock(item: InventoryItem): { label: string; isLow: boolean; isOut: boolean } {
  const total = item.totalStockPieces;
  const ppu   = item.piecesPerUnit;
  const isOut = total <= 0;

  if (ppu <= 1) {
    const isLow = total <= 10;
    return { label: `${total} ${item.packagingUnit}${total !== 1 ? "s" : ""}`, isLow, isOut };
  }

  const fullUnits = Math.floor(total / ppu);
  const remainder = total % ppu;
  const isLow     = total <= ppu * 1.5;
  let label = "";
  if (fullUnits > 0)  label += `${fullUnits} ${item.packagingUnit}${fullUnits !== 1 ? "s" : ""}`;
  if (remainder > 0)  label += `${fullUnits > 0 ? ", " : ""}${remainder} ${item.baseUnit}${remainder !== 1 ? "s" : ""}`;
  if (!label)         label  = "Out of Stock";

  return { label, isLow, isOut };
}

// ─── Expiry Badge ─────────────────────────────────────────────────────────────
function ExpiryBadge({ item }: { item: InventoryItem }) {
  const batch  = getNextBatch(item);
  const status = getExpiryStatus(item);
  if (!batch || status === "none") return null;

  const days = daysUntilExpiry(batch.expiryDate);

  if (status === "expired") return (
    <span className="flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 uppercase tracking-wider">
      <AlertOctagon className="w-2.5 h-2.5" /> Expired
    </span>
  );
  if (status === "critical") return (
    <span className="flex items-center gap-1 text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 uppercase tracking-wider">
      <TriangleAlert className="w-2.5 h-2.5" /> Exp {days}d
    </span>
  );
  if (status === "warning") return (
    <span className="flex items-center gap-1 text-[9px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
      Exp {batch.expiryDate.slice(0, 7)}
    </span>
  );
  return (
    <span className="text-[9px] font-medium text-slate-300">
      Exp {batch.expiryDate.slice(0, 7)}
    </span>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: InventoryItem;
  viewMode: "pos" | "inventory";
  onAction?: (product: InventoryItem) => void;
  disabled?: boolean;
}

export function ProductCard({ product, viewMode, onAction, disabled }: ProductCardProps) {
  const Icon      = getCategoryIcon(product.category);
  const stockInfo = formatStock(product);
  const isRx      = product.subCategory === "Prescription (Rx)";
  const expiryStatus = getExpiryStatus(product);
  const isOutOfStock = stockInfo.isOut;

  const displayPrice = product.discount
    ? product.sellingPricePerUnit * (1 - product.discount / 100)
    : product.sellingPricePerUnit;

  const showDualPricing = product.piecesPerUnit > 1;

  return (
    <div className={cn(
      "bg-white rounded-[20px] shadow-sm border p-5 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group",
      expiryStatus === "critical" || expiryStatus === "expired"
        ? "border-red-200"
        : expiryStatus === "warning"
        ? "border-orange-200"
        : "border-slate-100",
      (disabled || isOutOfStock) ? "opacity-60 grayscale-[0.5] pointer-events-none" : ""
    )}>

      {/* Top: Icon + Badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-600 shadow-sm group-hover:scale-105 transition-transform">
          <Icon className="w-5 h-5 -rotate-12" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {isRx ? (
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-extrabold text-[9px] border border-red-100/50 tracking-wider uppercase">Rx</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-[9px] border border-emerald-100/50 tracking-wider uppercase">OTC</span>
          )}
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{product.brandType}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 mb-3">
        <h3 className="font-extrabold text-slate-900 text-base leading-tight mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-xs font-medium text-slate-400 mb-1 line-clamp-1">{product.genericName || "Standard Unit"}</p>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">{product.manufacturer || "Generic"}</p>
      </div>

      {/* Expiry Badge */}
      <div className="mb-3">
        <ExpiryBadge item={product} />
      </div>

      {/* Price + Stock */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-0.5">
          {product.discount ? (
            <>
              <span className="text-xl font-black text-slate-900 leading-none">₱{displayPrice.toFixed(2)}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-slate-400 line-through">₱{product.sellingPricePerUnit.toFixed(2)}</span>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100/50">-{product.discount}%</span>
              </div>
            </>
          ) : (
            <span className="text-xl font-black text-slate-900 leading-none">₱{displayPrice.toFixed(2)}</span>
          )}
          <span className="text-[9px] text-slate-400 font-semibold">per {product.packagingUnit}</span>
          {showDualPricing && (
            <span className="text-[9px] text-brand-blue font-bold">₱{product.sellingPricePerPiece.toFixed(2)} / {product.baseUnit}</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          {stockInfo.isOut ? (
            <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">Out of Stock</span>
          ) : stockInfo.isLow ? (
            <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100/50">
              <TriangleAlert className="w-3 h-3 stroke-[2.5]" />
              <span className="text-[10px] font-bold">{stockInfo.label}</span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-400">{stockInfo.label}</span>
          )}
        </div>
      </div>

      {/* Action */}
      {viewMode === "pos" ? (
        <button
          onClick={() => onAction && onAction(product)}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all active:scale-95"
          disabled={disabled || isOutOfStock}
        >
          <Plus className="w-4 h-4" /> Add to Cart
        </button>
      ) : (
        <button
          onClick={() => onAction && onAction(product)}
          className="w-full py-2.5 rounded-xl border flex gap-2 items-center justify-center text-xs font-bold transition-all bg-white text-slate-600 hover:text-brand-blue border-slate-200 hover:border-brand-blue/30 hover:bg-slate-50 active:scale-95"
        >
          View Details <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
