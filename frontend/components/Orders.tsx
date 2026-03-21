import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import {
  Clock, CheckCircle, Package, Truck, Search, Building2, AlertCircle,
  Plus, X, Save, LayoutGrid, List, ChevronLeft, ChevronRight,
  User, Filter, Calendar, ArrowDownAZ, ArrowUpZA
} from "lucide-react";
import { cn } from "../lib/utils";

// ─────────────────────────────────────────────────────
// Types & Mock Data
// ─────────────────────────────────────────────────────
type OrderStatus = "Processing" | "In Transit" | "Delivered" | "Cancelled";
type OrderPriority = "Normal" | "Urgent";

interface PurchaseOrder {
  id: string;
  manufacturer: string;
  items: string[];
  total: number;
  status: OrderStatus;
  eta: string;
  placed: string;
  priority: OrderPriority;
  orderedBy: string; // Staff member who placed the order
  contactPerson: string; // Manufacturer's contact person
  remarks?: string;
}

const MOCK_STAFF = ["Admin", "Jane Reyes", "Mark Santos", "Liza Cruz", "Ben Alvarez"];
const MOCK_MANUFACTURERS = ["Unilab", "Pfizer", "TGP Generics", "GSK", "Bayer", "Unilever", "PharmaTech", "MedCorp"];

const initialOrders: PurchaseOrder[] = [
  { id: "PO-2026-0048", manufacturer: "Unilab", items: ["Biogesic 500mg (10 boxes)", "Neozep Forte (5 boxes)"], total: 4200, status: "In Transit", eta: "Mar 22", placed: "Mar 18", priority: "Normal", orderedBy: "Jane Reyes", contactPerson: "Mr. Cruz" },
  { id: "PO-2026-0047", manufacturer: "Pfizer", items: ["Amoxicillin 500mg (20 boxes)"], total: 8500, status: "Processing", eta: "Mar 25", placed: "Mar 19", priority: "Normal", orderedBy: "Admin", contactPerson: "Ms. Tan", remarks: "Awaiting stock replenishment from Pfizer warehouse." },
  { id: "PO-2026-0046", manufacturer: "TGP Generics", items: ["Paracetamol 500mg (50 boxes)", "Ibuprofen 400mg (30 boxes)", "Mefenamic Acid (20 boxes)"], total: 12400, status: "In Transit", eta: "Mar 21", placed: "Mar 16", priority: "Urgent", orderedBy: "Mark Santos", contactPerson: "Mr. Garcia" },
  { id: "PO-2026-0045", manufacturer: "GSK", items: ["Cetirizine 10mg (15 boxes)"], total: 3200, status: "Delivered", eta: "Mar 18", placed: "Mar 14", priority: "Normal", orderedBy: "Liza Cruz", contactPerson: "Ms. Reyes" },
  { id: "PO-2026-0044", manufacturer: "Bayer", items: ["Aspirin 100mg (25 boxes)", "Alaxan FR (10 boxes)"], total: 6800, status: "Delivered", eta: "Mar 17", placed: "Mar 12", priority: "Normal", orderedBy: "Ben Alvarez", contactPerson: "Mr. Lim" },
  { id: "PO-2026-0043", manufacturer: "Unilab", items: ["Solmux 500mg (8 boxes)"], total: 1950, status: "Processing", eta: "Mar 28", placed: "Mar 20", priority: "Urgent", orderedBy: "Admin", contactPerson: "Mr. Cruz", remarks: "Stock critically low. Rush order." },
  { id: "PO-2026-0042", manufacturer: "PharmaTech", items: ["Vitamin C 500mg (30 boxes)", "Zinc Sulfate (10 boxes)"], total: 5600, status: "Delivered", eta: "Mar 15", placed: "Mar 10", priority: "Normal", orderedBy: "Jane Reyes", contactPerson: "Ms. Bautista" },
  { id: "PO-2026-0041", manufacturer: "MedCorp", items: ["Losartan 50mg (20 boxes)"], total: 9200, status: "Cancelled", eta: "—", placed: "Mar 8", priority: "Normal", orderedBy: "Mark Santos", contactPerson: "Mr. Dela Cruz", remarks: "Supplier out of stock. Will reoorder." },
];

