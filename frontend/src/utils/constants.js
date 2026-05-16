// =============================================================
// src/utils/constants.js
// Purpose: Central config, theme colors, sample data, and
//          utility functions used across the entire app.
//          Edit CLIENT_CONFIG here for each new client.
// =============================================================

// ─── CLIENT CONFIG ────────────────────────────────────────────
// Only edit this block when customizing for a new client.
export const CLIENT_CONFIG = {
  shopName:     "Shraddha Traders",
  tagline:      "Wholesale & Retail Building Materials",
  logo:         "ST",
  gstin:        "27XXXXX0000X1ZX",
  phone:        "9800000000",
  address:      "Main Market Road, Your City",
  primaryColor: "#c9a227",
  gstRate:      18,

  paymentTypes: ["Cash", "UPI", "Credit", "Cheque"],

  categories: [
    "Cement", "Steel", "Bricks", "Sand", "Aggregate",
    "Wood", "Plumbing", "Paint", "Tiles", "Other",
  ],

  features: {
    gstInvoice:       true,
    whatsappReceipt:  true,
    creditManagement: true,
    supplierModule:   true,
    reportsPage:      true,
  },

  credentials: { username: "shraddha", password: "shraddha@2025" },
};

// ─── THEME ────────────────────────────────────────────────────
// Derived from CLIENT_CONFIG.primaryColor so the whole app
// recolors by changing just one hex value above.
export const C = {
  bg:          "var(--bg)",
  sidebar:     "#07111f",
  sidebarHigh: "#0b1220",
  sidebarText: "#f8fafc",
  sidebarSub:  "#cbd5e1",
  surface:     "var(--surface)",
  surfaceHigh: "var(--surface-high)",
  surfaceSoft: "var(--surface-high)",
  field:       "var(--card)",
  card:        "var(--card)",
  border:      "var(--border)",
  borderSoft:  "var(--border)",
  accent:      "var(--accent)",
  accentHover: "var(--accent-hover)",
  accentSoft:  "var(--accent-glow)",
  accentGlow:  "var(--accent-glow)",
  success:     "var(--success)",
  danger:      "var(--danger)",
  info:        "var(--info)",
  warning:     "var(--warning)",
  purple:      "var(--purple)",
  text:        "var(--text)",
  textSub:     "var(--text-sub)",
  textMuted:   "var(--text-muted)",
  shadow:      "var(--shadow)",
  shadowSoft:  "var(--shadow-soft)",
};

// ─── UNIT OPTIONS ─────────────────────────────────────────────
export const UNITS = [
  "Bag", "Kg", "Ton", "CFT", "Piece",
  "Sheet", "Meter", "Litre", "Box", "Roll",
];

// ─── UTILITY FUNCTIONS ────────────────────────────────────────

/** Format a number as Indian Rupee string. E.g. 10000 → "₹10,000" */
export const fmt = (n) =>
  "₹" + Number(n).toLocaleString("en-IN");

/** Format a number with GST applied. */
export const fmtGST = (n) =>
  "₹" + (Number(n) * (1 + CLIENT_CONFIG.gstRate / 100)).toLocaleString("en-IN");

/** Returns today's date as YYYY-MM-DD string. */
export const today = () => new Date().toISOString().split("T")[0];

/** Generate a random 4-digit numeric ID. */
export const genId = () => Math.floor(Math.random() * 9000) + 1000;

// ─── SAMPLE / SEED DATA ───────────────────────────────────────
// Replace these arrays with real data from Firebase/API in production.

export const INIT_PRODUCTS = [
  { id:1, name:"Portland Cement (50kg)", category:"Cement",    price:420,  stock:850,   minStock:100,  unit:"Bag",   supplier:"ACC Ltd"   },
  { id:2, name:"TMT Steel Bar 12mm",     category:"Steel",     price:68,   stock:2400,  minStock:500,  unit:"Kg",    supplier:"TATA Steel" },
  { id:3, name:"Red Clay Bricks",        category:"Bricks",    price:8,    stock:45000, minStock:5000, unit:"Piece", supplier:"Brick Co."  },
  { id:4, name:"River Sand (CFT)",       category:"Sand",      price:55,   stock:320,   minStock:80,   unit:"CFT",   supplier:"Sand Corp"  },
  { id:5, name:"20mm Blue Metal",        category:"Aggregate", price:48,   stock:180,   minStock:60,   unit:"CFT",   supplier:"Quarry Inc" },
  { id:6, name:"Plywood 18mm (8x4ft)",   category:"Wood",      price:1850, stock:75,    minStock:20,   unit:"Sheet", supplier:"Wood Works" },
  { id:7, name:"PVC Pipe 4inch",         category:"Plumbing",  price:320,  stock:12,    minStock:30,   unit:"Piece", supplier:"PVC Co"     },
  { id:8, name:"White Cement (40kg)",    category:"Cement",    price:680,  stock:95,    minStock:40,   unit:"Bag",   supplier:"ACC Ltd"    },
];

