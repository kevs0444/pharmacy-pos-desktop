import { useState } from "react";
import { Sidebar, TabType } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { Inventory } from "./components/Inventory";
import { Sales } from "./components/Sales";
import { Orders } from "./components/Orders";
import { POS } from "./components/POS";
import { Login, UserRole } from "./components/Login";
import { Profile } from "./components/Profile";
import { Admin } from "./components/Admin";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("Dashboard");
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  if (!userRole) {
    return <Login onLogin={(role) => setUserRole(role)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setUserRole(null)} userRole={userRole} />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Navbar onLogout={() => setUserRole(null)} onNavigate={setActiveTab} userRole={userRole} />
        {activeTab === "POS Terminal" && <POS />}
        {activeTab === "Dashboard" && <Dashboard userRole={userRole} />}
        {activeTab === "Admin Panel" && <Admin />}
        {activeTab === "Profile" && <Profile />}
        {activeTab === "Inventory" && <Inventory />}
        {activeTab === "Sales" && <Sales />}
        {activeTab === "Orders" && <Orders />}
        {/* Reporting routes can map back to sales or dashboard for now */}
        {activeTab === "Reporting" && <Dashboard userRole={userRole} />}
      </div>
    </div>
  );
}

export default App;
