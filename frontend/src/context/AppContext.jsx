// =============================================================
// src/context/AppContext.jsx
// Purpose: Global state for products, customers, suppliers,
//          sales, payments, expenses, stock entries, and shop settings.
// =============================================================

import { createContext, useContext, useEffect, useState } from "react";

import {
  INIT_PRODUCTS,
  INIT_CUSTOMERS,
  INIT_SUPPLIERS,
  INIT_SALES,
} from "../utils/constants";

const API_URL = "http://localhost:5000/api";

const AppContext = createContext(null);

const defaultShopSettings = {
  shopName: "Shraddha Traders",
  tagline: "Wholesale & Retail Building Materials",
  logo: "ST",
  phone: "9800000000",
  address: "Main Market Road, Your City",
  gstin: "27XXXXX0000X1ZX",
  ownerName: "",
  email: "",
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  const [products, setProducts] = useState(INIT_PRODUCTS || []);
  const [customers, setCustomers] = useState(INIT_CUSTOMERS || []);
  const [suppliers, setSuppliers] = useState(INIT_SUPPLIERS || []);
  const [sales, setSales] = useState(INIT_SALES || []);

  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stockEntries, setStockEntries] = useState([]);

  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");

  const [shopSettings, setShopSettings] = useState(defaultShopSettings);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const updateShopSettings = (newSettings) => {
    setShopSettings((prev) => {
      const updated = {
        ...prev,
        ...newSettings,
      };

      return updated;
    });
  };

  // =============================================================
  // SETTINGS
  // =============================================================
  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsError("");

      const response = await fetch(`${API_URL}/settings`);
      const data = await response.json();

      if (data.success) {
        setShopSettings({
          ...defaultShopSettings,
          ...(data.settings || {}),
        });
      } else {
        setSettingsError(data.message || "Failed to load settings");
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setSettingsError("Backend server not connected");
    } finally {
      setSettingsLoading(false);
    }
  };

  // =============================================================
  // PRODUCTS
  // =============================================================
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");

      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
      } else {
        setProductsError(data.message || "Failed to load products");
      }
    } catch (error) {
      console.error(error);
      setProductsError("Backend server not connected");
    } finally {
      setProductsLoading(false);
    }
  };

  // =============================================================
  // CUSTOMERS
  // =============================================================
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  // =============================================================
  // SUPPLIERS
  // =============================================================
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/suppliers`);
      const data = await response.json();

      if (data.success) {
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  // =============================================================
  // SALES
  // =============================================================
  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_URL}/sales`);
      const data = await response.json();

      if (data.success) {
        setSales(data.sales || []);
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    }
  };

  // =============================================================
  // PAYMENTS
  // =============================================================
  const fetchPayments = async () => {
    try {
      const response = await fetch(`${API_URL}/payments`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    }
  };

  // =============================================================
  // EXPENSES
  // =============================================================
  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  // =============================================================
  // STOCK ENTRIES
  // =============================================================
  const fetchStockEntries = async () => {
    try {
      const response = await fetch(`${API_URL}/stock-entries`);
      const data = await response.json();

      if (data.success) {
        setStockEntries(data.stockEntries || data.entries || []);
      }
    } catch (error) {
      console.error("Failed to fetch stock entries:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchProducts();
    fetchCustomers();
    fetchSuppliers();
    fetchSales();
    fetchPayments();
    fetchExpenses();
    fetchStockEntries();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const lowStockCount = products.filter(
    (p) => Number(p.stock) <= Number(p.minStock)
  ).length;

  return (
    <AppContext.Provider
      value={{
        API_URL,

        theme,
        toggleTheme,

        shopSettings,
        setShopSettings,
        updateShopSettings,
        fetchSettings,
        settingsLoading,
        settingsError,

        products,
        setProducts,
        fetchProducts,
        productsLoading,
        productsError,

        customers,
        setCustomers,
        fetchCustomers,

        suppliers,
        setSuppliers,
        fetchSuppliers,

        sales,
        setSales,
        fetchSales,

        payments,
        setPayments,
        fetchPayments,

        expenses,
        setExpenses,
        fetchExpenses,

        stockEntries,
        setStockEntries,
        fetchStockEntries,

        lowStockCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error("useAppContext must be used inside <AppProvider>");
  }

  return ctx;
}
