import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Package, Pencil, Trash2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import type { ChangeRequestRecord } from "../../backend/types/domain";

type TabFilter = "PENDING" | "APPROVED" | "REJECTED";

interface ParsedPayload {
  name?: string;
  code?: string;
  genericName?: string;
  manufacturerName?: string;
  category?: string;
  subCategory?: string;
  sellingPricePerUnit?: number;
  sellingPricePerPiece?: number;
  unitPriceCost?: number;
  discount?: number | null;
  totalStockPieces?: number;
  brandType?: string;
  productId?: number;
  [key: string]: unknown;
}

function parsePayload(raw: string): ParsedPayload {
  try { return JSON.parse(raw) as ParsedPayload; } catch { return {}; }
}

function typeBadge(type: string) {
  if (type === "CREATE") return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 flex items-center gap-1">
      <Package className="w-3 h-3" /> New Product
    </span>
  );
  if (type === "UPDATE") return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 flex items-center gap-1">
      <Pencil className="w-3 h-3" /> Edit
    </span>
  );
  return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 flex items-center gap-1">
      <Trash2 className="w-3 h-3" /> Delete
    </span>
  );
}

function statusBadge(status: string) {
  if (status === "PENDING") return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
  if (status === "APPROVED") return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
  return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
}

export function InventoryChangeRequests() {
  const [tab, setTab] = useState<TabFilter>("PENDING");
  const [requests, setRequests] = useState<ChangeRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectNoteId, setRejectNoteId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await window.api.inventory.listChangeRequests(tab);
      setRequests(data);
    } catch (e: any) {
      window.dispatchEvent(new CustomEvent("app-error", {
        detail: { title: "Load Error", message: e.message || String(e) }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [tab]);

  useEffect(() => { void loadRequests(); }, [loadRequests]);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await window.api.inventory.reviewChangeRequest(id, { approved: true });
      window.dispatchEvent(new CustomEvent("app-success", {
        detail: { title: "Approved", message: "Change has been applied to inventory." }
      }));
      void loadRequests();
    } catch (e: any) {
      window.dispatchEvent(new CustomEvent("app-error", {
        detail: { title: "Approve Error", message: e.message || String(e) }
      }));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      await window.api.inventory.reviewChangeRequest(id, { approved: false, reviewerNote: rejectNote || undefined });
      window.dispatchEvent(new CustomEvent("app-success", {
        detail: { title: "Rejected", message: "Change request has been rejected." }
      }));
      setRejectNoteId(null);
      setRejectNote("");
      void loadRequests();
    } catch (e: any) {
      window.dispatchEvent(new CustomEvent("app-error", {
        detail: { title: "Reject Error", message: e.message || String(e) }
      }));
    } finally {
      setProcessingId(null);
    }
  };

  const tabs: TabFilter[] = ["PENDING", "APPROVED", "REJECTED"];

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50">
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              Pending Inventory Changes
              {tab === "PENDING" && requests.length > 0 && (
                <span className="px-2.5 py-1 rounded-full text-sm font-black bg-amber-500 text-white animate-pulse">
                  {requests.length}
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Review and approve or reject inventory change submissions
            </p>
          </div>
          <button
            onClick={() => void loadRequests()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setExpandedId(null); setRejectNoteId(null); }}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-bold transition-all",
                tab === t
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {t === "PENDING" ? "⏳ Pending" : t === "APPROVED" ? "✅ Approved" : "❌ Rejected"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center text-slate-400 font-medium">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-500 font-bold">No {tab.toLowerCase()} requests</p>
              <p className="text-slate-400 text-sm mt-1">
                {tab === "PENDING" ? "All inventory changes are up to date." : "Nothing to show here yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map(req => {
                const p = parsePayload(req.payload);
                const isExpanded = expandedId === req.id;
                const isRejectOpen = rejectNoteId === req.id;
                const isProcessing = processingId === req.id;
                const productName = p.name || (req.requestType === "DELETE" ? `Product ID #${p.productId}` : "—");

                return (
                  <div key={req.id} className={cn("transition-colors", isExpanded && "bg-slate-50/60")}>
                    {/* Main row */}
                    <div
                      className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50/80 group"
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    >
                      <div className="shrink-0">{typeBadge(req.requestType)}</div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{productName}</p>
                        {p.genericName && <p className="text-xs text-slate-400 font-medium truncate">{p.genericName}</p>}
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Submitted {new Date(req.submittedAt).toLocaleString()} {req.submittedByName ? `by ${req.submittedByName}` : ""}
                        </p>
                      </div>

                      <div className="shrink-0 hidden md:block">{statusBadge(req.status)}</div>

                      {req.status === "PENDING" && (
                        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            disabled={isProcessing}
                            onClick={() => handleApprove(req.id)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => { setRejectNoteId(isRejectOpen ? null : req.id); setRejectNote(""); }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-red-500/20"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}

                      <div className="text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Reject note input */}
                    {isRejectOpen && (
                      <div className="px-6 pb-4 flex items-center gap-3" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={rejectNote}
                          onChange={e => setRejectNote(e.target.value)}
                          placeholder="Optional reason for rejection..."
                          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                        <button
                          disabled={isProcessing}
                          onClick={() => handleReject(req.id)}
                          className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                          Confirm Reject
                        </button>
                        <button onClick={() => { setRejectNoteId(null); setRejectNote(""); }} className="px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600">
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-slate-100 pt-4">
                        {[
                          ["Code / SKU", p.code],
                          ["Category", p.category],
                          ["Sub-Category", p.subCategory],
                          ["Brand Type", p.brandType],
                          ["Cost Price", p.unitPriceCost != null ? `₱${Number(p.unitPriceCost).toFixed(2)}` : null],
                          ["SRP / Unit", p.sellingPricePerUnit != null ? `₱${Number(p.sellingPricePerUnit).toFixed(2)}` : null],
                          ["SRP / Piece", p.sellingPricePerPiece != null ? `₱${Number(p.sellingPricePerPiece).toFixed(2)}` : null],
                          ["Discount", p.discount != null ? `${p.discount}%` : "None"],
                          ["Initial Stock", p.totalStockPieces != null ? String(p.totalStockPieces) : null],
                          ["Manufacturer", p.manufacturerName || null],
                          ["Reviewed by", req.reviewedByName || null],
                          ["Reviewer Note", req.reviewerNote || null],
                        ].filter(([, v]) => v != null).map(([label, value]) => (
                          <div key={String(label)} className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                            <p className="font-semibold text-slate-700">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
