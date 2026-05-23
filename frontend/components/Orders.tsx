import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { cn } from "../lib/utils";
import type { OrderDocumentRef } from "./OrderDocument";
import { OrderDocument } from "./OrderDocument";
import { PageHeader } from "./ui/PageHeader";
import {
  Search, Plus, RotateCcw, Trash2, Send, Package, Printer, Mail,
  ChevronLeft, ChevronRight, FileText,
} from "lucide-react";
import type { PurchaseOrderRecord, ManufacturerRecord, OrderStatus } from "../../backend/types/domain";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatPeriodLabel(isoMonth: string): string {
  const [y, m] = isoMonth.split("-");
  return `${MONTH_NAMES[parseInt(m, 10) - 1] || m} ${y}`;
}

function formatCurrentDateTime(): string {
  const now = new Date();
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const h = now.getHours(), mm = String(now.getMinutes()).padStart(2,"0");
  return `(${days[now.getDay()]}) ${now.getDate()}-${months[now.getMonth()]}-${String(now.getFullYear()).slice(-2)} ${h%12||12}:${mm} ${h>=12?"PM":"AM"}`;
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function TBtn({ children, onClick, color = "slate" }: { children: React.ReactNode; onClick?: () => void; color?: "blue"|"green"|"amber"|"red"|"indigo"|"slate"|"purple" }) {
  const cls: Record<string, string> = {
    blue:   "bg-brand-blue hover:bg-blue-700 text-white",
    green:  "bg-emerald-600 hover:bg-emerald-700 text-white",
    amber:  "bg-amber-500 hover:bg-amber-600 text-white",
    red:    "bg-red-500 hover:bg-red-600 text-white",
    indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
    slate:  "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300",
  };
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold rounded-lg shadow-sm transition-all active:scale-95", cls[color])}
    >
      {children}
    </button>
  );
}

