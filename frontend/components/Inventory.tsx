import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { PageHeader } from "./ui/PageHeader";
import { Search, Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, Package, BarChart2, SlidersHorizontal, CheckCircle, AlertTriangle } from "lucide-react";
import { DataGrid, DataGridRow, DataGridCell } from "./ui/DataGrid";
import type { ProductRecord } from "../../backend/types/domain";

// ─── Constants ────────────────────────────────────────────────────────────────
const inputCls = "w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-800 placeholder:text-slate-300";
const selectCls = "w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-800 cursor-pointer";
const labelCls = "block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1";
const STOCK_GROUPS = ["BRD","BUNDLE","CG","GALE","GEN","MSUP","REF","STORE USE"] as const;

type RightTab = "adjustment" | "stockmaster";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ─── Main Inventory Component ─────────────────────────────────────────────────
export function Inventory() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>("adjustment");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await window.api.inventory.list();
      if (result?.items) setProducts(result.items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter((p) => {
    if (filterCategory !== "ALL" && p.category !== filterCategory && filterCategory !== "GEN" && filterCategory !== "BRD") return false;
    if (filterStatus === "LOW" && p.totalStockPieces > 50) return false;
    if (filterStatus === "OUT" && p.totalStockPieces > 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleRowClick = (p: ProductRecord) => {
    setSelectedProduct(p);
    setIsPanelOpen(true);
  };

  const gridColumns = [
    { key: "code",    label: "Stock #",      width: "w-20" },
    { key: "name",    label: "Stock Name" },
    { key: "group",   label: "Group",        width: "w-16" },
    { key: "shelf",   label: "Shelf",        width: "w-16" },
    { key: "pkg",     label: "Pkg",          width: "w-14" },
    { key: "instock", label: "In Stock",     width: "w-20", align: "right" as const },
    { key: "cost",    label: "Unit Cost",    width: "w-20", align: "right" as const },
    { key: "markup",  label: "Markup",       width: "w-16", align: "right" as const },
    { key: "price",   label: "Sell Price",   width: "w-24", align: "right" as const },
    { key: "mfg",     label: "Manufacturer", width: "w-36" },
    { key: "actions", label: "",             width: "w-16", align: "center" as const },
  ];

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col font-mono text-xs overflow-hidden select-none">

      {/* ── Header ── */}
      <PageHeader>
        <Package className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold tracking-widest uppercase text-white">Inventory Management</span>
      </PageHeader>

      {/* ── Toolbar ── */}
      <div className="px-4 py-2 border-b border-slate-200 bg-white/90 backdrop-blur-md flex gap-2 items-center shadow-[0_1px_4px_rgba(0,0,0,0.05)] shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56 h-7 pl-8 pr-3 text-[11px] bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 placeholder:text-slate-300"
          />
        </div>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="h-7 px-2 text-[11px] bg-white border border-slate-200 rounded-lg shadow-sm outline-none text-slate-600 focus:border-brand-blue">
          <option value="ALL">All Groups</option>
          {STOCK_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="h-7 px-2 text-[11px] bg-white border border-slate-200 rounded-lg shadow-sm outline-none text-slate-600 focus:border-brand-blue">
          <option value="ALL">All Status</option>
          <option value="LOW">Low Stock</option>
          <option value="OUT">Out of Stock</option>
        </select>

        <div className="flex-1" />

        <span className="text-[11px] font-bold text-slate-400">{filteredProducts.length} items</span>

        {/* Panel toggle */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          title={isPanelOpen ? "Collapse detail panel" : "Open detail panel"}
          className={cn(
            "h-7 w-7 flex items-center justify-center rounded-lg border transition-all active:scale-95",
            isPanelOpen
              ? "bg-brand-blue border-blue-500 text-white shadow-sm"
              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 h-7 px-3 text-[11px] font-bold text-white bg-brand-blue hover:bg-blue-700 rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      {/* ── Body: Split Panel ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Product Grid ── */}
        <div className="flex-1 overflow-auto p-4">
          <DataGrid columns={gridColumns}>
            {isLoading ? (
              <tr>
                <td colSpan={gridColumns.length} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-brand-blue rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading inventory...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={gridColumns.length} className="p-12 text-center text-slate-400 text-xs font-medium">
                  No products found matching your filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isLow = p.totalStockPieces <= 50 && p.totalStockPieces > 0;
                const isOut = p.totalStockPieces <= 0;
                const markup = p.unitPriceCost > 0
                  ? ((p.sellingPricePerPiece - p.unitPriceCost) / p.unitPriceCost) * 100
                  : 0;
                const isSelected = selectedProduct?.id === p.id;

                return (
                  <DataGridRow
                    key={p.id}
                    isHighlight={isSelected}
                    onClick={() => handleRowClick(p)}
                  >
                    <DataGridCell className="text-slate-400 font-mono text-[10px] tracking-wide">{p.code}</DataGridCell>
                    <DataGridCell isBold className={cn("text-slate-800", isSelected && "text-brand-blue")}>{p.name}</DataGridCell>
                    <DataGridCell>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-slate-100 text-slate-600 uppercase">
                        {p.category}
                      </span>
                    </DataGridCell>
                    <DataGridCell>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        {p.shelfLocation || '—'}
                      </span>
                    </DataGridCell>
                    <DataGridCell className="text-slate-500 text-[10px] uppercase font-semibold">{p.packagingUnit}</DataGridCell>
                    <DataGridCell align="right">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold min-w-[40px] text-center",
                        isOut ? "bg-red-100 text-red-600"
                          : isLow ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      )}>
                        {p.totalStockPieces}
                      </span>
                    </DataGridCell>
                    <DataGridCell align="right" className="text-slate-600 font-mono">₱{p.unitPriceCost.toFixed(2)}</DataGridCell>
                    <DataGridCell align="right" className="text-slate-400 font-mono text-[10px]">{markup.toFixed(0)}%</DataGridCell>
                    <DataGridCell align="right" className="font-bold text-brand-blue font-mono">₱{p.sellingPricePerPiece.toFixed(2)}</DataGridCell>
                    <DataGridCell className="text-slate-500 text-[10px]">{p.manufacturerName || '—'}</DataGridCell>
                    <DataGridCell align="center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); setIsEditModalOpen(true); }}
                          className="p-1 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                          title="Edit item"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </DataGridCell>
                  </DataGridRow>
                );
              })
            )}
          </DataGrid>
        </div>

        {/* ── RIGHT: Detail Panel ── */}
        {isPanelOpen && (
          <div className="w-[340px] shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden shadow-[-4px_0_16px_rgba(0,0,0,0.04)]">

            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                {selectedProduct ? (
                  <>
                    <span className="font-mono text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {selectedProduct.code}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-700 truncate max-w-[160px]">
                      {selectedProduct.name}
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400">Select a product</span>
                )}
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Strip */}
            <div className="flex border-b border-slate-200 shrink-0">
              <button
                onClick={() => setRightTab("adjustment")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-extrabold uppercase tracking-wider border-b-2 transition-colors",
                  rightTab === "adjustment"
                    ? "border-brand-blue text-brand-blue bg-blue-50/50"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                <BarChart2 className="w-3 h-3" />
                Adjustment
              </button>
              <button
                onClick={() => setRightTab("stockmaster")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-extrabold uppercase tracking-wider border-b-2 transition-colors",
                  rightTab === "stockmaster"
                    ? "border-brand-blue text-brand-blue bg-blue-50/50"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                <SlidersHorizontal className="w-3 h-3" />
                Stockmaster
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto">
              {!selectedProduct ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300 px-8 text-center">
                  <ChevronLeft className="w-8 h-8" />
                  <p className="text-[11px] font-bold">Click any product row to view and edit details here</p>
                </div>
              ) : rightTab === "adjustment" ? (
                <AdjustmentPanel product={selectedProduct} onSuccess={fetchProducts} />
              ) : (
                <StockmasterPanel product={selectedProduct} onSuccess={fetchProducts} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => { setIsAddModalOpen(false); fetchProducts(); }}
      />
      {selectedProduct && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); }}
          onSuccess={() => { setIsEditModalOpen(false); fetchProducts(); }}
          product={selectedProduct}
        />
      )}
    </div>
  );
}

// ─── Adjustment Panel ─────────────────────────────────────────────────────────
function AdjustmentPanel({ product, onSuccess }: { product: ProductRecord; onSuccess: () => void }) {
  const [adjType, setAdjType] = useState("ADD");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleSave = async () => {
    const n = parseInt(qty, 10);
    if (!n || n <= 0) return;
    setIsSaving(true);
    setSavedMsg(null);
    try {
      const delta = adjType === "ADD" ? n : adjType === "SUBTRACT" ? -n : n;
      const newQty = adjType === "SET" ? n : product.totalStockPieces + delta;
      await window.api.inventory.update(product.id, {
        totalStockPieces: newQty,
      } as any);
      setSavedMsg(`Stock updated: ${product.totalStockPieces} → ${newQty}`);
      setQty("");
      setReason("");
      onSuccess();
    } catch (e) {
      console.error(e);
      setSavedMsg("Error saving adjustment.");
    } finally {
      setIsSaving(false);
    }
  };

  const isLow  = product.totalStockPieces <= 50 && product.totalStockPieces > 0;
  const isOut  = product.totalStockPieces <= 0;

  return (
    <div className="p-4 flex flex-col gap-4">

      {/* Current Stock Badge */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Current Stock</p>
          <p className={cn(
            "text-2xl font-black mt-0.5",
            isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-emerald-600"
          )}>
            {product.totalStockPieces}
          </p>
          <p className="text-[9px] text-slate-400 font-medium mt-0.5">{product.packagingUnit}</p>
        </div>
        <div className="text-right">
          {isOut && <span className="text-[9px] font-extrabold text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />OUT OF STOCK</span>}
          {isLow && <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />LOW STOCK</span>}
          {!isOut && !isLow && <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" />OK</span>}
        </div>
      </div>

      {/* Adjustment Type */}
      <Field label="Adjustment Type">
        <div className="flex gap-1">
          {(["ADD","SUBTRACT","SET"] as const).map(t => (
            <button key={t}
              onClick={() => setAdjType(t)}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-extrabold rounded-lg border transition-all",
                adjType === t
                  ? t === "ADD"     ? "bg-emerald-500 border-emerald-500 text-white"
                  : t === "SUBTRACT"? "bg-red-500 border-red-500 text-white"
                  :                   "bg-brand-blue border-blue-500 text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              )}
            >
              {t === "ADD" ? "+ Add" : t === "SUBTRACT" ? "− Subtract" : "= Set"}
            </button>
          ))}
        </div>
      </Field>

      {/* Quantity */}
      <Field label={adjType === "SET" ? "Set Stock To" : "Quantity to " + (adjType === "ADD" ? "Add" : "Subtract")}>
        <input
          type="number" min="1"
          value={qty}
          onChange={e => setQty(e.target.value)}
          placeholder="Enter quantity..."
          className={inputCls}
        />
      </Field>

      {/* Reason */}
      <Field label="Reason / Reference">
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Damaged goods, Expired, Physical count..."
          rows={3}
          className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-800 placeholder:text-slate-300 resize-none"
        />
      </Field>

      {/* Preview */}
      {qty && parseInt(qty) > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px]">
          <span className="text-slate-500">After adjustment: </span>
          <span className="font-extrabold text-brand-blue">
            {adjType === "SET"
              ? parseInt(qty)
              : adjType === "ADD"
              ? product.totalStockPieces + parseInt(qty)
              : Math.max(0, product.totalStockPieces - parseInt(qty))} {product.packagingUnit}
          </span>
        </div>
      )}

      {/* Success/Error message */}
      {savedMsg && (
        <p className={cn("text-[10px] font-bold px-3 py-2 rounded-lg", savedMsg.includes("Error") ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100")}>
          {savedMsg}
        </p>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving || !qty || parseInt(qty) <= 0}
        className="w-full py-2 text-xs font-extrabold text-white bg-brand-blue hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all active:scale-95"
      >
        {isSaving ? "Saving..." : "Save Adjustment"}
      </button>
    </div>
  );
}

// ─── Stockmaster Panel ────────────────────────────────────────────────────────
function StockmasterPanel({ product, onSuccess }: { product: ProductRecord; onSuccess: () => void }) {
  const [sellPrice, setSellPrice] = useState(product.sellingPricePerPiece.toFixed(2));
  const [shelfId, setShelfId] = useState(product.shelfLocation || "");
  const [supplier, setSupplier] = useState(product.manufacturerName || "");
  const [category, setCategory] = useState(product.category || "BRD");
  const [packaging, setPackaging] = useState(product.packagingUnit || "EACH");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Reset fields when product changes
  useEffect(() => {
    setSellPrice(product.sellingPricePerPiece.toFixed(2));
    setShelfId(product.shelfLocation || "");
    setSupplier(product.manufacturerName || "");
    setCategory(product.category || "BRD");
    setPackaging(product.packagingUnit || "EACH");
    setSavedMsg(null);
  }, [product.id]);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedMsg(null);
    try {
      await window.api.inventory.update(product.id, {
        sellingPricePerPiece: parseFloat(sellPrice) || 0,
        sellingPricePerUnit: parseFloat(sellPrice) || 0,
        shelfLocation: shelfId.toUpperCase(),
        manufacturerName: supplier,
        category,
        packagingUnit: packaging,
      } as any);
      setSavedMsg("Stockmaster updated successfully.");
      onSuccess();
    } catch (e) {
      console.error(e);
      setSavedMsg("Error saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const markup = product.unitPriceCost > 0
    ? ((parseFloat(sellPrice) - product.unitPriceCost) / product.unitPriceCost) * 100
    : 0;

  return (
    <div className="p-4 flex flex-col gap-4">

      {/* Cost summary (read-only) */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Cost</p>
          <p className="text-lg font-black text-slate-700 mt-0.5">₱{product.unitPriceCost.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Markup</p>
          <p className={cn("text-lg font-black mt-0.5", markup >= 0 ? "text-emerald-600" : "text-red-500")}>
            {markup.toFixed(1)}%
          </p>
        </div>
      </div>

      <Field label="Sell Price per Piece (₱)">
        <input type="number" min="0" step="0.01"
          value={sellPrice}
          onChange={e => setSellPrice(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Shelf Location">
        <input type="text"
          value={shelfId}
          onChange={e => setShelfId(e.target.value.toUpperCase())}
          placeholder="e.g. A01"
          className={inputCls}
        />
      </Field>

      <Field label="Stock Group">
        <select value={category} onChange={e => setCategory(e.target.value as any)} className={selectCls}>
          {STOCK_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </Field>

      <Field label="Packaging Unit">
        <select value={packaging} onChange={e => setPackaging(e.target.value)} className={selectCls}>
          <option value="BOX">BOX</option>
          <option value="EACH">EACH</option>
        </select>
      </Field>

      <Field label="Manufacturer / Supplier">
        <input type="text"
          value={supplier}
          onChange={e => setSupplier(e.target.value)}
          placeholder="Supplier name"
          className={inputCls}
        />
      </Field>

      {/* Success/Error message */}
      {savedMsg && (
        <p className={cn("text-[10px] font-bold px-3 py-2 rounded-lg", savedMsg.includes("Error") ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100")}>
          {savedMsg}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-2 text-xs font-extrabold text-white bg-brand-blue hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all active:scale-95"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────
function AddItemModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    code: '', name: '', genericName: '', manufacturerName: '', brandType: 'Generic', category: 'BRD', subCategory: 'Other',
    packagingUnit: 'BOX', baseUnit: 'Piece', piecesPerUnit: 1, totalStockPieces: 0,
    unitPriceCost: 0, sellingPricePerUnit: 0, sellingPricePerPiece: 0, shelfLocation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await window.api.inventory.create(formData as any);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to add item. Check console for details.");
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 w-[620px] overflow-hidden flex flex-col ring-1 ring-slate-900/5">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="font-extrabold text-slate-800 text-sm">Add New Item</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Fill in the product details below</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <ModalBody formData={formData} setFormData={setFormData} onClose={onClose} submitLabel="Save Item" />
        </form>
      </div>
    </div>
  );
}

// ─── Edit Item Modal ──────────────────────────────────────────────────────────
function EditItemModal({ isOpen, onClose, onSuccess, product }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, product: ProductRecord }) {
  const [formData, setFormData] = useState({
    code: product.code || '', name: product.name || '', genericName: product.genericName || '',
    manufacturerName: product.manufacturerName || '', brandType: product.brandType || 'Generic',
    category: product.category || 'BRD', subCategory: product.subCategory || 'Other',
    packagingUnit: product.packagingUnit || 'BOX', baseUnit: product.baseUnit || 'Piece',
    piecesPerUnit: product.piecesPerUnit || 1, totalStockPieces: product.totalStockPieces || 0,
    unitPriceCost: product.unitPriceCost || 0, sellingPricePerUnit: product.sellingPricePerUnit || 0,
    sellingPricePerPiece: product.sellingPricePerPiece || 0, shelfLocation: product.shelfLocation || '',
    isActive: product.isActive, salesCount: product.salesCount
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await window.api.inventory.update(product.id, formData as any);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to update item. Check console for details.");
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 w-[620px] overflow-hidden flex flex-col ring-1 ring-slate-900/5">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="font-extrabold text-slate-800 text-sm">Edit Item</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 font-mono">{product.code} — {product.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <ModalBody formData={formData} setFormData={setFormData} onClose={onClose} submitLabel="Save Changes" />
        </form>
      </div>
    </div>
  );
}

// ─── Shared Modal Body ────────────────────────────────────────────────────────
function ModalBody({ formData, setFormData, onClose, submitLabel }: {
  formData: any; setFormData: (d: any) => void; onClose: () => void; submitLabel: string;
}) {
  const set = (key: string, val: any) => setFormData({ ...formData, [key]: val });
  return (
    <>
      <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Stock Code">
            <input required value={formData.code} onChange={e => set('code', e.target.value)} className={inputCls} placeholder="e.g. MED-001" />
          </Field>
          <div className="col-span-2">
            <Field label="Item Name">
              <input required value={formData.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Full product name" />
            </Field>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Generic Name">
            <input value={formData.genericName} onChange={e => set('genericName', e.target.value)} className={inputCls} placeholder="Optional" />
          </Field>
          <Field label="Manufacturer / Supplier">
            <input value={formData.manufacturerName} onChange={e => set('manufacturerName', e.target.value)} className={inputCls} placeholder="Optional" />
          </Field>
        </div>
        <div className="border-t border-slate-100 pt-1">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Classification</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stock Group">
            <select value={formData.category} onChange={e => set('category', e.target.value)} className={selectCls}>
              {STOCK_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Brand Type">
            <select value={formData.brandType} onChange={e => set('brandType', e.target.value)} className={selectCls}>
              <option value="Generic">Generic</option>
              <option value="Branded">Branded</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Shelf Location">
            <input value={formData.shelfLocation} onChange={e => set('shelfLocation', e.target.value.toUpperCase())} className={inputCls} placeholder="e.g. A01" />
          </Field>
          <Field label="Packaging">
            <select value={formData.packagingUnit} onChange={e => set('packagingUnit', e.target.value)} className={selectCls}>
              <option value="BOX">BOX</option>
              <option value="EACH">EACH</option>
            </select>
          </Field>
          <Field label="Total Stock (Pcs)">
            <input required type="number" min="0" value={formData.totalStockPieces} onChange={e => set('totalStockPieces', Number(e.target.value))} className={inputCls} />
          </Field>
        </div>
        <div className="border-t border-slate-100 pt-1">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pricing</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase Cost (₱)">
            <input required type="number" min="0" step="0.01" value={formData.unitPriceCost} onChange={e => set('unitPriceCost', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Sell Price per Piece (₱)">
            <input required type="number" min="0" step="0.01" value={formData.sellingPricePerPiece} onChange={e => set('sellingPricePerPiece', Number(e.target.value))} className={inputCls} />
          </Field>
        </div>
      </div>
      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-2 shrink-0">
        <button type="button" onClick={onClose}
          className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-5 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95">
          {submitLabel}
        </button>
      </div>
    </>
  );
}
