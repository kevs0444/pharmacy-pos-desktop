import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Clock, CheckCircle, Package, Truck, Search, Filter, Building2, AlertCircle, Plus, X, Save } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

const initialOrders = [
  { id: "PO-2026-0048", manufacturer: "Unilab", items: ["Biogesic 500mg (10 boxes)", "Neozep Forte (5 boxes)"], total: 4200, status: "In Transit", eta: "Mar 22", placed: "Mar 18", priority: "Normal" },
  { id: "PO-2026-0047", manufacturer: "Pfizer", items: ["Amoxicillin 500mg (20 boxes)"], total: 8500, status: "Processing", eta: "Mar 25", placed: "Mar 19", priority: "Normal" },
  { id: "PO-2026-0046", manufacturer: "TGP Generics", items: ["Paracetamol 500mg (50 boxes)", "Ibuprofen 400mg (30 boxes)", "Mefenamic Acid (20 boxes)"], total: 12400, status: "In Transit", eta: "Mar 21", placed: "Mar 16", priority: "Urgent" },
  { id: "PO-2026-0045", manufacturer: "GSK", items: ["Cetirizine 10mg (15 boxes)"], total: 3200, status: "Delivered", eta: "Mar 18", placed: "Mar 14", priority: "Normal" },
  { id: "PO-2026-0044", manufacturer: "Bayer", items: ["Aspirin 100mg (25 boxes)", "Alaxan FR (10 boxes)"], total: 6800, status: "Delivered", eta: "Mar 17", placed: "Mar 12", priority: "Normal" },
  { id: "PO-2026-0043", manufacturer: "Unilab", items: ["Solmux 500mg (8 boxes)"], total: 1950, status: "Processing", eta: "Mar 28", placed: "Mar 20", priority: "Urgent" },
];

export function Orders() {
  const [orders, setOrders] = useState(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ manufacturer: '', items: '', total: '', priority: 'Normal' });

  const inTransit = orders.filter(o => o.status === "In Transit").length;
  const processing = orders.filter(o => o.status === "Processing").length;
  const delivered = orders.filter(o => o.status === "Delivered").length;

  const handleSave = () => {
    if (!form.manufacturer || !form.items) return;
    const newOrder = {
      id: `PO-2026-${String(orders.length + 48).padStart(4, '0')}`,
      manufacturer: form.manufacturer,
      items: form.items.split(',').map(s => s.trim()),
      total: parseFloat(form.total) || 0,
      status: "Processing" as const,
      eta: "TBD",
      placed: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      priority: form.priority
    };
    setOrders(prev => [newOrder, ...prev]);
    setIsModalOpen(false);
    setForm({ manufacturer: '', items: '', total: '', priority: 'Normal' });
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 bg-slate-50 overflow-y-auto custom-scrollbar relative">

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4">
            <div className="bg-brand-blue p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">New Purchase Order</h2>
                <p className="text-sm opacity-80 mt-1">Place an order to a manufacturer or supplier.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manufacturer / Supplier *</label>
                <select value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all">
                  <option value="">Select manufacturer...</option>
                  {['Unilab', 'Pfizer', 'TGP Generics', 'GSK', 'Bayer', 'Unilever'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Items (comma separated) *</label>
                <input type="text" value={form.items} onChange={e => setForm({...form, items: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Biogesic 500mg (10 boxes), Neozep (5 boxes)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount (₱)</label>
                  <input type="number" value={form.total} onChange={e => setForm({...form, total: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all">
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-8 py-3 bg-brand-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center gap-2 active:scale-95">
                <Save className="w-5 h-5" /> Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Purchase Orders</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Track incoming supply orders from manufacturers.</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Button variant="outline" className="border-slate-200 rounded-lg"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            <Button onClick={() => setIsModalOpen(true)} className="bg-brand-blue hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm"><Plus className="w-4 h-4 mr-2" /> New Order</Button>
          </div>
        </div>

        {/* Quick Status Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card title="Orders currently being prepared by the manufacturer." className="rounded-[1rem] shadow-sm border border-yellow-200 bg-yellow-50/50 cursor-default">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
              <div>
                <h3 className="text-2xl font-black text-yellow-800">{processing}</h3>
                <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest">Processing</p>
              </div>
            </CardContent>
          </Card>
          <Card title="Orders shipped and currently in transit to the store." className="rounded-[1rem] shadow-sm border border-blue-200 bg-blue-50/50 cursor-default">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center"><Truck className="w-5 h-5" /></div>
              <div>
                <h3 className="text-2xl font-black text-blue-800">{inTransit}</h3>
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">In Transit</p>
              </div>
            </CardContent>
          </Card>
          <Card title="Orders successfully received and added to inventory." className="rounded-[1rem] shadow-sm border border-emerald-200 bg-emerald-50/50 cursor-default">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
              <div>
                <h3 className="text-2xl font-black text-emerald-800">{delivered}</h3>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Delivered</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="rounded-[1rem] shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-800">Supplier Order Queue</CardTitle>
              <p className="text-xs font-medium text-slate-500 mt-1">All purchase orders from registered manufacturers.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 gap-2 text-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search orders..." className="outline-none bg-transparent text-sm w-36 placeholder:text-slate-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {orders.map((order, i) => (
                <div key={i} className="p-5 md:p-6 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Order Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-bold text-brand-blue text-sm group-hover:underline">{order.id}</span>
                        <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md",
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          order.status === 'In Transit' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        )}>{order.status}</span>
                        {order.priority === "Urgent" && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-red-100 text-red-600 border border-red-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5 font-semibold"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {order.manufacturer}</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-400"><Package className="w-3.5 h-3.5" /> {order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {order.items.map((item, j) => (
                          <span key={j} className="bg-slate-100 text-xs font-semibold text-slate-600 px-2 py-1 rounded-md">{item}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        <span>Placed: {order.placed}</span>
                        <span>ETA: {order.eta}</span>
                      </div>
                    </div>
                    {/* Right: Total */}
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-slate-800">₱ {order.total.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Order Total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
