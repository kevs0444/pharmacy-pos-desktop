import { useState } from "react";
import { User, Lock } from "lucide-react";
import loginImage from "../assets/images/login image.png";

export type UserRole = "Admin" | "Manager" | "Staff";

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine role statically based on the username they type
    const userLower = username.toLowerCase().trim();
    let computedRole: UserRole = "Staff"; // Default fallback
    
    if (userLower === "admin") computedRole = "Admin";
    else if (userLower === "manager") computedRole = "Manager";
    else if (userLower === "staff") computedRole = "Staff";

    onLogin(computedRole);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white overflow-hidden">
      
      {/* Left Side - Brand Context (Full Height Bleed) */}
      <div className="w-full md:w-5/12 lg:w-1/2 bg-brand-blue p-8 md:p-12 lg:p-16 text-white flex flex-col justify-center items-center relative overflow-hidden shrink-0 min-h-[40vh] md:min-h-screen">
        
        {/* Brand Logo Container Plate */}
        <div className="bg-white px-10 py-10 rounded-3xl mb-8 shadow-2xl shadow-black/20 z-10 flex items-center justify-center w-80 h-48 border-t-4 border-brand-green overflow-hidden">
           <img 
               src={loginImage} 
               alt="BotikaPlus Logo" 
               className="w-full h-full object-contain mix-blend-multiply"
            />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 z-10 text-center text-white tracking-tight">Ang Iyong Pinagkakatiwalaang Botika</h2>
        <p className="text-blue-100/80 text-center z-10 max-w-sm text-sm md:text-base leading-relaxed">
          Mag-login upang ma-access ang inyong POS, makita ang mga benta araw-araw, at ma-manage ang stock ng inyong mga gamot.
        </p>
      </div>

      {/* Right Side - Login Form (Full Height Bleed) */}
      <div className="w-full md:w-7/12 lg:w-1/2 p-8 md:p-12 lg:p-24 bg-white flex flex-col justify-center relative min-h-[60vh] md:min-h-screen">
        
        {/* Optional Wave decoration at bottom right for balance */}
        <div className="absolute bottom-0 right-0 w-full h-32 pointer-events-none z-0 opacity-40">
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
             <path fill="var(--color-brand-light)" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="w-full max-w-md mx-auto z-10">
          <div className="mb-12 text-center md:text-left relative">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">Hello,</h2>
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-green tracking-tight leading-tight">Welcome!</h2>
            <div className="mt-6 w-16 h-1.5 bg-brand-blue rounded-full mx-auto md:mx-0"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Username (e.g. staff)"
                className="w-full pl-5 pr-12 py-4 bg-slate-50/50 border-2 border-slate-200/80 rounded-2xl focus:border-brand-green focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-green/10 transition-all text-slate-800 font-semibold placeholder-slate-400 text-base"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
            </div>
            
            <div className="relative group">
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-5 pr-[4.5rem] py-4 bg-slate-50/50 border-2 border-slate-200/80 rounded-2xl focus:border-brand-green focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-green/10 transition-all text-slate-800 font-semibold placeholder-slate-400 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-[2px] border-slate-300 cursor-pointer hover:border-slate-500 transition-colors flex items-center justify-center"></div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-brand-blue hover:bg-blue-900 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/40 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-brand-blue/30 text-lg"
              >
                Log in
              </button>
            </div>
          </form>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-center md:justify-between text-sm font-semibold text-slate-500 gap-4">
            <a href="#" className="hover:text-brand-green transition-colors">No Account? Register Here</a>
            <a href="#" className="hover:text-brand-green transition-colors">Forgot Password?</a>
          </div>
        </div>
      </div>
    </div>
  );
}
