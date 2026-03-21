import { useState } from "react";
import { ArrowLeft, Save, Printer, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";

export function ReceiptEditor({ onBack }: { onBack: () => void }) {
  const [receiptData, setReceiptData] = useState({
    storeName: "BOTIKAPLUS",
    address: "123 Health Ave, Makati City",
    contact: "0912 345 6789",
    tin: "000-123-456-000",
    footerMessage: "Thank you for your business!\nPlease come again.",
    paperSize: "80mm" as "80mm" | "58mm",
    showTxnId: true,
    showCashier: true,
    showDate: true
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    // In a real app, this would save to a database or local config file
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50/50 font-sans absolute inset-0 z-40">
       {/* Header */}
       <div className="bg-white px-6 md:px-10 py-6 border-b border-slate-200 flex items-center justify-between sticky top-0 shrink-0 shadow-sm z-50">
          <div className="flex items-center gap-5">
             <button 
              onClick={onBack} 
              className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-all text-slate-500 shadow-sm active:scale-95"
             >
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Receipt Layout Editor</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">Customize the information printed on your POS thermal receipts.</p>
             </div>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 bg-brand-blue hover:bg-blue-900 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-brand-blue/20 active:scale-95">
             {isSaved ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             {isSaved ? "Saved!" : "Save Layout"}
          </button>
       </div>

       <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Settings Form */}
          <div className="w-full lg:w-1/2 overflow-y-auto p-6 md:p-10 custom-scrollbar border-r border-slate-200 bg-white">
             <div className="max-w-xl mx-auto space-y-6">
                <div>
                   <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-6">
                      <Printer className="w-5 h-5 text-brand-blue" />
                      Header Details
                   </h2>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store Name</label>
                        <input type="text" value={receiptData.storeName} onChange={e => setReceiptData({...receiptData, storeName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold text-slate-700" placeholder="Store Name" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch Address</label>
                        <input type="text" value={receiptData.address} onChange={e => setReceiptData({...receiptData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold text-slate-700" placeholder="123 Example St." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                           <input type="text" value={receiptData.contact} onChange={e => setReceiptData({...receiptData, contact: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold text-slate-700" placeholder="09XX XXX XXXX" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">TIN Number</label>
                           <input type="text" value={receiptData.tin} onChange={e => setReceiptData({...receiptData, tin: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold text-slate-700" placeholder="000-000-000-000" />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                   <h2 className="text-lg font-extrabold text-slate-800 mb-6">Footer Details</h2>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Thank You Message</label>
                     <textarea rows={4} value={receiptData.footerMessage} onChange={e => setReceiptData({...receiptData, footerMessage: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold text-slate-700 resize-none" placeholder="Thank you for shopping with us!" />
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                   <h2 className="text-lg font-extrabold text-slate-800 mb-6">Receipt Options</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paper Size</label>
                        <select value={receiptData.paperSize} onChange={e => setReceiptData({...receiptData, paperSize: e.target.value as "80mm"|"58mm"})} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white outline-none font-semibold text-slate-700 transition-all">
                           <option value="80mm">80mm Thermal</option>
                           <option value="58mm">58mm Thermal</option>
                        </select>
                     </div>
                     <div className="space-y-3 pt-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" checked={receiptData.showTxnId} onChange={e => setReceiptData({...receiptData, showTxnId: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue accent-brand-blue" />
                           <span className="text-sm font-bold text-slate-700 group-hover:text-brand-blue transition-colors">Show Transaction ID</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" checked={receiptData.showDate} onChange={e => setReceiptData({...receiptData, showDate: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue accent-brand-blue" />
                           <span className="text-sm font-bold text-slate-700 group-hover:text-brand-blue transition-colors">Show Date & Time</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" checked={receiptData.showCashier} onChange={e => setReceiptData({...receiptData, showCashier: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue accent-brand-blue" />
                           <span className="text-sm font-bold text-slate-700 group-hover:text-brand-blue transition-colors">Show Cashier Name</span>
                        </label>
                     </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Live Preview Pane */}
          <div className="w-full lg:w-1/2 bg-slate-100/50 p-6 md:p-10 flex flex-col items-center justify-start overflow-y-auto custom-scrollbar relative">
             <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none z-0"></div>
             
             <div className={`mb-6 flex items-center justify-between w-full relative z-10 transition-all duration-300 ${receiptData.paperSize === "80mm" ? "max-w-[320px]" : "max-w-[260px]"}`}>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   Live Thermal Preview
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200">{receiptData.paperSize} Paper</span>
             </div>

             {/* Thermal Receipt Mockup */}
             <div className={`w-full bg-white shadow-xl shadow-slate-300/40 relative font-mono text-[11px] leading-tight text-slate-900 border border-slate-200/50 pb-8 z-10 transition-all duration-300 ${receiptData.paperSize === "80mm" ? "max-w-[320px]" : "max-w-[260px] text-[10px]"}`}>
                {/* Serrated edge effect */}
                <div className="absolute -top-[6px] inset-x-0 overflow-hidden h-[6px] whitespace-nowrap leading-none flex items-end">
                   {[...Array(60)].map((_, i) => (
                      <div key={i} className="inline-block w-[6px] h-[6px] shrink-0 bg-white rotate-45 translate-y-[3px] border-t border-l border-slate-200/50 shadow-sm"></div>
                   ))}
                </div>

                <div className="p-6 md:p-8">
                   {/* Header */}
                   <div className="text-center mb-6 space-y-1">
                      <h2 className="text-sm font-bold uppercase tracking-wider mb-2">{receiptData.storeName || "STORE NAME"}</h2>
                      <p className="opacity-80 break-words">{receiptData.address || "Store Address"}</p>
                      <p className="opacity-80">TIN: {receiptData.tin || "---"}</p>
                      <p className="opacity-80">Contact: {receiptData.contact || "---"}</p>
                   </div>

                   {/* Mock Meta */}
                   {(receiptData.showTxnId || receiptData.showDate || receiptData.showCashier) && (
                     <div className="border-t border-b border-dashed border-slate-300 py-3 mb-4 space-y-1">
                        {receiptData.showTxnId && <div className="flex justify-between"><span>TXN:</span><span>1774060714</span></div>}
                        {receiptData.showDate && <div className="flex justify-between"><span>DATE:</span><span>2026-03-21 14:30:00</span></div>}
                        {receiptData.showCashier && <div className="flex justify-between"><span>CASHIER:</span><span>reymart</span></div>}
                     </div>
                   )}

                   {/* Mock Items */}
                   <table className="w-full mb-4">
                      <thead>
                         <tr className="border-b border-dashed border-slate-300">
                            <th className="text-left font-normal py-1 w-7/12">ITEM</th>
                            <th className="text-right font-normal py-1 w-2/12">QTY</th>
                            <th className="text-right font-normal py-1 w-3/12">AMT</th>
                         </tr>
                      </thead>
                      <tbody>
                         <tr>
                            <td className="py-2 pt-3 truncate pr-2">Amoxicillin 500mg</td>
                            <td className="text-right py-2">x3</td>
                            <td className="text-right py-2">37.50</td>
                         </tr>
                         <tr>
                            <td className="py-2">Vitamin C Complex</td>
                            <td className="text-right py-2">x1</td>
                            <td className="text-right py-2">8.99</td>
                         </tr>
                      </tbody>
                   </table>

                   {/* Mock Totals */}
                   <div className="border-t border-dashed border-slate-300 pt-3 space-y-1 mb-6 mt-6">
                      <div className="flex justify-between"><span>SUBTOTAL</span><span>46.49</span></div>
                      <div className="flex justify-between"><span>DISCOUNT</span><span>0.00</span></div>
                      <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-slate-800">
                         <span>TOTAL</span><span>PHP 46.49</span>
                      </div>
                      <div className="flex justify-between mt-3"><span>CASH</span><span>50.00</span></div>
                      <div className="flex justify-between"><span>CHANGE</span><span>3.51</span></div>
                   </div>

                   {/* Footer & Barcode */}
                   <div className="text-center mt-8">
                      <p className="whitespace-pre-line opacity-80 leading-relaxed mb-6">{receiptData.footerMessage}</p>
                      
                      {/* Barcode Simulation */}
                      {receiptData.showTxnId && (
                         <div className="flex flex-col items-center opacity-80 pt-4 border-t border-dashed border-slate-300">
                           <div className="flex justify-center h-8 mb-1 w-full max-w-[200px]">
                             {[...Array(30)].map((_, i) => (
                               <div key={i} className={cn("bg-slate-900 h-full", i % 2 === 0 ? 'w-1.5' : i % 3 === 0 ? 'w-1' : 'w-0.5', i % 4 === 0 ? 'mx-0.5' : 'mx-px')}></div>
                             ))}
                           </div>
                           <p className="font-mono text-[9px] tracking-[0.3em]">1774060714</p>
                         </div>
                      )}
                      
                      <p className="mt-4 text-[9px] opacity-40 uppercase tracking-widest">BotikaPlus POS System</p>
                   </div>
                </div>

                {/* Bottom serrated edge effect */}
                <div className="absolute -bottom-[6px] inset-x-0 overflow-hidden h-[6px] whitespace-nowrap leading-none flex items-start">
                   {[...Array(60)].map((_, i) => (
                      <div key={i} className="inline-block w-[6px] h-[6px] shrink-0 bg-white rotate-45 -translate-y-[3px] border-b border-r border-slate-200/50 shadow-sm"></div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
