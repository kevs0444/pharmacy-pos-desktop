import { useState, useEffect, useMemo } from "react";
import { Building2, Plus, Search, Mail, Phone, MapPin, X, Save, LayoutGrid, List } from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { cn } from "../lib/utils";

interface ManufacturerRecord {
  id: number;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  category: string | null;
  address: string | null;
  isActive: boolean;
}

export function Manufacturers() {
  const [manufacturers, setManufacturers] = useState<ManufacturerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");

  const emptyForm = () => ({
    name: '', contact: '', email: '', phone: '', address: '', category: 'Pharmaceutical'
  });
  const [form, setForm] = useState(emptyForm());

  const loadManufacturers = async () => {
    setIsLoading(true);
    try {
      const result = await window.api.admin.listManufacturers();
      setManufacturers(result);
    } catch (e: any) {
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: { title: "Fetch Manufacturers Error", message: e.message || String(e) }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadManufacturers();
  }, []);

  const handleSave = async () => {
    if (!form.name) return;
    try {
      await window.api.admin.createManufacturer({
        name: form.name,
        contactPerson: form.contact || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        category: form.category,
        isActive: true,
      });
      await loadManufacturers();
      window.dispatchEvent(new CustomEvent('app-success', {
        detail: { 
          title: "Manufacturer Added", 
          message: `${form.name} has been successfully registered.` 
        }
      }));
      setIsModalOpen(false);
      setForm(emptyForm());
    } catch (e: any) {
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: { title: "Save Manufacturer Error", message: e.message || String(e) }
      }));
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return manufacturers.filter(m => 
      !q || m.name.toLowerCase().includes(q) || (m.contactPerson || "").toLowerCase().includes(q)
    );
  }, [searchQuery, manufacturers]);

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 bg-slate-50 overflow-y-auto custom-scrollbar relative">
      <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              Manufacturers & Suppliers
              {isLoading && <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded-md animate-pulse">Loading...</span>}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage external contacts and pharmaceutical suppliers.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-brand-blue hover:bg-blue-900 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold shadow-lg shadow-brand-blue/20 transition-all flex items-center gap-2 active:scale-95 self-start sm:self-auto text-sm">
            <Plus className="w-4 h-4" /> Add Manufacturer
          </button>
        </div>

        <Card className="rounded-[1rem] shadow-sm border border-slate-200 bg-white">
          <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 sm:max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search manufacturers..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm font-medium transition-all" />
            </div>
            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200 shrink-0 w-full sm:w-auto justify-end">
              <button onClick={() => setViewMode("card")} className={cn("p-1.5 rounded-md transition-all", viewMode === "card" ? "bg-white shadow-sm text-brand-blue" : "text-slate-400 hover:text-slate-600")} title="Card View">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-white shadow-sm text-brand-blue" : "text-slate-400 hover:text-slate-600")} title="List View">
                <List className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        {filtered.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Building2 className="w-10 h-10 opacity-20 mb-3" />
            <p className="font-bold text-sm">No manufacturers found.</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(m => (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-0 pointer-events-none group-hover:bg-brand-light/30 transition-colors"></div>
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-4 relative z-10 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-800 tracking-tight relative z-10 mb-1">{m.name}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue bg-brand-blue/10 w-max px-2 py-0.5 rounded-md mb-4">{m.category || "Supplier"}</span>
                
                <div className="space-y-2 text-xs font-medium text-slate-500 mt-auto pt-4 border-t border-slate-100">
                  <p className="flex items-center gap-2"><div className="w-4 flex justify-center"><Search className="w-3.5 h-3.5 opacity-50"/></div> {m.contactPerson || "No contact person"}</p>
                  {m.email && <p className="flex items-center gap-2"><div className="w-4 flex justify-center"><Mail className="w-3.5 h-3.5 opacity-50"/></div> {m.email}</p>}
                  {m.phone && <p className="flex items-center gap-2"><div className="w-4 flex justify-center"><Phone className="w-3.5 h-3.5 opacity-50"/></div> {m.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Manufacturer</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800 group-hover:text-brand-blue transition-colors">{m.name}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-semibold">{m.category || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{m.contactPerson || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{m.email || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{m.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4">
            <div className="bg-brand-blue p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">Add New Manufacturer</h2>
                <p className="text-sm opacity-80 mt-1">Register a supplier or drug manufacturer.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Unilab Pharmaceuticals" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person</label>
                  <input type="text" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Juan Dela Cruz" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="supplier@company.com" />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="+63 912 345 6789" />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all">
                    <option value="Pharmaceutical">Pharmaceutical</option>
                    <option value="Medical Supplies">Medical Supplies</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Vitamins">Vitamins & Supplements</option>
                    <option value="Baby & Mom">Baby & Mom</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                  <div className="relative">
                    <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="Makati City, Metro Manila" />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-8 py-3 bg-brand-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center gap-2 active:scale-95">
                <Save className="w-5 h-5" /> Save Manufacturer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
