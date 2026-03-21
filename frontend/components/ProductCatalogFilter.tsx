import { Pill, HeartPulse, Baby, Stethoscope, Droplets, ArrowDownAZ, ArrowUpZA } from "lucide-react";
import { cn } from "../lib/utils";

export const categoryGroups = [
  { id: "all", name: "All Products", icon: Pill, subcategories: [] },
  {
    id: "meds",
    name: "Medicine",
    icon: Pill,
    subcategories: ["Prescription (Rx)", "OTC", "Herbal & Traditional"]
  },
  {
    id: "vitamins",
    name: "Vitamins & Supplements",
    icon: HeartPulse,
    subcategories: []
  },
  {
    id: "devices",
    name: "Medical Devices",
    icon: Stethoscope,
    subcategories: []
  },
  {
    id: "supplies",
    name: "Medical Supplies",
    icon: Stethoscope,
    subcategories: []
  },
  {
    id: "personal",
    name: "Personal Care",
    icon: Droplets,
    subcategories: ["Skincare", "Haircare", "Dental"]
  },
  {
    id: "baby",
    name: "Baby & Mom",
    icon: Baby,
    subcategories: []
  }
];

interface ProductCatalogFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSubCategory?: string;
  onSelectSubCategory?: (sub: string) => void;
  sortOrder: "asc" | "desc";
  onToggleSort: () => void;
  children?: React.ReactNode;
}

export function ProductCatalogFilter({ 
   selectedCategory, 
   onSelectCategory,
   selectedSubCategory,
   onSelectSubCategory,
   sortOrder,
   onToggleSort,
   children
}: ProductCatalogFilterProps) {
  const activeGroup = categoryGroups.find(g => 
    g.name === selectedCategory || (g.id === "all" && (selectedCategory === "All Products" || selectedCategory === "All"))
  )?.id || "all";

  const currentGroup = categoryGroups.find(g => g.id === activeGroup);

  return (
    <div className="flex flex-col gap-3 mb-6 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100">
      {/* Top Row: Main Groups + Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categoryGroups.map(g => (
             <button 
               key={g.id}
               onClick={() => {
                 onSelectCategory(g.id === "all" ? "All Products" : g.name);
                 if (onSelectSubCategory) onSelectSubCategory("All");
               }}
               className={cn(
                 "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2",
                 activeGroup === g.id ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
               )}
             >
               <g.icon className={cn("w-4 h-4", activeGroup === g.id ? "text-white" : "text-slate-400")} />
               {g.name}
             </button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
             onClick={onToggleSort}
             className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-brand-blue transition-colors flex items-center gap-2 shadow-sm"
          >
             {sortOrder === 'asc' ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpZA className="w-4 h-4" />}
             Sort A-Z
          </button>
          {children}
        </div>
      </div>
      
      {/* Bottom Row: Subcategories */}
      {activeGroup !== "all" && currentGroup && currentGroup.subcategories.length > 0 && (
         <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 animate-in slide-in-from-top-1 fade-in duration-200">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center mr-2">Filter By:</span>
            <button
               onClick={() => onSelectSubCategory && onSelectSubCategory("All")}
               className={cn(
                 "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border",
                 (!selectedSubCategory || selectedSubCategory === "All") ? "bg-brand-green/10 text-brand-green border-brand-green/30 shadow-sm" : "bg-white text-slate-500 hover:border-brand-blue/30 border-slate-200"
               )}
             >
               All Categories
            </button>
            {currentGroup.subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => onSelectSubCategory && onSelectSubCategory(sub)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border",
                  selectedSubCategory === sub ? "bg-brand-green/10 text-brand-green border-brand-green/30 shadow-sm" : "bg-white text-slate-500 hover:border-brand-blue/30 border-slate-200"
                )}
              >
                {sub}
              </button>
            ))}
         </div>
      )}
    </div>
  );
}
