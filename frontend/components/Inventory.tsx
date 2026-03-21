import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Package, Search, Plus, X, Save, Pill, Building2, FlaskConical, Pencil, LayoutGrid, List } from "lucide-react";
import { cn } from "../lib/utils";
import { ProductCatalogFilter } from "./ProductCatalogFilter";
import { INVENTORY_DB, InventoryItem } from "../lib/mockData";
import { ProductCard } from "./ProductCard";

const emptyForm = () => ({
  code: `PRD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
  name: "",
  genericName: "",
  manufacturer: "",
  brandType: "Generic",
  dosageForm: "",
  requiresPrescription: false,
  category: "OTC",
  stock: "",
  unitPrice: "",
  sellingPrice: "",
  expiryDate: ""
});

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_DB);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "card">("card");
  
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const onToggleSort = () => setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  
  // Form State
  const [formData, setFormData] = useState(emptyForm());

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
      dosageForm: item.dosageForm || "",
      requiresPrescription: item.requiresPrescription || false,
      category: item.category,
      stock: String(item.stock),
      unitPrice: String(item.unitPrice),
      sellingPrice: String(item.sellingPrice),
      expiryDate: item.expiryDate || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (editingItem) {
      // Update existing item
      setItems(prev => prev.map(it => it.id === editingItem.id ? {
        ...it,
        code: formData.code,
        name: formData.name,
        genericName: formData.genericName,
        manufacturer: formData.manufacturer,
        brandType: formData.brandType as any,
        dosageForm: formData.dosageForm,
        requiresPrescription: formData.requiresPrescription,
        category: formData.category as any,
        stock: parseInt(formData.stock) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        expiryDate: formData.expiryDate,
        status: (parseInt(formData.stock) || 0) > 20 ? "Good" : (parseInt(formData.stock) || 0) > 5 ? "Moderate" : "Critical"
      } : it));
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: Date.now(),
        code: formData.code,
        name: formData.name,
        genericName: formData.genericName,
        manufacturer: formData.manufacturer,
        brandType: formData.brandType as any,
        dosageForm: formData.dosageForm,
        requiresPrescription: formData.requiresPrescription,
        category: formData.category as any,
        stock: parseInt(formData.stock) || 0,
        unit: "pcs",
        unitPrice: parseFloat(formData.unitPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        expiryDate: formData.expiryDate,
        status: (parseInt(formData.stock) || 0) > 20 ? "Good" : "Moderate",
        salesCount: 0
      };
      setItems([newItem, ...items]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(emptyForm());
  };

  const sortedFilteredItems = [...items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Products" || selectedCategory === "All" || item.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(item.category.toLowerCase());
    return matchesSearch && matchesCategory;
  })].sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400 text-sm";

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50">
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto relative custom-scrollbar">
      
      {/* Add/Edit Item Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="bg-brand-blue p-6 flex justify-between items-center text-white shrink-0">
              <div>
                <h2 className="text-xl font-bold">{editingItem ? "Edit Pharmacy Item" : "Add New Pharmacy Item"}</h2>
                <p className="text-sm opacity-80 mt-1">{editingItem ? "Update product details." : "Enter product master data and initial stock."}</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
              
              {/* Identity Section */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                  <Pill className="w-4 h-4 text-brand-blue" /> Product Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="e.g. Biogesic 500mg" />
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manufacturer / Brand</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} className={cn(inputClass, "pl-9")} placeholder="e.g. Unilab" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand Type</label>
                    <select value={formData.brandType} onChange={e => setFormData({...formData, brandType: e.target.value as any})} className={inputClass}>
                      <option value="Generic">Generic</option>
                      <option value="Branded">Branded</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputClass}>
                      <option value="Prescription">Prescription (Rx)</option>
                      <option value="OTC">Over the Counter (OTC)</option>
                      <option value="Generic">Generic</option>
                      <option value="Supplements">Vitamins & Supplements</option>
                      <option value="Supplies">Medical Supplies</option>
                      <option value="Personal Care">Personal Care</option>
                      <option value="Baby & Mom">Baby & Mom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Formulation & Compliance */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                  <FlaskConical className="w-4 h-4 text-brand-teal" /> Formulation & Compliance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dosage Form / Unit</label>
                    <select value={formData.dosageForm} onChange={e => setFormData({...formData, dosageForm: e.target.value})} className={inputClass}>
                      <option value="">Select Form...</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup/Suspension</option>
                      <option value="Drops">Drops</option>
                      <option value="Cream/Ointment">Cream/Ointment</option>
                      <option value="Injection">Injection/Vial</option>
                      <option value="Piece">Piece (Supplies)</option>
                      <option value="Box">Box</option>
                    </select>
                  </div>
                  <div className="flex items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-3 cursor-pointer w-full">
                      <input 
                        type="checkbox" 
                        checked={formData.requiresPrescription} 
                        onChange={e => setFormData({...formData, requiresPrescription: e.target.checked})} 
                        className="w-5 h-5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue" 
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">Requires Prescription (Rx)</span>
                        <span className="text-xs text-slate-500">Flag this item as Rx-only during POS checkout.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                  <Package className="w-4 h-4 text-brand-green" /> Inventory & Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Stock</label>
                    <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className={inputClass} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price (₱) — Cost</label>
                    <input type="number" step="0.01" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} className={inputClass} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price (₱)</label>
                    <input type="number" step="0.01" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} className={inputClass} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiration Date</label>
                    <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className={cn(inputClass, "text-slate-700 font-medium")} />
                  </div>
                </div>
              </div>

              {/* Margin Preview */}
              {formData.unitPrice && formData.sellingPrice && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Profit Margin</span>
                  <span className="text-lg font-black text-emerald-700">
                    ₱{(parseFloat(formData.sellingPrice) - parseFloat(formData.unitPrice)).toFixed(2)} 
                    <span className="text-xs font-bold ml-2 text-emerald-500">
                      ({((parseFloat(formData.sellingPrice) - parseFloat(formData.unitPrice)) / parseFloat(formData.unitPrice) * 100).toFixed(1)}%)
                    </span>
                  </span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-8 py-3 bg-brand-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center gap-2 active:scale-95">
                <Save className="w-5 h-5" /> {editingItem ? "Update Item" : "Save Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-sm text-slate-500 font-medium">Manage and view your pharmacy stock catalog</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-brand-blue hover:bg-blue-900 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold shadow-lg shadow-brand-blue/20 transition-all flex items-center gap-2 active:scale-95 self-start sm:self-auto text-sm md:text-base"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Add Item
        </button>
      </div>

      <ProductCatalogFilter 
         selectedCategory={selectedCategory} 
         onSelectCategory={setSelectedCategory} 
         sortOrder={sortOrder} 
         onToggleSort={onToggleSort} 
      />

      <Card className="border-t-4 border-t-brand-teal relative z-10 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 md:pb-6 gap-3 md:gap-4">
          <CardTitle className="text-lg md:text-xl font-bold text-slate-800">Product List</CardTitle>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU, or category..." 
                className="w-full pl-9 pr-3 py-2 md:py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm font-medium transition-all"
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button 
                onClick={() => setViewMode("list")} 
                className={cn("p-1.5 md:p-2 rounded-md transition-all", viewMode === "list" ? "bg-white shadow-sm text-brand-blue" : "text-slate-400 hover:text-slate-600")}
                title="List View"
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button 
                onClick={() => setViewMode("card")} 
                className={cn("p-1.5 md:p-2 rounded-md transition-all", viewMode === "card" ? "bg-white shadow-sm text-brand-blue" : "text-slate-400 hover:text-slate-600")}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6 bg-slate-50/50 min-h-[500px]">

            {viewMode === "list" ? (
              <div className="relative w-full overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-black tracking-wider">
                    <tr>
                      <th className="px-4 py-4">Item Code</th>
                      <th className="px-4 py-4">Product Name</th>
                      <th className="px-4 py-4">Category</th>
                      <th className="px-4 py-4">Stock</th>
                      <th className="px-4 py-4">Unit Price</th>
                      <th className="px-4 py-4">Selling Price</th>
                      <th className="px-4 py-4">Margin</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {sortedFilteredItems.map(item => (
                       <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                         <td className="px-4 py-4 font-mono text-slate-500 text-xs font-semibold">{item.code}</td>
                         <td className="px-4 py-4 font-bold text-brand-blue group-hover:text-brand-green transition-colors flex flex-col items-start gap-1">
                           <span>{item.name}</span>
                           {item.requiresPrescription && <span className="bg-red-50 text-red-500 text-[9px] px-1.5 py-0.5 rounded border border-red-100 uppercase font-black" title="Prescription Required">Rx</span>}
                         </td>
                         <td className="px-4 py-4 font-medium"><span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 text-xs font-bold uppercase tracking-wider">{item.category}</span></td>
                         <td className="px-4 py-4 font-semibold">
                           <span className={item.stock < 10 ? "text-red-500 font-black" : "text-slate-800"}>{item.stock}</span> 
                           <span className="text-slate-400 text-xs ml-1 font-normal">{item.unit}</span>
                         </td>
                         <td className="px-4 py-4 font-semibold text-slate-500">₱{item.unitPrice.toFixed(2)}</td>
                         <td className="px-4 py-4 font-bold text-brand-blue">
                           ₱{(item.discount ? item.sellingPrice * (1 - item.discount / 100) : item.sellingPrice).toFixed(2)}
                           {item.discount && <span className="block text-[10px] text-slate-400 line-through">₱{item.sellingPrice.toFixed(2)}</span>}
                         </td>
                         <td className="px-4 py-4">
                           <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                             +₱{((item.discount ? item.sellingPrice * (1 - item.discount / 100) : item.sellingPrice) - item.unitPrice).toFixed(2)}
                           </span>
                         </td>
                         <td className="px-4 py-4">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                             item.status === 'Good' ? 'bg-emerald-100 text-emerald-700' :
                             item.status === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                             'bg-red-100 text-red-700'
                           }`}>
                             {item.status}
                           </span>
                         </td>
                         <td className="px-4 py-4 text-center">
                           <button 
                             onClick={() => openEditModal(item)}
                             className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
                             title="Edit Item"
                           >
                             <Pencil className="w-4 h-4" />
                           </button>
                         </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {sortedFilteredItems.map(item => (
                  <ProductCard 
                     key={item.id} 
                     product={item} 
                     viewMode="inventory" 
                     onAction={openEditModal} 
                  />
                ))}
              </div>
            )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
             <div className="flex items-center gap-2 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Package className="w-4 h-4 text-brand-blue" /> 
                <span>Showing {sortedFilteredItems.length} items</span>
             </div>
             <div className="flex gap-2 mt-4 sm:mt-0">
                <button className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">Previous</button>
                <button className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">Next</button>
             </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
