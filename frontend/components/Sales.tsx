import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Receipt } from "lucide-react";

export function Sales() {
  return (
    <div className="flex-1 p-8 space-y-6 bg-slate-50 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sales Overview</h1>
        <p className="text-slate-500 font-medium">Daily transaction summaries and revenue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-brand-teal text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-100 uppercase tracking-widest">Total Revenue Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">₱4,890.50</span>
              <DollarSign className="w-8 h-8 opacity-50" />
            </div>
            <div className="mt-4 flex items-center text-sm font-medium bg-white/20 w-fit px-2 py-1 rounded">
              <ArrowUpRight className="w-4 h-4 mr-1 text-green-300" />
              12% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-800">184</span>
              <Receipt className="w-8 h-8 text-slate-300" />
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-red-500">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              3% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-800">₱26.50</span>
              <CreditCard className="w-8 h-8 text-slate-300" />
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              8% from yesterday
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
           <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="text-sm text-slate-500 text-center py-10 italic">
               The transaction line chart will be implemented here during the database integration phase.
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
