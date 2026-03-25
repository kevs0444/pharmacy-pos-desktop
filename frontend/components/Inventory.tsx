import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Package, Search, Plus, X, Save, Pill, Building2, FlaskConical, Pencil, LayoutGrid, List, ChevronLeft, ChevronRight, Trash2, AlertTriangle, Clock, Truck } from "lucide-react";
import { cn } from "../lib/utils";
import { ProductCatalogFilter } from "./ProductCatalogFilter";
import type { CreateProductInput, UpdateProductInput } from "../../backend/types/api";
import type { ProductBatchRecord } from "../../backend/types/domain";
import { InventoryItem, BrandType, ProductCategory, ProductSubCategory, getExpiryStatus, getNextBatch, daysUntilExpiry, getActiveBatches, mapBatchRecordToInventoryBatch } from "../lib/inventoryModel";
import { mapProductRecordToInventoryItem } from "../lib/mappers";
import { ProductCard, formatStock, getCategoryIcon } from "./ProductCard";

const LIST_PAGE_SIZE = 20;
const CARD_PAGE_SIZE = 12;

const emptyForm = () => ({
  code: `PRD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
  name: "",
  genericName: "",
  manufacturer: "",
  brandType: "Generic" as BrandType,
  category: "Medicine" as ProductCategory,
  subCategory: "OTC",
  packagingUnit: "Box",
  baseUnit: "Tablet",
  piecesPerUnit: "100",
  totalStockPieces: "",
  unitPriceCost: "",
  sellingPricePerUnit: "",
  sellingPricePerPiece: "",
  discount: "",
  // Batch fields
  lotNumber: "",
  manufacturingDate: "",
  expiryDate: ""
});

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertTab, setAlertTab] = useState<"restock" | "expiring" | "pending">("restock");

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const pageSize = 100;
      let page = 1;
      let totalPages = 1;
      const allProducts = [];

      do {
        const result = await window.api.inventory.list({ page, pageSize, includeInactive: true });
        if (!result || !result.items) throw new Error("Backend returned no items wrapper.");
        allProducts.push(...result.items);
        totalPages = result.totalPages;
        page += 1;
      } while (page <= totalPages);

      const mappedItems: InventoryItem[] = await Promise.all(
        allProducts.map(async (product) => {
          const batches = await window.api.inventory.listBatches(product.id);
          return {
            ...mapProductRecordToInventoryItem(product),
            batches: batches.map((batch: ProductBatchRecord) => mapBatchRecordToInventoryBatch(batch)),
          };
        }),
      );
      setItems(mappedItems);
    } catch (e: any) {
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: { title: "Inventory Fetch Error", message: e.message || String(e) }
      }));
      console.error("Failed to load inventory API:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInventory();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const onToggleSort = () => { setSortOrder(prev => prev === "asc" ? "desc" : "asc"); setCurrentPage(1); };

  const [formData, setFormData] = useState(emptyForm());
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<InventoryItem | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  const handleDelete = async (item: InventoryItem) => {
    try {
      await window.api.inventory.remove(item.id);
      await loadInventory();
      setDeleteConfirmItem(null);
    } catch (e: any) {
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: { title: "Delete Product Error", message: e.message || String(e) }
      }));
    }
  };

  const handleToggleActive = async (item: InventoryItem) => {
    try {
      await window.api.inventory.setActive(item.id, !item.isActive);
      await loadInventory();
    } catch (e: any) {
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: { title: "Update Product Error", message: e.message || String(e) }
      }));
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(emptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    const firstBatch = item.batches[0];
    setFormData({
      code: item.code,
      name: item.name,
      genericName: item.genericName || "",
      manufacturer: item.manufacturer || "",
      brandType: item.brandType,
      category: item.category,
      subCategory: item.subCategory,
      packagingUnit: item.packagingUnit,
      baseUnit: item.baseUnit,
      piecesPerUnit: String(item.piecesPerUnit),
      totalStockPieces: String(item.totalStockPieces),
      unitPriceCost: String(item.unitPriceCost),
      sellingPricePerUnit: String(item.sellingPricePerUnit),
      sellingPricePerPiece: String(item.sellingPricePerPiece),
      discount: String(item.discount || ""),
      lotNumber: firstBatch?.lotNumber || "",
      manufacturingDate: firstBatch?.manufacturingDate || "",
      expiryDate: firstBatch?.expiryDate || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    const ppu = parseInt(formData.piecesPerUnit) || 1;
    const totalStock = parseInt(formData.totalStockPieces) || 0;
    const discountValue = parseFloat(formData.discount);

    try {
      if (editingItem) {
        const payload: UpdateProductInput = {
          code: formData.code,
          name: formData.name,
          genericName: formData.genericName || null,
          manufacturerName: formData.manufacturer || null,
          brandType: formData.brandType,
          category: formData.category as ProductCategory,
          subCategory: formData.subCategory as ProductSubCategory,
          packagingUnit: formData.packagingUnit,
          baseUnit: formData.baseUnit,
          piecesPerUnit: ppu,
          totalStockPieces: totalStock,
          unitPriceCost: parseFloat(formData.unitPriceCost) || 0,
          sellingPricePerUnit: parseFloat(formData.sellingPricePerUnit) || 0,
          sellingPricePerPiece: parseFloat(formData.sellingPricePerPiece) || 0,
          discount: Number.isFinite(discountValue) ? discountValue : null,
          isActive: editingItem.isActive,
          salesCount: editingItem.salesCount,
        };
        await window.api.inventory.update(editingItem.id, payload);
      } else {
        const payload: CreateProductInput = {
          code: formData.code,
          name: formData.name,
          genericName: formData.genericName || null,
          manufacturerName: formData.manufacturer || null,
          brandType: formData.brandType,
          category: formData.category as ProductCategory,
          subCategory: formData.subCategory as ProductSubCategory,
          packagingUnit: formData.packagingUnit,
          baseUnit: formData.baseUnit,
          piecesPerUnit: ppu,
          totalStockPieces: totalStock,
          unitPriceCost: parseFloat(formData.unitPriceCost) || 0,
          sellingPricePerUnit: parseFloat(formData.sellingPricePerUnit) || 0,
          sellingPricePerPiece: parseFloat(formData.sellingPricePerPiece) || 0,
          discount: Number.isFinite(discountValue) ? discountValue : null,
          initialBatch: formData.expiryDate ? {
            lotNumber: formData.lotNumber || `LOT-${Date.now()}`,
            manufacturingDate: formData.manufacturingDate || new Date().toISOString().split("T")[0],
            expiryDate: formData.expiryDate,
            stockPieces: totalStock,
            receivedDate: new Date().toISOString().split("T")[0],
          } : undefined,
        };
        await window.api.inventory.create(payload);
      }
      await loadInventory();
      window.dispatchEvent(new CustomEvent('app-success', {
        detail: { 
          title: editingItem ? "Product Updated" : "Product Added", 
          message: `${formData.name} has been successfully saved to inventory.` 
        }
      }));
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData(emptyForm());
    } catch (e: any) {
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: { title: "Save Product Error", message: e.message || String(e) }
      }));
    }
  };

  // Memoized filtering — safe for 10,000+ products
  const sortedFilteredItems = useMemo(() => {
    return [...items.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.genericName || "").toLowerCase().includes(q) ||
        (item.manufacturer || "").toLowerCase().includes(q);
      const matchesCategory = selectedCategory === "All Products" || selectedCategory === "All" || item.category === selectedCategory;
      const matchesSubCategory = !selectedSubCategory || selectedSubCategory === "All" || item.subCategory === selectedSubCategory;
      return matchesSearch && matchesCategory && matchesSubCategory;
    })].sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [items, searchQuery, selectedCategory, selectedSubCategory, sortOrder]);

  const pageSize = viewMode === "list" ? LIST_PAGE_SIZE : CARD_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(sortedFilteredItems.length / pageSize));
  const pagedItems = sortedFilteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Auto-calculate price per piece from unit price and ppu
  const suggestedPricePerPiece = formData.sellingPricePerUnit && formData.piecesPerUnit
    ? (parseFloat(formData.sellingPricePerUnit) / parseInt(formData.piecesPerUnit) * 1.1).toFixed(2)
    : "";

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400 text-sm";

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50">
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto relative custom-scrollbar">

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              <div className="bg-brand-blue p-6 flex justify-between items-center text-white shrink-0">
                <div>
                  <h2 className="text-xl font-bold">{editingItem ? "Edit Pharmacy Item" : "Add New Pharmacy Item"}</h2>
                  <p className="text-sm opacity-80 mt-1">{editingItem ? "Update product details." : "Enter master data and initial stock."}</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">

                {/* Identity */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                    <Pill className="w-4 h-4 text-brand-blue" /> Product Identity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name *</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="e.g. Biogesic 500mg" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generic Name</label>
                      <input type="text" value={formData.genericName} onChange={e => setFormData({...formData, genericName: e.target.value})} className={inputClass} placeholder="e.g. Paracetamol" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Barcode / SKU</label>
                      <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className={cn(inputClass, "font-mono text-brand-blue font-bold")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manufacturer</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} className={cn(inputClass, "pl-9")} placeholder="e.g. Unilab" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand Type</label>
                      <select value={formData.brandType} onChange={e => setFormData({...formData, brandType: e.target.value as BrandType})} className={inputClass}>
                        <option value="Generic">Generic</option>
                        <option value="Branded">Branded</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Main Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})} className={inputClass}>
                        <option value="Medicine">Medicine</option>
                        <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                        <option value="Medical Devices">Medical Devices</option>
                        <option value="Medical Supplies">Medical Supplies</option>
                        <option value="Personal Care">Personal Care</option>
                        <option value="Baby & Mom">Baby & Mom</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Category / Type</label>
                      <select value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} className={inputClass}>
                        <option value="Prescription (Rx)">Prescription (Rx)</option>
                        <option value="OTC">Over the Counter (OTC)</option>
                        <option value="Herbal & Traditional">Herbal & Traditional</option>
                        <option value="Skincare">Skincare</option>
                        <option value="Haircare">Haircare</option>
                        <option value="Dental">Dental</option>
                        <option value="None">None / Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Packaging */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                    <FlaskConical className="w-4 h-4 text-brand-teal" /> Packaging & Units
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs font-medium text-blue-700">
                    💡 <strong>How this works:</strong> Set the <em>Packaging Unit</em> (what you order/store, e.g. "Box") and the <em>Base Unit</em> (what's inside, e.g. "Tablet"). Then set how many base units fit in one packaging unit. The system tracks stock in base units automatically.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Packaging Unit (outer)</label>
                      <select value={formData.packagingUnit} onChange={e => setFormData({...formData, packagingUnit: e.target.value})} className={inputClass}>
                        <option value="Box">Box</option>
                        <option value="Bottle">Bottle</option>
                        <option value="Pack">Pack</option>
                        <option value="Tube">Tube</option>
                        <option value="Sachet">Sachet</option>
                        <option value="Unit">Unit (single)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Unit (inner)</label>
                      <select value={formData.baseUnit} onChange={e => setFormData({...formData, baseUnit: e.target.value})} className={inputClass}>
                        <option value="Tablet">Tablet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Piece">Piece</option>
                        <option value="ml">ml (liquid)</option>
                        <option value="g">gram (topical)</option>
                        <option value="Sachet">Sachet</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pieces per {formData.packagingUnit}</label>
                      <input type="number" min="1" value={formData.piecesPerUnit} onChange={e => setFormData({...formData, piecesPerUnit: e.target.value})} className={inputClass} placeholder="e.g. 100" />
                    </div>
                  </div>
                </div>

                {/* Stock & Batch Tracking */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                    <Package className="w-4 h-4 text-brand-green" /> Stock & Batch Tracking
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs font-medium text-amber-700">
                    📦 <strong>Batch / Lot:</strong> Each delivery should be tracked as a separate batch. Enter the lot number from the manufacturer label, along with the manufacturing and expiry dates. The system uses <strong>FEFO</strong> (First Expired, First Out) to auto-select the correct batch when selling.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Stock (in {formData.baseUnit}s)</label>
                      <input type="number" value={formData.totalStockPieces} onChange={e => setFormData({...formData, totalStockPieces: e.target.value})} className={inputClass} placeholder={`e.g. 200 ${formData.baseUnit}s`} />
                      {formData.piecesPerUnit && formData.totalStockPieces && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          = {Math.floor(parseInt(formData.totalStockPieces)/parseInt(formData.piecesPerUnit))} {formData.packagingUnit}s, {parseInt(formData.totalStockPieces) % parseInt(formData.piecesPerUnit)} {formData.baseUnit}s
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lot / Batch Number</label>
                      <input type="text" value={formData.lotNumber} onChange={e => setFormData({...formData, lotNumber: e.target.value})} className={cn(inputClass, "font-mono")} placeholder="e.g. LOT-2026-AMX-01" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-red-400 uppercase tracking-wider">Manufacturing Date *</label>
                      <input type="date" value={formData.manufacturingDate} onChange={e => setFormData({...formData, manufacturingDate: e.target.value})} className={cn(inputClass, "text-slate-700 font-medium")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-red-400 uppercase tracking-wider">Expiry Date *</label>
                      <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className={cn(inputClass, "text-slate-700 font-medium")} />
                      {formData.expiryDate && (() => {
                        const d = daysUntilExpiry(formData.expiryDate);
                        return (
                          <p className={cn("text-[10px] font-bold",
                            d < 0 ? "text-red-500" : d <= 90 ? "text-red-500" : d <= 365 ? "text-orange-500" : "text-emerald-600"
                          )}>
                            {d < 0 ? `⚠️ Expired ${Math.abs(d)} days ago` : d <= 90 ? `🔴 ${d} days left (critical)` : d <= 365 ? `🟠 ${Math.floor(d/30)} months left` : `🟢 ${Math.floor(d/365)}yr ${Math.floor((d%365)/30)}mo left (safe)`}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                    <Pill className="w-4 h-4 text-brand-blue" /> Pricing & SRP
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost Price per {formData.packagingUnit} (₱)</label>
                      <input type="number" step="0.01" value={formData.unitPriceCost} onChange={e => setFormData({...formData, unitPriceCost: e.target.value})} className={inputClass} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SRP per {formData.packagingUnit} (₱)</label>
                      <input type="number" step="0.01" value={formData.sellingPricePerUnit} onChange={e => setFormData({...formData, sellingPricePerUnit: e.target.value})} className={inputClass} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SRP per {formData.baseUnit} (₱)</label>
                      <input type="number" step="0.01" value={formData.sellingPricePerPiece} onChange={e => setFormData({...formData, sellingPricePerPiece: e.target.value})} className={inputClass} placeholder={suggestedPricePerPiece || "0.00"} />
                      {suggestedPricePerPiece && !formData.sellingPricePerPiece && (
                        <button type="button" onClick={() => setFormData({...formData, sellingPricePerPiece: suggestedPricePerPiece})} className="text-[10px] text-brand-blue font-bold hover:underline">
                          Suggested: ₱{suggestedPricePerPiece} (auto +10%)
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount % (Optional)</label>
                      <input type="number" min="0" max="100" step="1" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className={inputClass} placeholder="e.g. 10" />
                    </div>
                  </div>
                </div>

                {/* Margin Preview */}
                {formData.unitPriceCost && formData.sellingPricePerUnit && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Profit Margin (per {formData.packagingUnit})</span>
                    <span className="text-lg font-black text-emerald-700">
                      ₱{(parseFloat(formData.sellingPricePerUnit) - parseFloat(formData.unitPriceCost)).toFixed(2)}
                      <span className="text-xs font-bold ml-2 text-emerald-500">
                        ({((parseFloat(formData.sellingPricePerUnit) - parseFloat(formData.unitPriceCost)) / parseFloat(formData.unitPriceCost) * 100).toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-8 py-3 bg-brand-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center gap-2 active:scale-95">
                  <Save className="w-5 h-5" /> {editingItem ? "Update Item" : "Save Item"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">Delete Product?</h3>
                <p className="text-sm text-slate-500 mb-1">You're about to permanently delete:</p>
                <p className="text-base font-bold text-slate-800 mb-6">{deleteConfirmItem.name}</p>
                <p className="text-xs text-slate-400 mb-6">This action cannot be undone. Consider disabling the product instead.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirmItem(null)} className="flex-1 py-3 px-4 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(deleteConfirmItem)} className="flex-1 py-3 px-4 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              Inventory Management
              {isLoading && <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded-md animate-pulse">Loading...</span>}
            </h1>
            <p className="text-sm text-slate-500 font-medium">Manage and view your pharmacy stock catalog</p>
          </div>
          <button onClick={openAddModal} className="bg-brand-blue hover:bg-blue-900 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold shadow-lg shadow-brand-blue/20 transition-all flex items-center gap-2 active:scale-95 self-start sm:self-auto text-sm md:text-base">
            <Plus className="w-4 h-4 md:w-5 md:h-5" /> Add Item
          </button>
        </div>

        <ProductCatalogFilter
           selectedCategory={selectedCategory}
           onSelectCategory={(cat) => { setSelectedCategory(cat); setCurrentPage(1); }}
           selectedSubCategory={selectedSubCategory}
           onSelectSubCategory={(sub) => { setSelectedSubCategory(sub); setCurrentPage(1); }}
           sortOrder={sortOrder}
           onToggleSort={onToggleSort}
        />

        {/* Smart Inventory Alerts Widget */}
        {(() => {
          const needsRestock = items.filter(i => i.isActive && (i.status === "Out of Stock" || i.status === "Low Stock"));
          const expiringSoon = items.filter(i => {
            if (!i.isActive) return false;
            const exp = getExpiryStatus(i);
            return exp === "expired" || exp === "critical" || exp === "warning";
          });
          const pendingReceipt: InventoryItem[] = []; // Will be populated from orders API
          
          const hasAlerts = needsRestock.length > 0 || expiringSoon.length > 0 || pendingReceipt.length > 0;
          
          if (!hasAlerts) return null;
          
          return (
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden mb-4">
              <CardHeader className="py-3 px-4 border-b border-slate-100 bg-linear-to-r from-brand-blue/5 to-brand-teal/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Smart Inventory Alerts
                  </CardTitle>
                  <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200">
                    <button
                      onClick={() => setAlertTab("restock")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5",
                        alertTab === "restock"
                          ? "bg-orange-500 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Package className="w-3.5 h-3.5" />
                      Restock
                      {needsRestock.length > 0 && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[9px] font-black",
                          alertTab === "restock" ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-600"
                        )}>
                          {needsRestock.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setAlertTab("expiring")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5",
                        alertTab === "expiring"
                          ? "bg-red-500 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Expiring
                      {expiringSoon.length > 0 && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[9px] font-black",
                          alertTab === "expiring" ? "bg-red-600 text-white" : "bg-red-100 text-red-600"
                        )}>
                          {expiringSoon.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setAlertTab("pending")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5",
                        alertTab === "pending"
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Pending
                      {pendingReceipt.length > 0 && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[9px] font-black",
                          alertTab === "pending" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"
                        )}>
                          {pendingReceipt.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 max-h-72 overflow-y-auto custom-scrollbar">
                {/* Needs Restock Tab */}
                {alertTab === "restock" && (
                  <div className="divide-y divide-slate-100">
                    {needsRestock.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-bold">All products are well-stocked!</p>
                      </div>
                    ) : (
                      needsRestock.map(item => {
                        const Icon = getCategoryIcon(item.category);
                        return (
                          <div key={item.id} onClick={() => { setSearchQuery(item.name); setCurrentPage(1); }} className="flex items-center justify-between p-3 hover:bg-orange-50/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 group-hover:scale-105 transition-transform">
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-extrabold text-slate-800 text-sm truncate">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{item.genericName || item.manufacturer}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="font-black text-orange-600 text-sm tracking-tight">{item.totalStockPieces} left</p>
                              <p className="text-[9px] font-extrabold text-orange-400 uppercase tracking-widest leading-none mt-0.5">{item.status}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Expiring Soon Tab */}
                {alertTab === "expiring" && (
                  <div className="divide-y divide-slate-100">
                    {expiringSoon.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No products expiring soon!</p>
                      </div>
                    ) : (
                      expiringSoon.map(item => {
                        const Icon = getCategoryIcon(item.category);
                        const expStatus = getExpiryStatus(item);
                        const isExpired = expStatus === "expired";
                        const nextBatch = getNextBatch(item);
                        return (
                          <div key={item.id} onClick={() => { setSearchQuery(item.name); setCurrentPage(1); }} className="flex items-center justify-between p-3 hover:bg-red-50/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={cn("w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform", 
                                isExpired ? "bg-red-50 border-red-200 text-red-600" : 
                                expStatus === "critical" ? "bg-red-50 border-red-200 text-red-500" :
                                "bg-orange-50 border-orange-200 text-orange-500"
                              )}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-extrabold text-slate-800 text-sm truncate">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                  Lot: {nextBatch?.lotNumber || "N/A"} • Exp: {nextBatch?.expiryDate || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className={cn("font-black text-sm tracking-tight", 
                                isExpired || expStatus === "critical" ? "text-red-600" : "text-orange-500"
                              )}>
                                {isExpired ? "EXPIRED" : `${daysUntilExpiry(nextBatch?.expiryDate || "")}d left`}
                              </p>
                              <p className={cn("text-[9px] font-extrabold uppercase tracking-widest leading-none mt-0.5", 
                                isExpired || expStatus === "critical" ? "text-red-400" : "text-orange-400"
                              )}>
                                {isExpired ? "Remove Now" : "Act Soon"}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Pending Receipt Tab */}
                {alertTab === "pending" && (
                  <div className="divide-y divide-slate-100">
                    {pendingReceipt.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No pending deliveries to receive</p>
                        <p className="text-xs mt-1">Products from delivered orders will appear here</p>
                      </div>
                    ) : (
                      pendingReceipt.map(item => {
                        const Icon = getCategoryIcon(item.category);
                        return (
                          <div key={item.id} onClick={() => { setSearchQuery(item.name); setCurrentPage(1); }} className="flex items-center justify-between p-3 hover:bg-blue-50/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-extrabold text-slate-800 text-sm truncate">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{item.genericName || item.manufacturer}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="font-black text-blue-600 text-xs tracking-tight uppercase">Ready</p>
                              <p className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest leading-none mt-0.5">Receive Stock</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        <Card className="border-t-4 border-t-brand-teal overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
            <CardTitle className="text-lg md:text-xl font-bold text-slate-800">
              Product List
              <span className="ml-2 text-sm font-normal text-slate-400">({sortedFilteredItems.length.toLocaleString()} items)</span>
            </CardTitle>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64 md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Name, SKU, manufacturer..."
                  className="w-full pl-9 pr-3 py-2 md:py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm font-medium transition-all" />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                <button onClick={() => { setViewMode("list"); setCurrentPage(1); }}
                  className={cn("p-1.5 md:p-2 rounded-md transition-all", viewMode === "list" ? "bg-white shadow-sm text-brand-blue" : "text-slate-400 hover:text-slate-600")} title="List View">
                  <List className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button onClick={() => { setViewMode("card"); setCurrentPage(1); }}
                  className={cn("p-1.5 md:p-2 rounded-md transition-all", viewMode === "card" ? "bg-white shadow-sm text-brand-blue" : "text-slate-400 hover:text-slate-600")} title="Card View">
                  <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 md:p-6 bg-slate-50/50 min-h-100">

            {viewMode === "list" ? (
              <div className="relative w-full overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-black tracking-wider">
                    <tr>
                      <th className="px-4 py-4">Product</th>
                      <th className="px-4 py-4">Expiry / Mfg</th>
                      <th className="px-4 py-4">SRP</th>
                      <th className="px-4 py-4">Stock</th>
                      <th className="px-4 py-4">Stock Status</th>
                      <th className="px-4 py-4">Expiry Status</th>
                      <th className="px-4 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pagedItems.map(item => {
                      const stockInfo = formatStock(item);
                      const expiryStatus = getExpiryStatus(item);
                      const nextBatch = getNextBatch(item);
                      const daysLeft = nextBatch ? daysUntilExpiry(nextBatch.expiryDate) : null;
                      const isExpanded = expandedItemId === item.id;
                      const effectiveSelling = item.discount ? item.sellingPricePerUnit * (1 - item.discount/100) : item.sellingPricePerUnit;
                      const margin = effectiveSelling - item.unitPriceCost;

                      // Row border color based on expiry
                      const rowBorderClass = expiryStatus === "expired" || expiryStatus === "critical"
                        ? "border-l-4 border-l-red-400"
                        : expiryStatus === "warning"
                        ? "border-l-4 border-l-orange-300"
                        : expiryStatus === "good"
                        ? "border-l-4 border-l-emerald-300"
                        : "border-l-4 border-l-transparent";

                      return (
                        <>
                          <tr key={item.id}
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className={cn(
                              "transition-colors group cursor-pointer",
                              rowBorderClass,
                              !item.isActive ? "opacity-50 bg-slate-50" : "hover:bg-slate-50/80",
                              isExpanded && "bg-brand-blue/3"
                            )}>
                            {/* Product */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="font-bold text-brand-blue group-hover:text-brand-green transition-colors">{item.name}</p>
                                  <p className="text-[11px] text-slate-400 font-medium">{item.genericName}</p>
                                </div>
                                {!item.isActive && (
                                  <span className="px-2 py-0.5 text-[9px] font-black text-slate-400 bg-slate-200 rounded uppercase tracking-widest">Disabled</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="font-mono text-[10px] text-slate-300">{item.code}</span>
                                <span className="text-slate-200">·</span>
                                <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider", item.subCategory === "Prescription (Rx)" ? "bg-red-50 text-red-500 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                                  {item.subCategory === "Prescription (Rx)" ? "Rx" : "OTC"}
                                </span>
                                <span className="text-[9px] text-slate-300 font-bold uppercase">{item.brandType}</span>
                              </div>
                            </td>
                            {/* Expiry / Mfg */}
                            <td className="px-4 py-3">
                              {nextBatch ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase w-9">Exp</span>
                                    <span className={cn("text-xs font-bold",
                                      expiryStatus === "expired" || expiryStatus === "critical" ? "text-red-500" :
                                      expiryStatus === "warning" ? "text-orange-500" : "text-emerald-600"
                                    )}>
                                      {nextBatch.expiryDate}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase w-9">Mfg</span>
                                    <span className="text-xs text-slate-400 font-medium">{nextBatch.manufacturingDate}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300 italic">No batches</span>
                              )}
                            </td>
                            {/* SRP */}
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-bold text-brand-blue text-sm">₱{effectiveSelling.toFixed(2)}<span className="text-[10px] text-slate-300 font-medium">/{item.packagingUnit}</span></p>
                                {item.piecesPerUnit > 1 && (
                                  <p className="text-[11px] text-slate-400 font-medium">₱{item.sellingPricePerPiece.toFixed(2)}/{item.baseUnit}</p>
                                )}
                                {item.discount && <p className="text-[10px] text-red-400 font-bold">-{item.discount}% off</p>}
                              </div>
                            </td>
                            {/* Stock */}
                            <td className="px-4 py-3">
                              <span className={cn("font-bold text-xs", stockInfo.isOut ? "text-red-500" : stockInfo.isLow ? "text-orange-500" : "text-slate-700")}>
                                {stockInfo.label}
                              </span>
                            </td>
                            {/* Stock Status */}
                            <td className="px-4 py-3">
                              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
                                item.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              )}>{item.status}</span>
                            </td>
                            {/* Expiry Status */}
                            <td className="px-4 py-3">
                              {expiryStatus === "expired" ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700">Expired</span>
                              ) : expiryStatus === "critical" ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600">{daysLeft}d left</span>
                              ) : expiryStatus === "warning" ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-600">{daysLeft !== null ? `${Math.floor(daysLeft / 30)}mo` : ""}</span>
                              ) : expiryStatus === "monitor" ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-700">{daysLeft !== null ? `${Math.floor(daysLeft / 30)}mo` : ""}</span>
                              ) : expiryStatus === "good" ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">Safe</span>
                              ) : (
                                <span className="text-xs text-slate-300">—</span>
                              )}
                            </td>
                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                                <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all" title="Edit">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleToggleActive(item)} className={cn("p-1.5 rounded-lg transition-all", item.isActive ? "text-slate-300 hover:text-orange-500 hover:bg-orange-50" : "text-orange-500 bg-orange-50 hover:bg-orange-100")} title={item.isActive ? "Disable product" : "Enable product"}>
                                  <Package className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setDeleteConfirmItem(item)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Detail Row */}
                          {isExpanded && (
                            <tr key={`detail-${item.id}`} className="bg-slate-50/70">
                              <td colSpan={7} className="px-6 py-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* Pricing Breakdown */}
                                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Pricing</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between"><span className="text-slate-400">Cost / {item.packagingUnit}</span><span className="font-bold text-slate-600">₱{item.unitPriceCost.toFixed(2)}</span></div>
                                      <div className="flex justify-between"><span className="text-slate-400">SRP / {item.packagingUnit}</span><span className="font-bold text-brand-blue">₱{item.sellingPricePerUnit.toFixed(2)}</span></div>
                                      {item.piecesPerUnit > 1 && (
                                        <div className="flex justify-between"><span className="text-slate-400">SRP / {item.baseUnit}</span><span className="font-bold text-slate-600">₱{item.sellingPricePerPiece.toFixed(2)}</span></div>
                                      )}
                                      {item.discount && (
                                        <div className="flex justify-between"><span className="text-slate-400">Discount</span><span className="font-bold text-red-500">-{item.discount}%</span></div>
                                      )}
                                      <div className="flex justify-between border-t border-slate-100 pt-2">
                                        <span className="text-slate-400 font-bold">Margin / {item.packagingUnit}</span>
                                        <span className={cn("font-black", margin >= 0 ? "text-emerald-600" : "text-red-500")}>
                                          {margin >= 0 ? "+" : ""}₱{margin.toFixed(2)} ({((margin / item.unitPriceCost) * 100).toFixed(1)}%)
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Product Info */}
                                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Product Info</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between"><span className="text-slate-400">Category</span><span className="font-bold text-slate-600">{item.category}</span></div>
                                      <div className="flex justify-between"><span className="text-slate-400">SubCategory</span><span className="font-bold text-slate-600">{item.subCategory}</span></div>
                                      <div className="flex justify-between"><span className="text-slate-400">Manufacturer</span><span className="font-bold text-slate-600">{item.manufacturer || "—"}</span></div>
                                      <div className="flex justify-between"><span className="text-slate-400">Packaging</span><span className="font-bold text-slate-600">{item.piecesPerUnit} {item.baseUnit}s / {item.packagingUnit}</span></div>
                                      <div className="flex justify-between"><span className="text-slate-400">Total Sales</span><span className="font-bold text-slate-600">{item.salesCount.toLocaleString()}</span></div>
                                    </div>
                                  </div>

                                  {/* Batch Breakdown */}
                                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Batch Breakdown ({getActiveBatches(item).length} active)</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                      {item.batches.length > 0 ? item.batches.map(batch => {
                                        const bDays = daysUntilExpiry(batch.expiryDate);
                                        return (
                                          <div key={batch.batchId} className={cn("flex items-center justify-between text-xs p-2 rounded-lg border",
                                            bDays < 0 ? "bg-red-50 border-red-100" :
                                            bDays <= 90 ? "bg-red-50/50 border-red-100" :
                                            bDays <= 365 ? "bg-orange-50/50 border-orange-100" :
                                            "bg-emerald-50/30 border-emerald-100"
                                          )}>
                                            <div>
                                              <p className="font-bold text-slate-700">{batch.lotNumber}</p>
                                              <p className="text-[10px] text-slate-400">Mfg: {batch.manufacturingDate} · Exp: {batch.expiryDate}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-bold text-slate-700">{batch.stockPieces} pcs</p>
                                              <p className={cn("text-[10px] font-bold",
                                                bDays < 0 ? "text-red-500" : bDays <= 90 ? "text-red-500" : bDays <= 365 ? "text-orange-500" : "text-emerald-600"
                                              )}>
                                                {bDays < 0 ? "EXPIRED" : `${bDays}d left`}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      }) : (
                                        <p className="text-xs text-slate-300 italic">No batches recorded</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pagedItems.map(item => (
                  <ProductCard key={item.id} product={item} viewMode="inventory" onAction={openEditModal} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
              <div className="flex items-center gap-2 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Package className="w-4 h-4 text-brand-blue" />
                <span>Showing {Math.min((currentPage - 1) * pageSize + 1, sortedFilteredItems.length)}–{Math.min(currentPage * pageSize, sortedFilteredItems.length)} of {sortedFilteredItems.length.toLocaleString()}</span>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    // Smart page numbers for large datasets
                    let page: number;
                    if (totalPages <= 7) page = i + 1;
                    else if (i === 0) page = 1;
                    else if (i === 6) page = totalPages;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 6 + i;
                    else page = currentPage - 2 + i;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={cn("w-8 h-8 rounded-lg text-xs font-bold border transition-all",
                          currentPage === page ? "bg-brand-blue text-white border-brand-blue shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-brand-blue/40"
                        )}>
                        {page}
                      </button>
                    );
                  })}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
