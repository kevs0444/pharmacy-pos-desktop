import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "../lib/utils";

export interface LineItem {
  id?: number;
  rowIndex: number;
  stockNo: string;
  stockName: string;
  orderUnit: string;
  pkgQty: string;
  quantity: string;
  unitCost: string;
  discPercent: string;
  netUcost: string;
  extCost: string;
  received: string;
  prNumber: string;
  remarks: string;
}

export function emptyLineItem(rowIndex: number): LineItem {
  return {
    rowIndex,
    stockNo: "",
    stockName: "",
    orderUnit: "EACH",
    pkgQty: "1",
    quantity: "",
    unitCost: "",
    discPercent: "",
    netUcost: "",
    extCost: "",
    received: "",
    prNumber: "",
    remarks: "",
  };
}

interface OrderLineItemGridProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  readOnly?: boolean;
}

// Columns for the spreadsheet — "#" is the row-number gutter, NOT a data column
const COLUMNS = [
  { key: "stockNo", label: "Stock No.", width: "w-[70px]", align: "text-center", isPrice: false },
  { key: "stockName", label: "Stock Name", width: "min-w-[200px] flex-1", align: "text-left", isPrice: false },
  { key: "orderUnit", label: "Order Unit", width: "w-[85px]", align: "text-center", isPrice: false },
  { key: "pkgQty", label: "Pkg Qty", width: "w-[65px]", align: "text-right", isPrice: false },
  { key: "quantity", label: "Quantity", width: "w-[75px]", align: "text-right", isPrice: false },
  { key: "unitCost", label: "Unit Cost", width: "w-[95px]", align: "text-right", isPrice: true },
  { key: "discPercent", label: "Disc%", width: "w-[60px]", align: "text-right", isPrice: false },
  { key: "netUcost", label: "Net Ucost", width: "w-[95px]", align: "text-right", isPrice: true },
  { key: "extCost", label: "Ext Cost", width: "w-[95px]", align: "text-right", isPrice: true },
  { key: "received", label: "Recvd", width: "w-[60px]", align: "text-right", isPrice: false },
  { key: "prNumber", label: "PR #", width: "w-[65px]", align: "text-center", isPrice: false },
  { key: "remarks", label: "Remarks", width: "w-[120px]", align: "text-left", isPrice: false },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

/** Format a numeric string to 0.00 */
function formatPrice(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return num.toFixed(2);
}

export function OrderLineItemGrid({ items, onItemsChange, readOnly = false }: OrderLineItemGridProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleCellChange = useCallback(
    (rowIndex: number, key: ColumnKey, value: string) => {
      const numericColumns = ["pkgQty", "quantity", "unitCost", "discPercent", "netUcost", "extCost", "received"];
      let finalValue = value;
      
      // Enforce number-only inputs for specific columns
      if (numericColumns.includes(key) && value !== "") {
        // Strip everything except numbers and a single decimal point
        finalValue = value.replace(/[^0-9.]/g, '');
        const decimalParts = finalValue.split('.');
        if (decimalParts.length > 2) {
          finalValue = decimalParts[0] + '.' + decimalParts.slice(1).join('');
        }
      }

      const updated = items.map((item) => {
        if (item.rowIndex !== rowIndex) return item;
        const copy = { ...item, [key]: finalValue };
        // Auto-compute extCost when quantity or unitCost changes
        const qty = parseFloat(copy.quantity) || 0;
        const cost = parseFloat(copy.unitCost) || 0;
        const disc = parseFloat(copy.discPercent) || 0;
        const netCost = cost * (1 - disc / 100);
        copy.netUcost = cost > 0 ? netCost.toFixed(2) : "";
        copy.extCost = qty > 0 && cost > 0 ? (qty * netCost).toFixed(2) : "";
        return copy;
      });

      // Auto-append if editing the last row and it now has content
      const lastItem = updated[updated.length - 1];
      if (lastItem && (lastItem.stockName || lastItem.quantity || lastItem.unitCost)) {
        updated.push(emptyLineItem(updated.length));
      }

      onItemsChange(updated);
    },
    [items, onItemsChange]
  );

  /** On blur: format price fields to 0.00 */
  const handleCellBlur = useCallback(
    (rowIndex: number, key: ColumnKey, isPrice: boolean) => {
      if (!isPrice) return;
      const updated = items.map((item) => {
        if (item.rowIndex !== rowIndex) return item;
        const raw = item[key];
        if (!raw) return item;
        return { ...item, [key]: formatPrice(raw) };
      });
      onItemsChange(updated);
    },
    [items, onItemsChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const nextCol = e.shiftKey ? colIdx - 1 : colIdx + 1;
        if (nextCol >= 0 && nextCol < COLUMNS.length) {
          setSelectedCol(nextCol);
        } else if (!e.shiftKey && nextCol >= COLUMNS.length) {
          const nextRow = rowIdx + 1;
          if (nextRow < items.length) {
            setSelectedRow(nextRow);
            setSelectedCol(0);
          }
        } else if (e.shiftKey && nextCol < 0) {
          const prevRow = rowIdx - 1;
          if (prevRow >= 0) {
            setSelectedRow(prevRow);
            setSelectedCol(COLUMNS.length - 1);
          }
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (rowIdx < items.length - 1) setSelectedRow(rowIdx + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (rowIdx > 0) setSelectedRow(rowIdx - 1);
      }
    },
    [items.length]
  );

  // Focus the selected cell input
  useEffect(() => {
    if (selectedRow !== null && selectedCol !== null && gridRef.current) {
      const input = gridRef.current.querySelector(
        `[data-row="${selectedRow}"][data-col="${selectedCol}"]`
      ) as HTMLInputElement | null;
      input?.focus();
    }
  }, [selectedRow, selectedCol]);

  return (
    <div ref={gridRef} className="border border-slate-300 rounded-md overflow-hidden bg-white">
      {/* Header */}
      <div className="flex bg-slate-700 sticky top-0 z-10 shadow-sm">
        {/* Row number header */}
        <div className="w-[36px] shrink-0 flex items-center justify-center border-r border-slate-600 bg-slate-700/90">
          <span className="text-[9px] font-black text-slate-400">#</span>
        </div>
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={cn(
              "px-1.5 py-2 text-[10px] font-black uppercase tracking-wider text-slate-200 border-r border-slate-600 last:border-r-0 shrink-0 shadow-sm",
              col.width,
              col.align
            )}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
        {items.map((item, rowIdx) => {
          const isSelected = selectedRow === rowIdx;
          const isEmpty = !item.stockName && !item.quantity && !item.unitCost;
          return (
            <div
              key={item.rowIndex}
              className={cn(
                "flex border-b border-slate-200 last:border-b-0 transition-colors duration-75",
                isSelected
                  ? "bg-blue-50/80 ring-1 ring-inset ring-blue-300"
                  : isEmpty
                  ? "bg-slate-50/30"
                  : "bg-white hover:bg-slate-50/50"
              )}
              onClick={() => setSelectedRow(rowIdx)}
            >
              {/* Row number gutter — this is the ONLY "#" column */}
              <div className="w-[36px] shrink-0 flex items-center justify-center border-r border-slate-200 bg-slate-50/50">
                <span className={cn("text-[10px] font-bold", isSelected ? "text-blue-600" : "text-slate-400")}>
                  {rowIdx + 1}
                </span>
              </div>

              {/* Data cells */}
              {COLUMNS.map((col, colIdx) => {
                const isComputed = col.key === "netUcost" || col.key === "extCost";
                return (
                  <div
                    key={col.key}
                    className={cn(
                      "border-r border-slate-100 last:border-r-0 shrink-0 px-0.5 py-0.5",
                      col.width
                    )}
                  >
                    <input
                      type="text"
                      data-row={rowIdx}
                      data-col={colIdx}
                      value={item[col.key]}
                      readOnly={readOnly || isComputed}
                      onChange={(e) => handleCellChange(item.rowIndex, col.key, e.target.value)}
                      onBlur={() => handleCellBlur(item.rowIndex, col.key, col.isPrice)}
                      onFocus={() => {
                        setSelectedRow(rowIdx);
                        setSelectedCol(colIdx);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                      className={cn(
                        "w-full h-full px-1.5 py-1.5 text-xs font-medium border-0 outline-none transition-colors",
                        col.align,
                        isComputed
                          ? "bg-slate-50 text-slate-500 cursor-default"
                          : "bg-transparent text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:rounded-sm",
                        readOnly && "cursor-default"
                      )}
                      placeholder={isEmpty && colIdx === 0 ? "▸" : ""}
                      tabIndex={isComputed ? -1 : 0}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-slate-50 to-slate-100 border-t-2 border-slate-300 text-[10px] font-bold text-slate-500">
        <span>
          {items.filter((i) => i.stockName || i.quantity).length} item(s)
        </span>
        <span>
          Total: ₱
          {items
            .reduce((sum, item) => sum + (parseFloat(item.extCost) || 0), 0)
            .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
