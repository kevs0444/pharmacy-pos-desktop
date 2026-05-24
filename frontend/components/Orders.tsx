import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { cn } from "../lib/utils";
import type { OrderDocumentRef } from "./OrderDocument";
import { OrderDocument } from "./OrderDocument";
import { PageHeader } from "./ui/PageHeader";
import { NotificationCenter, getErrorMessage, useNotificationQueue } from "./ui/NotificationCenter";
import { toOrderUpper, toTrimmedOrderUpper } from "../lib/orderFormatting";
import {
  Search, Plus, RotateCcw, Trash2, Send, Package, Printer, Mail, Lock, Unlock,
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
function nullableOrderUpper(value: string | null | undefined): string | null {
  const normalized = toTrimmedOrderUpper(value);
  return normalized || null;
}

function normalizeOrderText(order: PurchaseOrderRecord): PurchaseOrderRecord {
  return {
    ...order,
    orderCode: toTrimmedOrderUpper(order.orderCode),
    manufacturerName: toTrimmedOrderUpper(order.manufacturerName),
    contactPerson: nullableOrderUpper(order.contactPerson),
    orderedByName: nullableOrderUpper(order.orderedByName),
    remarks: nullableOrderUpper(order.remarks),
    faxEmailRemarks: nullableOrderUpper(order.faxEmailRemarks),
    notedBy: nullableOrderUpper(order.notedBy),
    approvedBy: nullableOrderUpper(order.approvedBy),
    qtyToOrder: nullableOrderUpper(order.qtyToOrder),
  };
}

function TBtn({ children, onClick, color = "slate" }: { children: React.ReactNode; onClick?: () => void; color?: "blue"|"green"|"amber"|"red"|"indigo"|"slate"|"purple" }) {
  const cls: Record<string, string> = {
    blue:   "bg-white border border-blue-200 text-blue-600 hover:bg-blue-50",
    green:  "bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50",
    amber:  "bg-white border border-amber-200 text-amber-600 hover:bg-amber-50",
    red:    "bg-white border border-red-200 text-red-600 hover:bg-red-50",
    indigo: "bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50",
    purple: "bg-white border border-purple-200 text-purple-600 hover:bg-purple-50",
    slate:  "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
    primary: "bg-brand-blue hover:bg-blue-700 text-white border border-transparent shadow-sm",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent shadow-sm",
    warning: "bg-amber-500 hover:bg-amber-600 text-white border border-transparent shadow-sm",
  };
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold uppercase tracking-wide rounded-lg shadow-sm transition-all active:scale-95", cls[color])}
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [periodFilter, setPeriodFilter] = useState(() => new Date().toISOString().slice(0, 7));
  const docRef = useRef<OrderDocumentRef>(null);
  const [currentTime, setCurrentTime] = useState(formatCurrentDateTime());
  const { notifications, notify, dismissNotification } = useNotificationQueue();
  const [isLocked, setIsLocked] = useState(false);

  const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedOrderId) || null, [orders, selectedOrderId]);

  useEffect(() => {
    if (selectedOrder) {
      setIsLocked(selectedOrder.isLocked || selectedOrder.status === "Delivered" || selectedOrder.status === "Cancelled");
    } else {
      setIsLocked(false);
    }
  }, [selectedOrder]);

  // Search autocomplete state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchOptions, setSearchOptions] = useState<PurchaseOrderRecord[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchOptions([]);
      return;
    }
    window.api.orders.list({ page: 1, pageSize: 10, search: debouncedSearch })
      .then(res => setSearchOptions(res.items.map(normalizeOrderText)))
      .catch((e) => {
        console.error("Failed to search orders:", e);
        notify({
          variant: "error",
          title: "Order search failed",
          message: getErrorMessage(e, "Unable to search purchase orders."),
          source: "backend",
        });
      });
  }, [debouncedSearch, notify]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatCurrentDateTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const [orderResult, mfgResult] = await Promise.all([
        window.api.orders.list({ 
          page: currentPage, 
          pageSize: 100,
          search: searchQuery,
          status: filterStatus,
          period: periodFilter
        }),
        window.api.admin.listManufacturers(),
      ]);
      const normalizedOrders = orderResult.items.map(normalizeOrderText);
      setOrders(normalizedOrders);
      setManufacturers(mfgResult);
      setTotalPages(orderResult.totalPages || 1);
      setTotalCount(orderResult.total || 0);
      
      setSelectedOrderId((currentSelectedId) => {
        if (normalizedOrders.length > 0) {
          if (currentSelectedId === null || !normalizedOrders.find(o => o.id === currentSelectedId)) {
            return normalizedOrders[0].id;
          }
          return currentSelectedId;
        }
        return null;
      });
    } catch (e: any) {
      console.error("Failed to load Orders:", e);
      notify({
        variant: "error",
        title: "Orders failed to load",
        message: getErrorMessage(e, "Unable to load purchase orders."),
        source: "backend",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, filterStatus, periodFilter, notify]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filteredOrders = orders;

  const currentRecordIdx = useMemo(() => {
    if (!selectedOrderId) return -1;
    return filteredOrders.findIndex((o) => o.id === selectedOrderId);
  }, [filteredOrders, selectedOrderId]);

  const navigateRecord = useCallback(
    (direction: "first" | "prev" | "next" | "last") => {
      if (filteredOrders.length === 0) return;
      let idx = currentRecordIdx;
      
      if (direction === "first") {
         setCurrentPage(1);
      }
      else if (direction === "prev") {
         if (idx === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
         } else {
            idx = Math.max(0, idx - 1);
            setSelectedOrderId(filteredOrders[idx].id);
         }
      }
      else if (direction === "next") {
         if (idx === filteredOrders.length - 1 && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
         } else {
            idx = Math.min(filteredOrders.length - 1, idx + 1);
            setSelectedOrderId(filteredOrders[idx].id);
         }
      }
      else if (direction === "last") {
         setCurrentPage(totalPages);
      }
    },
    [filteredOrders, currentRecordIdx, currentPage, totalPages]
  );

  const handleGotoPo = useCallback(() => {
    if (!gotoPoNumber.trim()) return;
    const target = orders.find((o) => o.orderCode.toLowerCase().includes(gotoPoNumber.toLowerCase().trim()));
    if (target) { setSelectedOrderId(target.id); setSearchQuery(""); setFilterStatus("All"); setGotoPoNumber(""); }
  }, [gotoPoNumber, orders]);

  const handlePost = async () => {
    if (!docRef.current) {
      notify({
        variant: "warning",
        title: "No order document",
        message: "Open or create an order before posting.",
        source: "frontend",
      });
      return;
    }

    await docRef.current.save();
  };

  const handleDelete = useCallback(async () => {
    if (!selectedOrderId) return;
    const confirmed = window.confirm(`Are you sure you want to delete order ${selectedOrder?.orderCode || ""}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await window.api.orders.delete(selectedOrderId);
      setSelectedOrderId(null);
      await loadOrders();
      notify({
        variant: "success",
        title: "Order deleted",
        message: `${toOrderUpper(selectedOrder?.orderCode || "ORDER")} was removed.`,
        source: "system",
      });
    } catch (e: any) {
      console.error("Failed to delete order:", e);
      notify({
        variant: "error",
        title: "Delete failed",
        message: getErrorMessage(e, "Unable to delete this purchase order."),
        source: "backend",
      });
    }
  }, [selectedOrderId, selectedOrder, loadOrders, notify]);

  const handleReceive = useCallback(async () => {
    if (!selectedOrderId || !selectedOrder) return;
    if (selectedOrder.status === "Delivered" || selectedOrder.status === "Cancelled") {
      notify({
        variant: "warning",
        title: "Receive blocked",
        message: `Cannot receive an order that is already ${toOrderUpper(selectedOrder.status)}.`,
        source: "frontend",
      });
      return;
    }
    const nextStatus = selectedOrder.status === "Processing" ? "In Transit" : "Delivered";
    const confirmed = window.confirm(`Mark order ${selectedOrder.orderCode} as "${nextStatus}"?`);
    if (!confirmed) return;
    try {
      await window.api.orders.updateStatus(selectedOrderId, nextStatus as any);
      await loadOrders();
      notify({
        variant: "success",
        title: "Order status updated",
        message: `${selectedOrder.orderCode} is now ${toOrderUpper(nextStatus)}.`,
        source: "system",
      });
    } catch (e: any) {
      console.error("Failed to update status:", e);
      notify({
        variant: "error",
        title: "Status update failed",
        message: getErrorMessage(e, "Unable to update this order status."),
        source: "backend",
      });
    }
  }, [selectedOrderId, selectedOrder, loadOrders, notify]);

  const handleReset = () => {
    setSearchQuery(""); setSearchInput(""); setFilterStatus("All");
    setPeriodFilter(new Date().toISOString().slice(0, 7));
    setCurrentPage(1); setGotoPoNumber("");
  };

  const mfgForDocument = useMemo(
    () => manufacturers.map((m) => ({ id: m.id, name: m.name, contactPerson: m.contactPerson, email: m.email, phone: m.phone })),
    [manufacturers]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 font-mono text-xs">
      <NotificationCenter notifications={notifications} onDismiss={dismissNotification} />

      {/* ── Header ── */}
      <PageHeader userId="CHA" dateStr={currentTime}>
        <FileText className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold tracking-widest uppercase text-white">PO REGISTER</span>
        {selectedOrder && (
          <span className="text-[10px] text-slate-400 font-medium ml-1">- {toOrderUpper(selectedOrder.manufacturerName)}</span>
        )}
      </PageHeader>

      {/* ── Toolbar ── */}
      <div className="px-5 py-2 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex gap-2 items-center overflow-x-auto custom-scrollbar shadow-[0_1px_4px_rgba(0,0,0,0.06)] shrink-0">

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
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Smart Search */}
        <div className="relative" ref={searchWrapperRef}>
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input type="text" value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchQuery(searchInput);
                setCurrentPage(1);
                setIsSearchFocused(false);
              }
            }}
            placeholder="Search PO / supplier..."
            className="w-52 h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 placeholder:text-slate-300"
          />
          {isSearchFocused && searchOptions.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-[350px] bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
              <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Top Matches</span>
                <span className="text-[9px] text-slate-400">Press Enter to filter grid</span>
              </div>
              <ul className="max-h-64 overflow-y-auto">
                {searchOptions.map(opt => (
                  <li key={opt.id} 
                      onMouseDown={() => {
                        setSearchInput(opt.orderCode);
                        setSearchQuery(opt.orderCode);
                        setCurrentPage(1);
                        setSelectedOrderId(opt.id);
                        setIsSearchFocused(false);
                      }}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-700">{opt.orderCode}</div>
                      <div className="text-[10px] text-slate-500 truncate">{toOrderUpper(opt.manufacturerName)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-medium text-slate-600">{opt.placedDate}</div>
                      <div className={cn("text-[9px] font-extrabold uppercase px-1.5 rounded-full mt-0.5", 
                          opt.status === "Delivered" ? "bg-emerald-100 text-emerald-700" :
                          opt.status === "Cancelled" ? "bg-red-100 text-red-600" :
                          "bg-amber-100 text-amber-700"
                        )}>{opt.status}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Navigate PO */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigateRecord("prev")}
            disabled={filteredOrders.length === 0 || (currentRecordIdx <= 0 && currentPage <= 1)}
            title="Newer order"
            aria-label="Go to newer order"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition-colors shadow-sm disabled:opacity-30 disabled:hover:bg-white"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigateRecord("next")}
            disabled={filteredOrders.length === 0 || (currentRecordIdx >= filteredOrders.length - 1 && currentPage >= totalPages)}
            title="Older order"
            aria-label="Go to older order"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition-colors shadow-sm disabled:opacity-30 disabled:hover:bg-white"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</span>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
            className="h-8 px-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none shadow-sm uppercase">
            <option value="All">ALL</option>
            <option value="Processing">PROCESSING</option>
            <option value="In Transit">IN TRANSIT</option>
            <option value="Delivered">DELIVERED</option>
            <option value="Cancelled">CANCELLED</option>
          </select>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Server-Side Pagination */}
        <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 shadow-inner">
          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
            Page {currentPage} of {totalPages} <span className="text-slate-400 font-normal">({totalCount} items)</span>
          </span>
          <div className="flex items-center gap-0.5">
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-white border border-transparent hover:border-slate-300 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded hover:bg-white border border-transparent hover:border-slate-300 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <TBtn onClick={handleReset} color="slate"><RotateCcw className="w-3 h-3"/>Reset</TBtn>
          <TBtn onClick={handleDelete} color="red"><Trash2 className="w-3 h-3"/>Delete</TBtn>
          <TBtn onClick={handleReceive} color="indigo"><Package className="w-3 h-3"/>Receive</TBtn>
          <TBtn onClick={() => setIsLocked(!isLocked)} color={isLocked ? "amber" : "green"}>
            {isLocked ? <Unlock className="w-3 h-3"/> : <Lock className="w-3 h-3"/>}
            {isLocked ? "Unlock" : "Lock"}
          </TBtn>
          <TBtn color="slate"><Printer className="w-3 h-3"/>Print</TBtn>
          <TBtn color="purple"><Mail className="w-3 h-3"/>Email</TBtn>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <TBtn onClick={() => setSelectedOrderId(null)} color="success"><Plus className="w-3 h-3"/>New</TBtn>
          <TBtn onClick={handlePost} color="warning"><Send className="w-3 h-3"/>Post</TBtn>
        </div>

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
          onSave={loadOrders}
          onNotify={notify}
          isLocked={isLocked}
        />
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-slate-200 bg-white shrink-0">
        <div className="flex items-center justify-between px-5 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500">
              {selectedOrder ? `PO: ${selectedOrder.orderCode}` : "NO ORDER SELECTED"}
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
              { label: "Supplier", value: selectedOrder?.manufacturerName || "-" },
              { label: "Placed Date", value: selectedOrder?.placedDate || "-" },
              { label: "Item Count", value: selectedOrder ? String(selectedOrder.itemCount ?? 0) : "-" },
              { label: "Total Order", value: selectedOrder ? `₱${selectedOrder.total?.toFixed(2) ?? "0.00"}` : "-" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="text-[11px] font-bold text-slate-700 uppercase">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
