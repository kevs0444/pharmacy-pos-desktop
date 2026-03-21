import { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Delete, ArrowLeft, CheckCircle2, Pill } from "lucide-react";
import { cn } from "../lib/utils";
import { ProductCatalogFilter } from "./ProductCatalogFilter";

// TEMPORARY PHASE 1 MOCK DATA (No Backend Yet)
import { INVENTORY_DB, InventoryItem } from "../lib/mockData";
import { ProductCard } from "./ProductCard";

export function POS() {
  const [cart, setCart] = useState<{product: InventoryItem, qty: number}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showRxOnly, setShowRxOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const onToggleSort = () => setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  // List view enforced per client Phase 1

  const getAvailableStock = (product: InventoryItem) => {
    const inCart = cart.find(item => item.product.id === product.id)?.qty || 0;
    return Math.max(0, product.stock - inCart);
  };

  const addToCart = (product: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev; // Stop at stock limit
        return prev.map(item => 
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      if (product.stock < 1) return prev;
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, Math.min(item.qty + delta, item.product.stock));
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const setExactQty = (id: number, qty: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        return { ...item, qty: Math.max(0, Math.min(qty, item.product.stock)) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };


  const filteredProducts = INVENTORY_DB.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || selectedCategory === "All Products" || p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(p.category.toLowerCase());
    const matchesRx = showRxOnly ? p.requiresPrescription : true;
    return matchesSearch && matchesCategory && matchesRx;
  });

  const sortedFilteredProducts = [...filteredProducts].sort((a, b) => {
     return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  const topSellingProducts = [...INVENTORY_DB]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 3);

  const subtotal = cart.reduce((sum, item) => {
    const p = item.product.discount ? item.product.sellingPrice * (1 - item.product.discount/100) : item.product.sellingPrice;
    return sum + (p * item.qty);
  }, 0);
  const total = subtotal; // VAT removed per client request

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cashTenderedStr, setCashTenderedStr] = useState("");
  const [discountType, setDiscountType] = useState<"None" | "Senior" | "PWD" | "Custom">("None");
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // Form Modals State
  const [activeModal, setActiveModal] = useState<"None" | "Senior" | "PWD" | "Custom" | "Doctor">("None");
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(0);
  const [discountInfo, setDiscountInfo] = useState<any>(null);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);

  // Derived checkouts
  const needsPrescription = cart.some(item => item.product.requiresPrescription);
  const isDoctorInfoMissing = needsPrescription && !doctorInfo;

  // Checkout Calculations
  const discountMultiplier = discountType === "None" ? 0 : discountType === "Custom" ? (customDiscountPercent / 100) : 0.20; 
  const discountAmount = total * discountMultiplier;
  const finalTotal = total - discountAmount;
  const cashTendered = parseFloat(cashTenderedStr) || 0;
  const change = Math.max(0, cashTendered - finalTotal);
  
  // Must have doctor info if prescription is needed
  // Use Math.round to avoid JS floating point precision issues
  const isPayDisabled = Math.round(cashTendered * 100) < Math.round(finalTotal * 100) || cart.length === 0 || isDoctorInfoMissing;

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

      {/* Form Overlay Modals */}
      {activeModal !== "None" && (
        <div className="absolute inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-lg text-slate-800">
                {activeModal === "Senior" ? "Senior Citizen Details" : 
                 activeModal === "PWD" ? "PWD Details" : 
                 activeModal === "Custom" ? "Custom Discount Authorization" : 
                 "Doctor's Prescription Info"}
              </h3>
              <button onClick={() => setActiveModal("None")} className="text-slate-400 hover:text-slate-600 transition-colors p-1"><Delete className="w-5 h-5"/></button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               const data = Object.fromEntries(formData.entries());
               
               if (activeModal === "Doctor") {
                 setDoctorInfo(data);
               } else {
                 setDiscountInfo(data);
                 setDiscountType(activeModal);
                 if (activeModal === "Custom") {
                    setCustomDiscountPercent(parseFloat(data.percentage as string) || 0);
                 }
               }
               setActiveModal("None");
            }}>
               
               {activeModal === "Doctor" && (
                 <>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Doctor's Full Name</label>
                     <input name="doctorName" type="text" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold" placeholder="Dr. Juan Dela Cruz" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PRC License Number</label>
                     <input name="licenseNumber" type="text" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold" placeholder="1234567" />
                   </div>
                   <div className="flex gap-4">
                     <div className="flex-1">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinic (Optional)</label>
                       <input name="clinic" type="text" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold" placeholder="Makati Med" />
                     </div>
                     <div className="flex-1">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prescription Date</label>
                       <input name="prescriptionDate" type="date" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold text-slate-700" />
                     </div>
                   </div>
                 </>
               )}

               {(activeModal === "Senior" || activeModal === "PWD") && (
                 <>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                     <input name="fullName" type="text" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold" placeholder="Juan Dela Cruz" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{activeModal === "Senior" ? "OSCA ID Number" : "PWD ID Number"}</label>
                     <input name="idNumber" type="text" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold" placeholder="ID-12345" />
                   </div>
                   <div className="flex gap-4">
                     <div className="flex-1">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
                       <input name="age" type="number" required={activeModal === "Senior"} min="60" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold" placeholder="65" />
                     </div>
                     <div className="flex-1">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                       <select name="gender" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold text-slate-700">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                       </select>
                     </div>
                   </div>
                   {activeModal === "PWD" && (
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Disability Type (Optional)</label>
                       <input name="disabilityType" type="text" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold" placeholder="Visual, Mobility, etc." />
                     </div>
                   )}
                 </>
               )}

               {activeModal === "Custom" && (
                 <>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discount Percentage (%)</label>
                     <input name="percentage" type="number" min="1" max="100" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold" placeholder="10" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Authorized By / Reason</label>
                     <input name="authorizedBy" type="text" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-semibold" placeholder="Manager Jane" />
                   </div>
                 </>
               )}

               <div className="pt-4">
                 <button type="submit" className="w-full py-3.5 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-brand-blue/20">
                   {activeModal === "Doctor" ? "Save Doctor Info" : "Apply Discount"}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
      
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
                      <h4 className="font-bold text-slate-800 leading-tight flex items-center gap-2 flex-wrap">
                        {item.product.name}
                        {item.product.requiresPrescription && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[8px] uppercase font-black tracking-wider border border-red-100" title="Prescription Required">Rx Required</span>}
                      </h4>
                      <div className="flex justify-between items-center text-xs text-slate-500 mt-2 font-semibold">
                         <span className="bg-slate-100 px-2 py-1 rounded-md">Qty: {item.qty}</span>
                         <span>₱{(item.product.discount ? item.product.sellingPrice * (1 - item.product.discount/100) : item.product.sellingPrice).toFixed(2)} / ea</span>
                      </div>
                      <div className="text-right text-sm font-extrabold text-brand-green mt-2">
                         Subtotal: ₱{((item.product.discount ? item.product.sellingPrice * (1 - item.product.discount/100) : item.product.sellingPrice) * item.qty).toFixed(2)}
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
             <button 
               onClick={() => {
                 if (window.confirm("Are you sure you want to cancel this entire transaction? All items will be removed and stock will be restored.")) {
                   setIsCheckoutOpen(false);
                   setCart([]);
                   setCashTenderedStr("");
                   setDiscountType("None");
                   setDiscountInfo(null);
                   setDoctorInfo(null);
                 }
               }} 
               className="absolute top-6 right-6 text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-4 py-2 rounded-xl bg-white transition-all z-10 shadow-sm flex items-center gap-2 font-bold text-sm group"
             >
               <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Cancel Transaction
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
                                "h-14 sm:h-16 rounded-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1 font-black",
                                btn === 'C' ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 text-2xl" :
                                btn === 'DEL' ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 flex items-center justify-center" :
                                "bg-white border-slate-200 text-slate-800 text-2xl sm:text-3xl shadow-sm hover:bg-brand-light/30 hover:border-brand-blue/40 hover:text-brand-blue"
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
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                        <span>Discount Type</span>
                        {discountType !== "None" && discountInfo && <span className="text-brand-blue capitalize">{discountInfo.fullName || discountInfo.authorizedBy} applied</span>}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
                         {['None', 'Senior', 'PWD', 'Custom'].map(type => (
                            <button 
                              key={type}
                              onClick={() => {
                                if (type === "None") {
                                  setDiscountType("None");
                                  setDiscountInfo(null);
                                  setCustomDiscountPercent(0);
                                } else {
                                  setActiveModal(type as any); // Open the modal form first
                                }
                              }}
                              className={cn(
                                 "py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 flex flex-col items-center justify-center gap-1 min-h-[50px]",
                                 discountType === type 
                                   ? "bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/20" 
                                   : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300"
                              )}
                            >
                              <span>{type}</span>
                              {type === 'Senior' && <span className={cn("text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap", discountType === type ? "bg-white/20 text-white" : "bg-brand-blue/10 text-brand-blue")}>20%</span>}
                              {type === 'PWD' && <span className={cn("text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap", discountType === type ? "bg-white/20 text-white" : "bg-brand-blue/10 text-brand-blue")}>20%</span>}
                              {type === 'Custom' && discountType === 'Custom' && <span className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap bg-white/20 text-white">{customDiscountPercent}%</span>}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Doctor's Info Alert */}
                   {needsPrescription && (
                     <div className={cn("p-4 rounded-2xl border-2 flex items-center justify-between transition-colors", doctorInfo ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200")}>
                        <div>
                          <p className={cn("text-xs font-black uppercase tracking-widest mb-1", doctorInfo ? "text-emerald-600" : "text-orange-600")}>Restriction</p>
                          <p className="text-sm font-bold text-slate-700">{doctorInfo ? `Dr. ${doctorInfo.doctorName}` : "Prescription Info Required"}</p>
                        </div>
                        <button onClick={() => setActiveModal("Doctor")} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border", doctorInfo ? "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-orange-500 text-white border-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20")}>
                           {doctorInfo ? "Edit" : "Input Doctor"}
                        </button>
                     </div>
                   )}

                   {/* Receipt Breakdown */}
                   <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-teal"></div>
                      <div className="space-y-4">
                         <div className="flex justify-between text-slate-500 font-semibold text-sm sm:text-base">
                            <span>Subtotal</span>
                            <span>₱{subtotal.toFixed(2)}</span>
                         </div>
                         {discountAmount > 0 && (
                            <div className="flex justify-between text-red-500 font-bold bg-red-50 p-3 rounded-xl text-xs sm:text-sm">
                               <span>Discount ({discountType === "Custom" ? `${customDiscountPercent}%` : '20%'})</span>
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
                        className="w-full py-4 sm:py-5 px-2 bg-brand-green text-white font-black text-lg sm:text-xl rounded-2xl hover:bg-green-600 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-brand-green/20 disabled:shadow-none translate-y-0 active:translate-y-1 mb-8 md:mb-0 shrink-0 flex items-center justify-center flex-wrap"
                      >
                        <span className="mr-2">CONFIRM PAYMENT</span><span>(₱{finalTotal.toFixed(2)})</span>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Main POS Interface (Center Area) */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden bg-slate-50 relative z-0">
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

        {/* Top Filters & Search */}
        <div className="flex flex-col gap-4 mb-4">
           <ProductCatalogFilter 
             selectedCategory={selectedCategory} 
             onSelectCategory={setSelectedCategory} 
             sortOrder={sortOrder} 
             onToggleSort={onToggleSort} 
           />
           <div className="flex justify-end items-center mb-2 gap-4">
             <button 
               onClick={() => setShowRxOnly(!showRxOnly)}
               className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 border shadow-sm shrink-0",
                  showRxOnly ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
               )}
             >
               {showRxOnly ? "Showing Rx Only" : "Filter Rx Items"}
             </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar content-start flex flex-col gap-6">
          
          {/* Top Selling Section */}
          {searchQuery === "" && selectedCategory === "All" && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                🔥 Top Selling
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {topSellingProducts.map(product => {
                  const available = getAvailableStock(product);
                  return (
                    <ProductCard 
                      key={`top-${product.id}`} 
                      product={product} 
                      viewMode="pos" 
                      onAction={addToCart}
                      disabled={available <= 0}
                    />
                )})}
              </div>
            </div>
          )}

          {/* All Products List */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">All Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedFilteredProducts.map(product => {
                const available = getAvailableStock(product);
                return (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode="pos" 
                    onAction={addToCart}
                    disabled={available <= 0}
                  />
              )})}
            </div>
          </div>
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
                <div className="w-12 h-12 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5 text-brand-blue/50" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                     <h4 className="text-sm font-semibold text-slate-800 leading-tight pr-2">
                       {item.product.name}
                       {item.product.requiresPrescription && <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[9px] uppercase font-black" title="Prescription Required">Rx</span>}
                     </h4>
                     <button onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                   <div className="flex items-center justify-between mt-2">
                     <span className="text-xs font-bold text-brand-green">₱{((item.product.discount ? item.product.sellingPrice * (1 - item.product.discount/100) : item.product.sellingPrice) * item.qty).toFixed(2)}</span>
                     <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                       <button onClick={() => updateQty(item.product.id, -1)} className="p-1 hover:bg-white rounded rounded-l-md transition-colors"><Minus className="w-3 h-3 text-slate-500" /></button>
                       <input 
                         type="number" 
                         value={item.qty === 0 ? '' : item.qty} 
                         onChange={(e) => {
                           const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                           setExactQty(item.product.id, isNaN(val) ? 0 : val);
                         }}
                         onBlur={() => {
                           if (!item.qty || item.qty < 1) setExactQty(item.product.id, 1);
                         }}
                         className="w-10 text-xs font-bold text-center bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue rounded-sm py-0.5 mx-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
                         min="1"
                       />
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
               <span>Total Due</span>
               <span className="font-bold text-slate-700">₱{total.toFixed(2)}</span>
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
