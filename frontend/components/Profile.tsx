import { useState } from "react";
import { User, Lock, Mail, Phone, MapPin, Calendar, Users, Camera, Edit2 } from "lucide-react";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="h-full w-full bg-slate-50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Profile Information</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage your personal details and account preferences.</p>
        </div>

        {/* Profile Container */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
          
          {/* Top Banner Graphic (Curved shape) */}
          <div className="h-48 w-full bg-brand-blue relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-full">
                <svg viewBox="0 0 1440 320" className="w-full h-auto" preserveAspectRatio="none">
                  <path fill="#ffffff" fillOpacity="1" d="M0,256L80,240C160,224,320,192,480,192C640,192,800,224,960,234.7C1120,245,1280,235,1360,229.3L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                </svg>
             </div>
          </div>

          <div className="px-8 pb-12 flex flex-col md:flex-row gap-12 relative z-10 -mt-20">
            
            {/* Left Column - Avatar & Picture */}
            <div className="flex flex-col items-center shrink-0">
               <div className="w-48 h-48 bg-slate-100 rounded-full border-4 border-white shadow-lg overflow-hidden relative group">
                  {/* Stand-in for 3D character or portrait */}
                  <img src="https://ui-avatars.com/api/?name=Manager&background=203468&color=fff&size=200" alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     <Camera className="w-8 h-8 text-white" />
                  </div>
               </div>
               <button className="mt-4 px-6 py-2 bg-brand-blue text-white text-sm font-bold rounded-full shadow-md hover:bg-blue-900 transition-colors">
                 Edit Picture
               </button>
            </div>

            {/* Right Column - Form Data */}
            <div className="flex-1 pt-24 md:pt-4">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Profile Info</h2>
                 <button 
                   onClick={() => setIsEditing(!isEditing)}
                   className="flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-brand-green transition-colors"
                 >
                   <Edit2 className="w-4 h-4" />
                   {isEditing ? 'Cancel Edit' : 'Edit'}
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 
                 {/* Left Side Form Fields */}
                 <div className="space-y-6">
                    <div className="relative">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Username</label>
                       <input 
                         type="text" 
                         defaultValue="manager" 
                         disabled={!isEditing}
                         className="w-full pb-2 border-b-2 border-slate-200 focus:border-brand-green focus:outline-none bg-transparent text-slate-800 font-semibold disabled:text-slate-500 transition-colors pl-1"
                       />
                       <User className="absolute right-0 top-7 w-4 h-4 text-slate-400 -translate-y-1/2" />
                    </div>

                    <div className="relative">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Password</label>
                       <input 
                         type="password" 
                         defaultValue="••••••••" 
                         disabled={!isEditing}
                         className="w-full pb-2 border-b-2 border-slate-200 focus:border-brand-green focus:outline-none bg-transparent text-slate-800 font-semibold disabled:text-slate-500 transition-colors pl-1 tracking-widest"
                       />
                       <Lock className="absolute right-0 top-7 w-4 h-4 text-slate-400 -translate-y-1/2" />
                    </div>

                    <div className="relative">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                       <input 
                         type="email" 
                         defaultValue="manager@botikaplus.com" 
                         disabled={!isEditing}
                         className="w-full pb-2 border-b-2 border-slate-200 focus:border-brand-green focus:outline-none bg-transparent text-slate-800 font-semibold disabled:text-slate-500 transition-colors pl-1"
                       />
                       <Mail className="absolute right-0 top-7 w-4 h-4 text-slate-400 -translate-y-1/2" />
                    </div>

                    <div className="relative">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Full Name</label>
                       <input 
                         type="text" 
                         defaultValue="Juan Dela Cruz" 
                         disabled={!isEditing}
                         className="w-full pb-2 border-b-2 border-slate-200 focus:border-brand-green focus:outline-none bg-transparent text-slate-800 font-semibold disabled:text-slate-500 transition-colors pl-1"
                       />
                       <User className="absolute right-0 top-7 w-4 h-4 text-slate-400 -translate-y-1/2" />
                    </div>
                 </div>

                 {/* Right Side Form Fields */}
                 <div className="space-y-6">
                    <div className="relative">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                       <input 
                         type="tel" 
                         defaultValue="+63 912 345 6789" 
                         disabled={!isEditing}
                         className="w-full pb-2 border-b-2 border-slate-200 focus:border-brand-green focus:outline-none bg-transparent text-slate-800 font-semibold disabled:text-slate-500 transition-colors pl-1"
                       />
                       <Phone className="absolute right-0 top-7 w-4 h-4 text-slate-400 -translate-y-1/2" />
                    </div>

                    <div className="relative">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Address</label>
                       <input 
                         type="text" 
                         defaultValue="TayTay, Rizal" 
                         disabled={!isEditing}
                         className="w-full pb-2 border-b-2 border-slate-200 focus:border-brand-green focus:outline-none bg-transparent text-slate-800 font-semibold disabled:text-slate-500 transition-colors pl-1"
                       />
                       <MapPin className="absolute right-0 top-7 w-4 h-4 text-slate-400 -translate-y-1/2" />
                    </div>

                    <div className="flex gap-4">
                       <div className="relative flex-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Date of Birth</label>
                          <input 
                            type="text" 
                            defaultValue="Oct 28, 2004" 
                            disabled={!isEditing}
                            className="w-full pb-2 border-b-2 border-slate-200 focus:border-brand-green focus:outline-none bg-transparent text-slate-800 font-semibold disabled:text-slate-500 transition-colors pl-1"
                          />
                          <Calendar className="absolute right-0 top-7 w-4 h-4 text-slate-400 -translate-y-1/2" />
                       </div>
                       <div className="relative w-16">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Age</label>
                          <input 
                            type="text" 
                            defaultValue="19" 
                            disabled
                            className="w-full pb-2 border-b-2 border-slate-200 bg-transparent text-slate-800 font-semibold disabled:text-slate-500 transition-colors pl-1 text-center"
                          />
                       </div>
                    </div>

                    <div className="relative">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Gender</label>
                       <select 
                         disabled={!isEditing}
                         className="w-full pb-2 border-b-2 border-slate-200 focus:border-brand-green focus:outline-none bg-transparent text-slate-800 font-semibold disabled:text-slate-500 transition-colors pl-1 appearance-none cursor-pointer"
                         defaultValue="Male"
                       >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                       </select>
                       <Users className="absolute right-0 top-7 w-4 h-4 text-slate-400 -translate-y-1/2 pointer-events-none" />
                    </div>
                 </div>
               </div>

               {/* Action Area */}
               <div className="mt-12 flex justify-end mb-4">
                  <button 
                    disabled={!isEditing}
                    className="px-8 py-3 bg-brand-green hover:bg-green-700 text-white font-bold rounded-full shadow-lg shadow-brand-green/30 transition-all disabled:opacity-50 disabled:shadow-none min-w-[120px]"
                  >
                    Save Changes
                  </button>
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
