import { useState } from "react";
import { cn } from "../lib/utils";
import { PageHeader } from "./ui/PageHeader";
import { ActionToolbar, ActionButton } from "./ui/ActionToolbar";
import { DataGrid, DataGridRow, DataGridCell } from "./ui/DataGrid";

export function POS() {
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleNo] = useState("245930");
  const [time] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
  const [soldBy] = useState("ADMIN");
  
  // Scanned Items
  const [items] = useState([
    { id: 1, barcode: "4806502850015", stockName: "SYMDEX-D FORTE TAB", expiry: "30-Oct-27", qty: 5, price: 6.00, extPrice: 30.00, details: "", stkNo: "10610", vat: true },
    { id: 2, barcode: "4806524147087", stockName: "CETIRIZINE (CETICIT) 10MG TAB", expiry: "30-May-28", qty: 10, price: 2.00, extPrice: 20.00, details: "", stkNo: "10167", vat: true },
    { id: 3, barcode: "", stockName: "", expiry: "", qty: 0, price: 0, extPrice: 0, details: "", stkNo: "", vat: false }
  ]);

  const netAmount = items.reduce((sum, item) => sum + item.extPrice, 0);
  const vatAmount = netAmount * 0.12;
  const vatable = netAmount - vatAmount;

  const gridColumns = [
    { key: "id", label: "#", width: "w-8", align: "center" as const },
    { key: "barcode", label: "Bar Code", width: "w-32" },
    { key: "name", label: "Stock name", width: "min-w-[250px]" },
    { key: "expiry", label: "Expiry", width: "w-24" },
    { key: "qty", label: "Qty", width: "w-16", align: "right" as const },
    { key: "price", label: "Price", width: "w-20", align: "right" as const },
    { key: "ext", label: "Ext Price", width: "w-24", align: "right" as const },
    { key: "details", label: "Item Details" },
    { key: "stkno", label: "Stk No", width: "w-20" },
    { key: "vat", label: "VAT", align: "center" as const },
  ];

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col font-mono text-xs overflow-hidden select-none">
      
      {/* 1. Header Toolbar */}
      <PageHeader userId="JESSIE" dateStr="(Fri) 22-May-26 4:42 PM">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Sale Date</span>
          <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="text-slate-800 px-1 py-0.5 border border-slate-300 rounded h-6 outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Goto Sale#</span>
          <select className="text-slate-800 h-6 w-24 border border-slate-300 rounded outline-none"><option></option></select>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Print Sale#</span>
          <input type="text" className="text-slate-800 h-6 w-24 px-1 border border-slate-300 rounded outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Procedures</span>
          <select className="text-slate-800 h-6 w-32 border border-slate-300 rounded outline-none"><option></option></select>
        </div>
        <div className="flex-1 flex justify-center gap-2">
          <ActionButton variant="fkey">f2 <span className="text-brand-blue font-extrabold">New Sale</span></ActionButton>
          <ActionButton variant="fkey">f3 <span className="text-amber-600 font-extrabold">Post Sale</span></ActionButton>
          <ActionButton variant="fkey">f7 <span className="text-red-600 font-extrabold">Void Sale</span></ActionButton>
          <ActionButton variant="fkey">f8 <span className="text-brand-blue font-extrabold">Find Unposted</span></ActionButton>
        </div>
      </PageHeader>

      {/* 2. Main Details Section */}
      <div className="flex p-3 gap-6 shrink-0 bg-white border-b border-slate-200 shadow-sm z-10">
        
        {/* Left Column: Input Details */}
        <div className="w-[300px] flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
             <span className="font-bold w-[70px] text-right text-slate-600">Sale No.</span>
             <input type="text" value={saleNo} readOnly className="bg-yellow-50 font-bold text-center w-24 border border-slate-300 rounded outline-none" />
             <div className="flex gap-1">
                <button className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-1.5 font-bold text-[10px] flex items-center gap-1">f5 <span>{'<'}</span></button>
                <button className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-1.5 font-bold text-[10px] flex items-center gap-1">f6 <span>{'>'}</span></button>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="font-bold w-[70px] text-right text-slate-600">Time</span>
             <input type="text" value={time} readOnly className="bg-yellow-50 font-bold text-center w-24 border border-slate-300 rounded outline-none" />
          </div>
          <div className="flex items-center gap-2 mt-2">
             <span className="font-bold w-[70px] text-right text-slate-600">Bar Code</span>
             <input type="text" className="bg-white border border-slate-300 rounded w-full px-1 focus:border-brand-blue outline-none" />
             <input type="text" className="bg-blue-50 text-brand-blue font-bold border border-blue-200 rounded w-8 text-center" value="1" readOnly/>
          </div>
          <div className="flex items-center gap-1">
             <span className="font-bold text-red-500 w-4">1</span>
             <span className="font-bold w-[58px] text-right text-slate-600">Sold By</span>
             <input type="text" value={soldBy} onChange={() => {}} className="bg-yellow-50 font-bold border border-slate-300 rounded w-24 px-1" />
             <button className="bg-brand-blue text-white rounded text-[10px] px-2 py-0.5 font-bold shadow-sm">SNR/PWD IDs</button>
          </div>
          <div className="flex items-center gap-1">
             <span className="font-bold text-red-500 w-4">2</span>
             <span className="font-bold w-[58px] text-right text-slate-600">Discount</span>
             <select className="bg-yellow-50 border border-slate-300 rounded w-16 outline-none"><option></option></select>
             <input type="text" value="0.00" className="bg-slate-100 border border-slate-300 rounded w-16 text-right font-bold pr-1" readOnly/>
          </div>
          <div className="flex items-center gap-1">
             <span className="font-bold w-[70px] text-right text-slate-600">Rx Lic#</span>
             <input type="text" className="bg-yellow-50 border border-slate-300 rounded w-16 text-red-500 text-center font-bold" value="Rx" readOnly />
             <button className="text-brand-blue border border-brand-blue/30 rounded font-bold text-[10px] px-2 py-0.5 hover:bg-blue-50">Search Customer</button>
          </div>
          <div className="flex items-center gap-1">
             <span className="font-bold text-red-500 w-4">3</span>
             <span className="font-bold w-[58px] text-right text-slate-600">Sold to</span>
             <input type="text" className="bg-yellow-50 border border-slate-300 rounded flex-1 px-1 outline-none" />
             <select className="w-6 bg-white border border-slate-300 rounded"><option></option></select>
          </div>
          <div className="flex items-center gap-1">
             <span className="font-bold text-red-500 w-4">4</span>
             <span className="font-bold w-[58px] text-right text-slate-600">Card No.</span>
             <input type="text" className="bg-yellow-50 border border-slate-300 rounded flex-1 px-1 outline-none" />
             <select className="w-6 bg-white border border-slate-300 rounded"><option></option></select>
          </div>
          <div className="flex gap-1 mt-1">
             <span className="font-bold text-red-500 w-4">5</span>
             <span className="font-bold w-[58px] text-right text-slate-600">Remarks</span>
             <textarea className="bg-yellow-50 border border-slate-300 rounded flex-1 h-12 resize-none p-1 outline-none"></textarea>
          </div>
        </div>

        {/* Center Column: VAT Summary */}
        <div className="w-[220px] flex flex-col gap-1 text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
          <div className="flex justify-between items-center"><span className="text-right flex-1 pr-2 font-semibold">O.R. No</span><input type="text" className="w-24 bg-white border border-slate-300 rounded text-right text-brand-blue font-bold px-1" value="0" readOnly/></div>
          <div className="flex justify-between items-center"><span className="text-right flex-1 pr-2 font-semibold">Invoice No</span><input type="text" className="w-24 bg-slate-100 border border-slate-300 rounded text-right px-1" readOnly/></div>
          <div className="w-full border-b border-slate-200 my-1"></div>
          <div className="flex justify-between items-center"><span className="text-right flex-1 pr-2 font-semibold">VATable</span><input type="text" className="w-24 bg-slate-100 border border-slate-300 rounded text-right text-brand-blue font-bold px-1" value={vatable.toFixed(2)} readOnly/></div>
          <div className="flex justify-between items-center"><span className="text-right flex-1 pr-2 font-semibold">VAT - 12%</span><input type="text" className="w-24 bg-slate-100 border border-slate-300 rounded text-right text-brand-blue font-bold px-1" value={vatAmount.toFixed(2)} readOnly/></div>
          <div className="flex justify-between items-center"><span className="text-right flex-1 pr-2 font-semibold">Zero Rated</span><input type="text" className="w-24 bg-slate-100 border border-slate-300 rounded text-right text-brand-blue font-bold px-1" value="0.00" readOnly/></div>
          <div className="flex justify-between items-center"><span className="text-right flex-1 pr-2 font-semibold">VAT Exempt</span><input type="text" className="w-24 bg-slate-100 border border-slate-300 rounded text-right text-brand-blue font-bold px-1" value="0.00" readOnly/></div>
          <div className="w-full border-b border-slate-200 my-1"></div>
          <div className="flex justify-between items-center"><span className="text-right flex-1 pr-2 font-black text-slate-800">Net Sale</span><input type="text" className="w-24 bg-slate-100 border border-slate-300 rounded text-right text-brand-blue font-extrabold px-1" value={netAmount.toFixed(2)} readOnly/></div>
        </div>

        {/* Middle Column: Status & Payable */}
        <div className="w-[120px] flex flex-col items-center justify-between">
           <div className="flex items-center gap-1 mt-2">
             <input type="checkbox" className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"/> <span className="text-slate-700 font-bold">Pwd</span>
           </div>
           <div className="text-emerald-600 font-black mt-2 text-center text-sm border-2 border-emerald-500 rounded p-2 bg-emerald-50 w-full">
             POSTED<br/>✓
           </div>
           <div className="text-[9px] text-slate-500 text-center mt-1">22-May-26<br/>6:17:15 am</div>
           
           <div className="w-full text-right text-slate-700 space-y-1">
             <div className="flex justify-between items-center"><span className="text-[10px] font-semibold">Cents Off</span><input type="text" className="w-14 bg-slate-100 border border-slate-300 rounded text-right px-1" value="0.00" readOnly/></div>
             <div className="flex justify-between items-center"><span className="font-bold">Payable</span><input type="text" className="w-14 bg-emerald-50 border border-emerald-300 rounded text-right text-emerald-700 font-bold px-1" value={netAmount.toFixed(2)} readOnly/></div>
           </div>
        </div>

        {/* Right Column: Totals & Action Buttons */}
        <div className="flex-1 flex flex-col gap-2 min-w-[300px]">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2 items-end w-32 text-slate-600">
              <span className="font-bold">Amount</span>
              <span className="font-bold">less: VAT</span>
              <span className="font-bold">less: Invoice Disc</span>
              <span className="font-bold">add: Service</span>
            </div>
            <div className="flex-1 flex flex-col items-end gap-2 pr-4">
              <input type="text" className="bg-yellow-50 font-black text-right text-xl w-32 border border-slate-300 rounded text-slate-800 px-1" value={netAmount.toFixed(2)} readOnly/>
            </div>
            <div className="flex flex-col items-center mr-4">
               <span className="font-extrabold text-lg text-slate-700">Change</span>
               <input type="text" className="bg-white font-extrabold text-red-600 text-center text-2xl w-32 border-2 border-slate-300 rounded p-1 shadow-inner" value="50.00" readOnly/>
               
               <div className="flex flex-col gap-2 mt-4 w-full">
                 <button className="text-slate-700 font-bold text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded py-1 w-full shadow-sm">f9 <span className="text-brand-blue">Payment Tenders</span></button>
                 <button className="text-slate-700 font-bold text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded py-1 w-full shadow-sm">f10 <span className="text-brand-blue">Search stock</span></button>
                 <button className="text-slate-700 font-bold text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded py-1 w-full shadow-sm">f11 <span className="text-brand-blue">Print Receipt</span></button>
               </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto mb-2 pr-4">
            <div className="flex gap-2 items-center">
              <span className="font-bold w-32 text-right text-slate-700">Net Amount</span>
              <input type="text" className="bg-yellow-50 font-black text-right text-lg w-32 border border-slate-300 rounded text-slate-800 px-1" value={netAmount.toFixed(2)} readOnly/>
            </div>
          </div>
          <div className="flex items-center justify-between pr-4">
            <div className="flex gap-2 items-center">
              <span className="font-bold w-32 text-right text-slate-700">f12 <span className="text-brand-green">Cash</span></span>
              <input type="text" className="bg-yellow-50 font-black text-emerald-600 text-right text-lg w-32 border border-slate-300 rounded px-1" value="100.00" readOnly/>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-3 py-2 items-center bg-slate-100 border-b border-slate-200 shadow-inner z-0">
        <span className="font-bold text-red-500 w-4 text-right">6</span>
        <span className="font-bold text-brand-blue">Search Stock</span>
        <select className="w-72 bg-white border border-slate-300 rounded h-6 outline-none"><option></option></select>
      </div>

      {/* 3. Data Grid */}
      <DataGrid columns={gridColumns} className="border-0 shadow-none rounded-none border-b border-slate-300">
        {items.map((item, index) => (
          <DataGridRow key={index} isHighlight={!item.stockName}>
            <DataGridCell align="center" className="text-slate-500 bg-slate-50">
              <div className="flex items-center justify-between">
                <button className="text-[8px] text-slate-400 hover:text-brand-blue">▶</button>
                <span>{item.id}</span>
              </div>
            </DataGridCell>
            <DataGridCell>{item.barcode}</DataGridCell>
            <DataGridCell isBold>{item.stockName}</DataGridCell>
            <DataGridCell>
              <select className="w-full bg-transparent outline-none text-slate-700"><option>{item.expiry}</option></select>
            </DataGridCell>
            <DataGridCell align="right">
              <input type="text" className="w-full text-right bg-transparent outline-none font-bold text-slate-800" value={item.qty || ""} readOnly />
            </DataGridCell>
            <DataGridCell align="right">{item.price ? item.price.toFixed(2) : ""}</DataGridCell>
            <DataGridCell align="right" className="font-bold text-brand-blue">{item.extPrice ? item.extPrice.toFixed(2) : ""}</DataGridCell>
            <DataGridCell className="text-slate-600">{item.details}</DataGridCell>
            <DataGridCell className="text-slate-500">{item.stkNo}</DataGridCell>
            <DataGridCell align="center">
              <input type="checkbox" checked={item.vat} readOnly className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"/>
            </DataGridCell>
          </DataGridRow>
        ))}
      </DataGrid>

      {/* 4. Footer Status Bar */}
      <div className="bg-slate-100 p-2 border-t border-slate-300 shrink-0 shadow-inner">
        <div className="flex items-end gap-3 text-[10px] text-slate-700 font-bold">
          <div className="flex flex-col items-center">
            <span className="text-red-500 font-bold mb-1">7</span>
            <button className="text-red-600 bg-white hover:bg-red-50 border border-slate-300 rounded px-2 py-0.5 shadow-sm">Delete<br/>Item</button>
          </div>
          
          <div className="flex-1 flex gap-2 bg-white border border-slate-200 rounded p-1.5 shadow-sm">
            <div className="flex flex-col flex-1">
              <span className="text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Generic name</span>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded h-6 px-2 text-slate-600" readOnly/>
            </div>
            <div className="flex flex-col w-24">
              <span className="text-slate-500 uppercase tracking-wider text-[9px] mb-0.5 text-center">Stock Group</span>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded h-6 px-2 text-center font-bold text-slate-700" value="GEN" readOnly/>
            </div>
            <div className="flex flex-col w-20">
              <span className="text-slate-500 uppercase tracking-wider text-[9px] mb-0.5 text-center">Stock#</span>
              <input type="text" className="w-full bg-blue-50 border border-blue-200 rounded h-6 px-2 text-center text-brand-blue font-bold" value="10610" readOnly/>
            </div>
            <div className="flex flex-col w-24">
              <span className="text-slate-500 uppercase tracking-wider text-[9px] mb-0.5 text-center">Expiry Date</span>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded h-6 px-2 text-center font-bold text-slate-700" value="30-Oct-27" readOnly/>
            </div>
            <div className="flex flex-col w-16">
              <span className="text-slate-500 uppercase tracking-wider text-[9px] mb-0.5 text-center">Qty</span>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded h-6 px-2 text-center font-bold text-slate-700" value="416" readOnly/>
            </div>
            <div className="flex flex-col w-20">
              <span className="text-slate-500 uppercase tracking-wider text-[9px] mb-0.5 text-center">InStock</span>
              <input type="text" className="w-full bg-red-50 border border-red-200 rounded h-6 px-2 text-center font-bold text-red-600" value="-863" readOnly/>
            </div>
            <div className="flex flex-col w-16">
              <span className="text-slate-500 uppercase tracking-wider text-[9px] mb-0.5 text-center">Shelf</span>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded h-6 px-2 text-center text-red-600 font-bold" value="A01" readOnly/>
            </div>
            <div className="flex flex-col w-16">
              <span className="text-slate-500 uppercase tracking-wider text-[9px] mb-0.5 text-center">Counted</span>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded h-6 px-2" readOnly/>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom record navigation */}
      <div className="bg-slate-800 text-slate-300 px-3 py-1 text-[10px] flex items-center gap-2 shrink-0 border-t border-slate-700">
         <span className="font-bold">Record:</span>
         <div className="flex items-center gap-1">
           <button className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold">|◀</button>
           <button className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold">◀</button>
           <input type="text" className="w-12 text-center rounded bg-slate-900 border border-slate-600 text-white font-bold py-0.5 outline-none" value="1" readOnly/>
           <button className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold">▶</button>
           <button className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold">▶|</button>
           <span className="ml-2 font-medium">of 71</span>
         </div>
      </div>
    </div>
  );
}
