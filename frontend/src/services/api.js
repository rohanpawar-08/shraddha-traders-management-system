// =============================================================
// src/services/api.js
// Purpose: All data-fetching and persistence logic lives here.
//          Currently uses in-memory state (no backend).
//          When you connect Firebase, replace each function body
//          with the Firebase SDK call — no other file changes needed.
// =============================================================

// ─── HOW TO CONNECT FIREBASE ──────────────────────────────────
// 1. npm install firebase
// 2. Create src/services/firebase.js with your config (see guide)
// 3. Import { db } from './firebase' here
// 4. Replace each function body with the Firestore call shown below

// import { db } from "./firebase";
// import {
//   collection, getDocs, addDoc, updateDoc,
//   deleteDoc, doc, query, orderBy,
// } from "firebase/firestore";

// ─── PRODUCTS ─────────────────────────────────────────────────

/**
 * Load all products from the database.
 * Firebase version:
 *   const snap = await getDocs(collection(db, "products"));
 *   return snap.docs.map(d => ({ id: d.id, ...d.data() }));
 */
export const fetchProducts = async () => {
  // In-memory: state is already loaded from constants.js
  return [];
};

/**
 * Save a new product.
 * Firebase version:
 *   const ref = await addDoc(collection(db, "products"), data);
 *   return ref.id;
 */
export const createProduct = async (data) => {
  return null;
};

/**
 * Update an existing product.
 * Firebase version:
 *   await updateDoc(doc(db, "products", id), data);
 */
export const updateProduct = async (id, data) => {
  return null;
};

/**
 * Delete a product.
 * Firebase version:
 *   await deleteDoc(doc(db, "products", id));
 */
export const deleteProduct = async (id) => {
  return null;
};

// ─── CUSTOMERS ────────────────────────────────────────────────

export const fetchCustomers = async () => [];

export const createCustomer = async (data) => null;

export const updateCustomer = async (id, data) => null;

export const deleteCustomer = async (id) => null;

// ─── SUPPLIERS ────────────────────────────────────────────────

export const fetchSuppliers = async () => [];

export const createSupplier = async (data) => null;

export const updateSupplier = async (id, data) => null;

export const deleteSupplier = async (id) => null;

// ─── SALES ────────────────────────────────────────────────────

/**
 * Load all sales, most recent first.
 * Firebase version:
 *   const q = query(collection(db, "sales"), orderBy("date", "desc"));
 *   const snap = await getDocs(q);
 *   return snap.docs.map(d => ({ id: d.id, ...d.data() }));
 */
export const fetchSales = async () => [];

export const createSale = async (data) => null;

export const updateSale = async (id, data) => null;
