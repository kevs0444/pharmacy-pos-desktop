import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { PageHeader } from "./ui/PageHeader";
import { Search, Plus, Edit, Trash2, X } from "lucide-react";
import { DataGrid, DataGridRow, DataGridCell } from "./ui/DataGrid";
import type { ProductRecord } from "../../backend/types/domain";

type TabType = 'StockStatus' | 'StockAdjustments' | 'StockmasterInitializer';

export function Inventory() {
  const [activeTab, setActiveTab] = useState<TabType>('StockStatus');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'StockStatus', label: 'STOCK STATUS' },
    { id: 'StockAdjustments', label: 'STOCKS ADJUSTMENTS' },
    { id: 'StockmasterInitializer', label: 'STOCKMASTER INITIALIZER' },
  ];

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col font-mono text-xs overflow-hidden select-none">

      {/* 1. Header Toolbar */}
      <PageHeader>
        <div className="flex gap-1.5 flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn("px-4 py-1.5 font-bold rounded shadow-sm border transition-colors",
                activeTab === tab.id
                  ? "bg-white text-slate-800 border-slate-200"
                  : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* 2. Tab Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {activeTab === 'StockStatus' && <StockStatusTab />}
        {activeTab === 'StockAdjustments' && <StockAdjustmentsTab />}
        {activeTab === 'StockmasterInitializer' && <StockmasterInitializerTab />}
      </div>

    </div>
  );
}

