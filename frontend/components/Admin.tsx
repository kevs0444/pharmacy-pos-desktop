import { useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  Store, 
  Activity,
  UserPlus,
  Building2,
  Clock,
  Search,
  ArrowLeft,
  UserMinus,
  Settings,
  X,
  Save,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { cn } from "../lib/utils";

const mockAccounts = [
  { name: "reymart", email: "reymart@curesecure.com", role: "STAFF", status: "Active", seed: "reymart" },
  { name: "Yuri Sagadraca", email: "manager@curesecure.com", role: "MANAGER", status: "Active", seed: "yuri" },
  { name: "staff", email: "staff@curesecure.com", role: "STAFF", status: "Active", seed: "staff1" },
  { name: "Jomari", email: "jomari@gmail.com", role: "STAFF", status: "Active", seed: "jomari" },
  { name: "Kevin", email: "kevin@curesecure.com", role: "STAFF", status: "Active", seed: "kevin" },
  { name: "CureSecure", email: "CureSecure@gmail.com", role: "STAFF", status: "Inactive", seed: "botika" },
  { name: "Erick", email: "erick@gmail.com", role: "STAFF", status: "Active", seed: "erick" },
];

const INITIAL_MANUFACTURERS = [
  'Unilever', 'Pfizer', 'TGP Generics', 'Bayer', 'GSK', 'Unilab'
];

export function Admin() {
  const [viewState, setViewState] = useState<"dashboard" | "accounts">("dashboard");
  const [isManufacturerModalOpen, setIsManufacturerModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [manufacturers, setManufacturers] = useState(INITIAL_MANUFACTURERS);
  const [accounts, setAccounts] = useState(mockAccounts);

  // Manufacturer form
  const [mfForm, setMfForm] = useState({ name: '', contact: '', email: '', phone: '', address: '', category: 'Pharmaceutical' });
  // Employee form
  const [empForm, setEmpForm] = useState({ name: '', email: '', role: 'STAFF', password: '' });

  const handleSaveManufacturer = () => {
    if (!mfForm.name) return;
    setManufacturers(prev => [...prev, mfForm.name]);
    setIsManufacturerModalOpen(false);
    setMfForm({ name: '', contact: '', email: '', phone: '', address: '', category: 'Pharmaceutical' });
  };

  const handleSaveEmployee = () => {
    if (!empForm.name || !empForm.email) return;
    setAccounts(prev => [{
      name: empForm.name,
      email: empForm.email,
      role: empForm.role,
      status: 'Active',
      seed: empForm.name.toLowerCase().replace(/\s/g, '')
    }, ...prev]);
    setIsEmployeeModalOpen(false);
    setEmpForm({ name: '', email: '', role: 'STAFF', password: '' });
  };
  if (viewState === "accounts") {
     return (
        <div className="h-full w-full flex flex-col bg-slate-50/50 overflow-hidden font-sans">
           {/* Modern Premium Header */}
           <div className="bg-white px-6 md:px-10 py-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-20 shrink-0 shadow-sm">
              <div className="flex items-center gap-5">
                 <button 
                  onClick={() => setViewState("dashboard")} 
                  className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-all text-slate-500 shadow-sm active:scale-95"
                 >
                    <ArrowLeft className="w-5 h-5" />
                 </button>
                 <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Accounts System</h1>
                    <p className="text-sm font-semibold text-slate-500 mt-1">Manage personnel, roles, and access across your system.</p>
                 </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 md:mt-0 w-full md:w-auto">
                 <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search employees..." 
                      className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/50 w-full transition-all" 
                    />
                 </div>
                 <select className="border border-slate-200 rounded-xl text-sm px-4 py-2.5 outline-none font-bold text-slate-600 bg-white cursor-pointer hover:border-brand-blue/30 focus:ring-2 focus:ring-brand-blue/50 w-full sm:w-auto transition-all shadow-sm">
                    <option>All Roles</option>
                    <option>Staff</option>
                    <option>Manager</option>
                    <option>Admin</option>
                 </select>
                 <button className="flex justify-center items-center gap-2 w-full sm:w-auto bg-brand-blue hover:bg-blue-900 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-brand-blue/20 active:scale-95 shrink-0">
                    <UserPlus className="w-4 h-4" />
                    New User
                 </button>
              </div>
           </div>

           {/* Modern Card Grid */}
           <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
                 {accounts.map((acc, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-blue/30 transition-all duration-300 group flex flex-col relative overflow-hidden">
                       
                       {/* Abstract Background Decoration */}
                       <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full rounded-tr-[2rem] -z-0 pointer-events-none border-b border-l border-slate-100 group-hover:bg-brand-light/30 transition-colors duration-500"></div>

                       {/* Status Badge */}
                       <div className="absolute top-5 right-5 z-10">
                          <span className={cn(
                             "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm border",
                             acc.status === "Active" 
                               ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                               : "bg-red-50 text-red-600 border-red-100"
                          )}>
                             {acc.status}
                          </span>
                       </div>

                       {/* Avatar */}
                       <div className="h-24 w-24 rounded-full mb-6 flex items-end justify-center overflow-hidden bg-brand-light/20 border-4 border-white shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3 relative z-10 self-start">
                          <img 
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${acc.seed}&backgroundColor=transparent`} 
                            alt={acc.name} 
                            className="w-full h-full object-cover scale-[1.4] translate-y-3"
                          />
                       </div>
                       
                       <div className="flex flex-col space-y-1 relative z-10 w-full mt-auto">
                          <div className="flex items-center gap-2 mb-1">
                             <h3 className="font-extrabold text-xl text-slate-800 tracking-tight capitalize">{acc.name}</h3>
                          </div>
                          <span className={cn(
                             "w-max px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm border mb-2",
                             acc.role === "MANAGER" ? "bg-slate-800 text-white border-slate-700" : "bg-brand-blue/5 text-brand-blue border-brand-blue/10"
                          )}>
                             {acc.role}
                          </span>
                          <p className="text-xs font-semibold text-slate-500 truncate mt-2">{acc.email}</p>
                          
                          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100/80 w-full">
                             <button className="flex-1 py-2.5 bg-white border border-slate-200 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:text-brand-blue transition-all text-slate-600 active:scale-95 group/view flex items-center justify-center gap-2">
                                <Settings className="w-4 h-4 text-slate-400 group-hover/view:text-brand-blue transition-colors" />
                                Manage
                             </button>
                             <button className="py-2.5 px-3.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all shadow-sm active:scale-95" title={acc.status === "Active" ? "Deactivate" : "Activate"}>
                                <UserMinus className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {/* Add New User Card Placeholder for nice visual balance */}
                 <div onClick={() => {}} className="bg-slate-50 rounded-[2rem] p-6 border-2 border-dashed border-slate-200 hover:border-brand-blue/50 hover:bg-brand-blue/5 transition-all duration-300 group flex flex-col items-center justify-center text-center cursor-pointer min-h-[320px]">
                    <div className="w-16 h-16 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <UserPlus className="w-6 h-6 text-brand-blue" />
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-800 tracking-tight">Onboard Member</h3>
                    <p className="text-xs font-medium text-slate-500 mt-2 max-w-[200px]">Send an invite link to add a new pharmacist or staff member.</p>
                 </div>
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="h-full w-full p-6 md:p-8 overflow-y-auto bg-slate-50 custom-scrollbar relative">
      <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Hello admin, welcome to the system overview.</p>
          </div>
         <div className="flex flex-wrap gap-3 shrink-0">
             <button onClick={() => setIsManufacturerModalOpen(true)} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 md:px-5 rounded-xl transition-colors shadow-sm active:scale-95 text-sm md:text-base">
                <Building2 className="w-4 h-4" />
                Add Manufacturer
             </button>
             <button onClick={() => setIsEmployeeModalOpen(true)} className="flex items-center gap-2 bg-brand-blue hover:bg-blue-900 text-white font-bold py-2.5 px-4 md:px-5 rounded-xl transition-colors shadow-md shadow-brand-blue/20 active:scale-95 text-sm md:text-base">
                <UserPlus className="w-4 h-4" />
                New Employee
             </button>
          </div>
        </div>

        {/* Top Row - Role Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="col-span-1 md:col-span-4 lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 opacity-5 transition-transform duration-700 group-hover:scale-110">
                 <ShieldCheck className="w-56 h-56" />
              </div>
              <div className="relative z-10 w-full">
                 <h2 className="text-lg font-extrabold text-slate-800 mb-8 flex items-center gap-2">
                   <Users className="w-5 h-5 text-brand-blue" />
                   Role Distribution
                 </h2>
                 <div className="flex justify-between items-end px-2 sm:px-8">
                    <div className="flex flex-col items-center group/item hover:-translate-y-2 transition-transform">
                       <div className="w-16 h-16 rounded-full border-[3px] border-slate-200 bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-600 mb-3 shadow-inner group-hover/item:border-slate-300">10%</div>
                       <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Admin</span>
                    </div>
                    <div className="flex flex-col items-center group/item hover:-translate-y-2 transition-transform">
                       <div className="w-20 h-20 rounded-full border-[4px] border-yellow-400 bg-yellow-50 flex items-center justify-center text-base font-bold text-yellow-700 mb-3 shadow-sm group-hover/item:shadow-yellow-400/30">20%</div>
                       <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Manager</span>
                    </div>
                    <div className="flex flex-col items-center group/item hover:-translate-y-2 transition-transform">
                       <div className="w-24 h-24 rounded-full border-[6px] border-brand-green bg-emerald-50 flex items-center justify-center text-xl font-extrabold text-emerald-800 mb-3 shadow-md shadow-brand-green/20 group-hover/item:shadow-brand-green/40">70%</div>
                       <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Staff</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Stats */}
           <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-brand-blue to-blue-900 p-8 rounded-[2rem] shadow-lg shadow-brand-blue/20 text-white flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
             <div className="absolute -right-4 -top-4 opacity-10 blur-sm group-hover:scale-110 transition-transform duration-700">
                <Store className="w-40 h-40" />
             </div>
             <Store className="w-8 h-8 text-blue-300 mb-6 relative z-10" />
             <div className="text-6xl font-black mb-2 tracking-tighter relative z-10">12</div>
             <div className="text-sm font-bold tracking-wide text-blue-100/80 relative z-10 uppercase">Active Manufacturers</div>
           </div>
           
           <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-brand-green to-emerald-700 p-8 rounded-[2rem] shadow-lg shadow-brand-green/20 text-white flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
             <div className="absolute -right-4 -top-4 opacity-10 blur-sm group-hover:scale-110 transition-transform duration-700">
                <Activity className="w-40 h-40" />
             </div>
             <Activity className="w-8 h-8 text-emerald-200 mb-6 relative z-10" />
             <div className="text-6xl font-black mb-2 tracking-tighter relative z-10">10</div>
             <div className="text-sm font-bold tracking-wide text-emerald-100/80 relative z-10 uppercase">Total Employees</div>
           </div>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* Left Column: Employees */}
           <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col">
             {/* Decorative Background abstract */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="flex justify-between items-center mb-8 z-10 relative">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
                     <Users className="w-5 h-5 text-brand-green" />
                  </span>
                  Employees Summary
                </h2>
                <button 
                  onClick={() => setViewState("accounts")}
                  className="px-5 py-2.5 bg-brand-blue text-white text-xs font-black rounded-xl cursor-pointer hover:bg-blue-800 transition-colors shadow-sm shadow-brand-blue/30 active:scale-95 focus:ring-2 focus:ring-brand-blue/50"
                >
                  View All
                </button>
             </div>
             
             <div className="space-y-3 z-10 relative flex-1">
                {[
                  { user: "reymart", name: "Reymart Llona", role: "STAFF", avatar: "RL" },
                  { user: "manager", name: "Yuri Lorenz Sagadraca", role: "MANAGER", avatar: "YL" },
                  { user: "staff", name: "Russia Mae Cimafranca", role: "STAFF", avatar: "RM" },
                  { user: "jomari", name: "Jomari Cos", role: "STAFF", avatar: "JC" }
                ].map((emp, i) => (
                   <div key={i} className="flex items-center p-3 sm:p-4 rounded-2xl hover:bg-slate-50 transition-colors border-2 border-transparent hover:border-slate-100 group cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-extrabold mr-4 group-hover:bg-brand-blue group-hover:text-white transition-colors text-sm shadow-inner group-hover:shadow-md">
                        {emp.avatar}
                      </div>
                      <div className="flex-1">
                         <div className="font-bold text-slate-800 tracking-tight">{emp.name}</div>
                         <div className="text-xs font-medium text-slate-400 mt-0.5">@{emp.user}</div>
                      </div>
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm border",
                        emp.role === "MANAGER" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200"
                      )}>
                         {emp.role}
                      </div>
                   </div>
                ))}
             </div>
           </div>

           {/* Right Column: Activity & Manufacturers */}
           <div className="space-y-6 flex flex-col">
              
              {/* Recent Activity */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden flex-1">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
                 <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3 mb-8 z-10 relative">
                  <span className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                     <Clock className="w-5 h-5 text-brand-blue" />
                  </span>
                  Recent Activity
                 </h2>
                 <div className="space-y-6 z-10 relative">
                    <div className="flex gap-4 group cursor-pointer items-start">
                       <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0 group-hover:scale-125 transition-transform"></div>
                       <div>
                          <p className="text-sm font-extrabold text-slate-700 group-hover:text-brand-blue transition-colors">Admin logged in</p>
                          <p className="text-xs font-semibold text-slate-400 mt-1">Today, 21:08:44</p>
                       </div>
                    </div>
                    <div className="flex gap-4 group cursor-pointer items-start">
                       <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-red-400 ring-4 ring-red-50 shrink-0 group-hover:scale-125 transition-transform"></div>
                       <div>
                          <p className="text-sm font-extrabold text-slate-700 group-hover:text-red-500 transition-colors">Manager logged out</p>
                          <p className="text-xs font-semibold text-slate-400 mt-1">Today, 18:30:12</p>
                       </div>
                    </div>
                    <div className="flex gap-4 group cursor-pointer items-start">
                       <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0 group-hover:scale-125 transition-transform"></div>
                       <div>
                          <p className="text-sm font-extrabold text-slate-700 group-hover:text-brand-blue transition-colors">Staff (jomari) logged in</p>
                          <p className="text-xs font-semibold text-slate-400 mt-1">Today, 08:15:00</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Manufacturers Preview */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex-1">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                       <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-500" />
                       </span>
                       Manufacturers
                    </h2>
                 </div>
                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {manufacturers.map((brand, i) => (
                       <div key={i} className="h-14 rounded-xl border-2 border-slate-100 flex items-center justify-center px-3 hover:border-brand-light hover:bg-brand-light/20 cursor-pointer text-slate-500 hover:text-brand-blue transition-all active:scale-95 shadow-sm">
                          <span className="text-xs font-extrabold text-center truncate w-full tracking-wide uppercase">{brand}</span>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
        </div>

      </div>

      {/* ADD MANUFACTURER MODAL */}
      {isManufacturerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4">
            <div className="bg-brand-blue p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">Add New Manufacturer</h2>
                <p className="text-sm opacity-80 mt-1">Register a supplier or drug manufacturer.</p>
              </div>
              <button onClick={() => setIsManufacturerModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name *</label>
                  <input type="text" value={mfForm.name} onChange={e => setMfForm({...mfForm, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Unilab Pharmaceuticals" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person</label>
                  <input type="text" value={mfForm.contact} onChange={e => setMfForm({...mfForm, contact: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Juan Dela Cruz" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <input type="email" value={mfForm.email} onChange={e => setMfForm({...mfForm, email: e.target.value})} className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="supplier@company.com" />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <input type="tel" value={mfForm.phone} onChange={e => setMfForm({...mfForm, phone: e.target.value})} className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="+63 912 345 6789" />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select value={mfForm.category} onChange={e => setMfForm({...mfForm, category: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all">
                    <option value="Pharmaceutical">Pharmaceutical</option>
                    <option value="Medical Supplies">Medical Supplies</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Vitamins">Vitamins & Supplements</option>
                    <option value="Baby & Mom">Baby & Mom</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                  <div className="relative">
                    <input type="text" value={mfForm.address} onChange={e => setMfForm({...mfForm, address: e.target.value})} className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="Makati City, Metro Manila" />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setIsManufacturerModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSaveManufacturer} className="px-8 py-3 bg-brand-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center gap-2 active:scale-95">
                <Save className="w-5 h-5" /> Save Manufacturer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-bold">Add New Employee</h2>
                <p className="text-sm opacity-80 mt-1">Create a new user account for the system.</p>
              </div>
              <button onClick={() => setIsEmployeeModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                <input type="text" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Maria Santos" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
                <input type="email" value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="employee@botikaplus.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                  <select value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all">
                    <option value="STAFF">Staff</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Password</label>
                  <input type="password" value={empForm.password} onChange={e => setEmpForm({...empForm, password: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400" placeholder="••••••••" />
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setIsEmployeeModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSaveEmployee} className="px-8 py-3 bg-brand-blue hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20 transition-all flex items-center gap-2 active:scale-95">
                <Save className="w-5 h-5" /> Add Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
