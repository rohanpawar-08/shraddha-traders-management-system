// =============================================================
// src/App.jsx
// Purpose: Root component. Manages login state and renders the
// correct page based on sidebar navigation selection.
// =============================================================

import { useState, useEffect } from "react";
import { AppProvider, useAppContext } from "./context/AppContext";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import CustomersPage from "./pages/CustomersPage";
import SuppliersPage from "./pages/SuppliersPage";
import BillingPage from "./pages/BillingPage";
import CreditPage from "./pages/CreditPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import BackupPage from "./pages/BackupPage";
import SettingsPage from "./pages/SettingsPage";


import Sidebar from "./components/Sidebar";
import { C } from "./utils/constants";

function AppInner({ onLogout }) {
  const [page, setPage] = useState("dashboard");
  const { lowStockCount } = useAppContext();

  const pages = {
    dashboard: <Dashboard />,
    products: <ProductsPage />,
    customers: <CustomersPage />,
    suppliers: <SuppliersPage />,
    billing: <BillingPage />,
    credit: <CreditPage />,
    expenses: <ExpensesPage />,
    reports: <ReportsPage />,
    backup: <BackupPage />,
    settings: <SettingsPage />,
    
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background: C.bg,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: C.text,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Sidebar
        active={page}
        setActive={setPage}
        onLogout={onLogout}
        alertCount={lowStockCount}
      />

      <main
        style={{
          flex: 1,
          width: "100%",
          minWidth: 0,
          overflowY: "auto",
          overflowX: "hidden",
          boxSizing: "border-box",
        }}
      >
        {pages[page] || (
          <div style={{ padding: 40, color: C.textMuted }}>
            Page not found
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AppProvider>
      <AppInner onLogout={handleLogout} />
    </AppProvider>
  );
}
