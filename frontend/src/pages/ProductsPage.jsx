// =============================================================
// src/pages/ProductsPage.jsx
// Purpose: Professional products/materials page.
//          Manage products, stock add, stock purchase history.
// =============================================================

import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Btn,
  Badge,
  Card,
  Modal,
  Table,
  SearchBar,
  Input,
  Select,
  FormGrid,
  FormActions,
  StatCard,
  ActionGroup,
} from "../components/UI";
import { C, CLIENT_CONFIG, fmt, today } from "../utils/constants";

const UNITS = [
  "Bag",
  "Kg",
  "Ton",
  "CFT",
  "Piece",
  "Sheet",
  "Meter",
  "Litre",
  "Box",
  "Roll",
];

const API_BASE = "http://localhost:5000/api";

export default function ProductsPage() {
  const {
    products,
    fetchProducts,
    stockEntries,
    fetchStockEntries,
    API_URL,
    productsLoading,
    productsError,
  } = useAppContext();

  const BASE_URL = API_URL || API_BASE;

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(false);

  const blankForm = {
    name: "",
    category: CLIENT_CONFIG.categories?.[0] || "Cement",
    price: "",
    stock: "",
    minStock: "",
    unit: "Bag",
    supplier: "",
  };

  const blankStockForm = {
    qty: "",
    purchasePrice: "",
    entryDate: today(),
    note: "",
  };

  const [form, setForm] = useState(blankForm);
  const [stockForm, setStockForm] = useState(blankStockForm);

  const F = (key) => ({
    value: form[key],
    onChange: (value) => setForm((prev) => ({ ...prev, [key]: value })),
  });

  const SF = (key) => ({
    value: stockForm[key],
    onChange: (value) => setStockForm((prev) => ({ ...prev, [key]: value })),
  });

  const safeProducts = Array.isArray(products) ? products : [];
  const safeStockEntries = Array.isArray(stockEntries) ? stockEntries : [];

  const categories = ["All", ...(CLIENT_CONFIG.categories || [])];

  const filteredProducts = safeProducts
    .filter((p) => catFilter === "All" || p.category === catFilter)
    .filter((p) => {
      const searchText = search.toLowerCase();

      return (
        p.name?.toLowerCase().includes(searchText) ||
        p.category?.toLowerCase().includes(searchText) ||
        p.supplier?.toLowerCase().includes(searchText)
      );
    });

  const lowStockProducts = safeProducts.filter(
    (p) => Number(p.stock) <= Number(p.minStock)
  );

  const totalInventoryValue = safeProducts.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
    0
  );

  const totalStockPurchase = safeStockEntries.reduce(
    (sum, entry) => sum + Number(entry.totalAmount || 0),
    0
  );

  const totalStockQty = safeStockEntries.reduce(
    (sum, entry) => sum + Number(entry.qty || 0),
    0
  );

  const stockStatus = (product) => {
    const stock = Number(product.stock || 0);
    const minStock = Number(product.minStock || 0);

    if (stock <= 0) return { label: "Out of Stock", color: "danger" };
    if (stock <= minStock) return { label: "Low Stock", color: "danger" };
    return { label: "In Stock", color: "success" };
  };

  // =============================================================
  // PRODUCT MODAL
  // =============================================================
  const openAdd = () => {
    setForm(blankForm);
    setModal("add");
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || "",
      category: product.category || CLIENT_CONFIG.categories?.[0] || "Cement",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      minStock: String(product.minStock ?? ""),
      unit: product.unit || "Bag",
      supplier: product.supplier || "",
    });

    setModal(product);
  };

  const closeModal = () => {
    setModal(null);
    setForm(blankForm);
  };

  // =============================================================
  // SAVE PRODUCT
  // =============================================================
  const handleSave = async () => {
    if (!form.name || !form.category || !form.price || !form.stock || !form.unit) {
      alert("Product name, category, price, stock and unit are required");
      return;
    }

    if (Number(form.price) < 0 || Number(form.stock) < 0 || Number(form.minStock || 0) < 0) {
      alert("Price, stock and minimum stock cannot be negative");
      return;
    }

    const productData = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      minStock: Number(form.minStock || 0),
      unit: form.unit,
      supplier: form.supplier?.trim() || "",
    };

    try {
      let response;

      if (modal === "add") {
        response = await fetch(`${BASE_URL}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } else {
        response = await fetch(`${BASE_URL}/products/${modal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      const data = await response.json();

      if (data.success) {
        closeModal();
        fetchProducts();
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
  };

  // =============================================================
  // DELETE PRODUCT
  // =============================================================
  const handleDelete = async (product) => {
    const ok = confirm(
      `Delete product "${product.name}"?\n\nThis action cannot be undone.`
    );

    if (!ok) return;

    try {
      const response = await fetch(`${BASE_URL}/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchProducts();
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
  };

  // =============================================================
  // STOCK MODAL
  // =============================================================
  const openStockModal = (product) => {
    setStockModal(product);
    setStockForm(blankStockForm);
  };

  const closeStockModal = () => {
    setStockModal(null);
    setStockForm(blankStockForm);
  };

  // =============================================================
  // SAVE STOCK ENTRY
  // =============================================================
  const handleStockSave = async () => {
    if (!stockModal) return;

    if (!stockForm.qty || Number(stockForm.qty) <= 0) {
      alert("Enter valid stock quantity");
      return;
    }

    if (Number(stockForm.purchasePrice || 0) < 0) {
      alert("Purchase price cannot be negative");
      return;
    }

    if (!stockForm.entryDate) {
      alert("Date is required");
      return;
    }

    const stockData = {
      productId: stockModal.id,
      productName: stockModal.name,
      supplier: stockModal.supplier || "",
      qty: Number(stockForm.qty),
      unit: stockModal.unit,
      purchasePrice: Number(stockForm.purchasePrice || 0),
      entryDate: stockForm.entryDate,
      note: stockForm.note?.trim() || "",
    };

    try {
      const response = await fetch(`${BASE_URL}/stock-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockData),
      });

      const data = await response.json();

      if (data.success) {
        closeStockModal();
        fetchProducts();
        fetchStockEntries();
      } else {
        alert(data.message || "Failed to add stock");
      }
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
  };

  const openStockHistory = async () => {
    await fetchStockEntries();
    setHistoryModal(true);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        padding: "28px clamp(18px, 2.4vw, 34px)",
        overflowX: "hidden",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 18,
          marginBottom: 22,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: C.text,
              fontSize: 23,
              fontWeight: 900,
              letterSpacing: "-0.03em",
            }}
          >
            Products
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: C.textMuted,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            Manage materials, stock and prices
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search material, category, supplier..."
          />

          <Btn onClick={openStockHistory} variant="ghost">
            Stock Purchase History
          </Btn>

          <Btn onClick={openAdd}>Add Product</Btn>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          icon="PRD"
          label="TOTAL PRODUCTS"
          value={safeProducts.length}
          sub={`${filteredProducts.length} currently visible`}
          color={C.info}
        />

        <StatCard
          icon="LOW"
          label="LOW STOCK"
          value={lowStockProducts.length}
          sub={lowStockProducts.length ? "Needs attention" : "All stock healthy"}
          color={lowStockProducts.length ? C.danger : C.success}
        />

        <StatCard
          icon="VAL"
          label="INVENTORY VALUE"
          value={fmt(totalInventoryValue)}
          sub="Selling value estimate"
          color={C.accent}
        />

        <StatCard
          icon="PUR"
          label="STOCK PURCHASE"
          value={fmt(totalStockPurchase)}
          sub={`${safeStockEntries.length} stock entries`}
          color={C.success}
        />
      </div>

      {/* Loading / Error */}
      {productsLoading && (
        <div
          style={{
            color: C.textSub,
            marginBottom: 12,
            background: C.surface,
            border: `1px solid ${C.border}`,
            padding: "10px 14px",
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          Loading products...
        </div>
      )}

      {productsError && (
        <div
          style={{
            background: "#7f1d1d22",
            border: "1px solid #ef444455",
            color: "#fca5a5",
            padding: "10px 14px",
            borderRadius: 12,
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {productsError}
        </div>
      )}

      {/* Category Filter */}
      <Card style={{ marginBottom: 18, padding: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: C.textMuted,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.08em",
              marginRight: 4,
            }}
          >
            CATEGORY
          </span>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCatFilter(category)}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                border:
                  catFilter === category
                    ? `1px solid ${C.accent}`
                    : `1px solid ${C.border}`,
                cursor: "pointer",
                background: catFilter === category ? C.accent : C.surfaceHigh,
                color: catFilter === category ? "#ffffff" : C.textSub,
                transition: "all 0.15s",
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                color: C.text,
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              Material List
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                color: C.textMuted,
                fontSize: 12,
              }}
            >
              Showing {filteredProducts.length} of {safeProducts.length} products
            </p>
          </div>
        </div>

        <Table
          cols={[
            {
              key: "name",
              label: "PRODUCT",
              minWidth: 240,
              wrap: true,
              render: (value, row) => (
                <div>
                  <div
                    style={{
                      fontWeight: 900,
                      color: C.text,
                      lineHeight: 1.25,
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      marginTop: 3,
                    }}
                  >
                    Supplier: {row.supplier || "Not added"}
                  </div>
                </div>
              ),
            },
            {
              key: "category",
              label: "CATEGORY",
              minWidth: 110,
              render: (value) => <Badge color="info">{value}</Badge>,
            },
            {
              key: "price",
              label: "SELLING RATE",
              align: "right",
              minWidth: 135,
              render: (value, row) => (
                <span style={{ color: C.text, fontWeight: 800 }}>
                  {fmt(value)}/{row.unit}
                </span>
              ),
            },
            {
              key: "stock",
              label: "AVAILABLE STOCK",
              align: "right",
              minWidth: 150,
              render: (value, row) => {
                const isLow = Number(value) <= Number(row.minStock);

                return (
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: isLow ? C.danger : C.success,
                        fontWeight: 900,
                      }}
                    >
                      {value} {row.unit}
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 11 }}>
                      Min: {row.minStock || 0} {row.unit}
                    </div>
                  </div>
                );
              },
            },
            {
              key: "id",
              label: "STATUS",
              minWidth: 125,
              render: (_, row) => {
                const status = stockStatus(row);

                return <Badge color={status.color}>{status.label}</Badge>;
              },
            },
            {
              key: "id",
              label: "ACTIONS",
              align: "right",
              minWidth: 250,
              render: (_, row) => (
                <ActionGroup>
                  <Btn
                    onClick={() => openStockModal(row)}
                    variant="success"
                    size="sm"
                    style={{
                      minWidth: 92,
                      height: 34,
                      padding: "0 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Add Stock
                  </Btn>

                  <Btn
                    onClick={() => openEdit(row)}
                    variant="ghost"
                    size="sm"
                    style={{
                      minWidth: 58,
                      height: 34,
                      padding: "0 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Edit
                  </Btn>

                  <Btn
                    onClick={() => handleDelete(row)}
                    variant="danger"
                    size="sm"
                    style={{
                      minWidth: 70,
                      height: 34,
                      padding: "0 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Delete
                  </Btn>
                </ActionGroup>
              ),
            },
          ]}
          rows={filteredProducts}
          emptyMsg="No products found"
        />
      </Card>

      {/* Add/Edit Product Modal */}
      {modal && (
        <Modal
          title={modal === "add" ? "Add New Product" : "Edit Product"}
          onClose={closeModal}
          width={650}
        >
          <div
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
              color: C.textSub,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            Add product details exactly like shop material register. Selling price is
            used during billing, and minimum stock is used for low-stock alerts.
          </div>

          <FormGrid>
            <Input
              label="Material / Product Name *"
              {...F("name")}
              placeholder="Example: Birla Cement 50kg"
              style={{ gridColumn: "1/-1" }}
            />

            <Select
              label="Category *"
              {...F("category")}
              options={(CLIENT_CONFIG.categories || []).map((category) => ({
                value: category,
                label: category,
              }))}
            />

            <Select
              label="Unit *"
              {...F("unit")}
              options={UNITS.map((unit) => ({
                value: unit,
                label: unit,
              }))}
            />

            <Input
              label="Selling Rate / Unit (₹) *"
              {...F("price")}
              type="number"
              placeholder="Example: 420"
            />

            <Input
              label="Current Stock *"
              {...F("stock")}
              type="number"
              placeholder="Example: 200"
            />

            <Input
              label="Minimum Stock Alert"
              {...F("minStock")}
              type="number"
              placeholder="Example: 50"
            />

            <Input
              label="Supplier Name"
              {...F("supplier")}
              placeholder="Example: ACC Ltd"
              style={{ gridColumn: "1/-1" }}
            />
          </FormGrid>

          <FormActions
            onCancel={closeModal}
            onSave={handleSave}
            saveLabel={modal === "add" ? "Add Product" : "Save Changes"}
          />
        </Modal>
      )}

      {/* Stock Entry Modal */}
      {stockModal && (
        <Modal
          title={`Add Stock - ${stockModal.name}`}
          onClose={closeStockModal}
          width={560}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                style={{
                  color: C.textMuted,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                CURRENT STOCK
              </div>
              <div style={{ color: C.accent, fontWeight: 900, fontSize: 22 }}>
                {stockModal.stock} {stockModal.unit}
              </div>
            </div>

            <div
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                style={{
                  color: C.textMuted,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                SUPPLIER
              </div>
              <div style={{ color: C.text, fontWeight: 800, fontSize: 14 }}>
                {stockModal.supplier || "Not added"}
              </div>
            </div>
          </div>

          <FormGrid>
            <Input
              label={`Quantity Received (${stockModal.unit}) *`}
              {...SF("qty")}
              type="number"
              placeholder="Example: 100"
            />

            <Input
              label="Purchase Rate / Unit (₹)"
              {...SF("purchasePrice")}
              type="number"
              placeholder="Example: 350"
            />

            <Input label="Purchase Date *" {...SF("entryDate")} type="date" />

            <Input
              label="Note"
              {...SF("note")}
              placeholder="Example: new stock received"
            />
          </FormGrid>

          <div
            style={{
              background: C.surfaceHigh,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 15,
              marginTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span style={{ color: C.textSub }}>Purchase Total</span>
              <span style={{ color: C.accent, fontWeight: 900 }}>
                {fmt(
                  Number(stockForm.qty || 0) *
                    Number(stockForm.purchasePrice || 0)
                )}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.textSub }}>Stock After Save</span>
              <span style={{ color: C.success, fontWeight: 900 }}>
                {Number(stockModal.stock) + Number(stockForm.qty || 0)}{" "}
                {stockModal.unit}
              </span>
            </div>
          </div>

          <FormActions
            onCancel={closeStockModal}
            onSave={handleStockSave}
            saveLabel="Save Stock Entry"
          />
        </Modal>
      )}

      {/* Stock History Modal */}
      {historyModal && (
        <Modal
          title="Stock Purchase History"
          onClose={() => setHistoryModal(false)}
          width={1050}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <StatCard
              icon="ENT"
              label="TOTAL ENTRIES"
              value={safeStockEntries.length}
              color={C.info}
            />

            <StatCard
              icon="QTY"
              label="TOTAL QUANTITY"
              value={totalStockQty}
              sub="All units combined"
              color={C.success}
            />

            <StatCard
              icon="VAL"
              label="TOTAL PURCHASE"
              value={fmt(totalStockPurchase)}
              color={C.accent}
            />
          </div>

          <Card>
            <h3
              style={{
                margin: "0 0 14px",
                color: C.text,
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              Recent Stock Entries
            </h3>

            <Table
              cols={[
                {
                  key: "entryDate",
                  label: "DATE",
                  render: (value) => {
                    if (!value) return "-";
                    return String(value).slice(0, 10);
                  },
                },
                {
                  key: "productName",
                  label: "MATERIAL",
                  render: (value, row) => (
                    <div>
                      <div style={{ color: C.text, fontWeight: 900 }}>
                        {value}
                      </div>
                      <div style={{ color: C.textMuted, fontSize: 11 }}>
                        Supplier: {row.supplier || "Not added"}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "qty",
                  label: "QTY RECEIVED",
                  align: "right",
                  render: (value, row) => (
                    <span style={{ color: C.success, fontWeight: 900 }}>
                      +{value} {row.unit}
                    </span>
                  ),
                },
                {
                  key: "purchasePrice",
                  label: "PURCHASE RATE",
                  align: "right",
                  render: (value) => fmt(value || 0),
                },
                {
                  key: "totalAmount",
                  label: "TOTAL AMOUNT",
                  align: "right",
                  render: (value) => (
                    <span style={{ color: C.accent, fontWeight: 900 }}>
                      {fmt(value || 0)}
                    </span>
                  ),
                },
                {
                  key: "note",
                  label: "NOTE",
                  render: (value) => (
                    <span style={{ color: C.textSub, fontSize: 12 }}>
                      {value || "-"}
                    </span>
                  ),
                },
              ]}
              rows={safeStockEntries}
              emptyMsg="No stock history found"
            />
          </Card>
        </Modal>
      )}
    </div>
  );
}