export function Orders() {
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>([]);
  const [manufacturers, setManufacturers] = useState<ManufacturerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gotoPoNumber, setGotoPoNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "All">("All");
  const [, setCurrentPage] = useState(1);
  const [periodFilter, setPeriodFilter] = useState(() => new Date().toISOString().slice(0, 7));
  const docRef = useRef<OrderDocumentRef>(null);
  const [currentTime, setCurrentTime] = useState(formatCurrentDateTime());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatCurrentDateTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const [orderResult, mfgResult] = await Promise.all([
        window.api.orders.list({ page: 1, pageSize: 1000 }),
        window.api.admin.listManufacturers(),
      ]);
      setOrders(orderResult.items);
      setManufacturers(mfgResult);
      if (orderResult.items.length > 0 && selectedOrderId === null) {
        setSelectedOrderId(orderResult.items[0].id);
      }
    } catch (e: any) {
      console.error("Failed to load Orders:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      if (q && !o.orderCode.toLowerCase().includes(q) && !o.manufacturerName.toLowerCase().includes(q)) return false;
      if (filterStatus !== "All" && o.status !== filterStatus) return false;
      if (periodFilter && o.placedDate && !o.placedDate.startsWith(periodFilter)) return false;
      return true;
    });
  }, [orders, searchQuery, filterStatus, periodFilter]);

  const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedOrderId) || null, [orders, selectedOrderId]);

  const currentRecordIdx = useMemo(() => {
    if (!selectedOrderId) return -1;
    return filteredOrders.findIndex((o) => o.id === selectedOrderId);
  }, [filteredOrders, selectedOrderId]);

  const navigateRecord = useCallback(
    (direction: "first" | "prev" | "next" | "last") => {
      if (filteredOrders.length === 0) return;
      let idx = currentRecordIdx;
      if (direction === "first") idx = 0;
      else if (direction === "prev") idx = Math.max(0, idx - 1);
      else if (direction === "next") idx = Math.min(filteredOrders.length - 1, idx + 1);
      else idx = filteredOrders.length - 1;
      setSelectedOrderId(filteredOrders[idx].id);
      setCurrentPage(Math.floor(idx / 20) + 1);
    },
    [filteredOrders, currentRecordIdx]
  );

  const handleGotoPo = useCallback(() => {
    if (!gotoPoNumber.trim()) return;
    const target = orders.find((o) => o.orderCode.toLowerCase().includes(gotoPoNumber.toLowerCase().trim()));
    if (target) { setSelectedOrderId(target.id); setSearchQuery(""); setFilterStatus("All"); setGotoPoNumber(""); }
  }, [gotoPoNumber, orders]);

  const handlePost = () => { if (docRef.current) docRef.current.save(); };

  const handleReset = () => {
    setSearchQuery(""); setFilterStatus("All");
    setPeriodFilter(new Date().toISOString().slice(0, 7));
    setCurrentPage(1); setGotoPoNumber("");
  };

  const mfgForDocument = useMemo(
    () => manufacturers.map((m) => ({ id: m.id, name: m.name, contactPerson: m.contactPerson, email: m.email, phone: m.phone })),
    [manufacturers]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 font-mono text-xs">

      {/* ── Header ── */}
      <PageHeader userId="CHA" dateStr={currentTime}>
        <FileText className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold tracking-widest uppercase text-slate-800">PO REGISTER</span>
        {selectedOrder && (
          <span className="text-[10px] text-slate-400 font-medium ml-1">— {selectedOrder.manufacturerName}</span>
        )}
      </PageHeader>

      {/* ── Toolbar ── */}
      <div className="px-5 py-2.5 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex gap-2.5 items-center flex-wrap shadow-[0_1px_4px_rgba(0,0,0,0.06)]">

        {/* Period */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Period</span>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button onClick={() => { const d = new Date(periodFilter + "-01"); d.setMonth(d.getMonth()-1); setPeriodFilter(d.toISOString().slice(0,7)); setCurrentPage(1); }}
              className="px-1.5 py-1.5 hover:bg-slate-100 text-slate-500 border-r border-slate-200 transition-colors">
              <ChevronLeft className="w-3 h-3"/>
            </button>
            <button onClick={() => { const d = new Date(periodFilter + "-01"); d.setMonth(d.getMonth()+1); setPeriodFilter(d.toISOString().slice(0,7)); setCurrentPage(1); }}
              className="px-1.5 py-1.5 hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronRight className="w-3 h-3"/>
            </button>
          </div>
          <input type="month" value={periodFilter}
            onChange={(e) => { setPeriodFilter(e.target.value); setCurrentPage(1); }}
            className="h-8 px-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none w-[130px] shadow-sm"
          />
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 h-8 flex items-center rounded-lg border border-slate-200">
            {formatPeriodLabel(periodFilter)}
          </span>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input type="text" value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search PO / supplier..."
            className="w-52 h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 placeholder:text-slate-300"
          />
        </div>

        {/* Goto PO */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">Goto PO#</span>
          <input type="text" value={gotoPoNumber}
            onChange={(e) => setGotoPoNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGotoPo()}
            placeholder="PO-2026-..."
            className="h-8 w-28 px-2 text-xs bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 placeholder:text-slate-300"
          />
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Action Buttons */}
        <TBtn onClick={handleReset} color="slate"><RotateCcw className="w-3 h-3"/>Reset</TBtn>
        <TBtn onClick={() => setSelectedOrderId(null)} color="green"><Plus className="w-3 h-3"/>New</TBtn>
        <TBtn onClick={handlePost} color="amber"><Send className="w-3 h-3"/>Post</TBtn>
        <TBtn color="red"><Trash2 className="w-3 h-3"/>Delete</TBtn>
        <TBtn color="indigo"><Package className="w-3 h-3"/>Receive</TBtn>
        <TBtn color="slate"><Printer className="w-3 h-3"/>Print</TBtn>
        <TBtn color="purple"><Mail className="w-3 h-3"/>Email</TBtn>

        <div className="flex-1" />

        {isLoading && (
          <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded-lg animate-pulse">
            Loading...
          </span>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden">
        <OrderDocument
          ref={docRef}
          order={selectedOrder}
          manufacturers={mfgForDocument}
          isNew={!selectedOrder}
          onNavigate={navigateRecord}
          onSave={() => loadOrders()}
        />
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-slate-200 bg-white shrink-0">
        {/* Summary row */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500">
              {selectedOrder ? `PO: ${selectedOrder.orderCode}` : "No order selected"}
            </span>
            {selectedOrder && (
              <span className={cn(
                "text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full",
                selectedOrder.status === "Delivered" ? "bg-emerald-100 text-emerald-700" :
                selectedOrder.status === "Cancelled" ? "bg-red-100 text-red-600" :
                selectedOrder.status === "In Transit" ? "bg-blue-100 text-blue-700" :
                "bg-amber-100 text-amber-700"
              )}>
                {selectedOrder.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 text-center">
            {[
              { label: "Supplier", value: selectedOrder?.manufacturerName || "—" },
              { label: "Placed Date", value: selectedOrder?.placedDate || "—" },
              { label: "Item Count", value: selectedOrder ? String(selectedOrder.itemCount ?? 0) : "—" },
              { label: "Total Order", value: selectedOrder ? `₱${selectedOrder.total?.toFixed(2) ?? "0.00"}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="text-[11px] font-bold text-slate-700">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Record navigator */}
        <div className="flex items-center px-5 py-1.5 text-[10px] font-bold text-slate-500 gap-2">
          <span>Record:</span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => navigateRecord("first")} className="px-1.5 py-0.5 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors">|◄</button>
            <button onClick={() => navigateRecord("prev")} className="px-1.5 py-0.5 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors">◄</button>
            <input type="text" value={currentRecordIdx >= 0 ? currentRecordIdx + 1 : ""}
              readOnly className="w-8 text-center mx-1 border border-slate-200 rounded text-[10px] py-0.5 bg-slate-50" />
            <button onClick={() => navigateRecord("next")} className="px-1.5 py-0.5 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors">►</button>
            <button onClick={() => navigateRecord("last")} className="px-1.5 py-0.5 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors">►|</button>
          </div>
          <span>of {filteredOrders.length}</span>
        </div>
      </div>
    </div>
  );
}
