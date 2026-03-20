import { 
  Users, 
  ShieldCheck, 
  Store, 
  Activity,
  UserPlus,
  Building2,
  Clock
} from "lucide-react";

export function Admin() {
  return (
    <div className="h-full w-full p-8 overflow-y-auto bg-slate-50 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Hello admin, welcome to the system overview.</p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm">
                <Building2 className="w-4 h-4" />
                Add Manufacturer
             </button>
             <button className="flex items-center gap-2 bg-brand-blue hover:bg-blue-900 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-md shadow-brand-blue/20">
                <UserPlus className="w-4 h-4" />
                New Employee
             </button>
          </div>
        </div>

        {/* Top Row - Role Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="col-span-1 md:col-span-4 lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 opacity-5">
                 <ShieldCheck className="w-48 h-48" />
              </div>
              <div className="relative z-10 w-full">
                 <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                   <Users className="w-5 h-5 text-brand-blue" />
                   Role Distribution
                 </h2>
                 <div className="flex justify-between items-end">
                    <div className="flex flex-col items-center">
                       <div className="w-16 h-16 rounded-full border-4 border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 mb-2">10%</div>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin</span>
                    </div>
                    <div className="flex flex-col items-center">
                       <div className="w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center text-base font-bold text-slate-700 mb-2 shadow-sm shadow-yellow-400/20">20%</div>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manager</span>
                    </div>
                    <div className="flex flex-col items-center">
                       <div className="w-24 h-24 rounded-full border-[6px] border-brand-green flex items-center justify-center text-xl font-extrabold text-slate-800 mb-2 shadow-md shadow-brand-green/30">70%</div>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Stats */}
           <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-brand-blue to-blue-900 p-6 rounded-3xl shadow-lg shadow-brand-blue/20 text-white flex flex-col justify-center">
             <Store className="w-8 h-8 text-blue-200 mb-4" />
             <div className="text-4xl font-black mb-1">12</div>
             <div className="text-sm font-medium tracking-wide text-blue-100/80">Active Manufacturers</div>
           </div>
           
           <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-brand-green to-emerald-700 p-6 rounded-3xl shadow-lg shadow-brand-green/20 text-white flex flex-col justify-center">
             <Activity className="w-8 h-8 text-emerald-100 mb-4" />
             <div className="text-4xl font-black mb-1">10</div>
             <div className="text-sm font-medium tracking-wide text-emerald-100/80">Total Employees</div>
           </div>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* Left Column: Employees */}
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-green" />
                  Employees Summary
                </h2>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-200">View All</span>
             </div>
             <div className="space-y-4">
                {[
                  { user: "reymart", name: "Reymart Llona", role: "STAFF", avatar: "RL" },
                  { user: "manager", name: "Yuri Lorenz Sagadraca", role: "MANAGER", avatar: "YL" },
                  { user: "staff", name: "Russia Mae Cimafranca", role: "STAFF", avatar: "RM" },
                  { user: "jomari", name: "Jomari Cos", role: "STAFF", avatar: "JC" }
                ].map((emp, i) => (
                   <div key={i} className="flex items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                      <div className="w-12 h-12 rounded-full bg-brand-light text-brand-blue flex items-center justify-center font-bold mr-4 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                        {emp.avatar}
                      </div>
                      <div className="flex-1">
                         <div className="font-bold text-slate-800">{emp.name}</div>
                         <div className="text-xs font-semibold text-slate-400 mt-0.5">@{emp.user}</div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-black tracking-widest bg-slate-100 text-slate-500">
                         {emp.role}
                      </div>
                   </div>
                ))}
             </div>
           </div>

           {/* Right Column: Activity & Manufacturers */}
           <div className="space-y-6">
              
              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                 <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-brand-blue" />
                  Recent Activity
                 </h2>
                 <div className="space-y-4">
                    <div className="flex gap-4">
                       <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0"></div>
                       <div>
                          <p className="text-sm font-bold text-slate-700">Admin logged in</p>
                          <p className="text-xs text-slate-400 mt-1">Today, 21:08:44</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="mt-1 w-2 h-2 rounded-full bg-red-400 ring-4 ring-red-50 shrink-0"></div>
                       <div>
                          <p className="text-sm font-bold text-slate-700">Manager logged out</p>
                          <p className="text-xs text-slate-400 mt-1">Today, 18:30:12</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0"></div>
                       <div>
                          <p className="text-sm font-bold text-slate-700">Staff (jomari) logged in</p>
                          <p className="text-xs text-slate-400 mt-1">Today, 08:15:00</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Manufacturers Preview */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                       <Building2 className="w-5 h-5 text-slate-400" />
                       Manufacturers
                    </h2>
                 </div>
                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Unilever', 'Pfizer', 'TGP Generics', 'Bayer', 'GSK', 'Unilab'].map((brand, i) => (
                       <div key={i} className="h-16 rounded-xl border border-slate-100 flex items-center justify-center p-3 hover:border-brand-blue cursor-pointer transition-colors bg-slate-50/50">
                          <span className="text-xs font-bold text-slate-500 text-center">{brand}</span>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
