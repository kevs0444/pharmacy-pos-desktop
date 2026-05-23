import { useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "../lib/utils";
import { OrderDocument } from "./OrderDocument";
import {
  Search,
  Plus,
  RotateCcw,
  Trash2,
  Send,
  FileText,
  Package,
  Printer,
  User,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { PurchaseOrderRecord, ManufacturerRecord } from "../../backend/types/domain";

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────
const RECORDS_PER_PAGE = 20;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatPeriodLabel(isoMonth: string): string {
  // "2026-05" → "May 2026"
  const [y, m] = isoMonth.split("-");
  const monthIdx = parseInt(m, 10) - 1;
  return `${MONTH_NAMES[monthIdx] || m} ${y}`;
}

function formatCurrentDateTime(): string {
  const now = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = days[now.getDay()];
  const dd = now.getDate();
  const mon = months[now.getMonth()];
  const yy = String(now.getFullYear()).slice(-2);
  const h = now.getHours();
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `(${day}) ${dd}-${mon}-${yy} ${h12}:${mm} ${ampm}`;
}

export function Orders() {
  // ── Data State ──
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>([]);
  const [manufacturers, setManufacturers] = useState<ManufacturerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Selection / Navigation ──
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState("");
  const [gotoPoNumber, setGotoPoNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  // dummy state to satisfy the onchange handlers that reset pagination
  const [, setCurrentPage] = useState(1);
  const [periodFilter, setPeriodFilter] = useState(() => new Date().toISOString().slice(0, 7));

  // ── Clock ──
  const [currentTime, setCurrentTime] = useState(formatCurrentDateTime());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatCurrentDateTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  // ── Fetch data ──
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [orderResult, mfgResult] = await Promise.all([
          window.api.orders.list({ page: 1, pageSize: 1000 }),
          window.api.admin.listManufacturers(),
        ]);
        setOrders(orderResult.items);
        setManufacturers(mfgResult);
        if (orderResult.items.length > 0) {
          setSelectedOrderId(orderResult.items[0].id);
        }
      } catch (e: any) {
        window.dispatchEvent(
          new CustomEvent("app-error", {
            detail: { title: "Orders Fetch Error", message: e.message || String(e) },
          })
        );
        console.error("Failed to load Orders:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // ── Filtered + sorted orders ──
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      if (q && !o.orderCode.toLowerCase().includes(q) && !o.manufacturerName.toLowerCase().includes(q)) {
        return false;
      }
      if (filterStatus !== "All" && o.status !== filterStatus) return false;
      if (periodFilter && o.placedDate && !o.placedDate.startsWith(periodFilter)) return false;
      return true;
    });
  }, [orders, searchQuery, filterStatus, periodFilter]);

  // ── Navigate current record ──
  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const currentRecordIdx = useMemo(() => {
    if (!selectedOrderId) return -1;
    return filteredOrders.findIndex((o) => o.id === selectedOrderId);
  }, [filteredOrders, selectedOrderId]);

  const navigateRecord = useCallback(
    (direction: "first" | "prev" | "next" | "last") => {
      if (filteredOrders.length === 0) return;
      let idx = currentRecordIdx;
      switch (direction) {
        case "first": idx = 0; break;
        case "prev": idx = Math.max(0, idx - 1); break;
        case "next": idx = Math.min(filteredOrders.length - 1, idx + 1); break;
        case "last": idx = filteredOrders.length - 1; break;
      }
      setSelectedOrderId(filteredOrders[idx].id);
      const page = Math.floor(idx / RECORDS_PER_PAGE) + 1;
      setCurrentPage(page);
    },
    [filteredOrders, currentRecordIdx]
  );

  // ── Goto PO ──
  const handleGotoPo = useCallback(() => {
    if (!gotoPoNumber.trim()) return;
    const target = orders.find((o) => o.orderCode.toLowerCase().includes(gotoPoNumber.toLowerCase().trim()));
    if (target) {
      setSelectedOrderId(target.id);
      setSearchQuery("");
      setFilterStatus("All");
      setGotoPoNumber("");
    }
  }, [gotoPoNumber, orders]);

  // ── Reset filters ──
  const handleReset = () => {
    setSearchQuery("");
    setFilterStatus("All");
    setPeriodFilter(new Date().toISOString().slice(0, 7));
    setCurrentPage(1);
    setGotoPoNumber("");
  };

  const mfgForDocument = useMemo(
    () =>
      manufacturers.map((m) => ({
        id: m.id,
        name: m.name,
        contactPerson: m.contactPerson,
        email: m.email,
        phone: m.phone,
      })),
    [manufacturers]
  );

  // Dark button style helper
  const btnCls = "flex items-center px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide rounded shadow-sm text-white transition-transform active:scale-95";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      {/* ═══════════════ TOP TOOLBAR ═══════════════ */}
      <div className="bg-white border-b border-slate-300 shrink-0">
        {/* Row 1: Title bar with user info */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-700 text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-xs font-bold">PO REGISTER</span>
            <span className="text-[10px] text-slate-400 ml-1">
              — {selectedOrder?.manufacturerName || "Purchase Orders"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
              <User className="w-3 h-3" />
              User ID: <span className="font-bold text-white">CHA</span>
            </span>
            <span className="text-[10px] font-medium text-slate-300">
              {currentTime}
            </span>
          </div>
        </div>

        {/* Row 2: Filters + Actions */}
        <div className="flex items-center gap-2 px-4 py-2 flex-wrap">
          {/* Period with month name */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Period</label>
            <div className="flex items-center rounded border border-slate-300 shadow-sm bg-white overflow-hidden">
              <button 
                onClick={() => {
                  const d = new Date(periodFilter + "-01");
                  d.setMonth(d.getMonth() - 1);
                  setPeriodFilter(d.toISOString().slice(0, 7));
                  setCurrentPage(1);
                }}
                className="px-1.5 py-1 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors border-r border-slate-300"
              ><ChevronLeft className="w-3.5 h-3.5"/></button>
              <button 
                onClick={() => {
                  const d = new Date(periodFilter + "-01");
                  d.setMonth(d.getMonth() + 1);
                  setPeriodFilter(d.toISOString().slice(0, 7));
                  setCurrentPage(1);
                }}
                className="px-1.5 py-1 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
              ><ChevronRight className="w-3.5 h-3.5"/></button>
            </div>
            <input
              type="month"
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs font-medium border border-slate-300 rounded bg-white text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 outline-none transition-all w-[130px] shadow-sm h-[26px]"
            />
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 whitespace-nowrap shadow-sm h-[26px] flex items-center">
              {formatPeriodLabel(periodFilter)}
            </span>
          </div>

          <div className="w-px h-6 bg-slate-300" />

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search PO / supplier..."
              className="pl-7 pr-3 py-1.5 text-xs font-medium border border-slate-300 rounded bg-white text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 outline-none transition-all w-[170px]"
            />
          </div>

          {/* Goto PO */}
          <div className="flex items-center gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Goto PO#</label>
            <input
              type="text"
              value={gotoPoNumber}
              onChange={(e) => setGotoPoNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGotoPo()}
              placeholder="PO-2026-..."
              className="px-2 py-1.5 text-xs font-medium border border-slate-300 rounded bg-white text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 outline-none transition-all w-[110px]"
            />
          </div>

          <div className="w-px h-6 bg-slate-300" />

          {/* Action Buttons — VIBRANT colors matching user request */}
          <div className="flex items-center gap-1.5">
            <button onClick={handleReset} className={cn(btnCls, "bg-[#1d4ed8] hover:bg-[#1e40af]")}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />Reset
            </button>
            <button className={cn(btnCls, "bg-[#047857] hover:bg-[#065f46]")}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />New
            </button>
            <button className={cn(btnCls, "bg-[#ea580c] hover:bg-[#c2410c]")}>
              <Send className="w-3.5 h-3.5 mr-1.5" />Post
            </button>
            <button className={cn(btnCls, "bg-[#b91c1c] hover:bg-[#991b1b]")}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
            </button>
            <button className={cn(btnCls, "bg-[#4f46e5] hover:bg-[#4338ca]")}>
              <Package className="w-3.5 h-3.5 mr-1.5" />Receive
            </button>
            <button className={cn(btnCls, "bg-[#334155] hover:bg-[#1e293b]")}>
              <Printer className="w-3.5 h-3.5 mr-1.5" />Print
            </button>
            <button className={cn(btnCls, "bg-[#9333ea] hover:bg-[#7e22ce]")}>
              <Mail className="w-3.5 h-3.5 mr-1.5" />Email
            </button>
          </div>

          <div className="flex-1" />

          {/* Procedures */}
          <div className="flex items-center gap-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Procedures</label>
             <select className="px-2 py-1.5 text-xs font-medium border border-slate-300 rounded bg-white text-slate-700 outline-none w-[150px]">
                <option value=""></option>
             </select>
          </div>



          {isLoading && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded animate-pulse">
              Loading...
            </span>
          )}
        </div>
      </div>

      {/* ═══════════════ MAIN CONTENT: Document View ═══════════════ */}
      <div className="flex-1 overflow-hidden">
        <OrderDocument
          order={selectedOrder}
          manufacturers={mfgForDocument}
          isNew={false}
          onNavigate={navigateRecord}
        />
      </div>

      {/* ═══════════════ BOTTOM NAVIGATION BAR ═══════════════ */}
      <div className="bg-slate-200 border-t-2 border-slate-300 shrink-0 flex flex-col">
        {/* Row 1/2: Stock Summary */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-300/50">
          <div className="flex flex-col">
            <button className="text-[10px] font-bold text-red-600 bg-white border border-red-200 rounded px-2 py-0.5 w-fit hover:bg-red-50">
              Delete Stock
            </button>
            <span className="text-[10px] font-bold text-red-500 mt-1">
              Current item has enough qty in stock.
            </span>
          </div>

          <div className="flex items-center gap-6 text-center">
            {[
              { label: "InStock", value: "3", textCls: "text-blue-800" },
              { label: "Suggest", value: "-228", textCls: "text-blue-800" },
              { label: "AvgWeek", value: ".2", textCls: "text-blue-800" },
              { label: "AvgMnth", value: "6.7", textCls: "text-blue-800" },
              { label: "CurrMonth", value: "1", textCls: "text-blue-800" },
              { label: "MonthHigh", value: "17", textCls: "text-blue-800" },
            ].map(({ label, value, textCls }) => (
              <div key={label}>
                <p className="text-[10px] font-black text-blue-900">{label}</p>
                <p className={cn("text-[11px] font-black bg-white/50 px-1 rounded", textCls)}>{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-[10px] font-black text-blue-900">Purc Cost</p>
              <p className="text-[11px] font-black text-blue-800 bg-white/50 px-1 rounded">
                {selectedOrder?.total ? selectedOrder.total.toFixed(3) : "24.000"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-900">SellPrice</p>
              <p className="text-[11px] font-black text-blue-800 bg-white/50 px-1 rounded">0.00</p>
            </div>
          </div>
        </div>

        {/* Row 3: Record Navigator */}
        <div className="flex items-center px-4 py-1.5 bg-slate-100 text-[10px] font-bold text-slate-600 gap-2">
          <span>Record:</span>
          <div className="flex items-center">
            <button onClick={() => navigateRecord("first")} className="px-1 hover:text-blue-600">|◄</button>
            <button onClick={() => navigateRecord("prev")} className="px-1 hover:text-blue-600">◄</button>
            <input 
              type="text" 
              value={currentRecordIdx >= 0 ? currentRecordIdx + 1 : ""} 
              readOnly 
              className="w-8 text-center mx-1 border border-slate-300 text-[10px] py-0.5"
            />
            <button onClick={() => navigateRecord("next")} className="px-1 hover:text-blue-600">►</button>
            <button onClick={() => navigateRecord("last")} className="px-1 hover:text-blue-600">►|</button>
          </div>
          <span>of {filteredOrders.length}</span>
          <div className="flex-1 ml-4 border-t border-slate-400 mt-1"></div>
        </div>
      </div>
    </div>
  );
}
