import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Package, Search, Plus, X, Save } from "lucide-react";

const INITIAL_INVENTORY = [
  { id: 1, code: "PRD-X91A", name: "Amoxicillin 500mg", category: "Prescription", stock: 120, unit: "boxes", price: 4.50, status: "Good" },
  { id: 2, code: "PRD-V002", name: "Vitamin C Ascorbic Acid", category: "OTC", stock: 42, unit: "btls", price: 12.00, status: "Moderate" },
  { id: 3, code: "PRD-C119", name: "Paracetamol 500mg", category: "Generic", stock: 5, unit: "boxes", price: 2.00, status: "Critical" }
];

export function Inventory() {
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    code: `PRD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    name: "",
    genericName: "",
    category: "OTC",
    stock: "",
    price: "",
    expiryDate: ""
  });

  const handleSave = () => {
    if (!formData.name) return; // simple validation

    const newItem = {
      id: Date.now(),
      code: formData.code,
      name: formData.name,
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      unit: "pcs",
      price: parseFloat(formData.price) || 0,
      status: parseInt(formData.stock) > 20 ? "Good" : "Moderate"
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);
    setFormData({
      code: `PRD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: "",
      genericName: "",
      category: "OTC",
      stock: "",
      price: "",
      expiryDate: ""
    });
  };

  return (
    <div className="flex-1 p-8 space-y-6 bg-slate-50 overflow-y-auto relative h-full">
      
      {/* Add Item Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4">
            
            <div className="bg-brand-blue p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">Add New Pharmacy Item</h2>
                <p className="text-sm opacity-80 mt-1">Enter product master data and initial stock.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Biogesic 500mg" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generic Name</label>
                  <input type="text" value={formData.genericName} onChange={e => setFormData({...formData, genericName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Paracetamol" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Barcode / SKU</label>
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all">
                    <option value="Prescription">Prescription (Rx)</option>
                    <option value="OTC">Over the Counter (OTC)</option>
                    <option value="Generic">Generic</option>
                    <option value="Supplements">Vitamins & Supplements</option>
                    <option value="Supplies">Medical Supplies</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Stock</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price (₱)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="0.00" />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiration Date</label>
                  <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all text-slate-700" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-8 py-3 bg-brand-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center gap-2 active:scale-95">
                <Save className="w-5 h-5" /> Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 font-medium">Manage and view your pharmacy stock catalog</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-blue hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-blue/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      <Card className="border-t-4 border-t-brand-teal relative z-10">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4">
          <CardTitle className="text-xl font-bold text-slate-800">Product List</CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, generic, or SKU..." 
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm font-medium transition-all"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-black tracking-wider">
                <tr>
                  <th className="px-6 py-4">Item Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map(item => (
                   <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                     <td className="px-6 py-4 font-mono text-slate-500 text-xs font-semibold">{item.code}</td>
                     <td className="px-6 py-4 font-bold text-brand-blue group-hover:text-brand-green transition-colors">{item.name}</td>
                     <td className="px-6 py-4 font-medium"><span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 text-xs">{item.category}</span></td>
                     <td className="px-6 py-4 font-semibold">
                       <span className={item.stock < 10 ? "text-red-500" : "text-slate-800"}>{item.stock}</span> 
                       <span className="text-slate-400 text-xs ml-1 font-normal">{item.unit}</span>
                     </td>
                     <td className="px-6 py-4 font-bold">₱{item.price.toFixed(2)}</td>
                     <td className="px-6 py-4">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                         item.status === 'Good' ? 'bg-emerald-100 text-emerald-700' :
                         item.status === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                         'bg-red-100 text-red-700'
                       }`}>
                         {item.status}
                       </span>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
             <div className="flex items-center gap-2 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Package className="w-4 h-4 text-brand-blue" /> 
                <span>Showing {items.length} items</span>
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
