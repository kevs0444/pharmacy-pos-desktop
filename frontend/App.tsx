import { useState } from "react";
import { Sidebar, TabType } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Inventory } from "./components/Inventory";
import { Sales } from "./components/Sales";
import { SalesSummary } from "./components/SalesSummary";
import { Orders } from "./components/Orders";
import { POS } from "./components/POS";
import { Admin } from "./components/Admin";
import { Login, UserRole } from "./components/Login";
import { Profile } from "./components/Profile";
import { InventoryChangeRequests } from "./components/InventoryChangeRequests";

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
        {/* Global Navbar removed in favor of dense spreadsheet headers */}
        {activeTab === "Cashiering" && <POS />}
        {activeTab === "Dashboard" && <Dashboard userRole={userRole} />}
        {activeTab === "Branch" && <Admin />}
        {activeTab === "Profile" && <Profile />}
        {activeTab === "Inventory" && <Inventory />}
        {activeTab === "Pending Changes" && <InventoryChangeRequests />}
        {activeTab === "Sales" && <Sales />}
        {activeTab === "Sales Summary" && <SalesSummary />}
        {activeTab === "Purchasing" && <Orders />}
        {/* Reporting routes can map back to sales or dashboard for now */}
        {activeTab === "Reporting" && <Dashboard userRole={userRole} />}
      </div>
    </div>
  );
}

export default App;
