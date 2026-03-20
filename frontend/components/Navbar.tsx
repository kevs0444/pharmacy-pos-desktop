import { Bell, ChevronDown, User } from "lucide-react";

export function Navbar() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10 w-full">
      <div className="text-sm font-medium tracking-wide text-slate-600">
        {currentDate}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 overflow-hidden group-hover:bg-slate-300 transition-colors">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-800">staff</span>
            <span className="text-xs font-bold text-slate-400">STAFF</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 ml-1" />
        </div>
        
        <button className="relative text-slate-400 hover:text-brand-teal transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border-2 border-white ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}
