import { cn } from "../../lib/utils";
import { ReactNode } from "react";

interface PageHeaderProps {
  children?: ReactNode;
  userId?: string;
  dateStr?: string;
  className?: string;
}

export function PageHeader({ children, userId = "ADMIN", dateStr, className }: PageHeaderProps) {
  // If no date string is provided, use a default static format mimicking the legacy UI for now
  const displayDate = dateStr || "(Fri) 22-May-26";

  return (
    <div className={cn("bg-slate-800 text-white p-2 flex items-center gap-4 text-[11px] shrink-0 shadow-sm border-b border-slate-700", className)}>
      <div className="flex-1 flex items-center gap-4">
        {children}
      </div>
      <div className="text-right shrink-0">
        <span className="font-bold">User ID: {userId}</span>
        <br/>
        <span className="text-[10px] text-slate-400">{displayDate}</span>
      </div>
    </div>
  );
}
