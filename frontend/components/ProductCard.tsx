import { Pill, Activity, Syringe, HeartPulse, Stethoscope, ChevronRight, TriangleAlert, Plus } from "lucide-react";
import { cn } from "../lib/utils";
import { InventoryItem } from "../lib/mockData";

export function getCategoryIcon(category: string) {
  switch (category) {
    case "Supplement": return HeartPulse;
    case "Device": return Stethoscope;
    case "Prescription": return Activity;
    case "Supplies": return Syringe;
    default: return Pill;
  }
}

interface ProductCardProps {
  product: InventoryItem;
  viewMode: "pos" | "inventory";
  onAction?: (product: InventoryItem) => void;
  disabled?: boolean;
}

export function ProductCard({ product, viewMode, onAction, disabled }: ProductCardProps) {
  const Icon = getCategoryIcon(product.category);
  const isOutOfStock = product.stock <= 0;
  
  const actualPrice = product.discount 
    ? product.sellingPrice * (1 - product.discount / 100) 
    : product.sellingPrice;

  return (
    <div className={cn(
      "bg-white rounded-[20px] shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group",
      (disabled || isOutOfStock) ? "opacity-60 grayscale-[0.5] pointer-events-none" : ""
    )}>
      
      {/* Target Top Headers: Icon and Category Badges */}
      <div className="flex justify-between items-start mb-4">
        {/* Category Icon Badge */}
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-600 shadow-sm group-hover:scale-105 transition-transform">
           <Icon className="w-5 h-5 -rotate-12" />
        </div>
        
        {/* Rx & Type Badges */}
        <div className="flex items-center gap-1.5">
           {product.requiresPrescription && (
             <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-500 font-extrabold text-[9px] shadow-sm border border-red-100/50">
               Rx
             </span>
           )}
           <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest px-1">
             {product.requiresPrescription ? "Rx" : product.category === "Supplement" ? "Supplement" : product.category === "Device" ? "Device" : "OTC"}
           </span>
        </div>
      </div>
      
      {/* Product Information */}
      <div className="flex flex-col flex-1 mb-5">
         <h3 className="font-extrabold text-slate-900 text-base leading-tight mb-1" title={product.name}>
           {product.name}
         </h3>
         <p className="text-xs font-medium text-slate-400 mb-1.5 line-clamp-1" title={product.genericName}>
           {product.genericName || "Standard Unit"}
         </p>
         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
           {product.manufacturer || "Generic"} {product.brandType === "Branded" ? "• Branded" : product.brandType === "Generic" ? "• Generic" : ""}
         </p>
      </div>
      
      {/* Price & Stock Area */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col">
          {product.discount ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-black text-slate-900 leading-none">₱{actualPrice.toFixed(2)}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-slate-400 line-through">₱{product.sellingPrice.toFixed(2)}</span>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100/50">
                  -{product.discount}%
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xl font-black text-slate-900 leading-none">₱{actualPrice.toFixed(2)}</span>
          )}
        </div>
        
        <div className="flex flex-col items-end justify-end">
           {product.stock < 20 ? (
             <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100/50">
               <TriangleAlert className="w-3 h-3 stroke-[2.5]" />
               <span className="text-[10px] font-bold">{product.stock} left</span>
             </div>
           ) : (
             <span className="text-[10px] font-bold text-slate-400">{product.stock} left</span>
           )}
        </div>
      </div>
      
      {/* Call to Action */}
      {viewMode === "pos" ? (
        <button 
          onClick={() => onAction && onAction(product)}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all active:scale-95 disabled:opacity-50"
          disabled={disabled || isOutOfStock}
        >
          <Plus className="w-4 h-4" />
          Add to Cart
        </button>
      ) : (
        <button 
          onClick={() => onAction && onAction(product)}
          className="w-full py-2.5 rounded-xl border flex gap-2 items-center justify-center text-xs font-bold transition-all bg-white text-slate-600 hover:text-brand-blue border-slate-200 hover:border-brand-blue/30 hover:bg-slate-50 active:scale-95"
        >
           Update Details <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
