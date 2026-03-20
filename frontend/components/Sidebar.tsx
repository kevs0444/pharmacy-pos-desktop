import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  MonitorPlay,
  LogOut,
  UserCircle,
  ChevronDown,
  ChevronRight,
  Pill,
  HeartPulse,
  Baby,
  Stethoscope,
  SprayCan,
  Droplets,
  ShieldCheck
} from "lucide-react";
import { cn } from "../lib/utils";

const categoryGroups = [
  {
    id: "meds",
    name: "Medicines",
    icon: Pill,
    subcategories: ["Prescription (Rx)", "Over-the-Counter", "Generic", "Branded", "Herbal & Traditional"]
  },
  {
    id: "vitamins",
    name: "Vitamins & Supplements",
    icon: HeartPulse,
    subcategories: ["Multivitamins", "Immunity (Vit C)", "Kids Supplements", "Adult Health"]
  },
  {
    id: "supplies",
    name: "Medical Supplies",
    icon: Stethoscope,
    subcategories: ["First Aid & Wound Care", "Diagnostic (BP & Sugar)", "Masks & PPE", "Mobility & Supports"]
  },
  {
    id: "personal",
    name: "Personal Care",
    icon: Droplets,
    subcategories: ["Bath & Body", "Oral Care", "Hair Care", "Feminine Hygiene"]
  },
  {
    id: "baby",
    name: "Baby & Mom",
    icon: Baby,
    subcategories: ["Milk Formulas", "Diapers & Wipes", "Baby Toiletries", "Maternity Needs"]
  },
  {
    id: "essentials",
    name: "Household Essentials",
    icon: SprayCan,
    subcategories: ["Alcohol & Sanitizers", "Insect Repellents", "First Aid Needs"]
  }
];

const settingsNav = [
  { name: "POS Terminal", icon: MonitorPlay },
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Admin Panel", icon: ShieldCheck },
  { name: "Profile", icon: UserCircle },
  { name: "Inventory", icon: Package },
  { name: "Orders", icon: ShoppingCart },
  { name: "Sales", icon: TrendingUp },
];

export type TabType = "Dashboard" | "Inventory" | "Orders" | "Sales" | "Reporting" | "POS Terminal" | "Profile" | "Admin Panel";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onLogout: () => void;
  userRole: "Admin" | "Manager" | "Staff";
}

export function Sidebar({ activeTab, setActiveTab, onLogout, userRole }: SidebarProps) {
  const [openCategory, setOpenCategory] = useState<string | null>("meds");

  const toggleCategory = (id: string) => {
    setOpenCategory(prev => prev === id ? null : id);
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-screen flex flex-col overflow-y-auto shrink-0 transition-all custom-scrollbar">
      <div className="flex items-center gap-3 p-6 mb-2 sticky top-0 bg-white z-10 border-b border-slate-100">
        <div className="flex -space-x-1 items-center">
          <div className="w-5 h-7 bg-brand-blue rounded-l-full"></div>
          <div className="w-5 h-7 bg-brand-green rounded-r-full"></div>
        </div>
        <div className="flex flex-col leading-tight">
          <div className="flex items-baseline">
            <span className="font-extrabold text-brand-blue text-xl tracking-tight">Botika</span>
            <span className="font-extrabold text-brand-green text-xl tracking-tight">Plus</span>
          </div>
          <span className="text-[10px] text-brand-blue font-bold tracking-[0.2em] uppercase mt-0.5">DRUGSTORE</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-8">
        <div>
          <h3 className="px-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
            Main Navigation
          </h3>
          <ul className="space-y-1">
            {settingsNav.map((item) => {
              // Conditionally hide "Admin Panel" if userRole is not Admin
              if (item.name === "Admin Panel" && userRole !== "Admin") {
                 return null;
              }

              // Conditionally hide "Inventory", "Sales" and "Dashboard" from regular Staff if necessary
              // Alternatively, keeping them visible but restricted on Backend. We'll leave them open to show the views.
              
              const isActive = activeTab === item.name;
              return (
                <li key={item.name}>
                  <button 
                    onClick={() => setActiveTab(item.name as TabType)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                      isActive 
                        ? "text-brand-blue bg-brand-blue/5 shadow-sm shadow-brand-blue/5" 
                        : "text-slate-500 hover:text-brand-blue hover:bg-slate-50"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-brand-green" : "text-slate-400")} />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
           <div className="flex items-center justify-between px-2 mb-3">
              <h3 className="text-[11px] font-extrabold text-brand-green uppercase tracking-widest">
                Product Catalog
              </h3>
              <span className="text-[10px] font-bold bg-brand-light text-brand-green px-2 py-0.5 rounded-full">Explore</span>
           </div>
          
          <ul className="space-y-1.5">
            {categoryGroups.map((group) => {
              const isOpen = openCategory === group.id;
              
              return (
                <li key={group.id} className="flex flex-col">
                  <button 
                    onClick={() => toggleCategory(group.id)}
                    className={cn(
                       "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200",
                       isOpen ? "bg-slate-50 text-brand-blue" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                       <group.icon className={cn("w-4 h-4", isOpen ? "text-brand-green" : "text-slate-400")} />
                       <span>{group.name}</span>
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  
                  {/* Subcategories Accordion Dropdown */}
                  <div className={cn(
                     "overflow-hidden transition-all duration-300 ease-in-out",
                     isOpen ? "max-h-64 opacity-100 mt-1" : "max-h-0 opacity-0"
                  )}>
                     <ul className="pl-11 pr-2 py-1 space-y-1 border-l-2 border-slate-100 ml-4">
                       <li className="mb-2">
                           <button className="text-xs font-bold text-brand-blue hover:text-brand-green transition-colors w-full text-left py-1">
                             View All {group.name}
                           </button>
                       </li>
                       {group.subcategories.map((sub) => (
                         <li key={sub}>
                           <button className="w-full text-left py-1.5 text-xs text-slate-500 hover:text-brand-blue font-medium transition-colors">
                             {sub}
                           </button>
                         </li>
                       ))}
                     </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="pt-8 mb-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>
    </aside>
  );
}
