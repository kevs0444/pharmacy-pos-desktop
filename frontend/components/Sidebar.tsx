import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MonitorPlay,
  LogOut,
  UserCircle,
  ShieldCheck,
  Menu
} from "lucide-react";
import { cn } from "../lib/utils";



const settingsNav = [
  { name: "POS Terminal", icon: MonitorPlay },
  { name: "Inventory", icon: Package },
  { name: "Orders", icon: ShoppingCart },
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Admin Panel", icon: ShieldCheck },
];

export type TabType = "Dashboard" | "Inventory" | "Orders" | "Sales" | "Reporting" | "POS Terminal" | "Profile" | "Admin Panel";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onLogout: () => void;
  userRole: "Admin" | "Manager" | "Staff";
}

export function Sidebar({ activeTab, setActiveTab, onLogout, userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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


        
        <div className={cn("pt-4 mt-auto mb-4 border-t border-slate-100", isCollapsed ? "px-0" : "px-2")}>
          <button 
            onClick={() => setActiveTab("Profile")}
            className={cn(
              "w-full flex items-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 mb-2",
              isCollapsed ? "justify-center px-0" : "px-3",
              activeTab === "Profile" 
                ? "text-brand-blue bg-brand-blue/5 shadow-sm" 
                : "text-slate-500 hover:text-brand-blue hover:bg-slate-50"
            )}
            title={isCollapsed ? "Profile" : undefined}
          >
            <UserCircle className={cn("w-5 h-5 shrink-0", activeTab === "Profile" ? "text-brand-blue" : "text-slate-400")} />
            {!isCollapsed && <span className="truncate ml-3">Profile</span>}
          </button>

          <button 
            onClick={onLogout}
            className={cn(
               "w-full flex items-center py-2.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-colors",
               isCollapsed ? "justify-center px-0" : "px-3"
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="ml-3">Sign Out</span>}
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
