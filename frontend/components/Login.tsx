import { useState } from "react";
import { User, Lock, Eye, EyeOff, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import loginImage from "../assets/images/login image.png";

export type UserRole = "Admin" | "Manager" | "Staff";

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

type AuthScreen = "login" | "register" | "forgot";

export function Login({ onLogin }: LoginProps) {
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Forgot form
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userLower = username.toLowerCase().trim();
    let computedRole: UserRole = "Staff";
    if (userLower === "admin") computedRole = "Admin";
    else if (userLower === "manager") computedRole = "Manager";
    else if (userLower === "staff") computedRole = "Staff";
    onLogin(computedRole);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setAuthScreen("login");
      setRegName(""); setRegEmail(""); setRegPassword(""); setRegConfirm("");
    }, 2000);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setAuthScreen("login");
      setForgotEmail("");
    }, 2500);
  };

  // Left panel content changes per screen
  const leftPanelText = {
    login: { title: "Your Trusted Pharmacy", desc: "Log in to access your POS, view daily sales reports, and manage your medicine inventory." },
    register: { title: "Join BotikaPlus", desc: "Create your account to start managing your pharmacy operations with our powerful POS system." },
    forgot: { title: "Reset Your Password", desc: "Don't worry! Enter your email and we'll send you instructions to reset your password." },
  };

  const inputClass = "w-full pl-5 pr-12 py-3.5 bg-slate-50/50 border-2 border-slate-200/80 rounded-xl focus:border-brand-green focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-green/10 transition-all text-slate-800 font-semibold placeholder-slate-400 text-sm";

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white overflow-hidden">
      
      {/* Left Side - Brand Context */}
      <div className="w-full md:w-5/12 lg:w-1/2 bg-brand-blue p-6 md:p-10 lg:p-12 text-white flex flex-col justify-center items-center relative overflow-hidden shrink-0 min-h-[30vh] md:min-h-screen">
        
        <div className="bg-white px-8 py-8 rounded-2xl mb-6 shadow-2xl shadow-black/20 z-10 flex items-center justify-center w-64 h-36 md:w-80 md:h-48 border-t-4 border-brand-green overflow-hidden">
           <img 
               src={loginImage} 
               alt="BotikaPlus Logo" 
               className="w-full h-full object-contain mix-blend-multiply"
            />
        </div>
        
        <h2 className="text-xl md:text-2xl font-extrabold mb-3 z-10 text-center text-white tracking-tight">{leftPanelText[authScreen].title}</h2>
        <p className="text-blue-100/80 text-center z-10 max-w-xs text-xs md:text-sm leading-relaxed">
          {leftPanelText[authScreen].desc}
        </p>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full md:w-7/12 lg:w-1/2 p-6 md:p-10 lg:p-16 bg-white flex flex-col justify-center relative min-h-[50vh] md:min-h-screen">
        
        <div className="absolute bottom-0 right-0 w-full h-32 pointer-events-none z-0 opacity-40">
          <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none"><path fill="#e2e8f0" d="M0,128L120,144C240,160,480,192,720,186.7C960,181,1200,139,1320,117.3L1440,96L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path></svg>
        </div>

        <div className="w-full max-w-md mx-auto z-10">

          {/* ===== LOGIN SCREEN ===== */}
          {authScreen === "login" && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="mb-8 text-center md:text-left relative">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">Hello,</h2>
                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-green tracking-tight leading-tight">Welcome!</h2>
                <div className="mt-4 w-14 h-1.5 bg-brand-blue rounded-full mx-auto md:mx-0"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Username (e.g. staff)"
                    className={inputClass}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
                </div>
                
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-5 pr-[4.5rem] py-3.5 bg-slate-50/50 border-2 border-slate-200/80 rounded-xl focus:border-brand-green focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-green/10 transition-all text-slate-800 font-semibold placeholder-slate-400 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-brand-blue hover:bg-blue-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/40 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-brand-blue/30 text-base"
                  >
                    Log in
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-col md:flex-row items-center justify-center md:justify-between text-xs font-semibold text-slate-500 gap-3">
                <button onClick={() => setAuthScreen("register")} className="hover:text-brand-green transition-colors">No Account? Register Here</button>
                <button onClick={() => setAuthScreen("forgot")} className="hover:text-brand-green transition-colors">Forgot Password?</button>
              </div>
            </div>
          )}

          {/* ===== REGISTER SCREEN ===== */}
          {authScreen === "register" && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <button onClick={() => setAuthScreen("login")} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>

              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">Create</h2>
                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-green tracking-tight leading-tight">Account</h2>
                <div className="mt-4 w-14 h-1.5 bg-brand-blue rounded-full mx-auto md:mx-0"></div>
              </div>

              {regSuccess ? (
                <div className="text-center py-12 animate-in zoom-in-95 fade-in duration-300">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">Account Created!</h3>
                  <p className="text-sm text-slate-500 font-medium">Redirecting to login...</p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="relative group">
                    <input type="text" placeholder="Full Name" className={inputClass} value={regName} onChange={e => setRegName(e.target.value)} required />
                    <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
                  </div>

                  <div className="relative group">
                    <input type="email" placeholder="Email Address" className={inputClass} value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
                  </div>

                  <div className="relative group">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full pl-5 pr-[4.5rem] py-3.5 bg-slate-50/50 border-2 border-slate-200/80 rounded-xl focus:border-brand-green focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-green/10 transition-all text-slate-800 font-semibold placeholder-slate-400 text-sm"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      required
                    />
                    <Lock className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none" tabIndex={-1}>
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative group">
                    <input type="password" placeholder="Confirm Password" className={inputClass} value={regConfirm} onChange={e => setRegConfirm(e.target.value)} required />
                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full bg-brand-green hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-xl shadow-brand-green/20 hover:shadow-brand-green/40 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-brand-green/30 text-base">
                      Create Account
                    </button>
                  </div>
                </form>
              )}

              {!regSuccess && (
                <div className="mt-6 text-center text-xs font-semibold text-slate-500">
                  Already have an account? <button onClick={() => setAuthScreen("login")} className="text-brand-blue hover:text-brand-green transition-colors">Log in here</button>
                </div>
              )}
            </div>
          )}

          {/* ===== FORGOT PASSWORD SCREEN ===== */}
          {authScreen === "forgot" && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <button onClick={() => setAuthScreen("login")} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>

              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">Forgot</h2>
                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-green tracking-tight leading-tight">Password?</h2>
                <div className="mt-4 w-14 h-1.5 bg-brand-blue rounded-full mx-auto md:mx-0"></div>
                <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="text-center py-12 animate-in zoom-in-95 fade-in duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-brand-blue" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">Email Sent!</h3>
                  <p className="text-sm text-slate-500 font-medium">Check your inbox for reset instructions.<br/>Redirecting to login...</p>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-5">
                  <div className="relative group">
                    <input type="email" placeholder="Enter your email address" className={inputClass} value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-green transition-colors" />
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full bg-brand-blue hover:bg-blue-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/40 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-brand-blue/30 text-base">
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}

              {!forgotSuccess && (
                <div className="mt-6 text-center text-xs font-semibold text-slate-500">
                  Remember your password? <button onClick={() => setAuthScreen("login")} className="text-brand-blue hover:text-brand-green transition-colors">Log in here</button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
