import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Package, Search, Plus, X, Save, Pill, Building2, FlaskConical, Pencil, LayoutGrid, List, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";
import { ProductCatalogFilter } from "./ProductCatalogFilter";
import { INVENTORY_DB, InventoryItem, BrandType, ProductCategory } from "../lib/mockData";
import { ProductCard, formatStock } from "./ProductCard";

/* 
 * PERFORMANCE NOTE:
 * Inventory is designed to scale to thousands of products.
 * - All filtering/sorting is memoized via useMemo.
 * - Pagination renders only PAGE_SIZE rows at a time in DOM.
 * - In Phase 2 (DB integration), replace INVENTORY_DB with
 *   cursor-based SQL queries: SELECT * FROM products LIMIT 20 OFFSET {page*20}
 * - Consider adding a server-side search index (FTS5 in SQLite)
 *   for instant full-text search across 10,000+ products.
 */

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
  expiryDate: ""
});

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_DB);
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

  const handleDelete = (item: InventoryItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    setDeleteConfirmItem(null);
  };

  const handleToggleActive = (item: InventoryItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(emptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
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
      expiryDate: item.batches[0]?.expiryDate || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    const ppu = parseInt(formData.piecesPerUnit) || 1;
    const totalStock = parseInt(formData.totalStockPieces) || 0;
    const status = totalStock <= 0 ? "Critical" : totalStock <= ppu ? "Moderate" : "Good";

    if (editingItem) {
      setItems(prev => prev.map(it => it.id === editingItem.id ? {
        ...it,
        code: formData.code, name: formData.name, genericName: formData.genericName,
        manufacturer: formData.manufacturer, brandType: formData.brandType,
        category: formData.category as ProductCategory, subCategory: formData.subCategory as any,
        packagingUnit: formData.packagingUnit, baseUnit: formData.baseUnit,
        piecesPerUnit: ppu, totalStockPieces: totalStock,
        unitPriceCost: parseFloat(formData.unitPriceCost) || 0,
        sellingPricePerUnit: parseFloat(formData.sellingPricePerUnit) || 0,
        sellingPricePerPiece: parseFloat(formData.sellingPricePerPiece) || 0,
        discount: parseFloat(formData.discount) || undefined,
        status
      } : it));
    } else {
      const newItem: InventoryItem = {
        id: Date.now(), code: formData.code, name: formData.name,
        genericName: formData.genericName, manufacturer: formData.manufacturer,
        brandType: formData.brandType, category: formData.category as ProductCategory,
        subCategory: formData.subCategory as any,
        packagingUnit: formData.packagingUnit, baseUnit: formData.baseUnit,
        piecesPerUnit: ppu, totalStockPieces: totalStock,
        unitPriceCost: parseFloat(formData.unitPriceCost) || 0,
        sellingPricePerUnit: parseFloat(formData.sellingPricePerUnit) || 0,
        sellingPricePerPiece: parseFloat(formData.sellingPricePerPiece) || 0,
        discount: parseFloat(formData.discount) || undefined,
        status, salesCount: 0, isActive: true,
        batches: formData.expiryDate ? [{
          batchId: `B-${Date.now()}`,
          lotNumber: `LOT-${Date.now()}`,
          manufacturingDate: new Date().toISOString().split("T")[0],
          expiryDate: formData.expiryDate,
          stockPieces: totalStock,
          receivedDate: new Date().toISOString().split("T")[0],
        }] : []
      };
      setItems(prev => [newItem, ...prev]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(emptyForm());
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

                {/* Pricing & Stock */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                    <Package className="w-4 h-4 text-brand-green" /> Inventory & Pricing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost Price per {formData.packagingUnit} (₱)</label>
                      <input type="number" step="0.01" value={formData.unitPriceCost} onChange={e => setFormData({...formData, unitPriceCost: e.target.value})} className={inputClass} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price per {formData.packagingUnit} (₱)</label>
                      <input type="number" step="0.01" value={formData.sellingPricePerUnit} onChange={e => setFormData({...formData, sellingPricePerUnit: e.target.value})} className={inputClass} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price per {formData.baseUnit} (₱)</label>
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
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiration Date</label>
                      <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className={cn(inputClass, "text-slate-700 font-medium")} />
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
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Inventory Management</h1>
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

          <CardContent className="p-3 md:p-6 bg-slate-50/50 min-h-[400px]">

            {viewMode === "list" ? (
              <div className="relative w-full overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-black tracking-wider">
                    <tr>
                      <th className="px-4 py-4">SKU</th>
                      <th className="px-4 py-4">Product</th>
                      <th className="px-4 py-4">Category</th>
                      <th className="px-4 py-4">Stock</th>
                      <th className="px-4 py-4">Cost / {'{'}pack{'}'}</th>
                      <th className="px-4 py-4">Sell / Pack</th>
                      <th className="px-4 py-4">Sell / Piece</th>
                      <th className="px-4 py-4">Margin</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pagedItems.map(item => {
                      const stockInfo = formatStock(item);
                      const effectiveSelling = item.discount ? item.sellingPricePerUnit * (1 - item.discount/100) : item.sellingPricePerUnit;
                      const margin = effectiveSelling - item.unitPriceCost;
                      return (
                        <tr key={item.id} className={cn("transition-colors group", !item.isActive ? "opacity-50 bg-slate-50" : "hover:bg-slate-50/80")}>
                          <td className="px-4 py-3 font-mono text-slate-400 text-xs">{item.code}</td>
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
                              <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider", item.subCategory === "Prescription (Rx)" ? "bg-red-50 text-red-500 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                                {item.subCategory === "Prescription (Rx)" ? "Rx" : "OTC"}
                              </span>
                              <span className="text-[9px] text-slate-300 font-bold uppercase">{item.brandType}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 text-xs font-bold uppercase tracking-wider">{item.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("font-bold text-xs", stockInfo.isOut ? "text-red-500" : stockInfo.isLow ? "text-orange-500" : "text-slate-700")}>
                              {stockInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-500 text-xs">₱{item.unitPriceCost.toFixed(2)}</td>
                          <td className="px-4 py-3 font-bold text-brand-blue text-xs">
                            ₱{effectiveSelling.toFixed(2)}
                            {item.discount && <span className="block text-[10px] text-slate-300 line-through">₱{item.sellingPricePerUnit.toFixed(2)}</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-semibold">₱{item.sellingPricePerPiece.toFixed(2)}<span className="text-slate-300">/{item.baseUnit}</span></td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs font-bold px-2 py-1 rounded-md", margin >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50")}>
                              {margin >= 0 ? "+" : ""}₱{margin.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold",
                              item.status === 'Good' ? 'bg-emerald-100 text-emerald-700' :
                              item.status === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            )}>{item.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
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
