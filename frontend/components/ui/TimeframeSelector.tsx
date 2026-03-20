import { useState } from "react";
import { cn } from "../../lib/utils";
import { Calendar } from "lucide-react";

export type Timeframe = "Daily" | "Weekly" | "Monthly" | "Annually" | "Custom";

interface TimeframeSelectorProps {
  onChange?: (timeframe: Timeframe) => void;
  defaultValue?: Timeframe;
  size?: "sm" | "md";
}

export function TimeframeSelector({ onChange, defaultValue = "Weekly", size = "sm" }: TimeframeSelectorProps) {
  const [active, setActive] = useState<Timeframe>(defaultValue);
  const [showCustom, setShowCustom] = useState(false);

  const options: Timeframe[] = ["Daily", "Weekly", "Monthly", "Annually", "Custom"];

  const handleClick = (tf: Timeframe) => {
    setActive(tf);
    if (tf === "Custom") {
      setShowCustom(!showCustom);
    } else {
      setShowCustom(false);
    }
    onChange?.(tf);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center flex-wrap gap-1">
        {options.map(tf => (
          <button
            key={tf}
            onClick={() => handleClick(tf)}
            className={cn(
              "rounded-lg font-bold transition-all active:scale-95",
              size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
              active === tf
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            )}
          >
            {tf === "Custom" && <Calendar className="w-3 h-3 inline mr-1 -mt-0.5" />}
            {tf}
          </button>
        ))}
      </div>

      {/* Custom Date Range Picker */}
      {showCustom && active === "Custom" && (
        <div className="flex items-center gap-2 flex-wrap animate-in slide-in-from-top-1 fade-in duration-200">
          <input
            type="date"
            defaultValue="2026-03-14"
            className="px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
          />
          <span className="text-[10px] font-bold text-slate-400">to</span>
          <input
            type="date"
            defaultValue="2026-03-20"
            className="px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
          />
          <button className="px-3 py-1 text-[10px] font-black bg-brand-blue text-white rounded-lg hover:bg-blue-900 transition-colors active:scale-95">
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
