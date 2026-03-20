import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Receipt, ShoppingBag, Clock, Search, Filter } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";
import { TimeframeSelector } from "./ui/TimeframeSelector";

const recentTransactions = [
  { id: "TXN-0041", customer: "Walk-in", items: 3, total: 485.50, time: "10:32 AM", method: "Cash", status: "Completed" },
  { id: "TXN-0040", customer: "Maria Santos", items: 5, total: 1240.00, time: "10:15 AM", method: "GCash", status: "Completed" },
  { id: "TXN-0039", customer: "Walk-in", items: 1, total: 65.00, time: "09:58 AM", method: "Cash", status: "Completed" },
  { id: "TXN-0038", customer: "Juan Dela Cruz", items: 2, total: 320.75, time: "09:41 AM", method: "Cash", status: "Completed" },
  { id: "TXN-0037", customer: "Walk-in", items: 4, total: 890.00, time: "09:20 AM", method: "Card", status: "Completed" },
  { id: "TXN-0036", customer: "Ana Reyes", items: 1, total: 150.00, time: "09:05 AM", method: "Cash", status: "Voided" },
  { id: "TXN-0035", customer: "Walk-in", items: 6, total: 1450.25, time: "08:48 AM", method: "GCash", status: "Completed" },
  { id: "TXN-0034", customer: "Pedro Garcia", items: 2, total: 289.00, time: "08:30 AM", method: "Cash", status: "Completed" },
];

const topProducts = [
  { name: "Biogesic 500mg (20s)", qty: 48, revenue: 1920, color: "bg-blue-500" },
  { name: "Neozep Forte", qty: 35, revenue: 1225, color: "bg-emerald-500" },
  { name: "Ascorbic Acid 500mg", qty: 29, revenue: 725, color: "bg-yellow-500" },
  { name: "Alaxan FR", qty: 22, revenue: 1100, color: "bg-purple-500" },
  { name: "Bioflu", qty: 18, revenue: 1260, color: "bg-red-400" },
];

