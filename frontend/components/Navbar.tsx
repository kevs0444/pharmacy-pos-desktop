import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, User, LogOut, UserCircle, ShieldCheck, Briefcase, AlertTriangle, PackageX } from "lucide-react";
import { TabType } from "./Sidebar";

interface NavbarProps {
  onLogout: () => void;
  onNavigate: (tab: TabType) => void;
  userRole: "Admin" | "Manager" | "Staff";
}

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'critical', title: 'Medicine Expired', message: 'Amoxicillin 500mg (Batch A12) expired 2 days ago.', time: '2 hours ago' },
  { id: 2, type: 'warning', title: 'Expiring Soon', message: 'Paracetamol Syrup expiring in 15 days.', time: '1 day ago' },
  { id: 3, type: 'warning', title: 'Low Stock', message: 'Vitamin C Ascorbic Acid is critically low (5 bottles left).', time: '2 days ago' }
];

export function Navbar({ onLogout, onNavigate, userRole }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleIcon = () => {
    switch(userRole) {
      case "Admin": return <ShieldCheck className="w-4 h-4" />;
      case "Manager": return <Briefcase className="w-4 h-4" />;
      case "Staff": return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = () => {
    switch(userRole) {
      case "Admin": return "bg-red-100 text-red-600";
      case "Manager": return "bg-yellow-100 text-yellow-600";
      case "Staff": return "bg-slate-200 text-slate-600";
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-20 w-full relative">
      <div className="text-sm font-medium tracking-wide text-slate-600">
        {currentDate}
      </div>
      
      <div className="flex items-center gap-6">
        
        {/* User Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer group p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden transition-colors ${getRoleColor()}`}>
              {getRoleIcon()}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-800">{userRole === "Admin" ? "admin" : userRole.toLowerCase()}</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{userRole}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 ml-1" />
          </div>

          {/* User Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 transform origin-top-right transition-all">
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
              </div>
              <button
                onClick={() => {
                  onNavigate("Profile");
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-blue transition-colors text-left"
              >
                <UserCircle className="w-4 h-4" />
                My Profile
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
        
        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notifRef}>
           <button 
             onClick={() => {
               setIsNotifOpen(!isNotifOpen);
               setIsDropdownOpen(false);
             }}
             className="relative text-slate-400 hover:text-brand-blue transition-colors p-2"
           >
             <Bell className="w-5 h-5" />
             <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white ring-2 ring-white"></span>
           </button>

           {/* Notifications Menu */}
           {isNotifOpen && (
             <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 transform origin-top-right transition-all">
               <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                 <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                   Alerts & Expiries <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]">3 New</span>
                 </p>
               </div>
               <div className="max-h-[300px] overflow-y-auto">
                 {MOCK_NOTIFICATIONS.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                       <div className="flex gap-3">
                         <div className={`mt-0.5 shrink-0 ${notif.type === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}>
                           {notif.type === 'critical' ? <PackageX className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-800 leading-tight group-hover:text-brand-blue transition-colors">{notif.title}</span>
                           <span className="text-xs font-medium text-slate-500 mt-1 leading-snug">{notif.message}</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase mt-2">{notif.time}</span>
                         </div>
                       </div>
                    </div>
                 ))}
               </div>
               <div className="px-4 py-2 border-t border-slate-50 mt-1 text-center">
                 <button 
                    onClick={() => onNavigate("Inventory")}
                    className="text-xs font-bold text-brand-blue hover:text-brand-green transition-colors"
                 >
                   View All Inventory
                 </button>
               </div>
             </div>
           )}
        </div>
      </div>
    </header>
  );
}
