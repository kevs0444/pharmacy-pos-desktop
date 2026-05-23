import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<{row: number, col: number} | null>(null);

  // Search products when typing in stockName
  const searchProducts = useCallback(async (query: string, rowIndex: number, colIndex: number) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await window.api.inventory.list({ search: query, page: 1, pageSize: 20 });
      setSuggestions(res.items || []);
      if (res.items.length > 0) {
        setShowSuggestions({ row: rowIndex, col: colIndex });
      } else {
        setSuggestions([]);
      }
    } catch (e) {
      console.error("Error searching products:", e);
    }
  }, []);

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

  const applySuggestion = useCallback((item: any, rowIndex: number) => {
    const updated = items.map((row) => {
      if (row.rowIndex !== rowIndex) return row;
      return {
        ...row,
        stockNo: item.stockNo || "",
        stockName: item.name || "",
        orderUnit: item.baseUnit || "EACH",
        unitCost: item.unitCost ? item.unitCost.toFixed(2) : "",
      };
    });
    onItemsChange(updated);
    setShowSuggestions(null);
  }, [items, onItemsChange]);

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
    <div ref={gridRef} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex bg-gradient-to-b from-slate-700 to-slate-800 sticky top-0 z-10">
        {/* Row number header */}
        <div className="w-[36px] shrink-0 flex items-center justify-center border-r border-slate-600">
          <span className="text-[9px] font-extrabold text-slate-400">#</span>
        </div>
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={cn(
              "px-1.5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-300 border-r border-slate-600/50 last:border-r-0 shrink-0",
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
                      "relative border-r border-slate-100 last:border-r-0 shrink-0 px-0.5 py-0.5",
                      col.width
                    )}
                  >
                    <input
                      type="text"
                      data-row={rowIdx}
                      data-col={colIdx}
                      value={item[col.key]}
                      readOnly={readOnly || isComputed}
                      onChange={(e) => {
                        handleCellChange(item.rowIndex, col.key, e.target.value);
                        if (col.key === "stockName") searchProducts(e.target.value, item.rowIndex, colIdx);
                      }}
                      onBlur={() => {
                        handleCellBlur(item.rowIndex, col.key, col.isPrice);
                        setTimeout(() => setShowSuggestions(null), 200);
                      }}
                      onFocus={() => {
                        setSelectedRow(rowIdx);
                        setSelectedCol(colIdx);
                        if (col.key === "stockName" && item.stockName.length >= 2) {
                          searchProducts(item.stockName, item.rowIndex, colIdx);
                        }
                      }}
                      onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                      className={cn(
                        "w-full px-1 py-1 text-xs outline-none border-2 border-transparent focus:border-blue-500 font-bold",
                        col.align,
                        isComputed && "text-slate-500 bg-slate-50",
                        !isComputed && !readOnly && "hover:bg-slate-50 focus:bg-white text-slate-800",
                        col.isPrice && "font-mono"
                      )}
                      placeholder={col.key === "stockNo" || col.key === "stockName" ? "" : undefined}
                      tabIndex={isComputed ? -1 : 0}
                    />
                    {/* Autocomplete Dropdown */}
                    {col.key === "stockName" && showSuggestions?.row === item.rowIndex && showSuggestions?.col === colIdx && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-[500px] bg-white border border-slate-300 shadow-xl rounded z-50 max-h-[250px] overflow-y-auto">
                        <div className="sticky top-0 bg-slate-100 text-[9px] font-bold text-slate-500 uppercase px-2 py-1 flex border-b border-slate-200">
                          <div className="w-[80px]">Stock No</div>
                          <div className="flex-1">Name</div>
                          <div className="w-[50px] text-right">Unit</div>
                          <div className="w-[60px] text-right">Cost</div>
                        </div>
                        {suggestions.map((sug, i) => (
                          <div 
                            key={i} 
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevent input blur
                              applySuggestion(sug, item.rowIndex);
                            }}
                            className="flex text-[10px] px-2 py-1.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 items-center"
                          >
                            <div className="w-[80px] font-mono text-slate-500">{sug.stockNo}</div>
                            <div className="flex-1 font-bold text-slate-800 truncate pr-2">{sug.name}</div>
                            <div className="w-[50px] text-right text-slate-500">{sug.baseUnit}</div>
                            <div className="w-[60px] text-right text-green-700 font-bold">{sug.unitCost?.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200 text-[10px] font-bold text-slate-500">
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