export const INIT_CUSTOMERS = [
  { id:1, name:"Raj Construction Pvt Ltd", phone:"9876543210", email:"raj@const.com",    address:"12 Main Rd, Chennai",          type:"Wholesale", creditLimit:500000, creditUsed:125000 },
  { id:2, name:"Suresh Builders",          phone:"9876543211", email:"suresh@build.com", address:"5 Park Ave, Mumbai",           type:"Wholesale", creditLimit:300000, creditUsed:87500  },
  { id:3, name:"Meena Hardware",           phone:"9876543212", email:"meena@hw.com",     address:"8 Cross St, Pune",             type:"Retail",    creditLimit:50000,  creditUsed:12000  },
  { id:4, name:"Kumar & Sons",             phone:"9876543213", email:"kumar@sons.com",   address:"22 Ring Rd, Delhi",            type:"Retail",    creditLimit:75000,  creditUsed:0      },
  { id:5, name:"APC Infrastructure",       phone:"9876543214", email:"apc@infra.com",    address:"1 Industrial Area, Hyderabad", type:"Wholesale", creditLimit:800000, creditUsed:340000 },
];

export const INIT_SUPPLIERS = [
  { id:1, name:"ACC Ltd",    phone:"8800112233", email:"acc@cement.com",  address:"Industrial Zone, Mumbai",  category:"Cement",           balance:45000  },
  { id:2, name:"TATA Steel", phone:"8800112234", email:"tata@steel.com",  address:"Steel City, Jamshedpur",   category:"Steel",            balance:120000 },
  { id:3, name:"Brick Co.",  phone:"8800112235", email:"brick@co.com",    address:"Pottery Rd, Agra",         category:"Bricks",           balance:18000  },
  { id:4, name:"Sand Corp",  phone:"8800112236", email:"sand@corp.com",   address:"River Side, Kolkata",      category:"Sand & Aggregate", balance:9000   },
  { id:5, name:"Wood Works", phone:"8800112237", email:"wood@works.com",  address:"Forest Rd, Bangalore",     category:"Wood",             balance:55000  },
];

export const INIT_SALES = [
  { id:1001, customer:"Raj Construction Pvt Ltd", customerId:1, date:"2025-04-10", items:[], total:125000, paid:100000, type:"Credit", status:"Partial" },
  { id:1002, customer:"Meena Hardware",           customerId:3, date:"2025-04-12", items:[], total:18500,  paid:18500,  type:"Cash",   status:"Paid"    },
  { id:1003, customer:"Suresh Builders",          customerId:2, date:"2025-04-15", items:[], total:87500,  paid:50000,  type:"Credit", status:"Partial" },
  { id:1004, customer:"APC Infrastructure",       customerId:5, date:"2025-04-18", items:[], total:340000, paid:200000, type:"Credit", status:"Partial" },
  { id:1005, customer:"Kumar & Sons",             customerId:4, date:"2025-04-20", items:[], total:6800,   paid:6800,   type:"Cash",   status:"Paid"    },
];

// ─── NAV ITEMS ────────────────────────────────────────────────
// Builds sidebar navigation; hides items whose feature is disabled.
export const buildNav = () => {
  const all = [
    { id: "dashboard", label: "Dashboard", icon: "H" },
    { id: "products", label: "Products", icon: "P" },
    { id: "customers", label: "Customers", icon: "C" },
    { id: "suppliers", label: "Suppliers", icon: "S", feature: "supplierModule" },
    { id: "billing", label: "Billing", icon: "$" },
    { id: "credit", label: "Pending Payments", icon: "%", feature: "creditManagement" },
    { id: "expenses", label: "Expenses", icon: "-" },
    { id: "reports", label: "Reports", icon: "R", feature: "reportsPage" },
    { id: "backup", label: "Backup", icon: "#" },
    { id: "settings", label: "Shop Settings", icon: "*" },
   
  ];

  return all.filter((nav) => !nav.feature || CLIENT_CONFIG.features[nav.feature]);
};