export function Sales() {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 bg-slate-50 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Sales Overview</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Daily transaction summaries and revenue analytics.</p>
          </div>
          <Button className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-lg shadow-sm self-start sm:self-auto">
            Export Sales Report
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card title="Total combined revenue generated today across all transactions." className="rounded-[1rem] shadow-sm border border-emerald-200 bg-emerald-50/50 cursor-default">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Total Revenue Today</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">₱ 4.9k</h3>
              <div className="mt-3 flex items-center text-xs font-bold text-emerald-700">
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> 12% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card title="Number of completed POS transactions today." className="rounded-[1rem] shadow-sm border border-slate-200 cursor-default">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"><Receipt className="w-5 h-5" /></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Transactions</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">184</h3>
              <div className="mt-3 flex items-center text-xs font-bold text-red-500">
                <ArrowDownRight className="w-3.5 h-3.5 mr-1" /> 3% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card title="Average customer basket price." className="rounded-[1rem] shadow-sm border border-slate-200 cursor-default">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Avg. Order Value</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">₱ 26.50</h3>
              <div className="mt-3 flex items-center text-xs font-bold text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> 8% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card title="Number of unique items sold today." className="rounded-[1rem] shadow-sm border border-slate-200 bg-slate-800 text-white cursor-default">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700 text-white flex items-center justify-center"><ShoppingBag className="w-5 h-5" /></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Items Sold</span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">312</h3>
              <div className="mt-3 flex items-center text-xs font-bold text-emerald-300">
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> 5% from yesterday
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Daily Sales Bar Chart */}
          <Card className="lg:col-span-2 rounded-[1rem] shadow-sm border border-slate-200 overflow-hidden">
            <CardHeader className="p-6 md:p-8 pb-4 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                <div>
                  <CardTitle className="text-lg font-extrabold text-slate-800">Daily Sales (This Week)</CardTitle>
                  <p className="text-xs font-medium text-slate-500 mt-1">Revenue and volume trend per day.</p>
                </div>
                <TimeframeSelector defaultValue="Weekly" />
              </div>
              <div className="flex gap-4">
                <span className="flex items-center text-[10px] font-bold text-slate-600 uppercase cursor-help" title="Daily Revenue"><div className="w-3 h-3 rounded bg-blue-500 mr-2"></div>Revenue</span>
                <span className="flex items-center text-[10px] font-bold text-slate-600 uppercase cursor-help" title="Daily Target"><div className="w-3 h-3 rounded bg-slate-300 mr-2 border border-dashed border-slate-400"></div>Target</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="h-64 flex justify-between gap-2 md:gap-4 relative w-full pt-10 pb-8">
                {/* Grid lines */}
                <div className="absolute inset-x-0 bottom-8 top-10 flex flex-col justify-between pointer-events-none opacity-40 z-0 border-l border-b border-slate-300">
                  {/* Y-axis Labels */}
                  <div className="w-full border-t border-dashed border-slate-300 relative"><span className="absolute -left-8 -top-2 text-[10px] font-bold text-slate-500">₱8k</span></div>
                  <div className="w-full border-t border-dashed border-slate-300 relative"><span className="absolute -left-8 -top-2 text-[10px] font-bold text-slate-500">₱6k</span></div>
                  <div className="w-full border-t border-dashed border-slate-300 relative"><span className="absolute -left-8 -top-2 text-[10px] font-bold text-slate-500">₱4k</span></div>
                  <div className="w-full border-t border-dashed border-slate-300 relative"><span className="absolute -left-8 -top-2 text-[10px] font-bold text-slate-500">₱2k</span></div>
                </div>

                {/* Target line */}
                <div className="absolute inset-x-0 border-t-2 border-dashed border-slate-300 z-0 pointer-events-none" style={{ top: 'calc(10px + 25%)' }}></div>

                {/* Bars */}
                {[
                  { day: 'Mon', value: 55, amt: '₱4.4k' },
                  { day: 'Tue', value: 72, amt: '₱5.8k' },
                  { day: 'Wed', value: 48, amt: '₱3.8k' },
                  { day: 'Thu', value: 88, amt: '₱7k' },
                  { day: 'Fri', value: 61, amt: '₱4.9k' },
                  { day: 'Sat', value: 95, amt: '₱7.6k' },
                  { day: 'Sun', value: 32, amt: '₱2.6k' },
                ].map((bar, i) => (
                  <div key={i} title={`${bar.day}: ${bar.amt} total revenue`} className="flex flex-col items-center justify-end flex-1 z-10 h-full relative group cursor-pointer hover:bg-slate-50/50 rounded-lg transition-colors">
                    <span className="text-[11px] md:text-xs font-black text-slate-800 mb-1 group-hover:-translate-y-1 transition-transform">{bar.amt}</span>
                    <div className={cn("w-full max-w-[32px] md:max-w-[48px] rounded-t-lg shadow-sm border border-black/5 group-hover:brightness-110 transition-all", bar.value >= 75 ? 'bg-emerald-500' : bar.value >= 50 ? 'bg-blue-500' : 'bg-blue-300')} style={{ height: `${bar.value}%` }}></div>
                    <span className="absolute -bottom-6 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{bar.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card className="rounded-[1rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-brand-blue" /> Top Selling Products</CardTitle>
              <p className="text-xs font-medium text-slate-500 mt-1">By units sold today.</p>
            </CardHeader>
            <CardContent className="p-5 flex-1 space-y-4">
              {topProducts.map((product, i) => (
                <div key={i} title={`${product.name}: ${product.qty} units sold, ₱${product.revenue.toLocaleString()} revenue`} className="group cursor-pointer">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-brand-blue transition-colors truncate pr-2">{product.name}</span>
                    <span className="text-[10px] font-black text-slate-700 bg-slate-100 group-hover:bg-slate-200 transition-colors px-2 py-0.5 rounded-sm shrink-0">{product.qty} units</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all group-hover:brightness-110", product.color)} style={{ width: `${(product.qty / 50) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions Table */}
        <Card className="rounded-[1rem] shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-800">Recent Transactions</CardTitle>
              <p className="text-xs font-medium text-slate-500 mt-1">Latest point-of-sale activity log.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 gap-2 text-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search transactions..." className="outline-none bg-transparent text-sm w-40 placeholder:text-slate-400" />
              </div>
              <Button variant="outline" className="border-slate-200 rounded-lg px-3 py-1.5"><Filter className="w-4 h-4 text-slate-500" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left font-bold text-slate-500 uppercase tracking-widest text-[10px] px-5 py-3">Transaction ID</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-widest text-[10px] px-5 py-3">Customer</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-widest text-[10px] px-5 py-3">Items</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-widest text-[10px] px-5 py-3">Total</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-widest text-[10px] px-5 py-3">Time</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-widest text-[10px] px-5 py-3">Payment</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-widest text-[10px] px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((txn, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                      <td className="px-5 py-3.5 font-mono font-bold text-brand-blue text-xs group-hover:underline">{txn.id}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{txn.customer}</td>
                      <td className="px-5 py-3.5 text-slate-600">{txn.items} item{txn.items > 1 ? 's' : ''}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">₱ {txn.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-3.5 text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {txn.time}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md", 
                          txn.method === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 
                          txn.method === 'GCash' ? 'bg-blue-100 text-blue-700' : 
                          'bg-purple-100 text-purple-700'
                        )}>{txn.method}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md",
                          txn.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-red-50 text-red-600 border border-red-200'
                        )}>{txn.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
