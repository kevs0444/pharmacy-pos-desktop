import { cn } from "../../lib/utils";
import { ReactNode } from "react";

interface ColumnDef {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataGridProps {
  columns: ColumnDef[];
  children: ReactNode; // The tbody rows
  className?: string;
}

export function DataGrid({ columns, children, className }: DataGridProps) {
  return (
    <div className={cn("flex-1 bg-white overflow-auto relative border border-slate-200 rounded-lg shadow-sm", className)}>
      <table className="w-full text-left whitespace-nowrap border-collapse text-[11px] md:text-xs">
        <thead className="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200 shadow-sm z-10">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={col.key} 
                className={cn(
                  "font-bold px-3 py-2 border-r border-slate-200", 
                  col.width,
                  {
                    "text-left": !col.align || col.align === "left",
                    "text-center": col.align === "center",
                    "text-right": col.align === "right",
                  }
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {children}
        </tbody>
      </table>
    </div>
  );
}

// Pre-styled standard row that handles the hover and bottom border
export function DataGridRow({ 
  children, 
  className,
  isHighlight = false
}: { 
  children: ReactNode; 
  className?: string;
  isHighlight?: boolean;
}) {
  return (
    <tr className={cn(
      "border-b border-slate-100 transition-colors",
      isHighlight ? "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" : "hover:bg-slate-50",
      className
    )}>
      {children}
    </tr>
  );
}

// Pre-styled cell to handle consistent padding and borders
export function DataGridCell({ 
  children, 
  className,
  align = "left",
  isBold = false
}: { 
  children: ReactNode; 
  className?: string;
  align?: "left" | "center" | "right";
  isBold?: boolean;
}) {
  return (
    <td className={cn(
      "border-r border-slate-100 px-3 py-1.5",
      {
        "text-left": align === "left",
        "text-center": align === "center",
        "text-right": align === "right",
        "font-bold text-slate-800": isBold,
      },
      className
    )}>
      {children}
    </td>
  );
}
