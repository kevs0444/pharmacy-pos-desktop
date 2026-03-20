import { 
  Download, AlertCircle, Clock, 
  TrendingUp, Users, PackageOpen, ShoppingBag, ArrowUpRight, DollarSign, Target, PieChart, TrendingDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

interface DashboardProps {
  userRole: "Admin" | "Manager" | "Staff";
}

export function Dashboard({ userRole }: DashboardProps) {
  
  // STAFF VIEW
  if (userRole === "Staff") {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 overflow-y-auto bg-slate-50 custom-scrollbar relative">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-500">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">My Performance</h1>
               <p className="text-sm font-medium text-slate-500 mt-1">Hello, staff! Extremely readable and precise metrics for your current shift.</p>
             </div>
             <div className="flex items-center gap-3 self-start sm:self-auto">
               <span title="Your shift is currently active and logging metrics." className="px-3 md:px-4 py-1.5 md:py-2 bg-brand-green/10 text-brand-green font-bold text-xs md:text-sm rounded-xl flex items-center gap-2 border border-brand-green/20 cursor-default">
                  <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                  Active Shift
               </span>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
             <Card title="Gross sales accumulated specifically by your account today." className="rounded-[1rem] shadow-sm border border-slate-200 hover:border-brand-blue/50 transition-colors cursor-default">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue"><DollarSign className="w-5 h-5" /></div>
                      <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md"><ArrowUpRight className="w-3 h-3 mr-1" /> Target Beaten</span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight">₱ 8.5k</h3>
                   <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">My Sales Today</p>
                </CardContent>
             </Card>
             <Card title="Total successful customer transactions you've processed." className="rounded-[1rem] shadow-sm border border-slate-200 cursor-default">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center text-brand-green"><ShoppingBag className="w-5 h-5" /></div>
                   </div>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight">64</h3>
                   <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Transactions Handled</p>
                </CardContent>
             </Card>
             <Card title="Percentage completed toward your daily baseline requirement." className="rounded-[1rem] shadow-sm border border-slate-200 cursor-default">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"><Target className="w-5 h-5" /></div>
                   </div>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight">84.5%</h3>
                   <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Daily Target Reached</p>
                </CardContent>
             </Card>
             <Card title="How long your POS session has run today." className="rounded-[1rem] shadow-sm border border-slate-200 bg-slate-800 text-white cursor-default">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-white"><Clock className="w-5 h-5" /></div>
                   </div>
                   <h3 className="text-3xl font-black tracking-tight text-white">04:12</h3>
                   <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest text-slate-300">Current Shift (Hrs:Min)</p>
                </CardContent>
             </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
             {/* Hourly Sales Trend */}
             <Card className="rounded-[1rem] shadow-sm border border-slate-200">
                <CardHeader className="p-6 md:p-8 pb-4 border-b border-slate-100 bg-slate-50/50">
                   <div>
                      <CardTitle className="text-lg font-extrabold text-slate-800">My Hourly Sales Trend</CardTitle>
                      <p className="text-xs font-medium text-slate-500 mt-1">Easily readable transactional volume per hour.</p>
                   </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                   <div className="h-64 flex justify-between gap-1 md:gap-4 relative w-full pt-10 pb-8">
                      <div className="absolute inset-x-0 bottom-8 top-10 flex flex-col justify-between pointer-events-none opacity-40 z-0 border-l border-b border-slate-300">
                         {[100, 75, 50, 25].map(i => (
                           <div key={i} className="w-full border-t border-dashed border-slate-300 relative">
                             <span className="absolute -left-6 -top-2 text-[10px] font-bold text-slate-500">{i}</span>
                           </div>
                         ))}
                      </div>
                      
                      {[
                        { time: '8 AM', value: 30, color: 'bg-blue-500' },
                        { time: '9 AM', value: 55, color: 'bg-blue-600' },
                        { time: '10 AM', value: 85, color: 'bg-emerald-500' },
                        { time: '11 AM', value: 45, color: 'bg-blue-400' },
                        { time: '12 PM', value: 95, color: 'bg-emerald-600' },
                        { time: '1 PM', value: 65, color: 'bg-blue-600' },
                        { time: '2 PM', value: 10, color: 'bg-slate-300' },
                      ].map((bar, i) => (
                         // Custom hover title tooltip
                         <div key={i} title={`${bar.time} - ${bar.value} sales processed`} className="flex flex-col items-center justify-end flex-1 z-10 h-full relative group cursor-pointer hover:bg-slate-50/50 rounded-lg transition-colors">
                            <span className="text-[11px] md:text-xs font-black text-slate-800 mb-1 group-hover:-translate-y-1 transition-transform">{bar.value}</span>
                            <div className={cn("w-full max-w-[32px] md:max-w-[48px] rounded-t-lg shadow-sm border border-black/5 group-hover:brightness-110", bar.color)} style={{ height: `${bar.value}%` }}></div>
                            <span className="absolute -bottom-6 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{bar.time}</span>
                         </div>
                      ))}
                   </div>
                </CardContent>
             </Card>

             {/* Personal Pie Chart and Top Products */}
             <Card className="rounded-[1rem] shadow-sm border border-slate-200">
                <CardHeader className="p-6 md:p-8 pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-row justify-between items-center">
                   <div>
                     <CardTitle className="text-lg font-extrabold text-slate-800">My Categories & Products</CardTitle>
                     <p className="text-xs font-medium text-slate-500 mt-1">Clearly divided breakdown of your sales.</p>
                   </div>
                   <PieChart className="w-5 h-5 text-slate-400" />
                </CardHeader>
                <CardContent className="p-6 md:p-8 pt-6 flex flex-col md:flex-row items-center gap-8">
                   
                   <div className="flex flex-col items-center shrink-0">
                      <div 
                        title="Pie distribution of category volume"
                        className="w-36 h-36 rounded-full shadow-inner border border-slate-100 relative mb-4 hover:scale-[1.02] transition-transform cursor-pointer" 
                        style={{ background: 'conic-gradient(#10b981 0% 45%, #3b82f6 45% 75%, #f59e0b 75% 90%, #94a3b8 90% 100%)' }}>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold text-slate-600">
                         <div title="Volume: 45%" className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900"><div className="w-2.5 h-2.5 bg-brand-green rounded-sm"></div> OTC (45%)</div>
                         <div title="Volume: 30%" className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900"><div className="w-2.5 h-2.5 bg-brand-blue rounded-sm"></div> Rx (30%)</div>
                         <div title="Volume: 15%" className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900"><div className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></div> Suppl (15%)</div>
                         <div title="Volume: 10%" className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900"><div className="w-2.5 h-2.5 bg-slate-400 rounded-sm"></div> Other (10%)</div>
                      </div>
                   </div>

                   <div className="w-full space-y-4">
                     <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Top Solid Items</h4>
                     {[
                       { name: "Biogesic 500mg", qty: 45, max: 50, color: "bg-brand-blue" },
                       { name: "Neozep Forte", qty: 32, max: 50, color: "bg-emerald-500" },
                       { name: "Ascorbic Acid", qty: 28, max: 50, color: "bg-yellow-500" },
                     ].map((item, i) => (
                        <div key={i} title={`${item.qty} ${item.name} distributed.`} className="group cursor-pointer">
                           <div className="flex justify-between text-xs md:text-sm font-bold text-slate-700 mb-1">
                              <span>{item.name}</span>
                              <span className="bg-slate-100 px-2 rounded-sm group-hover:bg-slate-200 transition-colors">{item.qty} units</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className={cn("h-full rounded-full transition-all group-hover:brightness-110", item.color)} style={{ width: `${(item.qty / item.max) * 100}%` }}></div>
                           </div>
                        </div>
                     ))}
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  // MANAGER VIEW
  if (userRole === "Manager") {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 overflow-y-auto bg-slate-50 custom-scrollbar relative">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-500">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Pharmacy Performance</h1>
               <p className="text-sm font-medium text-slate-500 mt-1">Highly readable charts combining Profit, Categories, and Employee output.</p>
             </div>
             <Button variant="outline" className="border-slate-300 shadow-sm rounded-lg bg-white active:scale-95 text-slate-700 font-bold self-start sm:self-auto"><Download className="w-4 h-4 mr-2" /> Download Report</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
             <Card title="Total combined revenue generated today across all staff." className="rounded-[1rem] shadow-sm border border-slate-200 p-6 flex flex-col justify-center cursor-default">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Profit Today</span>
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">₱ 24.5k</h3>
             </Card>
             <Card title="Total funds distributed to supplier or expenses today." className="rounded-[1rem] shadow-sm border border-slate-200 p-6 flex flex-col justify-center cursor-default">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><TrendingDown className="w-4 h-4" /></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Expenses</span>
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">₱ 6.2k</h3>
             </Card>
             <Card title="Total amount of unique items available in the system." className="rounded-[1rem] shadow-sm border border-slate-200 p-6 flex flex-col justify-center cursor-default">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center"><PackageOpen className="w-4 h-4" /></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Inventory Items</span>
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">1,204</h3>
             </Card>
             <Card title="Items hitting zero or dropping below threshold limits." className="rounded-[1rem] shadow-sm border border-red-200 p-6 flex flex-col justify-center bg-red-50/50 cursor-pointer hover:bg-red-100/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><AlertCircle className="w-4 h-4" /></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-red-700">Critical / Pending</span>
                </div>
                <h3 className="text-3xl font-black text-red-800 tracking-tight">18 <span className="text-sm font-semibold text-red-600 tracking-normal">Alerts</span></h3>
             </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
             {/* Readability-first SVG Line Chart */}
             <Card className="lg:col-span-2 rounded-[1rem] shadow-sm border border-slate-200 overflow-hidden relative">
                <CardHeader className="flex flex-row flex-end justify-between items-center p-6 md:p-8 pb-4 bg-slate-50/50 border-b border-slate-100">
                   <div>
                      <CardTitle className="text-lg font-extrabold text-slate-800">Clear Weekly Finance Trend</CardTitle>
                      <p className="text-xs font-semibold text-slate-500 mt-1">Legible line charts accurately tracking daily nodes.</p>
                   </div>
                   <div className="flex gap-4">
                     <span className="flex items-center text-[10px] font-bold text-slate-600 uppercase cursor-help" title="Daily Revenue Track"><div className="w-3 h-3 rounded bg-emerald-500 mr-2"></div>Profit</span>
                     <span className="flex items-center text-[10px] font-bold text-slate-600 uppercase cursor-help" title="Daily Expenditures Track"><div className="w-3 h-3 rounded bg-red-500 mr-2"></div>Expenses</span>
                   </div>
                </CardHeader>
                <CardContent className="h-64 md:h-72 flex flex-col relative w-full items-end pb-8 px-6 md:px-8 mt-4">
                  <div className="absolute inset-x-6 md:inset-x-8 inset-y-8 flex border-l-2 border-b-2 border-slate-300">
                     <div className="absolute -left-10 h-full flex flex-col justify-between py-1 text-[10px] font-bold text-slate-400">
                        <span>₱30k</span><span>₱20k</span><span>₱10k</span><span>₱0</span>
                     </div>
                     <div className="w-full h-full flex flex-col justify-between absolute pointer-events-none opacity-30">
                        {[1, 2, 3].map(i => <div key={i} className="border-t border-slate-400 w-full h-0"></div>)}
                     </div>

                     <div className="w-full h-full relative z-10">
                       <svg className="w-full h-full overflow-visible" viewBox="0 0 900 200" preserveAspectRatio="none">
                          <path d="M 0 160 L 150 150 L 300 120 L 450 100 L 600 70 L 750 90 L 900 40 L 900 200 L 0 200 Z" fill="#10b981" opacity="0.1" />
                          <path d="M 0 160 L 150 150 L 300 120 L 450 100 L 600 70 L 750 90 L 900 40" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                          <path d="M 0 180 L 150 175 L 300 160 L 450 155 L 600 130 L 750 140 L 900 150" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="6,6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

                          {/* Data Points with SVG native tooltips */}
                          {[[0, 160], [150, 150], [300, 120], [450, 100], [600, 70], [750, 90], [900, 40]].map((p, i) => (
                             <circle key={i} cx={p[0]} cy={p[1]} r="6" fill="#fff" stroke="#10b981" strokeWidth="3" className="cursor-crosshair">
                                <title>Profit Day {i+1}: ₱ {Math.abs(200 - p[1]) * 150}</title>
                             </circle>
                          ))}
                          
                          {[[0, 180], [150, 175], [300, 160], [450, 155], [600, 130], [750, 140], [900, 150]].map((p, i) => (
                             <circle key={i} cx={p[0]} cy={p[1]} r="5" fill="#ef4444" className="cursor-crosshair">
                                <title>Expense Day {i+1}: ₱ {Math.abs(200 - p[1]) * 130}</title>
                             </circle>
                          ))}
                       </svg>
                       <div className="absolute bottom-[-24px] w-full flex justify-between text-[10px] font-black text-slate-500 uppercase">
                          <span style={{ transform: 'translateX(-50%)' }}>Mon</span>
                          <span style={{ transform: 'translateX(-50%)' }}>Tue</span>
                          <span style={{ transform: 'translateX(-50%)' }}>Wed</span>
                          <span style={{ transform: 'translateX(-50%)' }}>Thu</span>
                          <span style={{ transform: 'translateX(-50%)' }}>Fri</span>
                          <span style={{ transform: 'translateX(-50%)' }}>Sat</span>
                          <span style={{ transform: 'translateX(50%)' }}>Sun</span>
                       </div>
                     </div>
                  </div>
                </CardContent>
             </Card>

             <div className="flex flex-col gap-4 md:gap-6">
                
                {/* Store Overall Pie Chart */}
                <Card className="rounded-[1rem] shadow-sm border border-slate-200">
                   <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                     <CardTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2"><PieChart className="w-4 h-4 text-emerald-600" />Category Breakdown</CardTitle>
                   </CardHeader>
                   <CardContent className="p-5 flex items-center justify-between">
                      <div 
                        title="55% OTC, 25% Prescriptions, 20% Wellness"
                        className="w-24 h-24 rounded-full shadow-sm ring-4 ring-slate-50 cursor-pointer hover:scale-[1.02] transition-transform" 
                        style={{ background: 'conic-gradient(#10b981 0% 55%, #3b82f6 55% 80%, #f59e0b 80% 100%)' }}>
                      </div>
                      <div className="space-y-3">
                         <div title="Total Revenue: ₱13.4k" className="flex flex-col cursor-help p-1 hover:bg-slate-50 rounded">
                            <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-700 uppercase"><div className="w-3 h-3 bg-brand-green rounded-sm"></div> OTC Items</span>
                            <span className="text-xs font-medium text-slate-500 pl-4.5">55% (₱ 13.4k)</span>
                         </div>
                         <div title="Total Revenue: ₱6.1k" className="flex flex-col cursor-help p-1 hover:bg-slate-50 rounded">
                            <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-700 uppercase"><div className="w-3 h-3 bg-brand-blue rounded-sm"></div> Prescriptions</span>
                            <span className="text-xs font-medium text-slate-500 pl-4.5">25% (₱ 6.1k)</span>
                         </div>
                         <div title="Total Revenue: ₱5k" className="flex flex-col cursor-help p-1 hover:bg-slate-50 rounded">
                            <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-700 uppercase"><div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> Wellness</span>
                            <span className="text-xs font-medium text-slate-500 pl-4.5">20% (₱ 5k)</span>
                         </div>
                      </div>
                   </CardContent>
                </Card>

                {/* Staff Sales Leaderboard */}
                <Card className="rounded-[1rem] shadow-sm border border-slate-200 flex-1 overflow-hidden">
                   <CardHeader className="p-5 pb-2 border-b border-slate-100 bg-slate-50/50">
                     <CardTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2"><Users className="w-4 h-4 text-brand-blue" />Staff Sales Rankings</CardTitle>
                   </CardHeader>
                   <CardContent className="p-5 md:p-6 space-y-4">
                      {[
                        { name: "Reymart Llona", sales: 15.4, max: 20, color: "bg-brand-blue" },
                        { name: "Yuri Sagadraca", sales: 12.2, max: 20, color: "bg-brand-teal" },
                        { name: "Jomari Cos", sales: 8.5, max: 20, color: "bg-yellow-500" },
                      ].map((staff, i) => (
                         <div key={i} className="group cursor-pointer">
                            <div className="flex justify-between items-end mb-1" title={`${staff.name} completed ₱ ${staff.sales}k in gross retail.`}>
                               <div className="flex items-center gap-2 truncate pr-2">
                                  <span className="font-extrabold text-slate-400 text-xs shrink-0">0{i+1}</span>
                                  <span className="text-[11px] md:text-sm font-bold text-slate-800 truncate group-hover:text-brand-blue transition-colors">{staff.name}</span>
                               </div>
                               <span className="text-[10px] font-black text-slate-700 bg-slate-100 group-hover:bg-slate-200 transition-colors px-2 py-0.5 rounded-sm shrink-0">₱ {staff.sales}k</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-sm h-2 overflow-hidden">
                               <div className={cn("h-full", staff.color)} style={{ width: `${(staff.sales / staff.max) * 100}%` }}></div>
                            </div>
                         </div>
                      ))}
                   </CardContent>
                </Card>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN VIEW
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 overflow-y-auto bg-slate-50 custom-scrollbar relative">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Admin Analytics</h1>
             <p className="text-sm font-medium text-slate-500 mt-1">Highly readable, structural data tracking.</p>
           </div>
           <Button className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-lg border border-slate-900 shadow-sm self-start sm:self-auto">
              Export Deep Analysis
           </Button>
        </div>

        {/* Global Financials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
           <Card title="Monthly global net sum across all branches." className="rounded-[1rem] shadow-sm border border-slate-200 p-6 md:p-8 hover:border-brand-green/50 transition-colors cursor-default">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><TrendingUp className="w-4 h-4 md:w-5 md:h-5" /></div>
                 <span className="text-[10px] md:text-[11px] font-black bg-emerald-100 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-md mb-2 block w-max">+14.5% Montly</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight block">₱ 850.2k</h3>
              <p className="text-xs font-bold tracking-widest text-slate-500 mt-2 uppercase">Global Net Profit</p>
           </Card>
           
           <Card title="Recorded global expenses including operational costs." className="rounded-[1rem] shadow-sm border border-slate-200 p-6 md:p-8 hover:border-red-500/50 transition-colors cursor-default">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500"><TrendingDown className="w-4 h-4 md:w-5 md:h-5" /></div>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight block">₱ 124.1k</h3>
              <p className="text-xs font-bold tracking-widest text-slate-500 mt-2 uppercase">Total Global Expenses</p>
           </Card>

           <Card title="Market value of current distributed stock pool." className="rounded-[1rem] shadow-sm border border-slate-200 p-6 md:p-8 hover:border-brand-blue/50 transition-colors bg-white cursor-default">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue"><PackageOpen className="w-4 h-4 md:w-5 md:h-5" /></div>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight block">₱ 1.2M+</h3>
              <p className="text-xs font-bold tracking-widest text-slate-500 mt-2 uppercase">Total Inventory Value</p>
           </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
           
           {/* Readability Fixed Multi-Line Chart */}
           <Card className="lg:col-span-2 rounded-[1rem] shadow-sm border border-slate-200 overflow-hidden">
              <CardHeader className="p-6 md:p-8 pb-4 border-b border-slate-100 bg-slate-50/50">
                 <CardTitle className="text-lg font-extrabold text-slate-800">Clear Profit & Expense Trajectory Base</CardTitle>
                 <p className="text-[10px] md:text-xs font-semibold text-slate-500 mt-1 uppercase tracking-widest">Straight-line rendering prevents layout skew.</p>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                 <div className="h-64 md:h-72 w-full relative flex items-end ml-2 md:ml-4">
                    {/* Y Axis Grid Lines */}
                    <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none opacity-40 z-0 border-l border-b border-slate-300">
                       {[300, 200, 100, 0].map((val, i) => (
                         <div key={i} className="w-full border-t border-dashed border-slate-300 relative">
                           <span className="absolute -left-10 -top-2 text-[10px] font-bold text-slate-500">{val}k</span>
                         </div>
                       ))}
                    </div>
                    
                    <div className="w-full h-full relative z-10 pt-4">
                       <svg className="w-full h-full overflow-visible" viewBox="0 0 900 200" preserveAspectRatio="none">
                          <path d="M 0 150 L 180 130 L 360 90 L 540 110 L 720 60 L 900 20 L 900 200 L 0 200 Z" fill="#10b981" opacity="0.1" />
                          <path d="M 0 150 L 180 130 L 360 90 L 540 110 L 720 60 L 900 20" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                          <path d="M 0 180 L 180 185 L 360 160 L 540 165 L 720 150 L 900 165" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8,6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

                          {/* Data points visually clear with native SVG tooltips */}
                          {[[0,150], [180,130], [360,90], [540,110], [720,60], [900,20]].map((p,i) => (
                             <circle key={`p${i}`} cx={p[0]} cy={p[1]} r="6" fill="#fff" stroke="#10b981" strokeWidth="3" className="cursor-crosshair">
                                <title>Macro Profit Month {i+1}: ₱ {Math.abs(200 - p[1]) * 1.5}k</title>
                             </circle>
                          ))}
                          {[[0,180], [180,185], [360,160], [540,165], [720,150], [900,165]].map((p,i) => (
                             <circle key={`e${i}`} cx={p[0]} cy={p[1]} r="4" fill="#ef4444" className="cursor-crosshair">
                                <title>Macro Expense Month {i+1}: ₱ {Math.abs(200 - p[1]) * 1.2}k</title>
                             </circle>
                          ))}
                       </svg>
                       <div className="absolute bottom-[-28px] md:bottom-[-32px] w-full flex justify-between text-[10px] font-black text-slate-500 uppercase">
                          <span style={{ transform: 'translateX(-50%)' }}>Jan</span>
                          <span style={{ transform: 'translateX(-50%)' }}>Feb</span>
                          <span style={{ transform: 'translateX(-50%)' }}>Mar</span>
                          <span style={{ transform: 'translateX(-50%)' }}>Apr</span>
                          <span style={{ transform: 'translateX(-50%)' }}>May</span>
                          <span style={{ transform: 'translateX(50%)' }}>Jun</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 md:gap-6 mt-10 md:mt-12 ml-2 md:ml-4 flex-wrap">
                    <div className="flex items-center gap-2 cursor-help" title="Macro Profit Value"><div className="w-4 h-4 rounded bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Macro Profit</span></div>
                    <div className="flex items-center gap-2 cursor-help" title="Macro Expenses Value"><div className="w-4 h-4 rounded bg-red-500"></div><span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Macro Expenses</span></div>
                 </div>
              </CardContent>
           </Card>

           <div className="flex flex-col gap-4 md:gap-6">
              
              {/* Core Global Role Distribution (Admin) using Pie Chart */}
              <Card className="rounded-[1rem] shadow-sm border border-slate-200">
                 <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                   <CardTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2"><PieChart className="w-4 h-4 text-brand-blue" />Global Role Distribution</CardTitle>
                 </CardHeader>
                 <CardContent className="p-5 flex flex-col items-center">
                    <div title="Proportion mapping of current user accounts." className="w-32 h-32 rounded-full mb-6 cursor-pointer hover:scale-[1.02] transition-transform shadow-md" style={{ background: 'conic-gradient(#1e293b 0% 10%, #facc15 10% 30%, #10b981 30% 100%)' }}></div>
                    <div title="Majority operational force" className="w-full flex justify-between items-center bg-slate-50 p-2 rounded-md mb-2 cursor-pointer hover:bg-slate-100">
                       <span className="flex items-center gap-2 text-xs font-bold text-emerald-700"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Staff</span>
                       <span className="text-xs font-black">70%</span>
                    </div>
                    <div title="Management layer" className="w-full flex justify-between items-center bg-slate-50 p-2 rounded-md mb-2 cursor-pointer hover:bg-slate-100">
                       <span className="flex items-center gap-2 text-xs font-bold text-yellow-700"><div className="w-3 h-3 bg-yellow-400 rounded-sm"></div> Managers</span>
                       <span className="text-xs font-black">20%</span>
                    </div>
                    <div title="Supervisors & Analytics" className="w-full flex justify-between items-center bg-slate-50 p-2 rounded-md cursor-pointer hover:bg-slate-100">
                       <span className="flex items-center gap-2 text-xs font-bold text-slate-700"><div className="w-3 h-3 bg-slate-800 rounded-sm"></div> Admin</span>
                       <span className="text-xs font-black">10%</span>
                    </div>
                 </CardContent>
              </Card>

              {/* Readability Fixed Employee Analytics */}
              <Card className="rounded-[1rem] shadow-sm border border-slate-200 flex-1 overflow-hidden">
                 <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
                   <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-2"><Users className="w-4 h-4 md:w-4 md:h-4 text-brand-blue" />Highest Performing Employees</CardTitle>
                 </CardHeader>
                 <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {[
                      { name: "Yuri Sagadraca", role: "Manager", sales: 420.0, max: 500, color: "bg-brand-blue" },
                      { name: "Reymart Llona", role: "Staff", sales: 380.4, max: 500, color: "bg-brand-teal" },
                      { name: "Jomari Cos", role: "Staff", sales: 290.1, max: 500, color: "bg-yellow-500" }
                    ].map((staff, i) => (
                       <div key={i} title={`Position ${i+1}: ${staff.name} yielding ₱ ${staff.sales}k`} className="group cursor-pointer">
                          <div className="flex justify-between items-end mb-1">
                             <span className="text-xs font-bold text-slate-800 group-hover:text-brand-blue transition-colors"><span className="text-slate-400 font-normal mr-1">{i+1}.</span>{staff.name} <span className="font-normal text-[10px] text-slate-400">({staff.role})</span></span>
                             <span className="text-[10px] font-black text-slate-700 bg-slate-100 group-hover:bg-slate-200 transition-colors px-2 rounded-sm border border-slate-200">₱ {staff.sales}k</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                             <div className={cn("h-full rounded-full transition-all group-hover:brightness-110", staff.color)} style={{ width: `${(staff.sales / staff.max) * 100}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </CardContent>
              </Card>
           </div>
           
        </div>
      </div>
    </div>
  );
}
