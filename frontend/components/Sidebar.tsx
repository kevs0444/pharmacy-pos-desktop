import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp 
} from "lucide-react";
import { cn } from "../lib/utils";

const categories = [
  "All Products", 
  "Prescription Medicines", 
  "Over the Counter Medicines",
  "Generic",
  "Branded",
  "Medicines",
  "Vitamins",
  "Personal Care",
  "Cosmetics",
  "Medical Supplies",
  "Baby and Kids",
  "Young Adults (17-30)"
];

const settingsNav = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Inventory", icon: Package },
  { name: "Orders", icon: ShoppingCart },
  { name: "Sales", icon: TrendingUp },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col overflow-y-auto">
      <div className="flex items-center gap-3 p-6 mb-2">
        {/* Brand SVG Icon */}
        <div className="bg-brand-teal p-1.5 rounded-lg flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v20" />
            <path d="M2 12h20" />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-brand-teal text-lg tracking-tight">CureSecure</span>
          <span className="text-xs text-brand-blue font-medium tracking-widest uppercase">Pharmacy</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-6 pb-6">
        <div>
          <h3 className="px-2 text-xs font-bold text-brand-teal uppercase tracking-wider mb-3">
            Categories:
          </h3>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat}>
                <button className="w-full text-left px-2 py-1.5 rounded-md text-sm text-slate-600 hover:text-brand-blue hover:bg-slate-50 font-medium transition-colors">
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Settings:
          </h3>
          <ul className="space-y-1">
            {settingsNav.map((item) => (
              <li key={item.name}>
                <button 
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors",
                    item.name === "Dashboard" 
                      ? "text-brand-teal bg-teal-50" 
                      : "text-slate-600 hover:text-brand-blue hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
