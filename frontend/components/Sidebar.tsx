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
  ShieldCheck,
  Menu
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCategory = (id: string) => {
    if (isCollapsed) setIsCollapsed(false); // Auto-expand if clicking category while collapsed
    setOpenCategory(prev => prev === id ? null : id);
  };

  return (
    <aside className={cn(
      "bg-white border-r border-slate-200 h-screen flex flex-col overflow-y-auto shrink-0 transition-all duration-300 ease-in-out custom-scrollbar z-20",
      isCollapsed ? "w-20" : "w-72"
    )}>
      <div className={cn("flex items-center p-6 mb-2 sticky top-0 bg-white z-10 border-b border-slate-100", isCollapsed ? "justify-center px-0" : "justify-between")}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex -space-x-1 items-center shrink-0">
              <div className="w-5 h-7 bg-brand-blue rounded-l-full"></div>
              <div className="w-5 h-7 bg-brand-green rounded-r-full"></div>
            </div>
            <div className="flex flex-col leading-tight shrink-0">
              <div className="flex items-baseline">
                <span className="font-extrabold text-brand-blue text-xl tracking-tight">Botika</span>
                <span className="font-extrabold text-brand-green text-xl tracking-tight">Plus</span>
              </div>
              <span className="text-[10px] text-brand-blue font-bold tracking-[0.2em] uppercase mt-0.5">DRUGSTORE</span>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("p-2 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-light/50 transition-colors shrink-0", isCollapsed && "mt-1")}
          title="Toggle Sidebar"
        >
           <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className={cn("flex-1 py-4 space-y-8", isCollapsed ? "px-2" : "px-4")}>
        <div>
          {!isCollapsed && (
            <h3 className="px-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 whitespace-nowrap overflow-hidden">
              Main Navigation
            </h3>
          )}
          <ul className="space-y-1">
            {settingsNav.map((item) => {
              // Conditionally hide "Admin Panel" if userRole is not Admin
              if (item.name === "Admin Panel" && userRole !== "Admin") {
                 return null;
              }

              const isActive = activeTab === item.name;
              return (
                <li key={item.name}>
                  <button 
                    onClick={() => setActiveTab(item.name as TabType)}
                    className={cn(
                      "w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                      isCollapsed ? "justify-center px-0" : "px-3",
                      isActive 
                        ? "text-brand-blue bg-brand-blue/5 shadow-sm shadow-brand-blue/5" 
                        : "text-slate-500 hover:text-brand-blue hover:bg-slate-50"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-brand-green" : "text-slate-400")} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
           {!isCollapsed ? (
             <div className="flex items-center justify-between px-2 mb-3">
                <h3 className="text-[11px] font-extrabold text-brand-green uppercase tracking-widest whitespace-nowrap overflow-hidden">
                  Product Catalog
                </h3>
                <span className="text-[10px] font-bold bg-brand-light text-brand-green px-2 py-0.5 rounded-full shrink-0">Explore</span>
             </div>
           ) : (
             <div className="flex justify-center mb-3">
                <div className="w-6 border-b-2 border-slate-200"></div>
             </div>
           )}
          
          <ul className="space-y-1.5">
            {categoryGroups.map((group) => {
              const isOpen = openCategory === group.id && !isCollapsed;
              
              return (
                <li key={group.id} className="flex flex-col">
                  <button 
                    onClick={() => toggleCategory(group.id)}
                    className={cn(
                       "w-full flex items-center py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200",
                       isCollapsed ? "justify-center px-0" : "justify-between px-3",
                       isOpen && !isCollapsed ? "bg-slate-50 text-brand-blue" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                       isCollapsed && "hover:bg-slate-50 hover:text-brand-blue"
                    )}
                    title={isCollapsed ? group.name : undefined}
                  >
                    <div className="flex items-center gap-3">
                       <group.icon className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4", isOpen && !isCollapsed ? "text-brand-green" : "text-slate-400", isCollapsed && "text-slate-400")} />
                       {!isCollapsed && <span className="truncate text-left">{group.name}</span>}
                    </div>
                    {!isCollapsed && (isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />)}
                  </button>
                  
                  {/* Subcategories Accordion Dropdown */}
                  {!isCollapsed && (
                    <div className={cn(
                       "overflow-hidden transition-all duration-300 ease-in-out",
                       isOpen ? "max-h-64 opacity-100 mt-1" : "max-h-0 opacity-0"
                    )}>
                       <ul className="pl-11 pr-2 py-1 space-y-1 border-l-2 border-slate-100 ml-4">
                         <div className="mt-1 ml-6 pl-4 border-l border-brand-teal/20 space-y-1">
                          <div
                            onClick={() => setActiveTab("POS Terminal")}
                            className="py-2 text-xs font-bold text-brand-blue cursor-pointer hover:text-brand-green transition-colors"
                          >
                            View All {group.name}
                          </div>
                          {group.subcategories.map((sub) => (
                            <div
                              key={sub}
                              onClick={() => setActiveTab("POS Terminal")}
                              className="py-1.5 text-xs font-semibold text-slate-500 cursor-pointer hover:text-brand-blue transition-colors truncate"
                              title={sub}
                            >
                              {sub}
                            </div>
                          ))}
                         </div>
                       </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className={cn("pt-8 mb-4 border-t border-slate-100", isCollapsed ? "px-0" : "px-2")}>
          <button 
            onClick={onLogout}
            className={cn(
               "w-full flex items-center py-2 rounded-md text-sm font-bold text-red-500 hover:bg-red-50 transition-colors",
               isCollapsed ? "justify-center px-0" : "gap-3 px-2"
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
          
          {/* Version */}
          <div className={cn("mt-4 text-center", isCollapsed ? "px-0" : "px-2")}>
            <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">
              {isCollapsed ? "v1" : "v1.0.0"}
            </span>
          </div>
        </div>
      </nav>
    </aside>
  );
}
