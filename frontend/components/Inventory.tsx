import { useState } from "react";
import { cn } from "../lib/utils";
import { PageHeader } from "./ui/PageHeader";
import { ActionToolbar, ActionButton } from "./ui/ActionToolbar";
import { DataGrid, DataGridRow, DataGridCell } from "./ui/DataGrid";

type TabType = 'StockStatus' | 'StockAdjustments' | 'StockmasterInitializer';

export function Inventory() {
  const [activeTab, setActiveTab] = useState<TabType>('StockStatus');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'StockStatus', label: 'STOCK STATUS' },
    { id: 'StockAdjustments', label: 'STOCKS ADJUSTMENTS' },
    { id: 'StockmasterInitializer', label: 'STOCKMASTER INITIALIZER' },
  ];

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col font-mono text-xs overflow-hidden select-none">
      
      {/* 1. Header Toolbar */}
      <PageHeader>
         <div className="flex gap-1.5 flex-1">
            {tabs.map(tab => (
               <button 
                 key={tab.id} 
                 onClick={() => setActiveTab(tab.id)}
                 className={cn("px-4 py-1.5 font-bold rounded shadow-sm border transition-colors", 
                 activeTab === tab.id 
                    ? "bg-white text-slate-800 border-slate-200" 
                    : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white")}
               >
                 {tab.label}
               </button>
            ))}
         </div>
      </PageHeader>

      {/* 2. Tab Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {activeTab === 'StockStatus' && <StockStatusTab />}
        {activeTab === 'StockAdjustments' && <StockAdjustmentsTab />}
        {activeTab === 'StockmasterInitializer' && <StockmasterInitializerTab />}
      </div>
      
    </div>
  );
}

// -----------------------------------------------------------------------------
// STOCK STATUS TAB
// -----------------------------------------------------------------------------
function StockStatusTab() {
  const gridColumns = [
    { key: "type", label: "Type", width: "w-8", align: "center" as const },
    { key: "name", label: "Stock name" },
    { key: "price", label: "SellPrice", width: "w-20", align: "right" as const },
    { key: "shelf", label: "Shelf", width: "w-16" },
    { key: "instock", label: "In Stock", width: "w-20", align: "right" as const },
    { key: "onorder", label: "On Order", width: "w-20", align: "right" as const },
    { key: "toorder", label: "To Order", width: "w-20", align: "right" as const },
    { key: "sales", label: "Sales", width: "w-20", align: "right" as const },
    { key: "purchase", label: "Purchase", width: "w-20", align: "right" as const },
    { key: "group", label: "StockGroup" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Filters Area */}
      <div className="p-3 flex gap-6 shrink-0 bg-white border-b border-slate-200 shadow-sm z-10">
         <div className="flex flex-col gap-1.5 w-[280px]">
            <div className="flex items-center gap-2"><span className="w-28 text-right font-bold text-slate-600">Stock Group</span><select className="flex-1 bg-white border border-slate-300 rounded h-6 outline-none text-slate-800"><option>ALL GROUP</option></select></div>
            <div className="flex items-center gap-2"><span className="w-28 text-right font-bold text-slate-600">Purchased From</span><select className="flex-1 bg-white border border-slate-300 rounded h-6 outline-none text-slate-800"><option></option></select></div>
            <div className="flex items-center gap-2"><span className="w-28 text-right font-bold text-slate-600">Shelf ID</span><select className="flex-1 bg-white border border-slate-300 rounded h-6 outline-none text-slate-800"><option></option></select></div>
         </div>
         <div className="flex flex-col gap-1.5 w-[280px]">
            <div className="flex items-center gap-2"><span className="w-28 text-right font-bold text-slate-600">Manufacturer</span><select className="flex-1 bg-white border border-slate-300 rounded h-6 outline-none text-slate-800"><option>ALL MANUFACTURER</option></select></div>
            <div className="flex items-center gap-2"><span className="w-28 text-right font-bold text-slate-600">Main Supplier</span><select className="flex-1 bg-white border border-slate-300 rounded h-6 outline-none text-slate-800"><option></option></select></div>
            <div className="flex items-center gap-2"><span className="w-28 text-right font-bold text-slate-600">Assigned To</span><select className="flex-1 bg-white border border-slate-300 rounded h-6 outline-none text-slate-800"><option></option></select></div>
         </div>
         <div className="flex flex-col gap-1.5 w-[180px]">
            <div className="flex items-center gap-2"><input type="checkbox" checked readOnly className="rounded border-slate-300 text-brand-blue"/> <span className="font-bold text-slate-700">Hide Inactive</span></div>
            <div className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300 text-brand-blue"/> <span className="font-bold text-slate-700">Hide Retail</span></div>
            <div className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300 text-brand-blue"/> <span className="font-bold text-slate-700">To Order {'<>'}</span></div>
         </div>
         <div className="flex flex-col gap-1.5 w-[140px]">
            <div className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300 text-brand-blue"/> <span className="font-bold text-slate-700">is Retail</span></div>
            <div className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300 text-red-500"/> <span className="font-bold text-red-600">is Wholesale</span></div>
            <div className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300 text-blue-500"/> <span className="font-bold text-brand-blue">is Drug</span></div>
         </div>
         <div className="flex flex-col gap-1.5">
             <button className="bg-brand-blue text-white hover:bg-blue-700 rounded shadow-sm px-4 py-1.5 font-bold flex-1 transition-colors">Apply Filters</button>
             <button className="bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 rounded shadow-sm px-4 py-1.5 font-bold flex-1 transition-colors">Reset</button>
         </div>
      </div>

      {/* Action Buttons Toolbar */}
      <ActionToolbar>
         <ActionButton variant="fkey">f5 View Sales</ActionButton>
         <ActionButton variant="fkey">f6 View PO's</ActionButton>
         <ActionButton variant="fkey">f7 View Purchases</ActionButton>
         <ActionButton variant="fkey">f8 View Transfers</ActionButton>
         <ActionButton variant="fkey">f9 View Phy Counts</ActionButton>
         <span className="text-slate-300 mx-1">|</span>
         <ActionButton>Generate P.O.</ActionButton>
         <ActionButton>Generate Snapshot</ActionButton>
         <ActionButton>Change Stockname</ActionButton>
         <ActionButton>Change RetlPrice</ActionButton>
         <ActionButton className="text-brand-blue">Audit Stock Item</ActionButton>
         <ActionButton>Print</ActionButton>
      </ActionToolbar>

      {/* Data Grid */}
      <DataGrid columns={gridColumns} className="border-0 shadow-none rounded-none border-b border-slate-300">
        {[
          { type: 'R/D', name: 'AMOXICILLIN 500MG CAP', price: '5.00', shelf: 'A01', inStock: '1240', onOrder: '0', toOrder: '0', sales: '450', purchase: '0', group: 'GEN' },
          { type: 'R/D', name: 'BIOGESIC 500MG TAB', price: '7.50', shelf: 'A02', inStock: '530', onOrder: '200', toOrder: '0', sales: '890', purchase: '500', group: 'BRD' },
          { type: 'W/D', name: 'CETIRIZINE 10MG TAB', price: '2.00', shelf: 'A03', inStock: '3000', onOrder: '0', toOrder: '500', sales: '120', purchase: '0', group: 'GEN' },
        ].map((row, i) => (
           <DataGridRow key={i}>
              <DataGridCell align="center" className="text-slate-500 font-bold">{row.type}</DataGridCell>
              <DataGridCell isBold>{row.name}</DataGridCell>
              <DataGridCell align="right" className="bg-yellow-50">{row.price}</DataGridCell>
              <DataGridCell className="text-slate-600">{row.shelf}</DataGridCell>
              <DataGridCell align="right" className="bg-cyan-50 text-cyan-800 font-bold">{row.inStock}</DataGridCell>
              <DataGridCell align="right" className="text-slate-600">{row.onOrder}</DataGridCell>
              <DataGridCell align="right" className="text-slate-600">{row.toOrder}</DataGridCell>
              <DataGridCell align="right" className="bg-pink-50 text-pink-700 font-bold">{row.sales}</DataGridCell>
              <DataGridCell align="right" className="bg-blue-50 text-brand-blue font-bold">{row.purchase}</DataGridCell>
              <DataGridCell className="text-slate-600">{row.group}</DataGridCell>
           </DataGridRow>
        ))}
      </DataGrid>

      <div className="flex gap-3 px-4 py-2 items-center bg-slate-100 border-t border-slate-200 shadow-inner z-0">
        <span className="font-bold text-slate-700">Search Stock</span>
        <input type="text" className="w-72 bg-white border border-slate-300 rounded h-6 px-2 outline-none focus:border-brand-blue" placeholder="Type to search..."/>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// STOCK ADJUSTMENTS TAB
// -----------------------------------------------------------------------------
function StockAdjustmentsTab() {
  const gridColumns = [
    { key: "no", label: "Stock No." },
    { key: "name", label: "Stock name", width: "min-w-[250px]" },
    { key: "expiry", label: "Expiry" },
    { key: "qty", label: "Adj Qty", align: "right" as const },
    { key: "ucost", label: "UCost", align: "right" as const },
    { key: "dcost", label: "Debit Cost", align: "right" as const },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-4 gap-4">
      <div className="flex justify-between items-end bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
         <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Period</span>
              <input type="month" className="h-7 px-2 border border-slate-300 rounded outline-none text-slate-800" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 ml-4">Search Doc#</span>
              <input type="text" className="h-7 w-32 px-2 border border-slate-300 rounded outline-none text-slate-800" />
            </div>
         </div>
         <div className="flex gap-2">
            <ActionButton variant="primary">New</ActionButton>
            <ActionButton variant="warning">Post</ActionButton>
            <ActionButton variant="danger">Delete</ActionButton>
            <ActionButton>Print</ActionButton>
         </div>
      </div>

      <div className="flex gap-6 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
         <div className="flex flex-col gap-2 w-64">
            <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Doc No.</span><input className="w-32 h-6 bg-yellow-50 font-bold text-center border border-slate-300 rounded text-slate-800" value="ADJ-1002" readOnly/></div>
            <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Doc Date</span><input type="date" className="w-32 h-6 border border-slate-300 rounded px-1 outline-none text-slate-800" /></div>
            <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Entered By</span><input className="w-32 h-6 bg-slate-100 border border-slate-300 rounded px-2 text-slate-700 font-bold" value="ADMIN" readOnly/></div>
         </div>
         <div className="flex flex-col gap-2 w-72">
            <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Adjust Type</span><select className="w-48 h-6 border border-slate-300 rounded outline-none text-slate-800"><option>DAMAGE</option></select></div>
            <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Qty Type</span><select className="w-48 h-6 border border-slate-300 rounded outline-none text-slate-800"><option>BASE UNIT</option></select></div>
            <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Reference</span><input className="w-48 h-6 border border-slate-300 rounded px-2 outline-none text-slate-800" /></div>
         </div>
         <div className="flex-1"></div>
         <div className="flex flex-col gap-2 items-end w-56 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex justify-between items-center w-full"><span className="font-bold text-brand-blue">Net Amount</span><input className="w-28 h-6 bg-white font-bold text-right border border-slate-300 rounded px-2 text-slate-800" value="450.00" readOnly/></div>
            <div className="flex justify-between items-center w-full"><span className="font-bold text-red-500">Debit Amt</span><input className="w-28 h-6 bg-red-50 font-bold text-right border border-red-200 rounded px-2 text-red-600" value="450.00" readOnly/></div>
         </div>
      </div>

      <DataGrid columns={gridColumns}>
         <DataGridRow isHighlight>
           <DataGridCell className="text-slate-600">10610</DataGridCell>
           <DataGridCell isBold>AMOXICILLIN 500MG CAP</DataGridCell>
           <DataGridCell className="text-slate-600">30-Oct-27</DataGridCell>
           <DataGridCell align="right" className="font-bold text-red-600">-10</DataGridCell>
           <DataGridCell align="right" className="text-slate-700">4.50</DataGridCell>
           <DataGridCell align="right" isBold>45.00</DataGridCell>
         </DataGridRow>
      </DataGrid>
    </div>
  );
}

// -----------------------------------------------------------------------------
// STOCKMASTER INITIALIZER TAB
// -----------------------------------------------------------------------------
function StockmasterInitializerTab() {
  const gridColumns = [
    { key: "no", label: "Stock #" },
    { key: "name", label: "Stock name", width: "min-w-[250px]" },
    { key: "brand", label: "Brand" },
    { key: "sell", label: "SellPrice", align: "right" as const },
    { key: "avg", label: "AvgCost", align: "right" as const },
    { key: "shelf", label: "Shelf ID" },
    { key: "supplier", label: "Supplier" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-4 gap-4">
       <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2">
               <span className="font-bold text-slate-600">Search name</span>
               <input type="text" className="h-7 w-64 px-2 border border-slate-300 rounded outline-none text-slate-800" placeholder="Type to search..." />
             </div>
             <div className="flex items-center gap-2">
               <span className="font-bold text-slate-600 ml-4">Supplier</span>
               <select className="h-7 w-56 border border-slate-300 rounded outline-none text-slate-800"><option>ALL</option></select>
             </div>
          </div>
          <ActionButton variant="primary" className="px-6">Save Changes</ActionButton>
       </div>
       
       <DataGrid columns={gridColumns}>
          <DataGridRow>
             <DataGridCell className="text-slate-500">10610</DataGridCell>
             <DataGridCell isBold>AMOXICILLIN 500MG CAP</DataGridCell>
             <DataGridCell className="text-slate-600">GENERIC</DataGridCell>
             <td className="border-r border-slate-100 px-0 py-0"><input className="w-full bg-yellow-50 font-bold text-slate-800 text-right px-3 py-1.5 h-full outline-none focus:bg-yellow-100" defaultValue="5.00" /></td>
             <DataGridCell align="right" className="font-bold text-brand-blue">4.50</DataGridCell>
             <td className="border-r border-slate-100 px-0 py-0"><input className="w-full text-center px-3 py-1.5 h-full outline-none focus:bg-slate-100" defaultValue="A01" /></td>
             <DataGridCell className="text-slate-600">UNILAB</DataGridCell>
          </DataGridRow>
       </DataGrid>
    </div>
  );
}
