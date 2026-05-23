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
  children: ReactNode;
  className?: string;
}

export function DataGrid({ columns, children, className }: DataGridProps) {
  return (
    <div className={cn("flex-1 bg-white overflow-auto relative border border-slate-200/80 rounded-xl shadow-sm", className)}>
      <table className="w-full text-left whitespace-nowrap border-collapse text-[11px] md:text-[11.5px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gradient-to-b from-slate-100 to-slate-50 border-b-2 border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "font-extrabold uppercase tracking-wider text-slate-500 px-3 py-2.5 border-r border-slate-200 last:border-r-0 text-[10px]",
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
        <tbody className="text-slate-700 divide-y divide-slate-100">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function DataGridRow({
  children,
  className,
  isHighlight = false,
}: {
  children: ReactNode;
  className?: string;
  isHighlight?: boolean;
}) {
  return (
    <tr
      className={cn(
        "transition-colors duration-100 group",
        isHighlight
          ? "bg-amber-50/60 hover:bg-amber-100/60"
          : "even:bg-slate-50/40 hover:bg-blue-50/40",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function DataGridCell({
  children,
  className,
  align = "left",
  isBold = false,
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  isBold?: boolean;
}) {
  return (
    <td
      className={cn(
        "border-r border-slate-100/80 last:border-r-0 px-3 py-1.5 leading-snug",
        {
          "text-left": align === "left",
          "text-center": align === "center",
          "text-right": align === "right",
          "font-semibold text-slate-800": isBold,
        },
        className
      )}
    >
      {children}
    </td>
  );
}
