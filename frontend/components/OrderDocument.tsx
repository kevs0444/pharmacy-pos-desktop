import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { cn } from "../lib/utils";
import type { PurchaseOrderRecord } from "../../backend/types/domain";
import { OrderLineItemGrid, emptyLineItem } from "./OrderLineItemGrid";
import type { LineItem } from "./OrderLineItemGrid";
import { Clock, Truck, CheckCircle, X as XIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface OrderDocumentProps {
  order: PurchaseOrderRecord | null;
  manufacturers: { id: number; name: string; contactPerson: string | null; email: string | null; phone: string | null }[];
  isNew?: boolean;
  onSave?: (order: PurchaseOrderRecord) => void;
  onNavigate?: (dir: "first"|"prev"|"next"|"last") => void;
}

const STATUS_BADGE: Record<string, { label: string; cls: string; icon: any }> = {
  Processing:   { label: "Processing",  cls: "bg-amber-100 text-amber-700 border-amber-300",    icon: Clock },
  "In Transit": { label: "In Transit",  cls: "bg-blue-100 text-blue-700 border-blue-300",       icon: Truck },
  Delivered:    { label: "Delivered",    cls: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: CheckCircle },
  Cancelled:    { label: "Cancelled",   cls: "bg-red-100 text-red-600 border-red-300",           icon: XIcon },
};


export interface OrderDocumentRef {
  save: () => Promise<void>;
}

export const OrderDocument = forwardRef<OrderDocumentRef, OrderDocumentProps>(({ 
  order, 
  manufacturers, 
  isNew = false,
  onNavigate,
  onSave
}, ref) => {
  // Local editable state seeded from the selected order
  const [docNo, setDocNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderedBy, setOrderedBy] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notedBy, setNotedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [termsDays, setTermsDays] = useState("30");
  const [payDueDate, setPayDueDate] = useState("");
  const [qtyToOrder, setQtyToOrder] = useState("1 week");
  const [remarks, setRemarks] = useState("");
  const [faxEmailRemarks, setFaxEmailRemarks] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [status, setStatus] = useState("Processing");
  const [isLocked, setIsLocked] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem(0)]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Supplier contact info (derived from selected manufacturer)
  const supplierInfo = useMemo(() => {
    const mfg = manufacturers.find((m) => m.name === supplier);
    return {
      contactPerson: mfg?.contactPerson || "",
      phone: mfg?.phone || "",
      email: mfg?.email || "",
    };
  }, [manufacturers, supplier]);

  // Computed totals
  const computedTotals = useMemo(() => {
    const itemCount = lineItems.filter((i) => i.stockName || i.quantity).length;
    const totalOrder = lineItems.reduce((s, i) => s + (parseFloat(i.extCost) || 0), 0);
    return { itemCount, totalOrder, totalReceived: 0 };
  }, [lineItems]);

  // Seed from order prop
  useEffect(() => {
    if (!order) {
      // New order mode
      setDocNo("");
      setOrderDate(new Date().toISOString().slice(0, 10));
      setOrderedBy("");
      setSupplier("");
      setNotedBy("");
      setApprovedBy("");
      setTermsDays("30");
      setPayDueDate("");
      setQtyToOrder("1 week");
      setRemarks("");
      setFaxEmailRemarks("");
      setPriority("Normal");
      setStatus("Processing");
      setIsLocked(false);
      setLineItems([emptyLineItem(0)]);
      return;
    }

    setDocNo(order.orderCode);
    setOrderDate(order.placedDate);
    setOrderedBy(order.orderedByName || "CHA");
    setSupplier(order.manufacturerName);
    setNotedBy(order.notedBy || "");
    setApprovedBy(order.approvedBy || "");
    setTermsDays(order.termsDays?.toString() || "30");
    setQtyToOrder(order.qtyToOrder || "1 week");
    setRemarks(order.remarks || "");
    setFaxEmailRemarks(order.faxEmailRemarks || "");
    setPriority(order.priority);
    setStatus(order.status);
    setIsLocked(order.isLocked || order.status === "Delivered" || order.status === "Cancelled");

    if (order.payDueDate) {
      setPayDueDate(order.payDueDate);
    } else if (order.placedDate) {
      try {
        const placed = new Date(order.placedDate);
        placed.setDate(placed.getDate() + 30);
        setPayDueDate(placed.toISOString().slice(0, 10));
      } catch {
        setPayDueDate("");
      }
    }

    // Load line items from DB
    async function loadItems() {
      setIsLoadingItems(true);
      try {
        const dbItems = await window.api.orders.getItems(order!.id);
        if (dbItems.length > 0) {
          const mapped: LineItem[] = dbItems.map((item, idx) => ({
            id: item.id,
            rowIndex: idx,
            stockNo: item.stockNo || String(idx + 1),
            stockName: item.stockName,
            orderUnit: item.orderUnit || "",
            pkgQty: item.pkgQty ? String(item.pkgQty) : "",
            quantity: String(item.quantity),
            unitCost: item.unitCost > 0 ? item.unitCost.toFixed(2) : "",
            discPercent: item.discPercent > 0 ? item.discPercent.toFixed(2) : "",
            netUcost: item.netUCost > 0 ? item.netUCost.toFixed(2) : "",
            extCost: item.extCost > 0 ? item.extCost.toFixed(2) : "",
            received: item.recvd > 0 ? String(item.recvd) : "",
            prNumber: item.prNum || "",
            remarks: item.remarks || "",
          }));
          mapped.push(emptyLineItem(mapped.length));
          setLineItems(mapped);
        } else {
          setLineItems([emptyLineItem(0)]);
        }
      } catch (e: any) {
        console.error("Failed to load order items:", e);
        setLineItems([emptyLineItem(0)]);
      } finally {
        setIsLoadingItems(false);
      }
    }
    loadItems();
  }, [order]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      // Find manufacturer ID from name
      const mfg = manufacturers.find(m => m.name === supplier);
      const mfgId = mfg ? mfg.id : null;
      
      const payload = {
        id: order?.id,
        manufacturerId: mfgId,
        manufacturerName: supplier,
        contactPerson: supplierInfo.contactPerson,
        total: computedTotals.totalOrder,
        status: status as any,
        etaDate: null,
        placedDate: orderDate,
        priority: priority as any,
        orderedByName: orderedBy,
        remarks: remarks || null,
        faxEmailRemarks: faxEmailRemarks || null,
        notedBy: notedBy || null,
        approvedBy: approvedBy || null,
        qtyToOrder: qtyToOrder || null,
        termsDays: parseInt(termsDays, 10) || 30,
        payDueDate: payDueDate || null,
        items: lineItems
          .filter(i => i.stockName || parseFloat(i.quantity) > 0)
          .map(i => ({
            productId: null,
            stockNo: i.stockNo || null,
            stockName: i.stockName,
            orderUnit: i.orderUnit || null,
            pkgQty: parseFloat(i.pkgQty) || 1,
            quantity: parseFloat(i.quantity) || 0,
            unitCost: parseFloat(i.unitCost) || 0,
            discPercent: parseFloat(i.discPercent) || 0,
            netUCost: parseFloat(i.netUcost) || 0,
            extCost: parseFloat(i.extCost) || 0,
            prNum: i.prNumber || null,
            remarks: i.remarks || null
          }))
      };

      try {
        await window.api.orders.save(payload);
        if (onSave) onSave(payload as any);
        alert("Order saved successfully!");
      } catch (err) {
        console.error("Failed to save order:", err);
        alert("Failed to save order. Check console for details.");
      }
    }
  }));

  const statusCfg = STATUS_BADGE[status] || STATUS_BADGE["Processing"];
  const StatusIcon = statusCfg.icon;

  if (!order && !isNew) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-bold">Select an order to view</p>
          <p className="text-xs">Click on an order from the list below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Document Header ── */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button 
              disabled={isLocked}
              onClick={() => {
                if (isLocked) return;
                const cycle: Record<string, string> = {
                  "Processing": "In Transit",
                  "In Transit": "Delivered",
                  "Delivered": "Processing",
                  "Cancelled": "Processing"
                };
                setStatus(cycle[status] || "Processing");
              }}
              className={cn("text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-80 active:scale-95 disabled:opacity-100 disabled:cursor-not-allowed", statusCfg.cls)}
              title={isLocked ? "Order is locked" : "Click to change status"}
            >
              <StatusIcon className="w-3 h-3" />
              {statusCfg.label}
            </button>
            {priority === "Urgent" && (
              <span className="text-[10px] font-extrabold uppercase bg-red-100 text-red-600 px-2 py-1 rounded-full border border-red-200">
                🚨 Urgent
              </span>
            )}
          </div>
          
          {!isHeaderExpanded && (
             <div className="hidden md:flex flex-1 mx-4 items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 overflow-hidden whitespace-nowrap">
                <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{docNo || "NEW PO"}</span>
                <span className="opacity-50">•</span>
                <span>{orderDate}</span>
                <span className="opacity-50">•</span>
                <span><span className="opacity-60 mr-1">Supplier:</span> <span className="text-brand-blue">{supplier || "Not selected"}</span></span>
                <span className="opacity-50">•</span>
                <span><span className="opacity-60 mr-1">Total:</span> <span className="text-emerald-600">₱{(computedTotals.totalOrder || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                <span className="opacity-50">•</span>
                <span><span className="opacity-60 mr-1">By:</span> {orderedBy || "N/A"}</span>
                {(notedBy || approvedBy) && (
                   <>
                     <span className="opacity-50">•</span>
                     <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                       <CheckCircle className="w-3 h-3" /> 
                       {approvedBy || notedBy}
                     </span>
                   </>
                )}
             </div>
          )}

          <button 
            onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
            className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors shadow-sm"
          >
            {isHeaderExpanded ? "Minimize Header" : "Expand Header"}
          </button>
        </div>

        {/* Form fields — Responsive 4-column layout */}
        {isHeaderExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Column 1: Order Details */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative pt-4">
            <div className="absolute -top-[10px] left-3 bg-white px-1.5">
              <span className="text-[9px] font-extrabold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">Order Details</span>
            </div>
            
            <div className="flex items-center gap-1 mt-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[80px] text-right pr-2">Doc No</label>
              <input type="text" value={docNo || ""} readOnly className="flex-1 w-full px-2 py-0.5 text-xs font-bold text-slate-800 outline-none bg-white border border-slate-300 rounded shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
            </div>
            
            <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[80px] text-right pr-2">Order Date</label>
               <input type="date" value={orderDate || ""} onChange={(e) => setOrderDate(e.target.value)} className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-300 rounded bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700" />
            </div>

            <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[80px] text-right pr-2">Ordered By</label>
               <select value={orderedBy || ""} onChange={(e) => setOrderedBy(e.target.value)} className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-300 rounded bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700">
                  <option value="CHA">CHA</option>
                  <option value="System Administrator">System Administrator</option>
                  <option value="Branch Manager">Branch Manager</option>
               </select>
            </div>

            <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[80px] text-right pr-2">Supplier</label>
               <div className="flex items-center gap-2 flex-1 w-full">
                 <select value={supplier || ""} onChange={(e) => setSupplier(e.target.value)} className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-300 rounded bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700">
                    <option value="">Select...</option>
                    <option value="01-MAIN">01-MAIN</option>
                    {manufacturers.filter(m => m.name !== "01-MAIN").map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                 </select>
                 <span className="text-[10px] font-semibold text-emerald-600 truncate">{supplier === "01-MAIN" ? "Main warehouse" : ""}</span>
               </div>
            </div>

            <div className="flex items-start gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[80px] text-right pr-2 mt-1">Remarks</label>
               <textarea value={remarks || ""} onChange={(e) => setRemarks(e.target.value)} rows={2} className="flex-1 w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700" />
            </div>

            <div className="flex items-start gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[80px] text-right pr-2 mt-1 leading-tight">Fax / Email<br/>remarks</label>
               <textarea value={faxEmailRemarks || ""} onChange={(e) => setFaxEmailRemarks(e.target.value)} rows={2} className="flex-1 w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700" />
            </div>
          </div>

          {/* Column 2: Approvals */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative pt-4">
            <div className="absolute -top-[10px] left-3 bg-white px-1.5">
              <span className="text-[9px] font-extrabold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">Approvals & Workflow</span>
            </div>
             
             <div className="flex items-center gap-1 mt-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Noted By</label>
               <select value={notedBy || ""} onChange={(e) => setNotedBy(e.target.value)} className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-300 rounded bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700">
                 <option value=""></option>
                 <option value="Branch Manager">Branch Manager</option>
                 <option value="System Administrator">System Administrator</option>
               </select>
             </div>
             <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Approved By</label>
               <select value={approvedBy || ""} onChange={(e) => setApprovedBy(e.target.value)} className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-300 rounded bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700">
                 <option value=""></option>
                 <option value="System Administrator">System Administrator</option>
                 <option value="Branch Manager">Branch Manager</option>
               </select>
             </div>
             <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">QtyToOrder</label>
               <select value={qtyToOrder || ""} onChange={(e) => setQtyToOrder(e.target.value)} className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-300 rounded bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700">
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
               </select>
             </div>
             <div className="flex items-center gap-1 ml-[79px] mt-1">
               <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">MCP00010</span>
               <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 ml-4">OTHER</span>
             </div>
             <div className="flex items-center gap-2 mt-2">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">SysGen?</label>
               <input type="checkbox" className="w-3.5 h-3.5 border-slate-300 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-shadow" />
             </div>
             <div className="flex items-start gap-2 mt-3 ml-[79px]">
               <button className="flex items-center justify-center px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide rounded shadow-sm text-white transition-transform active:scale-95 bg-[#2b4c7e] hover:bg-[#1e3a63] text-center leading-tight">Email to<br/>supplier</button>
               <div className="flex flex-col items-center">
                 <button className="flex items-center justify-center px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide rounded shadow-sm text-white transition-transform active:scale-95 bg-[#2b4c7e] hover:bg-[#1e3a63] text-center leading-tight">Send to<br/>Cloud</button>
                 <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-4 py-0.5 rounded-full mt-1.5 shadow-sm border border-blue-200">0</span>
               </div>
             </div>
          </div>

          {/* Column 3: Terms & Contact */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative pt-4">
             <div className="absolute -top-[10px] left-3 bg-white px-1.5">
               <span className="text-[9px] font-extrabold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">Terms & Contact</span>
             </div>
             
             <div className="flex items-center gap-1 mt-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Terms (days)</label>
               <select value={termsDays || "30"} onChange={(e) => setTermsDays(e.target.value)} className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-300 rounded bg-white text-center outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700">
                 <option value="7">7</option>
                 <option value="15">15</option>
                 <option value="30">30</option>
                 <option value="45">45</option>
                 <option value="60">60</option>
                 <option value="90">90</option>
               </select>
             </div>
             <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Pay Due Date</label>
               <input type="date" value={payDueDate || ""} readOnly className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-200 rounded bg-slate-50 outline-none text-slate-600" />
             </div>
             <div className="flex items-center gap-2">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Closed</label>
               <input type="checkbox" className="w-3.5 h-3.5 border-slate-300 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-shadow" />
             </div>
             <div className="flex items-center gap-1 mt-2">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Item Cnt</label>
               <input type="text" value={computedTotals.itemCount} readOnly className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-200 rounded bg-slate-100 text-slate-700 text-center outline-none font-bold" />
             </div>
             <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Total Order</label>
               <input type="text" value={computedTotals.totalOrder.toFixed(2)} readOnly className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-200 rounded bg-blue-50 text-blue-700 text-center outline-none font-bold" />
             </div>
             <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Total Recvd</label>
               <input type="text" value={computedTotals.totalReceived.toFixed(2)} readOnly className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-200 rounded bg-emerald-50 text-emerald-700 text-center outline-none font-bold" />
             </div>
             <div className="flex items-center gap-1 mt-2">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Contact</label>
               <input type="text" value={supplierInfo.contactPerson || ""} readOnly className="flex-1 px-2 py-0.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none font-medium" />
             </div>
             <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Phone</label>
               <input type="text" value={supplierInfo.phone || ""} readOnly className="flex-1 px-2 py-0.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none font-medium" />
             </div>
             <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Fax</label>
               <input type="text" value="" readOnly className="flex-1 px-2 py-0.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none font-medium" />
             </div>
             <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[75px] text-right pr-2">Email</label>
               <input type="text" value={supplierInfo.email || ""} readOnly className="flex-1 px-2 py-0.5 text-xs border border-slate-200 rounded bg-slate-50 text-blue-600 outline-none font-medium truncate hover:underline cursor-pointer" />
             </div>
          </div>

          {/* Column 4: Summary */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative flex flex-col h-full pt-4">
             <div className="absolute -top-[10px] left-3 bg-white px-1.5">
               <span className="text-[9px] font-extrabold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">Summary</span>
             </div>
             
             <div className="flex items-center gap-1 mt-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[70px] text-right pr-2">Amount</label>
               <input type="text" value={computedTotals.totalOrder.toFixed(2)} readOnly className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-700 text-right font-mono outline-none font-medium" />
             </div>
             <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[70px] text-right pr-2">Item Disc</label>
               <input type="text" value="0.00" readOnly className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-700 text-right font-mono outline-none font-medium" />
             </div>
             <div className="flex items-center gap-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[70px] text-right pr-2">Addl Disc</label>
               <input type="text" value="0.00" readOnly className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-700 text-right font-mono outline-none font-medium" />
             </div>
             <div className="flex items-center gap-1 mt-1">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 w-[70px] text-right pr-2">Net Amt</label>
               <input type="text" value={computedTotals.totalOrder.toFixed(2)} readOnly className="flex-1 w-full px-2 py-0.5 text-xs border border-slate-200 rounded bg-blue-50 text-blue-700 text-right font-mono outline-none font-bold" />
             </div>
             
             <div className="mt-auto flex flex-col gap-2 pl-[74px]">
               <div className="flex items-center gap-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lock</label>
                 <input type="checkbox" checked={isLocked} onChange={() => setIsLocked(!isLocked)} className="w-3.5 h-3.5 border-slate-300 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-shadow" />
               </div>
               <div className="text-[9px] text-slate-400 font-bold mt-2">
                 Created: {orderDate ? `${orderDate} 17:04:02` : "—"}
               </div>
             </div>
          </div>
        </div>
        )}
      </div>

      {/* ── Line Items Grid ── */}
      <div className="flex-1 overflow-hidden p-4 bg-slate-50 flex flex-col min-h-0">
        <div className="mb-2 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-medium">
            💡 Type in the <strong>Stock Name</strong> column to search and select items from inventory.
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <OrderLineItemGrid
          items={lineItems}
          onItemsChange={setLineItems}
          readOnly={isLocked}
          isLoading={isLoadingItems}
        />
        </div>
      </div>
    </div>
  );
});
