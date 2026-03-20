import { Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";

export function Dashboard() {
  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-[#F0F4F8]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <Card className="md:col-span-2 bg-gradient-to-r from-brand-teal/10 to-transparent border-brand-teal/20 shadow-sm relative overflow-hidden">
          <CardContent className="p-8 flex items-center justify-between">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
              <div className="text-lg font-medium text-slate-600">
                <p>Hello, staff</p>
                <p className="font-bold text-brand-teal">Welcome!</p>
              </div>
            </div>
            {/* SVG Illustration Placeholder instead of image/emoji */}
            <div className="absolute right-0 bottom-0 opacity-80 mix-blend-multiply w-48 h-48 pointer-events-none">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#0D9488" d="M45.7,-76.1C58.9,-69.3,69.1,-55.3,77.3,-40.5C85.5,-25.7,91.7,-10.1,89.5,4.3C87.3,18.7,76.6,31.9,65.8,43.4C55,54.9,44.1,64.7,30.9,71.2C17.7,77.7,2.2,80.9,-12.3,79.5C-26.8,78.1,-40.3,72.1,-52.3,63.1C-64.3,54.1,-74.8,42.1,-80.7,27.8C-86.6,13.5,-87.9,-3.1,-82.9,-17.7C-77.9,-32.3,-66.6,-44.9,-53.4,-53.1C-40.2,-61.3,-25.1,-65.1,-9.6,-66.9C5.9,-68.7,21.8,-68.5,32.4,-83L45.7,-76.1Z" transform="translate(100 100) scale(1.1)" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Stock Condition */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-700">Selling Stock Condition</CardTitle>
            <div className="flex gap-2">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Percent ▼</span>
              <Button variant="ghost" size="icon" className="h-6 w-6"><Download className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-around gap-2 px-4 pb-6">
            <div className="text-center w-20 flex flex-col items-center">
              <div className="flex items-center gap-1 text-emerald-600 mb-2">
                <span className="text-xs font-semibold">Good</span>
                <CheckCircle className="h-3 w-3" />
              </div>
              <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeWidth="4" strokeDasharray="84.62, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="mt-[-2.2rem] text-xs font-bold text-emerald-800">84.6%</div>
            </div>
            
            <div className="text-center w-20 flex flex-col items-center">
              <div className="flex items-center gap-1 text-yellow-600 mb-2">
                <span className="text-xs font-semibold">Moderate</span>
                <Clock className="h-3 w-3" />
              </div>
              <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-yellow-500" strokeWidth="4" strokeDasharray="11.54, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="mt-[-2.2rem] text-xs font-bold text-yellow-800">11.5%</div>
            </div>

            <div className="text-center w-20 flex flex-col items-center">
              <div className="flex items-center gap-1 text-red-600 mb-2">
                <span className="text-xs font-semibold">Critical</span>
                <AlertCircle className="h-3 w-3" />
              </div>
              <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-red-500" strokeWidth="4" strokeDasharray="3.85, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="mt-[-2.2rem] text-xs font-bold text-red-800">3.8%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Product Status line chart mock */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row flex-end justify-between items-center">
             <CardTitle className="text-sm font-bold text-slate-700">Product Status</CardTitle>
             <Button variant="ghost" size="icon"><Download className="h-4 w-4 text-slate-400" /></Button>
          </CardHeader>
          <CardContent className="h-64 flex flex-col relative w-full items-end pb-8">
            <div className="absolute inset-x-8 inset-y-8 flex border-l border-b border-slate-200">
               {/* Grid lines */}
               <div className="w-full h-full flex flex-col justify-between absolute right-0">
                  {[30, 25, 20, 15, 10, 5, 0].map((num) => (
                    <div key={num} className="border-t border-slate-100 flex items-center h-0 w-full relative">
                      <span className="absolute -left-6 text-[10px] text-slate-400">{num}</span>
                    </div>
                  ))}
               </div>
               
               {/* The Line SVG Mock */}
               <div className="w-full h-full relative z-10 px-8">
                 <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradientArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#0D9488" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#84CC16" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 20 Q 150 200 250 180 T 500 120 L 500 200 L 0 200 Z" fill="url(#gradientArea)" />
                    <path d="M 0 20 Q 150 200 250 180 T 500 120" fill="none" stroke="#0D9488" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                    
                    <circle cx="0" cy="20" r="4" fill="#1E3A8A" />
                    <circle cx="150" cy="140" r="4" fill="#1E3A8A" />
                    <circle cx="280" cy="190" r="4" fill="#1E3A8A" />
                    <circle cx="500" cy="120" r="4" fill="#1E3A8A" />
                 </svg>
                 <div className="absolute bottom-[-24px] w-full flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">
                    <span>Selling</span>
                    <span>Completed</span>
                    <span>Delivered</span>
                    <span>Pending</span>
                 </div>
                 
                 {/* Vertical lines */}
                 <div className="absolute left-[30%] top-0 h-full w-px bg-slate-200"></div>
                 <div className="absolute left-[60%] top-0 h-full w-px bg-slate-200"></div>
                 <div className="absolute left-[100%] top-0 h-full w-px bg-slate-200"></div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Mock */}
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-bold text-slate-700">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-slate-800 text-sm">April 2024</span>
                <div className="flex space-x-1">
                   <Button variant="outline" size="sm" className="h-6 w-8 text-xs p-0">&lt;</Button>
                   <Button variant="outline" size="sm" className="h-6 w-8 text-xs p-0">&gt;</Button>
                </div>
             </div>
             
             <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 mb-2 gap-y-3">
               <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
               
               <div className="mt-2 text-slate-700">1</div><div className="mt-2 text-brand-green font-bold">2</div><div className="mt-2 text-slate-700">3</div><div className="mt-2 text-brand-green font-bold">4</div><div className="mt-2 text-brand-green font-bold">5</div><div className="mt-2 text-slate-700">6</div><div className="mt-2 text-slate-700">7</div>
               
               <div className="mt-2 text-slate-700">8</div><div className="mt-2 text-brand-green font-bold">9</div><div className="mt-2 text-slate-700">10</div><div className="mt-2 text-slate-700">11</div><div className="mt-2 text-slate-700">12</div><div className="mt-2 text-slate-700">13</div><div className="mt-2 text-slate-700">14</div>
               
               <div className="mt-2 text-slate-700">15</div><div className="mt-2 text-brand-green font-bold">16</div><div className="mt-2 text-slate-700">17</div><div className="mt-2 text-brand-green font-bold">18</div><div className="mt-2 text-slate-700">19</div><div className="mt-2 text-slate-700">20</div><div className="mt-2 text-slate-700">21</div>
               
               <div className="mt-2 text-brand-green font-bold relative"><span className="absolute inset-0 bg-brand-green/20 rounded-full w-6 h-6 m-auto"></span>22</div>
               <div className="mt-2 text-slate-700">23</div><div className="mt-2 text-slate-700">24</div><div className="mt-2 text-brand-teal font-bold relative"><span className="absolute inset-0 bg-brand-teal/20 rounded-full w-6 h-6 m-auto"></span>25</div>
               <div className="mt-2 text-slate-700">26</div><div className="mt-2 text-slate-700">27</div><div className="mt-2 text-slate-700">28</div>
             </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