const PAGE_SIZE = 6;

// Status / Priority config
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  "Processing":  { label: "Processing",  color: "bg-yellow-100 text-yellow-700 border-yellow-200",   icon: Clock },
  "In Transit":  { label: "In Transit",  color: "bg-blue-100   text-blue-700   border-blue-200",     icon: Truck },
  "Delivered":   { label: "Delivered",   color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  "Cancelled":   { label: "Cancelled",   color: "bg-red-50     text-red-600     border-red-200",     icon: X },
};

const emptyForm = () => ({
  manufacturer: "",
  contactPerson: "",
  items: "",
  total: "",
  priority: "Normal" as OrderPriority,
  eta: "",
  orderedBy: "Admin",
  remarks: "",
});

export function Orders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());

  // View & Filters
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterManufacturer, setFilterManufacturer] = useState("All");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "All">("All");
  const [filterPriority, setFilterPriority] = useState<OrderPriority | "All">("All");
  const [filterOrderedBy, setFilterOrderedBy] = useState("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // newest first
  const [currentPage, setCurrentPage] = useState(1);

  const inTransit  = orders.filter(o => o.status === "In Transit").length;
  const processing = orders.filter(o => o.status === "Processing").length;
  const delivered  = orders.filter(o => o.status === "Delivered").length;

  const handleSave = () => {
    if (!form.manufacturer || !form.items) return;
    const newOrder: PurchaseOrder = {
      id: `PO-2026-${String(orders.length + 49).padStart(4, "0")}`,
      manufacturer: form.manufacturer,
      contactPerson: form.contactPerson,
      items: form.items.split(",").map(s => s.trim()),
      total: parseFloat(form.total) || 0,
      status: "Processing",
      eta: form.eta || "TBD",
      placed: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      priority: form.priority,
      orderedBy: form.orderedBy,
      remarks: form.remarks
    };
    setOrders(prev => [newOrder, ...prev]);
    setIsModalOpen(false);
    setForm(emptyForm());
  };

  // Memoized filter + sort
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return [...orders.filter(o => {
      const matchesSearch = !q || o.id.toLowerCase().includes(q) || o.manufacturer.toLowerCase().includes(q) || o.items.some(i => i.toLowerCase().includes(q));
      const matchesMfg = filterManufacturer === "All" || o.manufacturer === filterManufacturer;
      const matchesStatus = filterStatus === "All" || o.status === filterStatus;
      const matchesPriority = filterPriority === "All" || o.priority === filterPriority;
      const matchesPerson = filterOrderedBy === "All" || o.orderedBy === filterOrderedBy;
      return matchesSearch && matchesMfg && matchesStatus && matchesPriority && matchesPerson;
    })].sort((a, b) => sortOrder === "asc" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id));
  }, [orders, searchQuery, filterManufacturer, filterStatus, filterPriority, filterOrderedBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const uniqueManufacturers = [...new Set(orders.map(o => o.manufacturer))];
  const uniqueStaff = [...new Set(orders.map(o => o.orderedBy))];

  const resetPage = () => setCurrentPage(1);

  const selectClass = "px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:border-brand-blue/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all";

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 bg-slate-50 overflow-y-auto custom-scrollbar relative">

      {/* ── New Order Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-brand-blue p-6 flex justify-between items-center text-white shrink-0">
              <div>
                <h2 className="text-xl font-bold">New Purchase Order</h2>
                <p className="text-sm opacity-80 mt-1">Place a supply order to a manufacturer or supplier.</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setForm(emptyForm()); }} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 md:p-8 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manufacturer / Supplier *</label>
                  <select value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all">
                    <option value="">Select manufacturer...</option>
                    {MOCK_MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person (at Manufacturer)</label>
                  <input type="text" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Mr. Garcia" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ordered By (Staff) *</label>
                  <select value={form.orderedBy} onChange={e => setForm({...form, orderedBy: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all">
                    {MOCK_STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                  <div className="flex gap-3">
                    {(["Normal", "Urgent"] as OrderPriority[]).map(p => (
                      <button key={p} type="button" onClick={() => setForm({...form, priority: p})}
                        className={cn("flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all",
                          form.priority === p ? (p === "Urgent" ? "bg-red-500 text-white border-red-500" : "bg-brand-blue text-white border-brand-blue") : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                        )}>
                        {p === "Urgent" ? "🚨 Urgent" : "✅ Normal"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Items Ordered (comma separated) *</label>
                <input type="text" value={form.items} onChange={e => setForm({...form, items: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Biogesic 500mg (10 boxes), Neozep (5 boxes)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount (₱)</label>
                  <input type="number" value={form.total} onChange={e => setForm({...form, total: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected ETA</label>
                  <input type="date" value={form.eta} onChange={e => setForm({...form, eta: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all text-slate-700 font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks (Optional)</label>
                <textarea value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} rows={2} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400 resize-none text-sm font-medium" placeholder="Additional notes about this order..." />
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100 shrink-0">
              <button onClick={() => { setIsModalOpen(false); setForm(emptyForm()); }} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-8 py-3 bg-brand-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center gap-2 active:scale-95">
                <Save className="w-5 h-5" /> Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Purchase Orders</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Track supply orders from manufacturers and suppliers.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-brand-blue hover:bg-blue-900 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold shadow-lg shadow-brand-blue/20 transition-all flex items-center gap-2 active:scale-95 self-start sm:self-auto text-sm">
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>

        {/* ── Status Summary Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Processing",  count: processing, icon: Clock,         color: "bg-yellow-50 border-yellow-200 text-yellow-800", iconBg: "bg-yellow-100 text-yellow-700" },
            { label: "In Transit",  count: inTransit,  icon: Truck,         color: "bg-blue-50   border-blue-200   text-blue-800",   iconBg: "bg-blue-100 text-blue-700" },
            { label: "Delivered",   count: delivered,  icon: CheckCircle,   color: "bg-emerald-50 border-emerald-200 text-emerald-800", iconBg: "bg-emerald-100 text-emerald-700" },
            { label: "Total Orders",count: orders.length,icon: Package,     color: "bg-slate-50  border-slate-200  text-slate-800",  iconBg: "bg-slate-100 text-slate-600" },
          ].map(({ label, count, icon: Icon, color, iconBg }) => (
            <Card key={label} className={cn("rounded-[1rem] shadow-sm border cursor-default", color)}>
              <CardContent className="p-4 md:p-5 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconBg)}><Icon className="w-4 h-4" /></div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black">{count}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Orders Table/Card Area ── */}
        <Card className="rounded-[1rem] shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col gap-3">
              {/* Top row: title + search + view toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base md:text-lg font-extrabold text-slate-800">
                  Supplier Order Queue
                  <span className="ml-2 text-xs font-normal text-slate-400">({filteredOrders.length} orders)</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-52">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
                      placeholder="Search PO, manufacturer..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-xs font-medium transition-all" />
                  </div>
                  {/* Sort */}
                  <button onClick={() => { setSortOrder(p => p === "asc" ? "desc" : "asc"); resetPage(); }}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-blue/30 text-slate-500 hover:text-brand-blue transition-all" title="Toggle Sort">
                    {sortOrder === "desc" ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpZA className="w-4 h-4" />}
                  </button>
                  {/* View Toggle */}
                  <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                    <button onClick={() => { setViewMode("list"); resetPage(); }} className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-white shadow-sm text-brand-blue" : "text-slate-400 hover:text-slate-600")} title="List View"><List className="w-4 h-4" /></button>
                    <button onClick={() => { setViewMode("card"); resetPage(); }} className={cn("p-1.5 rounded-md transition-all", viewMode === "card" ? "bg-white shadow-sm text-brand-blue" : "text-slate-400 hover:text-slate-600")} title="Card View"><LayoutGrid className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Filter row */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by:</span>

                <select value={filterManufacturer} onChange={e => { setFilterManufacturer(e.target.value); resetPage(); }} className={selectClass}>
                  <option value="All">🏭 All Manufacturers</option>
                  {uniqueManufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                </select>

                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as any); resetPage(); }} className={selectClass}>
                  <option value="All">📦 All Statuses</option>
                  {(["Processing", "In Transit", "Delivered", "Cancelled"] as OrderStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value as any); resetPage(); }} className={selectClass}>
                  <option value="All">⚡ All Priorities</option>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>

                <select value={filterOrderedBy} onChange={e => { setFilterOrderedBy(e.target.value); resetPage(); }} className={selectClass}>
                  <option value="All">👤 All Staff</option>
                  {uniqueStaff.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* Reset filters */}
                {(filterManufacturer !== "All" || filterStatus !== "All" || filterPriority !== "All" || filterOrderedBy !== "All" || searchQuery) && (
                  <button onClick={() => { setFilterManufacturer("All"); setFilterStatus("All"); setFilterPriority("All"); setFilterOrderedBy("All"); setSearchQuery(""); resetPage(); }}
                    className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-wider flex items-center gap-1 transition-colors">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-5 bg-slate-50/30 min-h-[300px]">
            {pagedOrders.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                <Package className="w-10 h-10 opacity-20 mb-3" />
                <p className="font-bold text-sm">No orders found.</p>
              </div>
            ) : viewMode === "list" ? (
              /* ─── List / Table View ─── */
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Manufacturer</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Ordered By</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">ETA</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedOrders.map((order, i) => {
                      const cfg = STATUS_CONFIG[order.status];
                      return (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-brand-blue text-xs group-hover:underline">{order.id}</span>
                            {order.priority === "Urgent" && <span className="ml-1.5 text-[8px] font-black uppercase bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">Urgent</span>}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-700 text-xs">{order.manufacturer}</p>
                            <p className="text-[10px] text-slate-400">{order.contactPerson}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-slate-600 font-medium">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{order.items[0]}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                              <User className="w-3 h-3 text-slate-400" />{order.orderedBy}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border", cfg.color)}>{cfg.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium"><Calendar className="w-3 h-3 text-slate-300" />{order.eta}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-black text-slate-800 text-sm">₱{order.total.toLocaleString()}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ─── Card View ─── */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {pagedOrders.map((order, i) => {
                  const cfg = STATUS_CONFIG[order.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-brand-blue text-sm">{order.id}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1", cfg.color)}>
                              <StatusIcon className="w-3 h-3" />{cfg.label}
                            </span>
                            {order.priority === "Urgent" && (
                              <span className="text-[9px] font-black uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />Urgent
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-800">₱{order.total.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Order Total</p>
                        </div>
                      </div>

                      {/* Manufacturer & Person */}
                      <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" />{order.manufacturer}</span>
                        <span className="text-slate-200">|</span>
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" />{order.orderedBy}</span>
                      </div>

                      {/* Items */}
                      <div className="flex flex-wrap gap-1.5">
                        {order.items.slice(0, 2).map((item, j) => (
                          <span key={j} className="bg-slate-100 text-[10px] font-semibold text-slate-600 px-2 py-1 rounded-md">{item}</span>
                        ))}
                        {order.items.length > 2 && <span className="bg-slate-100 text-[10px] font-bold text-slate-400 px-2 py-1 rounded-md">+{order.items.length - 2} more</span>}
                      </div>

                      {/* Remarks */}
                      {order.remarks && <p className="text-[10px] text-slate-400 italic border-l-2 border-slate-200 pl-2 line-clamp-2">{order.remarks}</p>}

                      {/* Footer Dates */}
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Placed: {order.placed}</span>
                        <span className="flex items-center gap-1"><Truck className="w-3 h-3" />ETA: {order.eta}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={cn("w-8 h-8 rounded-lg text-xs font-bold border transition-all",
                        currentPage === page ? "bg-brand-blue text-white border-brand-blue shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-brand-blue/40"
                      )}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
