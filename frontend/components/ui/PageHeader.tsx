import { cn } from "../../lib/utils";
import { ReactNode, useState, useEffect } from "react";

interface PageHeaderProps {
  children?: ReactNode;
  userId?: string;
  dateStr?: string;
  className?: string;
}

function getFormattedDate() {
  const d = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[d.getDay()];
  const day = d.getDate().toString().padStart(2, '0');
  const monthName = months[d.getMonth()];
  const year = d.getFullYear().toString().slice(-2);
  
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `(${dayName}) ${day}-${monthName}-${year} ${hours}:${minutes} ${ampm}`;
}

export function PageHeader({ children, userId = "ADMIN", dateStr, className }: PageHeaderProps) {
  const [currentDate, setCurrentDate] = useState(getFormattedDate());

  useEffect(() => {
    if (dateStr) return; // Don't tick if overridden
    const timer = setInterval(() => {
      setCurrentDate(getFormattedDate());
    }, 1000);
    return () => clearInterval(timer);
  }, [dateStr]);

  const displayDate = dateStr || currentDate;

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
