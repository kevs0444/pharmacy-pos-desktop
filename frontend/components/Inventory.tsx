import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Package, Search, Plus, X, Save, LayoutGrid, List, Pencil, Pill } from "lucide-react";
import { cn } from "../lib/utils";

const INITIAL_INVENTORY = [
  { id: 1, code: "PRD-X91A", name: "Amoxicillin 500mg", category: "Prescription", stock: 120, unit: "boxes", unitPrice: 3.20, sellingPrice: 4.50, status: "Good" },
  { id: 2, code: "PRD-V002", name: "Vitamin C Ascorbic Acid", category: "OTC", stock: 42, unit: "btls", unitPrice: 8.50, sellingPrice: 12.00, status: "Moderate" },
  { id: 3, code: "PRD-C119", name: "Paracetamol 500mg", category: "Generic", stock: 5, unit: "boxes", unitPrice: 1.20, sellingPrice: 2.00, status: "Critical" },
  { id: 4, code: "PRD-B445", name: "Cetirizine 10mg", category: "OTC", stock: 85, unit: "boxes", unitPrice: 2.80, sellingPrice: 5.00, status: "Good" },
  { id: 5, code: "PRD-D780", name: "Losartan 50mg", category: "Prescription", stock: 15, unit: "boxes", unitPrice: 5.50, sellingPrice: 8.75, status: "Moderate" },
];

type InventoryItem = typeof INITIAL_INVENTORY[0];

const emptyForm = () => ({
  code: `PRD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
  name: "",
  genericName: "",
  category: "OTC",
  stock: "",
  unitPrice: "",
  sellingPrice: "",
  expiryDate: ""
});

export function Inventory() {
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [searchQuery, setSearchQuery] = useState("");
  
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
      genericName: "",
      category: item.category,
      stock: String(item.stock),
      unitPrice: String(item.unitPrice),
      sellingPrice: String(item.sellingPrice),
      expiryDate: ""
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
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        status: (parseInt(formData.stock) || 0) > 20 ? "Good" : (parseInt(formData.stock) || 0) > 5 ? "Moderate" : "Critical"
      } : it));
    } else {
      // Add new item
      const newItem = {
        id: Date.now(),
        code: formData.code,
        name: formData.name,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        unit: "pcs",
        unitPrice: parseFloat(formData.unitPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        status: (parseInt(formData.stock) || 0) > 20 ? "Good" : "Moderate"
      };
      setItems([newItem, ...items]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(emptyForm());
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400 text-sm";

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 bg-slate-50 overflow-y-auto relative h-full custom-scrollbar">
      
      {/* Add/Edit Item Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4">
            
            <div className="bg-brand-blue p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">{editingItem ? "Edit Pharmacy Item" : "Add New Pharmacy Item"}</h2>
                <p className="text-sm opacity-80 mt-1">{editingItem ? "Update product details." : "Enter product master data and initial stock."}</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
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
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className={cn(inputClass, "font-mono")} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputClass}>
                    <option value="Prescription">Prescription (Rx)</option>
                    <option value="OTC">Over the Counter (OTC)</option>
                    <option value="Generic">Generic</option>
                    <option value="Supplements">Vitamins & Supplements</option>
                    <option value="Supplies">Medical Supplies</option>
                  </select>
                </div>

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
                  <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className={cn(inputClass, "text-slate-700")} />
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

      <Card className="border-t-4 border-t-brand-teal relative z-10 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 md:pb-6 gap-3 md:gap-4">
          <CardTitle className="text-lg md:text-xl font-bold text-slate-800">Product List</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU, or category..." 
                className="w-full pl-9 pr-3 py-2 md:py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm font-medium transition-all"
              />
            </div>
            {/* View Mode Toggle */}
            <div className="hidden md:flex bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200">
              <button 
                onClick={() => setViewMode("list")}
                className={cn("px-3 py-1.5 rounded-lg flex items-center justify-center transition-all", viewMode === "list" ? "bg-white shadow-sm text-brand-blue border border-slate-200/50" : "text-slate-400 hover:text-slate-600")}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("card")}
                className={cn("px-3 py-1.5 rounded-lg flex items-center justify-center transition-all", viewMode === "card" ? "bg-white shadow-sm text-brand-blue border border-slate-200/50" : "text-slate-400 hover:text-slate-600")}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">

          {/* ===== TABLE / LIST VIEW ===== */}
          {viewMode === "list" && (
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
                  {filteredItems.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                       <td className="px-4 py-4 font-mono text-slate-500 text-xs font-semibold">{item.code}</td>
                       <td className="px-4 py-4 font-bold text-brand-blue group-hover:text-brand-green transition-colors">{item.name}</td>
                       <td className="px-4 py-4 font-medium"><span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 text-xs">{item.category}</span></td>
                       <td className="px-4 py-4 font-semibold">
                         <span className={item.stock < 10 ? "text-red-500" : "text-slate-800"}>{item.stock}</span> 
                         <span className="text-slate-400 text-xs ml-1 font-normal">{item.unit}</span>
                       </td>
                       <td className="px-4 py-4 font-semibold text-slate-500">₱{item.unitPrice.toFixed(2)}</td>
                       <td className="px-4 py-4 font-bold text-brand-blue">₱{item.sellingPrice.toFixed(2)}</td>
                       <td className="px-4 py-4">
                         <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                           +₱{(item.sellingPrice - item.unitPrice).toFixed(2)}
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
          )}

          {/* ===== CARD VIEW ===== */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
                  {/* Icon Header */}
                  <div className="h-16 bg-gradient-to-br from-brand-blue/10 to-brand-green/10 flex items-center justify-center relative">
                    <Pill className="w-7 h-7 text-brand-blue/30" />
                    <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-md font-mono">{item.code}</span>
                    <button 
                      onClick={() => openEditModal(item)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-brand-blue rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider self-start mb-2">{item.category}</span>
                    <h3 className="font-extrabold text-slate-800 text-sm leading-tight group-hover:text-brand-blue transition-colors">{item.name}</h3>
                    
                    <div className="mt-auto pt-4 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Unit Price</p>
                          <p className="text-sm font-bold text-slate-500">₱{item.unitPrice.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Selling Price</p>
                          <p className="text-lg font-black text-brand-blue leading-none">₱{item.sellingPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-sm font-black", item.stock < 10 ? "text-red-500" : item.stock < 50 ? "text-yellow-600" : "text-emerald-600")}>{item.stock}</span>
                          <span className="text-xs text-slate-400 font-medium">{item.unit}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Good' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="bg-emerald-50 rounded-lg px-3 py-1.5 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Margin</span>
                        <span className="text-xs font-black text-emerald-700">+₱{(item.sellingPrice - item.unitPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
             <div className="flex items-center gap-2 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Package className="w-4 h-4 text-brand-blue" /> 
                <span>Showing {filteredItems.length} items</span>
             </div>
             <div className="flex gap-2 mt-4 sm:mt-0">
                <button className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">Previous</button>
                <button className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">Next</button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
