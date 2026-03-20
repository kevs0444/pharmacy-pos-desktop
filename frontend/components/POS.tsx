import { useState } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { cn } from "../lib/utils";

// Sample robust dummy products with external links for image representation
const SAMPLE_PRODUCTS = [
  { id: "P001", name: "Amoxicillin 500mg", type: "Antibiotic", price: 12.50, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop" },
  { id: "P002", name: "Vitamin C Complex", type: "Vitamins", price: 8.99, image: "https://images.unsplash.com/photo-1550572017-edb7ecfb6fe2?q=80&w=200&auto=format&fit=crop" },
  { id: "P003", name: "Paracetamol 500mg", type: "Pain Relief", price: 4.50, image: "https://images.unsplash.com/photo-1628770732159-009ab8cbfafc?q=80&w=200&auto=format&fit=crop" },
  { id: "P004", name: "Ibuprofen 400mg", type: "Pain Relief", price: 6.20, image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=200&auto=format&fit=crop" },
  { id: "P005", name: "First Aid Kit", type: "Supplies", price: 24.99, image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=200&auto=format&fit=crop" },
  { id: "P006", name: "Cough Syrup", type: "Cold & Flu", price: 11.25, image: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?q=80&w=200&auto=format&fit=crop" },
  { id: "P007", name: "Bandages Pack", type: "Outer Care", price: 3.49, image: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=200&auto=format&fit=crop" },
  { id: "P008", name: "Eye Drops", type: "Eye Care", price: 9.99, image: "https://images.unsplash.com/photo-1585435421671-0c16764628ce?q=80&w=200&auto=format&fit=crop" },
];

export function POS() {
  const [cart, setCart] = useState<{product: typeof SAMPLE_PRODUCTS[0], qty: number}[]>([]);

  const addToCart = (product: typeof SAMPLE_PRODUCTS[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const tax = subtotal * 0.12; // 12% mock tax
  const total = subtotal + tax;

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden">
      
      {/* Products Grid (Left Area) */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Point of Sale</h1>
            <p className="text-sm text-slate-500 font-medium">Select items to add to current transaction.</p>
          </div>
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products by barcode or name..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 shadow-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SAMPLE_PRODUCTS.map(product => (
            <div 
              key={product.id} 
              onClick={() => addToCart(product)}
              className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-brand-blue transition-all group active:scale-95"
            >
              <div className="h-32 rounded-xl bg-slate-100 mb-3 overflow-hidden relative">
                 <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                 <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-full text-brand-blue shadow-sm">
                    ₱{product.price.toFixed(2)}
                 </div>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-brand-green transition-colors">{product.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{product.type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Panel (Right Area) */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-10">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-brand-blue p-2 rounded-full text-white">
                <ShoppingCart className="w-5 h-5" />
             </div>
             <h2 className="text-lg font-bold text-slate-800 tracking-tight">Current Order</h2>
          </div>
          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-sm">Cart is empty</p>
              <p className="text-xs mt-1 text-center px-6">Click on products to add them to the selection.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-3 bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <img src={item.product.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                     <h4 className="text-sm font-semibold text-slate-800 leading-tight pr-2">{item.product.name}</h4>
                     <button onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                   <div className="flex items-center justify-between mt-2">
                     <span className="text-xs font-bold text-brand-green">₱{(item.product.price * item.qty).toFixed(2)}</span>
                     <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                       <button onClick={() => updateQty(item.product.id, -1)} className="p-1 hover:bg-white rounded rounded-l-md transition-colors"><Minus className="w-3 h-3 text-slate-500" /></button>
                       <span className="text-xs font-bold min-w-[1.5rem] text-center">{item.qty}</span>
                       <button onClick={() => updateQty(item.product.id, 1)} className="p-1 hover:bg-white rounded rounded-r-md transition-colors"><Plus className="w-3 h-3 text-slate-500" /></button>
                     </div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation & Checkout Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
           <div className="space-y-3 mb-6">
             <div className="flex justify-between text-sm text-slate-500">
               <span>Subtotal</span>
               <span className="font-bold text-slate-700">₱{subtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-sm text-slate-500">
               <span>Tax (12%)</span>
               <span className="font-bold text-slate-700">₱{tax.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-lg font-extrabold text-slate-900 border-t border-slate-200 pt-3">
               <span>Total</span>
               <span>₱{total.toFixed(2)}</span>
             </div>
           </div>
           
           <button 
             className={cn(
               "w-full py-4 flex items-center justify-center text-lg font-bold rounded-xl shadow-lg transition-all",
               cart.length === 0 ? "bg-slate-200 text-slate-400" : "bg-brand-blue hover:bg-blue-900 text-white shadow-brand-blue/20"
             )}
             disabled={cart.length === 0}
            >
             <CreditCard className="w-5 h-5 mr-2" />
             Complete Sale (₱{total.toFixed(2)})
           </button>
        </div>
      </div>
      
    </div>
  );
}
