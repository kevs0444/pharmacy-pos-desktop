import { PageHeader } from "./ui/PageHeader";
import { ActionToolbar, ActionButton } from "./ui/ActionToolbar";
import { DataGrid, DataGridRow, DataGridCell } from "./ui/DataGrid";
import { TrendingUp, DollarSign, Package, Activity } from "lucide-react";

export function SalesSummary() {
  const gridColumns = [
    { key: "group", label: "Stock Group" },
    { key: "qty", label: "Qty Sold", align: "right" as const },
    { key: "sales", label: "Sales Amount", align: "right" as const },
    { key: "cost", label: "Total Cost", align: "right" as const },
    { key: "profit", label: "Gross Profit", align: "right" as const },
    { key: "markup", label: "MarkUp %", align: "right" as const },
    { key: "share", label: "% Share", align: "center" as const },
  ];

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col font-mono text-xs overflow-hidden select-none">
      
      {/* 1. Header */}
      <PageHeader>
         <h1 className="text-lg font-black tracking-widest text-slate-100 uppercase ml-2 flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-blue" />
            Sales Summary
         </h1>
      </PageHeader>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
         
         {/* 2. Dashboard Cards */}
         <div className="grid grid-cols-4 gap-4 shrink-0">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="bg-blue-100 text-brand-blue p-3 rounded-full"><DollarSign size={24} /></div>
               <div>
                  <div className="text-slate-500 font-bold uppercase text-[10px]">Total Sales</div>
                  <div className="text-xl font-black text-slate-800">₱430,670.00</div>
               </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full"><Activity size={24} /></div>
               <div>
                  <div className="text-slate-500 font-bold uppercase text-[10px]">Gross Profit</div>
                  <div className="text-xl font-black text-emerald-600">₱65,370.00</div>
               </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="bg-amber-100 text-amber-600 p-3 rounded-full"><Package size={24} /></div>
               <div>
                  <div className="text-slate-500 font-bold uppercase text-[10px]">Items Sold</div>
                  <div className="text-xl font-black text-slate-800">23,730</div>
               </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="bg-purple-100 text-purple-600 p-3 rounded-full"><TrendingUp size={24} /></div>
               <div>
                  <div className="text-slate-500 font-bold uppercase text-[10px]">Avg Markup</div>
                  <div className="text-xl font-black text-slate-800">17.8%</div>
               </div>
            </div>
         </div>

         {/* 3. Filters */}
         <div className="flex gap-6 items-center bg-white p-3 border border-slate-200 rounded-lg shadow-sm shrink-0">
            <div className="flex items-center gap-2">
               <span className="font-bold text-slate-600">Summarize By:</span>
               <select className="h-7 w-40 border border-slate-300 rounded outline-none text-slate-800"><option>StockGroup</option></select>
            </div>
            <div className="flex items-center gap-2">
               <span className="font-bold text-slate-600">Scope:</span>
               <select className="h-7 w-40 border border-slate-300 rounded outline-none text-slate-800"><option>Monthly</option></select>
            </div>
            <div className="flex items-center gap-2">
               <span className="font-bold text-slate-600">Period:</span>
               <input type="month" className="h-7 border border-slate-300 rounded px-2 outline-none text-slate-800" />
            </div>
            <ActionButton variant="primary" className="ml-auto px-6">Generate</ActionButton>
            <ActionButton>Print Report</ActionButton>
         </div>
         
         {/* 4. Data Grid */}
         <DataGrid columns={gridColumns}>
            <DataGridRow>
               <DataGridCell isBold>GEN</DataGridCell>
               <DataGridCell align="right" isBold>15,420</DataGridCell>
               <DataGridCell align="right" className="font-bold text-brand-blue">120,450.00</DataGridCell>
               <DataGridCell align="right" className="text-slate-600">85,200.00</DataGridCell>
               <DataGridCell align="right" className="font-bold text-emerald-700 bg-emerald-50">35,250.00</DataGridCell>
               <DataGridCell align="right" className="text-slate-600">41.37%</DataGridCell>
               <DataGridCell align="center" className="font-bold text-slate-500">45%</DataGridCell>
            </DataGridRow>
            <DataGridRow>
               <DataGridCell isBold>BRD</DataGridCell>
               <DataGridCell align="right" isBold>8,310</DataGridCell>
               <DataGridCell align="right" className="font-bold text-brand-blue">310,220.00</DataGridCell>
               <DataGridCell align="right" className="text-slate-600">280,100.00</DataGridCell>
               <DataGridCell align="right" className="font-bold text-emerald-700 bg-emerald-50">30,120.00</DataGridCell>
               <DataGridCell align="right" className="text-slate-600">10.75%</DataGridCell>
               <DataGridCell align="center" className="font-bold text-slate-500">55%</DataGridCell>
            </DataGridRow>
            {/* Totals Row */}
            <tr className="bg-slate-800 text-white font-bold border-t-2 border-slate-600">
               <td className="px-3 py-2 border-r border-slate-700">TOTAL</td>
               <td className="px-3 py-2 text-right border-r border-slate-700">23,730</td>
               <td className="px-3 py-2 text-right border-r border-slate-700 text-blue-300">430,670.00</td>
               <td className="px-3 py-2 text-right border-r border-slate-700">365,300.00</td>
               <td className="px-3 py-2 text-right border-r border-slate-700 text-emerald-400">65,370.00</td>
               <td className="px-3 py-2 text-right border-r border-slate-700">17.8%</td>
               <td className="px-3 py-2 text-center">100%</td>
            </tr>
         </DataGrid>

      </div>
    </div>
  );
}
