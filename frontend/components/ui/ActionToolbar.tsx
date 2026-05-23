import { cn } from "../../lib/utils";
import { ReactNode } from "react";

interface ActionToolbarProps {
  children: ReactNode;
  className?: string;
  justify?: "start" | "center" | "end" | "between";
}

export function ActionToolbar({ children, className, justify = "center" }: ActionToolbarProps) {
  return (
    <div className={cn(
      "flex p-2 gap-2 shrink-0 bg-slate-100 border-b border-slate-200 shadow-inner flex-wrap items-center",
      {
        "justify-start": justify === "start",
        "justify-center": justify === "center",
        "justify-end": justify === "end",
        "justify-between": justify === "between",
      },
      className
    )}>
      {children}
    </div>
  );
}

// Pre-styled common button sizes/colors used inside the toolbar
export function ActionButton({ 
  children, 
  onClick, 
  variant = "default", 
  className 
}: { 
  children: ReactNode; 
  onClick?: () => void; 
  variant?: "default" | "primary" | "warning" | "danger" | "fkey";
  className?: string;
}) {
  const baseStyle = "px-3 py-1 font-bold shadow-sm transition-colors rounded border flex items-center gap-1 text-[10px] md:text-xs";
  
  const variants = {
    default: "bg-white hover:bg-slate-50 border-slate-300 text-slate-700",
    primary: "bg-brand-blue hover:bg-blue-700 border-brand-blue text-white",
    warning: "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white",
    danger: "bg-red-500 hover:bg-red-600 border-red-500 text-white",
    fkey: "bg-white hover:bg-slate-50 border-slate-300 text-red-600", // Legacy style where text is red but bg is white
  };

  return (
    <button 
      onClick={onClick}
      className={cn(baseStyle, variants[variant], className)}
    >
      {children}
    </button>
  );
}
