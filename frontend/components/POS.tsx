import { useState, useMemo, useEffect } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Delete, ArrowLeft, CheckCircle2, Pill, ChevronLeft, ChevronRight, LayoutGrid, List, TriangleAlert } from "lucide-react";
import { cn } from "../lib/utils";
import { ProductCatalogFilter } from "./ProductCatalogFilter";
import { InventoryItem, daysUntilExpiry, getSellableBatches } from "../lib/mockData";
import { mapProductRecordToInventoryItem } from "../lib/mappers";
import { ProductCard, formatStock } from "./ProductCard";

const CARD_PAGE_SIZE = 8;
const LIST_PAGE_SIZE = 15;

type CartItem = {
  product: InventoryItem;
  qty: number;
  sellByPiece: boolean; // true = sell per piece, false = sell per pack/box
  // FEFO batch tracking — set when item is added to cart
  batchId: string;
  lotNumber: string;
  expiryDate: string;
};

export function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCatalog() {
      setIsLoading(true);
      try {
        const result = await window.api.pos.listCatalog({ page: 1, pageSize: 2000 });
        const mappedItems: InventoryItem[] = result.items.map(mapProductRecordToInventoryItem);
        setInventoryProducts(mappedItems);
      } catch (e: any) {
        window.dispatchEvent(new CustomEvent('app-error', {
          detail: { title: "POS Fetch Error", message: e.message || String(e) }
        }));
        console.error("Failed to load POS catalog:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCatalog();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const onToggleSort = () => setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  const [viewMode, setViewMode] = useState<"card" | "list">("card"); // card default for POS

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Unit selector modal (Box vs Piece)
  const [unitModalProduct, setUnitModalProduct] = useState<InventoryItem | null>(null);

  const getAvailableStockPieces = (product: InventoryItem) => {
    const inCartPieces = cart
      .filter(item => item.product.id === product.id)
      .reduce((sum, item) => sum + (item.sellByPiece ? item.qty : item.qty * item.product.piecesPerUnit), 0);
    return Math.max(0, product.totalStockPieces - inCartPieces);
  };

  const addToCart = (product: InventoryItem, sellByPiece: boolean) => {
    // FEFO: always pick the earliest-expiring SELLABLE batch with stock
    const fefo = getSellableBatches(product)[0];
    if (!fefo) {
      alert("⚠️ Cannot sell this product: No valid, unexpired batches available.");
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.sellByPiece === sellByPiece && i.batchId === fefo.batchId);
      const pieceCost = sellByPiece ? 1 : product.piecesPerUnit;
      const availPieces = getAvailableStockPieces(product);

      if (availPieces < pieceCost) return prev; // Not enough stock
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.sellByPiece === sellByPiece && i.batchId === fefo.batchId
            ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, {
        product,
        qty: 1,
        sellByPiece,
        batchId: fefo.batchId,
        lotNumber: fefo.lotNumber,
        expiryDate: fefo.expiryDate,
      }];
    });
    setUnitModalProduct(null);
  };

  const handleCardAction = (product: InventoryItem) => {
    if (product.piecesPerUnit > 1) {
      setUnitModalProduct(product); // Show unit selection modal
    } else {
      addToCart(product, false); // Only 1 unit type (bottle, piece, etc.)
    }
  };

  const updateQty = (productId: number, sellByPiece: boolean, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.sellByPiece === sellByPiece) {
        const newQty = Math.max(1, item.qty + delta);
        const newPieces = sellByPiece ? newQty : newQty * item.product.piecesPerUnit;
        const totalOthers = prev
          .filter(i => i.product.id === productId && !(i.sellByPiece === sellByPiece))
          .reduce((s, i) => s + (i.sellByPiece ? i.qty : i.qty * i.product.piecesPerUnit), 0);
        if (newPieces + totalOthers > item.product.totalStockPieces) return item;
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number, sellByPiece: boolean) => {
    setCart(prev => prev.filter(i => !(i.product.id === productId && i.sellByPiece === sellByPiece)));
  };

  const getItemPrice = (item: CartItem) => {
    const basePrice = item.sellByPiece ? item.product.sellingPricePerPiece : item.product.sellingPricePerUnit;
    return item.product.discount ? basePrice * (1 - item.product.discount / 100) : basePrice;
  };

  // Filters (memoized for scale)
  const filteredProducts = useMemo(() => inventoryProducts.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "All" || selectedCategory === "All Products" || p.category === selectedCategory;
    const matchesSubCategory = !selectedSubCategory || selectedSubCategory === "All" || p.subCategory === selectedSubCategory;
    const isActive = p.isActive !== false; // Disabled products hidden from POS
    const hasSellable = getSellableBatches(p).length > 0; // Hide completely if OOS or expired
    return matchesSearch && matchesCategory && matchesSubCategory && isActive && hasSellable;
  }), [searchQuery, selectedCategory, selectedSubCategory]);

  const sortedFilteredProducts = useMemo(() =>
    [...filteredProducts].sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)),
    [filteredProducts, sortOrder]
  );

  const pageSize = viewMode === "card" ? CARD_PAGE_SIZE : LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(sortedFilteredProducts.length / pageSize));
  const pagedProducts = sortedFilteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const topSellingProducts = [...inventoryProducts]
    .filter(p => p.isActive !== false && getSellableBatches(p).length > 0)
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 4);

  const subtotal = cart.reduce((sum, item) => sum + getItemPrice(item) * item.qty, 0);
  const total = subtotal;

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cashTenderedStr, setCashTenderedStr] = useState("");
  const [discountType, setDiscountType] = useState<"None" | "Senior" | "PWD" | "Custom">("None");
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [activeModal, setActiveModal] = useState<"None" | "Senior" | "PWD" | "Custom" | "Doctor">("None");
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(0);
  const [discountInfo, setDiscountInfo] = useState<any>(null);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);

  const needsPrescription = cart.some(item => item.product.subCategory === "Prescription (Rx)");
  const isDoctorInfoMissing = needsPrescription && !doctorInfo;

  const discountMultiplier = discountType === "None" ? 0 : discountType === "Custom" ? (customDiscountPercent / 100) : 0.20;
  const discountAmount = total * discountMultiplier;
  const finalTotal = total - discountAmount;
  const cashTendered = parseFloat(cashTenderedStr) || 0;
  const change = Math.max(0, cashTendered - finalTotal);
  const isPayDisabled = Math.round(cashTendered * 100) < Math.round(finalTotal * 100) || cart.length === 0 || isDoctorInfoMissing;

  const handleKeypadPress = (val: string) => {
    if (val === "C") return setCashTenderedStr("");
    if (val === "DEL") return setCashTenderedStr(prev => prev.slice(0, -1));
    if (val === "." && cashTenderedStr.includes(".")) return;
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
    }, 2200);
  };

  return (
    <div className="h-full w-full bg-slate-50 flex overflow-hidden relative">

      {/* Unit Selection Mini Modal */}
      {unitModalProduct && (
        <div className="absolute inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="p-5 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-extrabold text-slate-900 text-base">{unitModalProduct.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{unitModalProduct.genericName}</p>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">How would you like to sell this?</p>
              <button
                onClick={() => addToCart(unitModalProduct, false)}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10 transition-all"
              >
                <div className="text-left">
                  <p className="font-extrabold text-brand-blue text-sm">Per {unitModalProduct.packagingUnit}</p>
                  <p className="text-xs text-slate-500">{unitModalProduct.piecesPerUnit} {unitModalProduct.baseUnit}s included</p>
                </div>
                <span className="font-black text-brand-blue text-lg">₱{(unitModalProduct.discount ? unitModalProduct.sellingPricePerUnit * (1 - unitModalProduct.discount/100) : unitModalProduct.sellingPricePerUnit).toFixed(2)}</span>
              </button>
              <button
                onClick={() => addToCart(unitModalProduct, true)}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5 transition-all"
              >
                <div className="text-left">
                  <p className="font-extrabold text-slate-700 text-sm">Per {unitModalProduct.baseUnit}</p>
                  <p className="text-xs text-slate-400">Individual unit</p>
                </div>
                <span className="font-black text-slate-700 text-lg">₱{unitModalProduct.sellingPricePerPiece.toFixed(2)}</span>
              </button>
              <button onClick={() => setUnitModalProduct(null)} className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount/Doctor Form Modals */}
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
                 setDiscountType(activeModal as any);
                 if (activeModal === "Custom") setCustomDiscountPercent(parseFloat(data.percentage as string) || 0);
               }
               setActiveModal("None");
            }}>
               {activeModal === "Doctor" && (
                 <>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Doctor's Full Name</label>
                     <input name="doctorName" type="text" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue outline-none font-semibold" placeholder="Dr. Juan Dela Cruz" /></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PRC License Number</label>
                     <input name="licenseNumber" type="text" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue outline-none font-semibold" placeholder="1234567" /></div>
                   <div className="flex gap-4">
                     <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinic (Optional)</label>
                       <input name="clinic" type="text" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue outline-none font-semibold" placeholder="Makati Med" /></div>
                     <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prescription Date</label>
                       <input name="prescriptionDate" type="date" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue outline-none font-semibold text-slate-700" /></div>
                   </div>
                 </>
               )}
               {(activeModal === "Senior" || activeModal === "PWD") && (
                 <>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                     <input name="fullName" type="text" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue outline-none font-semibold" placeholder="Juan Dela Cruz" /></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{activeModal === "Senior" ? "OSCA ID Number" : "PWD ID Number"}</label>
                     <input name="idNumber" type="text" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue outline-none font-semibold" placeholder="ID-12345" /></div>
                 </>
               )}
               {activeModal === "Custom" && (
                 <>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discount Percentage (%)</label>
                     <input name="percentage" type="number" min="1" max="100" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue outline-none font-semibold" placeholder="10" /></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Authorized By / Reason</label>
                     <input name="authorizedBy" type="text" required className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue outline-none font-semibold" placeholder="Manager Jane" /></div>
                 </>
               )}
               <div className="pt-2">
                 <button type="submit" className="w-full py-3.5 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                   {activeModal === "Doctor" ? "Save Doctor Info" : "Apply Discount"}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="absolute inset-0 z-50 bg-slate-100 flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-200">
          {isPaymentSuccess && (
            <div className="absolute inset-0 z-50 bg-brand-green/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 animate-in fade-in duration-300">
               <CheckCircle2 className="w-32 h-32 mb-6 drop-shadow-lg" />
               <h1 className="text-5xl font-black tracking-tight mb-2 text-center">Payment Successful!</h1>
               <p className="text-xl font-medium opacity-90 text-center mb-8">Change due: ₱{change.toFixed(2)}</p>
            </div>
          )}

          <div className="w-full md:w-1/3 max-w-sm bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-lg z-10">
             <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm">
                <div>
                   <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Order Summary</h2>
                   <p className="text-sm font-bold text-slate-400">TXN: {Math.floor(Date.now() / 1000)}</p>
                </div>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-sm font-bold text-brand-blue hover:text-brand-green flex items-center gap-1 transition-colors px-3 py-1.5 rounded-md hover:bg-slate-50">
                  <ArrowLeft className="w-4 h-4" /> Modify
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-50/30">
                {cart.map((item, idx) => (
                   <div key={idx} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <h4 className="font-bold text-slate-800 leading-tight flex items-center gap-2 flex-wrap text-sm">
                        {item.product.name}
                        {item.product.subCategory === "Prescription (Rx)" && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[8px] uppercase font-black tracking-wider border border-red-100">Rx</span>}
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] uppercase font-bold">
                          per {item.sellByPiece ? item.product.baseUnit : item.product.packagingUnit}
                        </span>
                      </h4>
                      <div className="flex justify-between items-center text-xs text-slate-500 mt-2 font-semibold">
                         <span className="bg-slate-100 px-2 py-1 rounded-md">Qty: {item.qty}</span>
                         <span>₱{getItemPrice(item).toFixed(2)} / ea</span>
                      </div>
                      <div className="text-right text-sm font-extrabold text-brand-green mt-2">
                         Subtotal: ₱{(getItemPrice(item) * item.qty).toFixed(2)}
                      </div>
                   </div>
                ))}
             </div>
             <div className="p-6 bg-slate-800 border-t border-slate-700 font-bold text-white flex justify-between items-center">
                <span>Total Items</span>
                <span className="text-xl">{cart.reduce((sum, item) => sum + item.qty, 0)}</span>
             </div>
          </div>

          <div className="flex-1 p-6 lg:p-10 overflow-y-auto flex flex-col bg-slate-50 relative custom-scrollbar">
             <button 
               onClick={() => { if (window.confirm("Cancel this transaction?")) { setIsCheckoutOpen(false); setCart([]); setCashTenderedStr(""); setDiscountType("None"); setDiscountInfo(null); setDoctorInfo(null); }}}
               className="absolute top-6 right-6 text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-4 py-2 rounded-xl bg-white transition-all z-10 shadow-sm flex items-center gap-2 font-bold text-sm"
             >
               <Trash2 className="w-4 h-4" /> Cancel Transaction
             </button>
             <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-8 pr-12">Payment Terminal</h2>
             
             <div className="flex flex-col xl:flex-row gap-8 max-w-6xl w-full mx-auto">
                <div className="w-full xl:w-[320px] max-w-sm mx-auto xl:mx-0 shrink-0">
                   <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 mb-6 text-right shadow-sm relative overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-1 bg-brand-blue"></div>
                      <span className="text-xs font-bold text-slate-400 block mb-1">CASH TENDERED</span>
                      <span className="text-4xl font-extrabold text-brand-blue tracking-tighter truncate block w-full">₱ {cashTenderedStr || "0.00"}</span>
                   </div>
                   <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="grid grid-cols-3 gap-2">
                         {['7','8','9','4','5','6','1','2','3','C','0','DEL'].map((btn) => (
                           <button key={btn} onClick={() => handleKeypadPress(btn)}
                             className={cn("h-14 sm:h-16 rounded-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1 font-black",
                               btn === 'C' ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 text-2xl" :
                               btn === 'DEL' ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 flex items-center justify-center" :
                               "bg-white border-slate-200 text-slate-800 text-2xl sm:text-3xl shadow-sm hover:bg-brand-blue/5 hover:text-brand-blue"
                             )}>
                             {btn === 'DEL' ? <Delete className="w-6 h-6" /> : btn}
                           </button>
                         ))}
                      </div>
                   </div>
                   <div className="mt-4 grid grid-cols-2 gap-3">
                      <button onClick={() => setCashTenderedStr(finalTotal.toFixed(2))} className="h-12 sm:h-14 px-2 rounded-xl text-sm font-bold bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors border border-brand-blue/20">Exact Amount</button>
                      <button onClick={() => setCashTenderedStr("1000")} className="h-12 sm:h-14 px-2 rounded-xl text-sm font-bold bg-green-50 text-brand-green hover:bg-brand-green hover:text-white transition-colors border border-brand-green/20">₱ 1000 Note</button>
                   </div>
                </div>

                <div className="flex-1 flex flex-col space-y-6">
                   <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                        <span>Discount Type</span>
                        {discountType !== "None" && discountInfo && <span className="text-brand-blue capitalize">{discountInfo.fullName || discountInfo.authorizedBy} applied</span>}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
                         {['None', 'Senior', 'PWD', 'Custom'].map(type => (
                            <button key={type} onClick={() => {
                              if (type === "None") { setDiscountType("None"); setDiscountInfo(null); setCustomDiscountPercent(0); }
                              else { setActiveModal(type as any); }
                            }}
                              className={cn("py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 flex flex-col items-center justify-center gap-1 min-h-[50px]",
                                discountType === type ? "bg-brand-blue border-brand-blue text-white shadow-md" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300"
                              )}>
                              <span>{type}</span>
                              {(type === 'Senior' || type === 'PWD') && <span className={cn("text-[10px] px-2 py-0.5 rounded-full", discountType === type ? "bg-white/20 text-white" : "bg-brand-blue/10 text-brand-blue")}>20%</span>}
                              {type === 'Custom' && discountType === 'Custom' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white">{customDiscountPercent}%</span>}
                            </button>
                         ))}
                      </div>
                   </div>

                   {needsPrescription && (
                     <div className={cn("p-4 rounded-2xl border-2 flex items-center justify-between transition-colors", doctorInfo ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200")}>
                        <div>
                          <p className={cn("text-xs font-black uppercase tracking-widest mb-1", doctorInfo ? "text-emerald-600" : "text-orange-600")}>Rx Required</p>
                          <p className="text-sm font-bold text-slate-700">{doctorInfo ? `Dr. ${doctorInfo.doctorName}` : "Doctor info needed"}</p>
                        </div>
                        <button onClick={() => setActiveModal("Doctor")} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border", doctorInfo ? "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-orange-500 text-white border-orange-500 hover:bg-orange-600")}>
                           {doctorInfo ? "Edit" : "Input Doctor"}
                        </button>
                     </div>
                   )}

                   <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-teal"></div>
                      <div className="space-y-4">
                         <div className="flex justify-between text-slate-500 font-semibold text-sm">
                            <span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span>
                         </div>
                         {discountAmount > 0 && (
                            <div className="flex justify-between text-red-500 font-bold bg-red-50 p-3 rounded-xl text-xs">
                               <span>Discount ({discountType === "Custom" ? `${customDiscountPercent}%` : '20%'})</span>
                               <span>- ₱{discountAmount.toFixed(2)}</span>
                            </div>
                         )}
                         <div className="flex flex-col sm:flex-row justify-between sm:items-end pt-5 border-t border-slate-100 gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase">Total Payment</span>
                            <span className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight break-all leading-none">₱{finalTotal.toFixed(2)}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col gap-4 mt-auto pt-4 shrink-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-brand-green/10 p-5 rounded-2xl border border-brand-green/20 gap-2">
                         <span className="text-base sm:text-lg font-bold text-slate-700">Change Due</span>
                         <span className={cn("text-3xl sm:text-4xl font-extrabold tracking-tight", cashTendered >= finalTotal ? "text-brand-green" : "text-slate-300")}>
                            ₱ {(cashTendered >= finalTotal ? change : 0).toFixed(2)}
                         </span>
                      </div>
                      <button onClick={handleCompleteSale} disabled={isPayDisabled}
                        className="w-full py-4 sm:py-5 px-2 bg-brand-green text-white font-black text-lg sm:text-xl rounded-2xl hover:bg-green-600 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-brand-green/20 disabled:shadow-none flex items-center justify-center flex-wrap">
                        <span className="mr-2">CONFIRM PAYMENT</span><span>(₱{finalTotal.toFixed(2)})</span>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Main POS Interface */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden bg-slate-50 relative z-0">
        <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center gap-3">
              Sales Counter
              {isLoading && <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded-md animate-pulse">Loading...</span>}
            </h1>
            <p className="text-sm text-slate-500 font-medium">Point of Sale — select items to add to current transaction.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-72">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by name or barcode..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 shadow-sm transition-all text-sm font-medium"
                autoFocus />
            </div>
            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button onClick={() => { setViewMode("card"); setCurrentPage(1); }}
                className={cn("p-2 rounded-md transition-all", viewMode === "card" ? "bg-white shadow-sm text-brand-blue" : "text-slate-400 hover:text-slate-600")} title="Card View">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => { setViewMode("list"); setCurrentPage(1); }}
                className={cn("p-2 rounded-md transition-all", viewMode === "list" ? "bg-white shadow-sm text-brand-blue" : "text-slate-400 hover:text-slate-600")} title="List View">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-4">
           <ProductCatalogFilter
             selectedCategory={selectedCategory}
             onSelectCategory={(cat) => { setSelectedCategory(cat); setSelectedSubCategory("All"); setCurrentPage(1); }}
             selectedSubCategory={selectedSubCategory}
             onSelectSubCategory={(sub) => { setSelectedSubCategory(sub); setCurrentPage(1); }}
             sortOrder={sortOrder}
             onToggleSort={onToggleSort}
           >
           </ProductCatalogFilter>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar flex flex-col gap-6">
          
          {/* Top Selling Section */}
          {searchQuery === "" && selectedCategory === "All" && selectedSubCategory === "All" && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                🔥 Top Selling
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {topSellingProducts.map(product => (
                  <ProductCard key={`top-${product.id}`} product={product} viewMode="pos" onAction={handleCardAction} disabled={product.totalStockPieces <= 0} />
                ))}
              </div>
            </div>
          )}

          {/* All Products Grid with Pagination */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                {searchQuery || selectedCategory !== "All" ? "Filtered Results" : "All Products"}
                <span className="ml-2 text-slate-400 font-normal normal-case text-xs">({sortedFilteredProducts.length} items)</span>
              </h3>
            </div>

            {pagedProducts.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                <Search className="w-8 h-8 opacity-20 mb-3" />
                <p className="font-bold text-sm">No products found.</p>
              </div>
            ) : viewMode === "card" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pagedProducts.map(product => (
                  <ProductCard key={product.id} product={product} viewMode="pos" onAction={handleCardAction} disabled={product.totalStockPieces <= 0} />
                ))}
              </div>
            ) : (
              /* List View — compact rows, good for barcode-scan workflows */
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Price / Pack</th>
                      <th className="px-4 py-3">Price / Piece</th>
                      <th className="px-4 py-3 text-center">Add</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedProducts.map(product => {
                      const stockInfo = formatStock(product);
                      const isOut = stockInfo.isOut;
                      const effectivePrice = product.discount ? product.sellingPricePerUnit * (1 - product.discount/100) : product.sellingPricePerUnit;
                      return (
                        <tr key={product.id} className={cn("transition-colors group", isOut ? "opacity-50" : "hover:bg-slate-50/80 cursor-pointer")}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800 group-hover:text-brand-blue transition-colors text-sm">{product.name}</p>
                            <p className="text-[11px] text-slate-400">{product.genericName}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border", product.subCategory === "Prescription (Rx)" ? "bg-red-50 text-red-500 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
                              {product.subCategory === "Prescription (Rx)" ? "Rx" : "OTC"}
                            </span>
                            <p className="text-[10px] text-slate-300 font-bold uppercase mt-0.5">{product.brandType}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs font-bold", stockInfo.isOut ? "text-red-500" : stockInfo.isLow ? "text-orange-500" : "text-slate-600")}>
                              {stockInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-black text-brand-blue text-sm">₱{effectivePrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-semibold">₱{product.sellingPricePerPiece.toFixed(2)}<span className="text-slate-300">/{product.baseUnit}</span></td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => !isOut && handleCardAction(product)}
                              disabled={isOut}
                              className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-lg hover:bg-brand-blue hover:text-white disabled:opacity-30 transition-all border border-brand-blue/20"
                            >
                              <Plus className="w-3 h-3 inline mr-1" />Add
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={cn("w-8 h-8 rounded-lg text-xs font-bold border transition-all",
                        currentPage === page ? "bg-brand-blue text-white border-brand-blue shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-brand-blue/40"
                      )}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-72 md:w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-10 shrink-0">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-brand-blue p-2 rounded-full text-white"><ShoppingCart className="w-5 h-5" /></div>
             <h2 className="text-lg font-bold text-slate-800 tracking-tight">Current Order</h2>
          </div>
          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-sm">Cart is empty</p>
              <p className="text-xs mt-1 text-center px-6">Click on products to add them to the selection.</p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const daysLeft = daysUntilExpiry(item.expiryDate);
              const isNearExpiry = daysLeft >= 0 && daysLeft <= 90;
              return (
                <div key={idx} className={cn("flex gap-3 bg-white border p-3 rounded-xl shadow-sm", isNearExpiry ? "border-orange-200" : "border-slate-100")}>
                  <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                    <Pill className="w-4 h-4 text-brand-blue/50" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <h4 className="text-xs font-semibold text-slate-800 leading-tight">{item.product.name}</h4>
                        <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 rounded mt-0.5 inline-block">
                          per {item.sellByPiece ? item.product.baseUnit : item.product.packagingUnit}
                        </span>
                        {/* FEFO Batch Info */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            Lot: {item.lotNumber}
                          </span>
                          {isNearExpiry ? (
                            <span className="flex items-center gap-0.5 text-[9px] font-black text-orange-500">
                              <TriangleAlert className="w-2.5 h-2.5" /> {daysLeft}d
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-300">Exp {item.expiryDate.slice(0,7)}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id, item.sellByPiece)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-brand-green">₱{(getItemPrice(item) * item.qty).toFixed(2)}</span>
                      <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                        <button onClick={() => updateQty(item.product.id, item.sellByPiece, -1)} className="p-1 hover:bg-white rounded transition-colors"><Minus className="w-3 h-3 text-slate-500" /></button>
                        <span className="w-8 text-xs font-bold text-center text-slate-700">{item.qty}</span>
                        <button onClick={() => updateQty(item.product.id, item.sellByPiece, 1)} className="p-1 hover:bg-white rounded transition-colors"><Plus className="w-3 h-3 text-slate-500" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
           <div className="space-y-3 mb-6">
             <div className="flex justify-between text-sm text-slate-500">
               <span>Total Due</span>
               <span className="font-bold text-slate-700">₱{total.toFixed(2)}</span>
             </div>
           </div>
           <button onClick={() => setIsCheckoutOpen(true)}
             className="w-full py-4 px-4 bg-brand-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-brand-green/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center text-lg"
             disabled={cart.length === 0}>
             <CreditCard className="w-5 h-5 mr-2" />
             Complete Sale (₱{total.toFixed(2)})
           </button>
        </div>
      </div>
      
    </div>
  );
}
