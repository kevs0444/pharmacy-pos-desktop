import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Package, Search, Plus } from "lucide-react";
import { Button } from "./ui/Button";

export function Inventory() {
  return (
    <div className="flex-1 p-8 space-y-6 bg-slate-50 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 font-medium">Manage and view your pharmacy stock</p>
        </div>
        <Button variant="brand" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <Card className="border-t-4 border-t-brand-teal">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-lg">Product List (Preview)</CardTitle>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal/50 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto border border-slate-100 rounded-lg bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Item Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">PRD-X91A</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">Amoxicillin 500mg</td>
                  <td className="px-6 py-4">Prescription</td>
                  <td className="px-6 py-4">120 <span className="text-slate-400 text-xs ml-1">boxes</span></td>
                  <td className="px-6 py-4">₱4.50</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Good</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">PRD-V002</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">Vitamin C Ascorbic Acid</td>
                  <td className="px-6 py-4">Over the Counter</td>
                  <td className="px-6 py-4">42 <span className="text-slate-400 text-xs ml-1">btls</span></td>
                  <td className="px-6 py-4">₱12.00</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Moderate</span></td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">PRD-C119</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">Paracetamol 500mg</td>
                  <td className="px-6 py-4">Generic</td>
                  <td className="px-6 py-4 text-red-600 font-bold">5 <span className="text-slate-400 text-xs ml-1 font-normal">boxes</span></td>
                  <td className="px-6 py-4">₱2.00</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Critical</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
             <div className="flex items-center gap-2"><Package className="w-4 h-4" /> <span>Showing 3 of 1,204 items</span></div>
             <div className="space-x-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
