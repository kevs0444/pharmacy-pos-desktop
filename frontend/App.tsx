import { useState } from "react";

import { ShoppingCart, Barcode, HeartPulse } from "lucide-react";

function App() {
  const [barcode, setBarcode] = useState("");

  async function processScan(e: React.FormEvent) {
    e.preventDefault();
    if (!barcode) return;
    // We will later invoke the Electron/SQLite command here
    // await window.ipcRenderer.invoke("process_sale_item", { barcode });
    console.log("Scanned:", barcode);
    setBarcode("");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-800">
      <div className="flex items-center gap-3 mb-8">
        <HeartPulse className="w-10 h-10 text-emerald-600" />
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Pharmacy POS
        </h1>
      </div>
      
      <p className="text-slate-500 mb-8 max-w-sm text-center">
        Tauri + React + Tailwind v4 + Turso Local-First Architecture. Ready for development.
      </p>

      <form 
        onSubmit={processScan}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 flex flex-col gap-5"
      >
        <div>
          <label htmlFor="barcode-input" className="block text-sm font-medium text-slate-600 mb-2">
            Scan Product Barcode
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Barcode className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="barcode-input"
              type="text"
              autoFocus
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
              placeholder="e.g. 0341029318"
              value={barcode}
              onChange={(e) => setBarcode(e.currentTarget.value)}
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          Process Item
        </button>
      </form>
    </div>
  );
}

export default App;