// -----------------------------------------------------------------------------
// STOCK STATUS TAB
// -----------------------------------------------------------------------------
function StockStatusTab() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await window.api.inventory.list();
      if (result && result.items) {
        setProducts(result.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    // For now we map filterCategory to category since we haven't strictly split stockgroups in the DB yet,
    // but the dropdown shows the exact legacy stockgroups.
    if (filterCategory !== "ALL" && p.category !== filterCategory && filterCategory !== "GEN" && filterCategory !== "BRD") return false;
    if (filterStatus === "LOW" && p.totalStockPieces > 50) return false;
    if (filterStatus === "OUT" && p.totalStockPieces > 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const gridColumns = [
    { key: "code", label: "Stock #", width: "w-20" },
    { key: "name", label: "Stock Name" },
    { key: "group", label: "Group", width: "w-20" },
    { key: "shelf", label: "Shelf", width: "w-16" },
    { key: "packaging", label: "Pkg", width: "w-16" },
    { key: "instock", label: "In Stock", width: "w-20", align: "right" as const },
    { key: "cost", label: "Unit Cost", width: "w-20", align: "right" as const },
    { key: "markup", label: "Markup", width: "w-16", align: "right" as const },
    { key: "price", label: "Selling Price", width: "w-24", align: "right" as const },
    { key: "mfg", label: "Manufacturer", width: "w-40" },
    { key: "actions", label: "", width: "w-16", align: "center" as const },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-sm">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex gap-3 items-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all placeholder:text-slate-300"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-8 px-2.5 pr-7 text-xs bg-white border border-slate-200 rounded-lg shadow-sm outline-none cursor-pointer font-medium text-slate-600 focus:border-brand-blue"
        >
          <option value="ALL">All Groups</option>
          <option value="BRD">BRD</option>
          <option value="BUNDLE">BUNDLE</option>
          <option value="CG">CG</option>
          <option value="GALE">GALE</option>
          <option value="GEN">GEN</option>
          <option value="MSUP">MSUP</option>
          <option value="REF">REF</option>
          <option value="STORE USE">STORE USE</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-8 px-2.5 pr-7 text-xs bg-white border border-slate-200 rounded-lg shadow-sm outline-none cursor-pointer font-medium text-slate-600 focus:border-brand-blue"
        >
          <option value="ALL">All Status</option>
          <option value="LOW">Low Stock</option>
          <option value="OUT">Out of Stock</option>
        </select>

        <div className="flex-1" />

        <span className="text-[11px] font-bold text-slate-400">{filteredProducts.length} items</span>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 h-8 px-3.5 text-xs font-bold text-white bg-brand-blue hover:bg-blue-700 rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-5">
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
              const isLowStock = p.totalStockPieces <= 50 && p.totalStockPieces > 0;
              const isOutOfStock = p.totalStockPieces <= 0;
              const markup = p.unitPriceCost > 0 ? ((p.sellingPricePerPiece - p.unitPriceCost) / p.unitPriceCost) * 100 : 0;

              return (
                <DataGridRow key={p.id}>
                  <DataGridCell className="text-slate-400 font-mono text-[10px] tracking-wide">{p.code}</DataGridCell>
                  <DataGridCell isBold className="text-slate-800">{p.name}</DataGridCell>
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
                      isOutOfStock
                        ? "bg-red-100 text-red-600"
                        : isLowStock
                        ? "bg-amber-100 text-amber-700"
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
                        onClick={() => { setSelectedProduct(p); setIsEditModalOpen(true); }}
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

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchProducts();
        }}
      />
      
      {selectedProduct && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedProduct(null); }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
            fetchProducts();
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
}



// -----------------------------------------------------------------------------
// STOCK ADJUSTMENTS TAB
// -----------------------------------------------------------------------------
function StockAdjustmentsTab() {
  const gridColumns = [
    { key: "no", label: "Stock No." },
    { key: "name", label: "Stock name", width: "min-w-[250px]" },
    { key: "expiry", label: "Expiry" },
    { key: "qty", label: "Adj Qty", align: "right" as const },
    { key: "ucost", label: "UCost", align: "right" as const },
    { key: "dcost", label: "Debit Cost", align: "right" as const },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-4 gap-4">
      <div className="flex justify-between items-end bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Period</span>
            <input type="month" className="h-7 px-2 border border-slate-300 rounded outline-none text-slate-800" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 ml-4">Search Doc#</span>
            <input type="text" className="h-7 w-32 px-2 border border-slate-300 rounded outline-none text-slate-800" />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="h-7 px-3 text-xs font-bold text-white bg-brand-blue rounded shadow-sm hover:bg-blue-700 transition-colors">New</button>
          <button className="h-7 px-3 text-xs font-bold text-white bg-amber-500 rounded shadow-sm hover:bg-amber-600 transition-colors">Post</button>
          <button className="h-7 px-3 text-xs font-bold text-white bg-red-500 rounded shadow-sm hover:bg-red-600 transition-colors">Delete</button>
          <button className="h-7 px-3 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 rounded shadow-sm hover:bg-slate-200 transition-colors">Print</button>
        </div>
      </div>

      <div className="flex gap-6 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
        <div className="flex flex-col gap-2 w-64">
          <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Doc No.</span><input className="w-32 h-6 bg-yellow-50 font-bold text-center border border-slate-300 rounded text-slate-800" value="ADJ-1002" readOnly /></div>
          <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Doc Date</span><input type="date" className="w-32 h-6 border border-slate-300 rounded px-1 outline-none text-slate-800" /></div>
          <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Entered By</span><input className="w-32 h-6 bg-slate-100 border border-slate-300 rounded px-2 text-slate-700 font-bold" value="ADMIN" readOnly /></div>
        </div>
        <div className="flex flex-col gap-2 w-72">
          <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Adjust Type</span><select className="w-48 h-6 border border-slate-300 rounded outline-none text-slate-800"><option>DAMAGE</option></select></div>
          <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Qty Type</span><select className="w-48 h-6 border border-slate-300 rounded outline-none text-slate-800"><option>BASE UNIT</option></select></div>
          <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Reference</span><input className="w-48 h-6 border border-slate-300 rounded px-2 outline-none text-slate-800" /></div>
        </div>
        <div className="flex-1"></div>
        <div className="flex flex-col gap-2 items-end w-56 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex justify-between items-center w-full"><span className="font-bold text-brand-blue">Net Amount</span><input className="w-28 h-6 bg-white font-bold text-right border border-slate-300 rounded px-2 text-slate-800" value="450.00" readOnly /></div>
          <div className="flex justify-between items-center w-full"><span className="font-bold text-red-500">Debit Amt</span><input className="w-28 h-6 bg-red-50 font-bold text-right border border-red-200 rounded px-2 text-red-600" value="450.00" readOnly /></div>
        </div>
      </div>

      <DataGrid columns={gridColumns}>
        <DataGridRow isHighlight>
          <DataGridCell className="text-slate-600">10610</DataGridCell>
          <DataGridCell isBold>AMOXICILLIN 500MG CAP</DataGridCell>
          <DataGridCell className="text-slate-600">30-Oct-27</DataGridCell>
          <DataGridCell align="right" className="font-bold text-red-600">-10</DataGridCell>
          <DataGridCell align="right" className="text-slate-700">4.50</DataGridCell>
          <DataGridCell align="right" isBold>45.00</DataGridCell>
        </DataGridRow>
      </DataGrid>
    </div>
  );
}

// -----------------------------------------------------------------------------
// STOCKMASTER INITIALIZER TAB
// -----------------------------------------------------------------------------
function StockmasterInitializerTab() {
  const gridColumns = [
    { key: "no", label: "Stock #" },
    { key: "name", label: "Stock name", width: "min-w-[250px]" },
    { key: "brand", label: "Brand" },
    { key: "sell", label: "SellPrice", align: "right" as const },
    { key: "avg", label: "AvgCost", align: "right" as const },
    { key: "shelf", label: "Shelf ID" },
    { key: "supplier", label: "Supplier" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-4 gap-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Search name</span>
            <input type="text" className="h-7 w-64 px-2 border border-slate-300 rounded outline-none text-slate-800" placeholder="Type to search..." />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 ml-4">Supplier</span>
            <select className="h-7 w-56 border border-slate-300 rounded outline-none text-slate-800"><option>ALL</option></select>
          </div>
        </div>
        <button className="h-7 px-6 text-xs font-bold text-white bg-brand-blue rounded shadow-sm hover:bg-blue-700 transition-colors">Save Changes</button>
      </div>

      <DataGrid columns={gridColumns}>
        <DataGridRow>
          <DataGridCell className="text-slate-500">10610</DataGridCell>
          <DataGridCell isBold>AMOXICILLIN 500MG CAP</DataGridCell>
          <DataGridCell className="text-slate-600">GENERIC</DataGridCell>
          <td className="border-r border-slate-100 px-0 py-0"><input className="w-full bg-yellow-50 font-bold text-slate-800 text-right px-3 py-1.5 h-full outline-none focus:bg-yellow-100" defaultValue="5.00" /></td>
          <DataGridCell align="right" className="font-bold text-brand-blue">4.50</DataGridCell>
          <td className="border-r border-slate-100 px-0 py-0"><input className="w-full text-center px-3 py-1.5 h-full outline-none focus:bg-slate-100" defaultValue="A01" /></td>
          <DataGridCell className="text-slate-600">UNILAB</DataGridCell>
        </DataGridRow>
      </DataGrid>
    </div>
  );
}

// -----------------------------------------------------------------------------
// ADD ITEM MODAL
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// EDIT ITEM MODAL
// -----------------------------------------------------------------------------
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
          <ModalBody
            formData={formData}
            setFormData={setFormData}
            onClose={onClose}
            submitLabel="Save Changes"
          />
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SHARED MODAL BODY (used by both Add & Edit)
// -----------------------------------------------------------------------------
const inputCls = "w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-800 placeholder:text-slate-300";
const selectCls = "w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-800 cursor-pointer";
const labelCls = "block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1";

const STOCK_GROUPS = ["BRD","BUNDLE","CG","GALE","GEN","MSUP","REF","STORE USE"] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function ModalBody({
  formData, setFormData, onClose, submitLabel
}: {
  formData: any;
  setFormData: (d: any) => void;
  onClose: () => void;
  submitLabel: string;
}) {
  const set = (key: string, val: any) => setFormData({ ...formData, [key]: val });

  return (
    <>
      <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">

        {/* Row 1 — Code + Name */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Stock Code">
            <input required value={formData.code} onChange={e => set('code', e.target.value)}
              className={inputCls} placeholder="e.g. MED-001" />
          </Field>
          <div className="col-span-2">
            <Field label="Item Name">
              <input required value={formData.name} onChange={e => set('name', e.target.value)}
                className={inputCls} placeholder="Full product name" />
            </Field>
          </div>
        </div>

        {/* Row 2 — Generic + Manufacturer */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Generic Name">
            <input value={formData.genericName} onChange={e => set('genericName', e.target.value)}
              className={inputCls} placeholder="Optional" />
          </Field>
          <Field label="Manufacturer / Supplier">
            <input value={formData.manufacturerName} onChange={e => set('manufacturerName', e.target.value)}
              className={inputCls} placeholder="Optional" />
          </Field>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 pt-1">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Classification</p>
        </div>

        {/* Row 3 — Group + Brand */}
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

        {/* Row 4 — Shelf + Packaging + Stock */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Shelf Location">
            <input value={formData.shelfLocation} onChange={e => set('shelfLocation', e.target.value.toUpperCase())}
              className={inputCls} placeholder="e.g. A01" />
          </Field>
          <Field label="Packaging">
            <select value={formData.packagingUnit} onChange={e => set('packagingUnit', e.target.value)} className={selectCls}>
              <option value="BOX">BOX</option>
              <option value="EACH">EACH</option>
            </select>
          </Field>
          <Field label="Total Stock (Pcs)">
            <input required type="number" min="0" value={formData.totalStockPieces}
              onChange={e => set('totalStockPieces', Number(e.target.value))} className={inputCls} />
          </Field>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 pt-1">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pricing</p>
        </div>

        {/* Row 5 — Cost + Sell Price */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase Cost (₱)">
            <input required type="number" min="0" step="0.01" value={formData.unitPriceCost}
              onChange={e => set('unitPriceCost', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Sell Price per Piece (₱)">
            <input required type="number" min="0" step="0.01" value={formData.sellingPricePerPiece}
              onChange={e => set('sellingPricePerPiece', Number(e.target.value))} className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Footer */}
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

