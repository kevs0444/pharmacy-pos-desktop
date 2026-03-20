import { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Delete, ArrowLeft, CheckCircle2, LayoutGrid, List } from "lucide-react";
import { cn } from "../lib/utils";

// Sample robust dummy products with specific, high-quality Unsplash IDs perfectly matched to Pharmacy
const DUMMY_PRODUCTS = [
  { id: '1', name: 'Amoxicillin 500mg', category: 'Antibiotic', price: 12.50, stock: 150, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80' },
  { id: '2', name: 'Vitamin C Complex', category: 'Vitamins', price: 8.99, stock: 45, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80' },
  { id: '3', name: 'Paracetamol 500mg', category: 'Pain Relief', price: 4.50, stock: 320, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80' },
  { id: '4', name: 'Ibuprofen 400mg', category: 'Pain Relief', price: 6.20, stock: 80, image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&q=80' },
  { id: '5', name: 'First Aid Kit', category: 'Supplies', price: 24.99, stock: 12, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&q=80' },
  { id: '6', name: 'Cough Syrup', category: 'Cold & Flu', price: 11.25, stock: 0, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80' },
  { id: '7', name: 'Bandages Pack', category: 'Outer Care', price: 3.49, stock: 200, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&q=80' },
  { id: '8', name: 'Eye Drops', category: 'Eye Care', price: 9.99, stock: 34, image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&q=80' },
];

export function POS() {
  const [cart, setCart] = useState<{product: typeof DUMMY_PRODUCTS[0], qty: number}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const addToCart = (product: typeof DUMMY_PRODUCTS[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const categories = ["All", ...new Set(DUMMY_PRODUCTS.map(p => p.category))];
  const filteredProducts = DUMMY_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const tax = subtotal * 0.12; // 12% mock tax
  const total = subtotal + tax;

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cashTenderedStr, setCashTenderedStr] = useState("");
  const [discountType, setDiscountType] = useState<"None" | "Senior" | "PWD">("None");
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // Checkout Calculations
  const discountMultiplier = discountType === "None" ? 0 : 0.20; // 20% discount for Senior/PWD
  const discountAmount = total * discountMultiplier;
  const finalTotal = total - discountAmount;
  const cashTendered = parseFloat(cashTenderedStr) || 0;
  const change = Math.max(0, cashTendered - finalTotal);
  const isPayDisabled = cashTendered < finalTotal || cart.length === 0;

  const handleKeypadPress = (val: string) => {
    if (val === "C") return setCashTenderedStr("");
    if (val === "DEL") return setCashTenderedStr(prev => prev.slice(0, -1));
    
    // Prevent multiple decimals
    if (val === "." && cashTenderedStr.includes(".")) return;
    
    // Limit decimal places to 2
    if (cashTenderedStr.includes(".")) {
      const decimals = cashTenderedStr.split(".")[1];
      if (decimals && decimals.length >= 2) return;
    }

    setCashTenderedStr(prev => prev + val);
  };

  const handleCompleteSale = () => {
    setIsPaymentSuccess(true);
    setTimeout(() => {
       setIsPaymentSuccess(false);
       setIsCheckoutOpen(false);
       setCart([]);
       setCashTenderedStr("");
       setDiscountType("None");
    }, 2000);
  };

  return (
    <div className="h-full w-full bg-slate-50 flex overflow-hidden relative">
      
      {/* Checkout Overlay Modal */}
      {isCheckoutOpen && (
        <div className="absolute inset-0 z-50 bg-slate-100 flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-200">
          
          {/* Success Overlay */}
          {isPaymentSuccess && (
            <div className="absolute inset-0 z-50 bg-brand-green/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 animate-in fade-in duration-300">
               <CheckCircle2 className="w-32 h-32 mb-6 drop-shadow-lg" />
               <h1 className="text-5xl font-black tracking-tight mb-2 text-center">Payment Successful!</h1>
               <p className="text-xl font-medium opacity-90 text-center mb-8">Change due: ₱{change.toFixed(2)}</p>
               <div className="w-16 h-1 bg-white/30 rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Left Side: Order Summary */}
          <div className="w-full md:w-1/3 max-w-sm bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-lg z-10">
             <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm">
                <div>
                   <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Total Items</h2>
                   <p className="text-sm font-bold text-slate-400">Transaction ID: {Math.floor(Date.now() / 1000)}</p>
                </div>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-sm font-bold text-brand-blue hover:text-brand-green flex items-center gap-1 transition-colors px-3 py-1.5 rounded-md hover:bg-slate-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Modify
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-50/30">
                {cart.map(item => (
                   <div key={item.product.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <h4 className="font-bold text-slate-800 leading-tight">{item.product.name}</h4>
                      <div className="flex justify-between items-center text-xs text-slate-500 mt-2 font-semibold">
                         <span className="bg-slate-100 px-2 py-1 rounded-md">Qty: {item.qty}</span>
                         <span>₱{item.product.price.toFixed(2)} / ea</span>
                      </div>
                      <div className="text-right text-sm font-extrabold text-brand-green mt-2">
                         Subtotal: ₱{(item.product.price * item.qty).toFixed(2)}
                      </div>
                   </div>
                ))}
             </div>
             <div className="p-6 bg-slate-800 border-t border-slate-700 font-bold text-white flex justify-between items-center">
                <span>Total Quantity</span>
                <span className="text-xl">{cart.reduce((sum, item) => sum + item.qty, 0)} items</span>
             </div>
          </div>

          {/* Right Side: Payment Details */}
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto flex flex-col bg-slate-50 relative custom-scrollbar">
             <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 border border-slate-200 p-2 rounded-full bg-white transition-colors z-10 shadow-sm">
               <Delete className="w-5 h-5" />
             </button>
             <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-8 pr-12">Payment Terminal</h2>
             
             <div className="flex flex-col xl:flex-row gap-8 max-w-6xl w-full mx-auto">
                
                {/* Numeric Keypad Component */}
                <div className="w-full xl:w-[320px] max-w-sm mx-auto xl:mx-0 shrink-0">
                   <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 mb-6 text-right shadow-sm relative overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-1 bg-brand-blue"></div>
                      <span className="text-xs font-bold text-slate-400 block mb-1">CASH TENDERED</span>
                      <span className="text-4xl font-extrabold text-brand-blue tracking-tighter truncate block w-full">
                         ₱ {cashTenderedStr || "0.00"}
                      </span>
                   </div>
                   
                   <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="grid grid-cols-3 gap-2">
                         {['7','8','9','4','5','6','1','2','3','C','0','DEL'].map((btn) => (
                           <button 
                             key={btn}
                             onClick={() => handleKeypadPress(btn)}
                             className={cn(
                                "h-14 sm:h-16 rounded-2xl text-xl font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1",
                                btn === 'C' ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" :
                                btn === 'DEL' ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 flex items-center justify-center" :
                                "bg-slate-50 border-slate-200 text-slate-700 hover:bg-brand-light/50 hover:border-brand-blue/30 hover:text-brand-blue"
                             )}
                           >
                             {btn === 'DEL' ? <Delete className="w-6 h-6" /> : btn}
                           </button>
                         ))}
                      </div>
                   </div>
                   
                   <div className="mt-4 grid grid-cols-2 gap-3">
                      <button onClick={() => setCashTenderedStr(finalTotal.toFixed(2))} className="h-12 sm:h-14 px-2 rounded-xl text-sm font-bold bg-brand-light text-brand-blue hover:bg-brand-blue hover:text-white transition-colors border border-brand-blue/20">
                         Exact Amount
                      </button>
                      <button onClick={() => setCashTenderedStr("1000")} className="h-12 sm:h-14 px-2 rounded-xl text-sm font-bold bg-green-50 text-brand-green hover:bg-brand-green hover:text-white transition-colors border border-brand-green/20">
                         ₱ 1000 Note
                      </button>
                   </div>
                </div>

                {/* Breakdown & Actions */}
                <div className="flex-1 flex flex-col space-y-6">
                   
                   {/* Discount Cards */}
                   <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Discount Type</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                         {['None', 'Senior', 'PWD'].map(type => (
                            <button 
                              key={type}
                              onClick={() => setDiscountType(type as any)}
                              className={cn(
                                 "py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 flex flex-col lg:flex-row items-center justify-center gap-1 min-h-[50px]",
                                 discountType === type 
                                   ? "bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/20" 
                                   : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300"
                              )}
                            >
                              <span>{type}</span>
                              {type !== 'None' && <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap", discountType === type ? "bg-white/20 text-white" : "bg-brand-blue/10 text-brand-blue")}>-20%</span>}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Receipt Breakdown */}
                   <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-teal"></div>
                      <div className="space-y-4">
                         <div className="flex justify-between text-slate-500 font-semibold text-sm sm:text-base">
                            <span>Subtotal</span>
                            <span>₱{subtotal.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-slate-500 font-semibold text-sm sm:text-base">
                            <span>Tax (12% VAT inc.)</span>
                            <span>₱{tax.toFixed(2)}</span>
                         </div>
                         {discountAmount > 0 && (
                            <div className="flex justify-between text-red-500 font-bold bg-red-50 p-3 rounded-xl text-xs sm:text-sm">
                               <span>Discount (20%)</span>
                               <span>- ₱{discountAmount.toFixed(2)}</span>
                            </div>
                         )}
                         <div className="flex flex-col sm:flex-row justify-between sm:items-end pt-5 sm:pt-6 border-t border-slate-100 gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase">Total Payment</span>
                            <span className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight break-all leading-none">₱{finalTotal.toFixed(2)}</span>
                         </div>
                      </div>
                   </div>

                   {/* Change & Action Buttons */}
                   <div className="flex flex-col gap-4 mt-auto pt-4 shrink-0">
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-brand-green/10 p-5 rounded-2xl border border-brand-green/20 gap-2">
                         <span className="text-base sm:text-lg font-bold text-slate-700">Change Due</span>
                         <span className={cn(
                            "text-3xl sm:text-4xl font-extrabold tracking-tight truncate",
                            cashTendered >= finalTotal ? "text-brand-green" : "text-slate-300"
                         )}>
                            ₱ {(cashTendered >= finalTotal ? change : 0).toFixed(2)}
                         </span>
                      </div>

                      <button 
                        onClick={handleCompleteSale}
                        disabled={isPayDisabled}
                        className="w-full py-4 sm:py-5 px-2 bg-brand-green text-white font-black text-lg sm:text-xl rounded-2xl hover:bg-green-600 transition-all disabled:opacity-50 disabled:bg-slate-300 shadow-lg shadow-brand-green/20 disabled:shadow-none translate-y-0 active:translate-y-1 mb-8 md:mb-0 shrink-0 flex items-center justify-center flex-wrap"
                      >
                        <span className="mr-2">CONFIRM PAYMENT</span><span>(₱{finalTotal.toFixed(2)})</span>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Main POS Interface */}
      {/* Products Grid (Left Area) */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">Point of Sale</h1>
            <p className="text-sm text-slate-500 font-medium">Select items to add to current transaction.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by barcode or name..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 shadow-sm transition-all text-sm font-medium"
              autoFocus
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar flex-1">
            {categories.map(cat => (
               <button
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors",
                    selectedCategory === cat 
                      ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" 
                      : "bg-white text-slate-500 hover:bg-slate-100 hover:text-brand-blue border border-slate-200"
                 )}
               >
                 {cat}
               </button>
            ))}
          </div>

          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl shrink-0 h-[42px] mb-2 self-start border border-slate-200">
            <button 
               onClick={() => setViewMode("grid")}
               className={cn("px-3 rounded-lg flex items-center justify-center transition-all", viewMode === "grid" ? "bg-white shadow-sm text-brand-blue border border-slate-200/50" : "text-slate-400 hover:text-slate-600")}
               title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
               onClick={() => setViewMode("list")}
               className={cn("px-3 rounded-lg flex items-center justify-center transition-all", viewMode === "list" ? "bg-white shadow-sm text-brand-blue border border-slate-200/50" : "text-slate-400 hover:text-slate-600")}
               title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={cn("flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar content-start", viewMode === "grid" ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4" : "flex flex-col gap-3")}>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => product.stock > 0 && addToCart(product)}
              className={cn(
                "bg-white rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group duration-300 active:scale-95 flex overflow-hidden",
                viewMode === "grid" ? "flex-col" : "flex-row items-center p-3 gap-4",
                product.stock === 0 && "opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-sm"
              )}
            >
              {/* Image */}
              <div className={cn("bg-slate-100 overflow-hidden relative shrink-0", viewMode === "grid" ? "h-28 md:h-32" : "w-16 h-16 rounded-xl")}>
                 <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                 {product.stock === 0 && (
                   <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                     <span className={cn("text-white font-black uppercase tracking-wider bg-red-500 rounded-full", viewMode === "grid" ? "text-xs px-3 py-1" : "text-[8px] px-1.5 py-0.5")}>Out</span>
                   </div>
                 )}
              </div>

              {/* Info */}
              <div className={cn("flex flex-1", viewMode === "grid" ? "flex-col p-3 md:p-4" : "flex-row items-center justify-between py-1 pr-2")}>
                
                <div className={cn(viewMode === "grid" ? "" : "flex flex-col justify-center")}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{product.category}</p>
                  <h3 className="font-extrabold text-slate-800 text-sm leading-tight group-hover:text-brand-blue transition-colors line-clamp-2">{product.name}</h3>
                </div>
                
                <div className={cn("mt-auto flex", viewMode === "grid" ? "pt-3 items-end justify-between" : "items-center gap-6 md:gap-12")}>
                  <div>
                    <p className={cn("font-bold text-slate-400 uppercase", viewMode === "grid" ? "text-[10px]" : "hidden")}>Price</p>
                    <p className={cn("font-black text-brand-blue leading-none", viewMode === "grid" ? "text-lg" : "text-base")}>₱{product.price.toFixed(2)}</p>
                  </div>
                  <div className={cn("text-right", viewMode === "list" && "w-16")}>
                    <p className={cn("font-bold text-slate-400 uppercase", viewMode === "grid" ? "text-[10px]" : "hidden")}>Stock</p>
                    <p className={cn("font-black leading-none whitespace-nowrap", viewMode === "grid" ? "text-sm" : "text-xs", product.stock <= 10 ? "text-red-500" : product.stock <= 50 ? "text-yellow-600" : "text-emerald-600")}>{product.stock} left</p>
                  </div>
                  
                  {viewMode === "list" && (
                    <button className="py-2 px-4 bg-brand-green/10 text-brand-green text-xs font-black rounded-lg group-hover:bg-brand-green group-hover:text-white transition-all uppercase tracking-wider shrink-0 pointer-events-none">
                      Add
                    </button>
                  )}
                </div>

                {viewMode === "grid" && (
                  <button className="mt-3 w-full py-2 bg-brand-green/10 text-brand-green text-xs font-black rounded-lg group-hover:bg-brand-green group-hover:text-white transition-all uppercase tracking-wider pointer-events-none">
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
             <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-400">
                <Search className="w-8 h-8 opacity-20 mb-3" />
                <p className="font-bold text-sm">No products found.</p>
             </div>
          )}
        </div>
      </div>

      {/* Cart Panel (Right Area) */}
      <div className="w-72 md:w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-10 shrink-0">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
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
             onClick={() => setIsCheckoutOpen(true)}
             className="w-full py-4 px-4 bg-brand-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-brand-green/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center text-lg"
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
