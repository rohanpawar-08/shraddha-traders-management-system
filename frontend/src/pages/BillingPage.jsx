// =============================================================
// src/pages/BillingPage.jsx
// Purpose: Create invoices, save sales in MySQL backend,
//          reduce product stock, manage credit payment,
//          view invoice, print invoice, WhatsApp receipt.
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
  ActionGroup,
} from "../components/UI";
import { C, CLIENT_CONFIG, fmt, today } from "../utils/constants";

const API_URL = "http://localhost:5000/api";

export default function BillingPage() {
  const {
    products,
    setProducts,
    customers,
    setCustomers,
    sales,
    setSales,
    fetchProducts,
    fetchCustomers,
    fetchSales,
    fetchPayments,
    shopSettings,
  } = useAppContext();

  const shop = {
    ...CLIENT_CONFIG,
    ...shopSettings,
    features: CLIENT_CONFIG.features,
    paymentTypes: CLIENT_CONFIG.paymentTypes,
    gstRate: CLIENT_CONFIG.gstRate,
  };

  const [creating, setCreating] = useState(false);
  const [viewSale, setViewSale] = useState(null);
  const [search, setSearch] = useState("");

  const [custId, setCustId] = useState("");
  const [payType, setPayType] = useState(CLIENT_CONFIG.paymentTypes[0]);
  const [paidAmt, setPaidAmt] = useState("");
  const [date, setDate] = useState(today());
  const [quickCustomerModal, setQuickCustomerModal] = useState(false);
  const [quickCustomerForm, setQuickCustomerForm] = useState({
    name: "",
    phone: "",
    address: "",
    type: "Retail",
  });

  const [items, setItems] = useState([
    {
      productId: "",
      qty: 1,
      price: 0,
      name: "",
      unit: "",
    },
  ]);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0),
    0
  );

  const gstAmt = CLIENT_CONFIG.features.gstInvoice
    ? subtotal * (CLIENT_CONFIG.gstRate / 100)
    : 0;

  const grandTotal = subtotal + gstAmt;

  const customer = customers.find((c) => Number(c.id) === Number(custId));

  const filteredSales = sales.filter((sale) => {
    const customerName = sale.customer || "";
    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      String(sale.id).includes(search)
    );
  });

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        qty: 1,
        price: 0,
        name: "",
        unit: "",
      },
    ]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      if (field === "productId") {
        const selectedProduct = products.find(
          (p) => Number(p.id) === Number(value)
        );

        if (selectedProduct) {
          updated[index].name = selectedProduct.name;
          updated[index].price = Number(selectedProduct.price);
          updated[index].unit = selectedProduct.unit;
        }
      }

      return updated;
    });
  };

  const resetForm = () => {
    setCustId("");
    setPayType(CLIENT_CONFIG.paymentTypes[0]);
    setPaidAmt("");
    setDate(today());
    setQuickCustomerModal(false);
    setQuickCustomerForm({
      name: "",
      phone: "",
      address: "",
      type: "Retail",
    });
    setItems([
      {
        productId: "",
        qty: 1,
        price: 0,
        name: "",
        unit: "",
      },
    ]);
  };

  const resetQuickCustomerForm = () => {
    setQuickCustomerForm({
      name: "",
      phone: "",
      address: "",
      type: "Retail",
    });
  };

  const handleQuickCustomerSave = async () => {
    const name = quickCustomerForm.name.trim();
    const phone = quickCustomerForm.phone.trim();
    const address = quickCustomerForm.address.trim();

    if (!name) {
      alert("Customer name is required");
      return;
    }

    if (!phone) {
      alert("Phone is required");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          email: "",
          address,
          type: quickCustomerForm.type,
          creditLimit: 0,
          creditUsed: 0,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Failed to add customer");
        return;
      }

      if (fetchCustomers) await fetchCustomers();

      setCustId(String(data.customerId));
      setQuickCustomerModal(false);
      resetQuickCustomerForm();
      alert("Customer added successfully");
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
  };

  const createBill = async () => {
    if (!custId) {
      alert("Please select customer");
      return;
    }

    if (!customer) {
      alert("Customer not found");
      return;
    }

    if (items.some((item) => !item.productId)) {
      alert("Please select material/item");
      return;
    }

    if (items.some((item) => Number(item.qty) <= 0)) {
      alert("Quantity must be greater than 0");
      return;
    }

    if (items.some((item) => Number(item.price) <= 0)) {
      alert("Rate must be greater than 0");
      return;
    }

    for (const item of items) {
      const product = products.find(
        (p) => Number(p.id) === Number(item.productId)
      );

      if (!product) {
        alert(`Product not found: ${item.name}`);
        return;
      }

      if (Number(item.qty) > Number(product.stock)) {
        alert(
          `Not enough stock for ${product.name}. Available stock: ${product.stock} ${product.unit}`
        );
        return;
      }
    }

    const isCredit = payType === "Credit" || payType === "Cheque";
    const paid = isCredit ? Number(paidAmt || 0) : grandTotal;

    if (paid > grandTotal) {
      alert("Paid amount cannot be greater than grand total");
      return;
    }

    const status =
      paid >= grandTotal ? "Paid" : paid > 0 ? "Partial" : "Unpaid";

    const invoiceData = {
      customerId: Number(custId),
      customer: customer.name,
      date,
      items: items.map((item) => ({
        productId: Number(item.productId),
        name: item.name,
        qty: Number(item.qty),
        price: Number(item.price),
        unit: item.unit,
        subtotal: Number(item.qty) * Number(item.price),
      })),
      subtotal,
      gst: gstAmt,
      total: grandTotal,
      paid,
      type: payType,
      status,
    };

    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Failed to create bill");
        return;
      }

      const newSale = {
        ...invoiceData,
        id: data.saleId,
      };

      setSales((prev) => [newSale, ...prev]);
      setViewSale(newSale);
      setCreating(false);
      resetForm();

      if (fetchSales) fetchSales();
      if (fetchProducts) fetchProducts();
      if (fetchCustomers) fetchCustomers();
      if (fetchPayments) fetchPayments();
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
  };

  const sendWhatsApp = (sale) => {
    const cust = customers.find(
      (c) => Number(c.id) === Number(sale.customerId)
    );

    if (!cust) {
      alert("Customer not found");
      return;
    }

    const balance = Number(sale.total) - Number(sale.paid);

    const msg = [
      `*Bill from ${shop.shopName}*`,
      `Bill No: #${sale.id}`,
      `Date: ${formatDate(sale.date)}`,
      `Customer: ${sale.customer}`,
      `Total: ${fmt(sale.total)}`,
      `Paid: ${fmt(sale.paid)}`,
      balance > 0 ? `Balance: ${fmt(balance)}` : "",
      "",
      "Thank you!",
      shop.phone,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/91${cust.phone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const openViewInvoice = (sale) => {
    setViewSale(sale);
  };

  const printBill = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);

    return d.toLocaleDateString("en-IN");
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        padding: "24px clamp(18px, 2.2vw, 28px)",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 18,
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: C.text,
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            Billing & Bills
          </h2>

          <p
            style={{
              margin: "3px 0 0",
              color: C.textMuted,
              fontSize: 14,
            }}
          >
            Create and view customer bills
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search bills..."
          />

          <Btn onClick={() => setCreating(true)}>Create Bill</Btn>
        </div>
      </div>

      {/* Sales Table */}
      <Card>
        <Table
          cols={[
            {
              key: "id",
              label: "Bill No.",
              minWidth: 95,
              render: (value) => (
                <span style={{ color: C.accent, fontWeight: 800 }}>
                  #{value}
                </span>
              ),
            },
            {
              key: "customer",
              label: "CUSTOMER",
              minWidth: 220,
              wrap: true,
            },
            {
              key: "date",
              label: "DATE",
              minWidth: 115,
              render: (value) => formatDate(value),
            },
            {
              key: "type",
              label: "TYPE",
              minWidth: 100,
              render: (value) => (
                <Badge
                  color={
                    value === "Cash"
                      ? "success"
                      : value === "Credit"
                      ? "info"
                      : "warning"
                  }
                >
                  {value}
                </Badge>
              ),
            },
            {
              key: "total",
              label: "TOTAL",
              minWidth: 115,
              render: (value) => fmt(value),
              align: "right",
            },
            {
              key: "paid",
              label: "PAID",
              minWidth: 115,
              render: (value) => fmt(value),
              align: "right",
            },
            {
              key: "balance",
              label: "PENDING AMOUNT",
              align: "right",
              minWidth: 150,
              render: (_, row) => (
                <span
                  style={{
                    color:
                      Number(row.total) - Number(row.paid) > 0
                        ? C.danger
                        : C.success,
                    fontWeight: 800,
                  }}
                >
                  {fmt(Number(row.total) - Number(row.paid))}
                </span>
              ),
            },
            {
              key: "status",
              label: "STATUS",
              minWidth: 115,
              render: (value) => (
                <Badge
                  color={
                    value === "Paid"
                      ? "success"
                      : value === "Partial"
                      ? "warning"
                      : "danger"
                  }
                >
                  {value}
                </Badge>
              ),
            },
            {
              key: "id",
              label: "ACTION",
              align: "right",
              minWidth: 195,
              render: (_, row) => (
                <ActionGroup>
                  <Btn
                    onClick={() => openViewInvoice(row)}
                    variant="info"
                    size="sm"
                    style={{
                      minWidth: 84,
                      height: 34,
                      padding: "0 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View Bill
                  </Btn>

                  <Btn
                    onClick={() => sendWhatsApp(row)}
                    variant="success"
                    size="sm"
                    style={{
                      minWidth: 88,
                      height: 34,
                      padding: "0 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    WhatsApp
                  </Btn>
                </ActionGroup>
              ),
            },
          ]}
          rows={filteredSales}
        />
      </Card>

      {/* Create Bill Modal */}
      {creating && (
        <Modal
          title="Create New Bill"
          onClose={() => {
            setCreating(false);
            resetForm();
          }}
          width={760}
        >
          <FormGrid cols={3}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Select
                label="Customer *"
                value={custId}
                onChange={setCustId}
                options={[
                  { value: "", label: "— Select Customer —" },
                  ...customers.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                ]}
              />

              <Btn
                onClick={() => setQuickCustomerModal(true)}
                variant="ghost"
                size="sm"
                style={{ alignSelf: "flex-start" }}
              >
                New Customer
              </Btn>
            </div>

            <Select
              label="Payment Type"
              value={payType}
              onChange={setPayType}
              options={CLIENT_CONFIG.paymentTypes.map((type) => ({
                value: type,
                label: type,
              }))}
            />

            <Input label="Date" value={date} onChange={setDate} type="date" />
          </FormGrid>

          {/* Items Header */}
          <div
            style={{
              margin: "18px 0 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label
              style={{
                fontSize: 11,
                color: C.textSub,
                fontWeight: 800,
                letterSpacing: "0.06em",
              }}
            >
              ITEMS / MATERIALS
            </label>

            <Btn onClick={addItem} variant="ghost" size="sm">
              Add Row
            </Btn>
          </div>

          {/* Clear column names for owner */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px, 2.4fr) minmax(70px, 0.7fr) minmax(110px, 1fr) minmax(120px, 1fr) auto",
              gap: 8,
              marginBottom: 6,
              padding: "0 3px",
            }}
          >
            <div style={labelStyle}>Material / Item</div>
            <div style={labelStyle}>Qty</div>
            <div style={labelStyle}>Rate</div>
            <div style={labelStyle}>Amount</div>
            <div></div>
          </div>

          {/* Item Rows */}
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(220px, 2.4fr) minmax(70px, 0.7fr) minmax(110px, 1fr) minmax(120px, 1fr) auto",
                gap: 8,
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              <select
                value={item.productId}
                onChange={(e) =>
                  updateItem(index, "productId", e.target.value)
                }
                style={fieldStyle}
              >
                <option value="">— Select Material —</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock} {product.unit})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => updateItem(index, "qty", e.target.value)}
                placeholder="Qty"
                style={fieldStyle}
              />

              <input
                type="number"
                min="0"
                value={item.price}
                onChange={(e) => updateItem(index, "price", e.target.value)}
                placeholder="Rate"
                style={fieldStyle}
              />

              <div
                style={{
                  ...fieldStyle,
                  color: C.accent,
                  fontWeight: 900,
                  textAlign: "right",
                }}
              >
                {fmt(Number(item.qty || 0) * Number(item.price || 0))}
              </div>

              <Btn
                onClick={() => removeItem(index)}
                variant="danger"
                size="sm"
                disabled={items.length === 1}
              >
                ×
              </Btn>
            </div>
          ))}

          {/* Totals */}
          <div
            style={{
              background: C.surfaceHigh,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 16,
              marginTop: 14,
            }}
          >
            <TotalLine label="Subtotal" value={fmt(subtotal)} />

            {CLIENT_CONFIG.features.gstInvoice && (
              <TotalLine
                label={`GST ${CLIENT_CONFIG.gstRate}%`}
                value={fmt(gstAmt)}
                valueColor={C.warning}
              />
            )}

            {(payType === "Credit" || payType === "Cheque") && (
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <Input
                  label="Paid Amount Now (₹)"
                  value={paidAmt}
                  onChange={setPaidAmt}
                  type="number"
                  placeholder="0 = full credit"
                />
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
                paddingTop: 10,
                borderTop: `2px solid ${C.border}`,
              }}
            >
              <span
                style={{
                  color: C.accent,
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                BILL TOTAL
              </span>

              <span
                style={{
                  color: C.accent,
                  fontWeight: 900,
                  fontSize: 22,
                }}
              >
                {fmt(grandTotal)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ marginTop: 16 }}>
            <ActionGroup>
              <Btn
                onClick={() => {
                  setCreating(false);
                  resetForm();
                }}
                variant="ghost"
              >
                Cancel
              </Btn>

              <Btn onClick={createBill} variant="primary">
                Save Bill
              </Btn>
            </ActionGroup>
          </div>

          {quickCustomerModal && (
            <Modal
              title="Add New Customer"
              onClose={() => setQuickCustomerModal(false)}
              width={480}
            >
              <FormGrid cols={2}>
                <Input
                  label="Customer Name"
                  value={quickCustomerForm.name}
                  onChange={(value) =>
                    setQuickCustomerForm((prev) => ({ ...prev, name: value }))
                  }
                  required
                />

                <Input
                  label="Phone"
                  value={quickCustomerForm.phone}
                  onChange={(value) =>
                    setQuickCustomerForm((prev) => ({ ...prev, phone: value }))
                  }
                  required
                />

                <Input
                  label="Address"
                  value={quickCustomerForm.address}
                  onChange={(value) =>
                    setQuickCustomerForm((prev) => ({
                      ...prev,
                      address: value,
                    }))
                  }
                />

                <Select
                  label="Customer Type"
                  value={quickCustomerForm.type}
                  onChange={(value) =>
                    setQuickCustomerForm((prev) => ({ ...prev, type: value }))
                  }
                  options={[
                    { value: "Retail", label: "Retail" },
                    { value: "Wholesale", label: "Wholesale" },
                  ]}
                />
              </FormGrid>

              <div style={{ marginTop: 18 }}>
                <ActionGroup>
                  <Btn
                    onClick={() => setQuickCustomerModal(false)}
                    variant="ghost"
                  >
                    Cancel
                  </Btn>

                  <Btn onClick={handleQuickCustomerSave} variant="primary">
                    Save Customer
                  </Btn>
                </ActionGroup>
              </div>
            </Modal>
          )}
        </Modal>
      )}

      {/* View Bill Modal */}
      {viewSale && (
        <Modal
          title={`Bill #${viewSale.id}`}
          onClose={() => setViewSale(null)}
          width={680}
        >
          <div id="invoice-print-area">
            <div
              style={{
                border: "1.5px solid #000",
                padding: 18,
                background: "#fff",
                color: "#000",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              {/* Invoice Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "2px solid #000",
                  paddingBottom: 10,
                  marginBottom: 14,
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      color: "#000",
                      fontSize: 24,
                      fontWeight: 900,
                    }}
                  >
                    {shop.logo} {shop.shopName}
                  </h2>

                  <div style={{ fontSize: 12, color: "#000" }}>
                    {shop.tagline}
                  </div>

                  <div style={{ fontSize: 12, color: "#000" }}>
                    Owner: {shop.ownerName || "Owner"}
                  </div>

                  <div style={{ fontSize: 12, color: "#000" }}>
                    Address:{" "}
                    {shop.address}
                  </div>

                  <div style={{ fontSize: 12, color: "#000" }}>
                    Phone: {shop.phone}
                  </div>

                  {CLIENT_CONFIG.features.gstInvoice && (
                    <div style={{ fontSize: 12, color: "#000" }}>
                      GSTIN: {shop.gstin}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <h2
                    style={{
                      margin: 0,
                      color: "#000",
                      fontSize: 22,
                      fontWeight: 900,
                    }}
                  >
                    BILL
                  </h2>

                  <div style={{ fontSize: 12, color: "#000" }}>
                    Bill No: #{viewSale.id}
                  </div>

                  <div style={{ fontSize: 12, color: "#000" }}>
                    Date: {formatDate(viewSale.date)}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#000",
                      fontWeight: 800,
                    }}
                  >
                    Status: {viewSale.status}
                  </div>
                </div>
              </div>

              {/* Customer + Payment */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                  marginBottom: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      borderBottom: "1px solid #999",
                      fontWeight: 800,
                      fontSize: 13,
                      marginBottom: 6,
                      color: "#000",
                    }}
                  >
                    BILL TO
                  </div>

                  <div style={{ fontSize: 13, color: "#000" }}>
                    Name: <b>{viewSale.customer}</b>
                  </div>

                  <div style={{ fontSize: 13, color: "#000" }}>
                    Phone:{" "}
                    {
                      customers.find(
                        (c) => Number(c.id) === Number(viewSale.customerId)
                      )?.phone
                    }
                  </div>

                  <div style={{ fontSize: 13, color: "#000" }}>
                    Address:{" "}
                    {
                      customers.find(
                        (c) => Number(c.id) === Number(viewSale.customerId)
                      )?.address
                    }
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      borderBottom: "1px solid #999",
                      fontWeight: 800,
                      fontSize: 13,
                      marginBottom: 6,
                      color: "#000",
                    }}
                  >
                    PAYMENT DETAILS
                  </div>

                  <div style={{ fontSize: 13, color: "#000" }}>
                    Payment Type: <b>{viewSale.type}</b>
                  </div>

                  <div style={{ fontSize: 13, color: "#000" }}>
                    Paid Amount: <b>{fmt(viewSale.paid)}</b>
                  </div>

                  <div style={{ fontSize: 13, color: "#000" }}>
                    Pending Amount:{" "}
                    <b>{fmt(Number(viewSale.total) - Number(viewSale.paid))}</b>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    <th style={printTh}>Sr.</th>
                    <th style={{ ...printTh, textAlign: "left" }}>
                      Material / Item
                    </th>
                    <th style={printTh}>Qty</th>
                    <th style={printTh}>Rate</th>
                    <th style={printTh}>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {viewSale.items?.map((item, index) => (
                    <tr key={index}>
                      <td style={printTdCenter}>{index + 1}</td>
                      <td style={printTd}>{item.name}</td>
                      <td style={printTdCenter}>
                        {item.qty} {item.unit}
                      </td>
                      <td style={printTdRight}>{fmt(item.price)}</td>
                      <td style={printTdRight}>{fmt(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Box */}
              <div
                style={{
                  width: "45%",
                  marginLeft: "auto",
                  border: "1px solid #000",
                  marginBottom: 26,
                }}
              >
                <PrintTotalLine
                  label="Subtotal"
                  value={fmt(viewSale.subtotal || viewSale.total)}
                />

                {CLIENT_CONFIG.features.gstInvoice &&
                  Number(viewSale.gst) > 0 && (
                    <PrintTotalLine
                      label={`GST ${CLIENT_CONFIG.gstRate}%`}
                      value={fmt(viewSale.gst)}
                    />
                  )}

                <PrintTotalLine
                  label="Bill Total"
                  value={fmt(viewSale.total)}
                  bold
                />

                <PrintTotalLine
                  label="Paid"
                  value={fmt(viewSale.paid)}
                />

                {Number(viewSale.total) - Number(viewSale.paid) > 0 && (
                  <PrintTotalLine
                    label="Pending Amount"
                    value={fmt(Number(viewSale.total) - Number(viewSale.paid))}
                    bold
                  />
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: 28,
                  fontSize: 12,
                  color: "#000",
                }}
              >
                <div>
                  <div>Thank you for your business.</div>
                  <div>Goods once sold will not be taken back.</div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #000",
                    paddingTop: 6,
                    minWidth: 160,
                    textAlign: "center",
                  }}
                >
                  Authorized Signature
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="no-print" style={{ marginTop: 14 }}>
            <ActionGroup>
              <Btn onClick={() => setViewSale(null)} variant="ghost">
                Close
              </Btn>

              {CLIENT_CONFIG.features.whatsappReceipt && (
                <Btn onClick={() => sendWhatsApp(viewSale)} variant="success">
                  WhatsApp
                </Btn>
              )}

              <Btn onClick={printBill} variant="info">
                Print Bill
              </Btn>
            </ActionGroup>
          </div>
        </Modal>
      )}
    </div>
  );
}

const labelStyle = {
  color: C.textMuted,
  fontSize: 11,
  fontWeight: 800,
};

const fieldStyle = {
  background: C.field,
  border: `1px solid ${C.border}`,
  color: C.text,
  minHeight: 40,
  padding: "9px 11px",
  borderRadius: 10,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const printTh = {
  border: "1px solid #000",
  padding: "7px",
  background: "#f2f2f2",
  color: "#000",
  textAlign: "center",
  fontWeight: 800,
};

const printTd = {
  border: "1px solid #000",
  padding: "7px",
  color: "#000",
};

const printTdCenter = {
  ...printTd,
  textAlign: "center",
};

const printTdRight = {
  ...printTd,
  textAlign: "right",
};

function TotalLine({ label, value, valueColor }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6,
      }}
    >
      <span style={{ color: C.textSub }}>{label}</span>
      <span
        style={{
          color: valueColor || C.text,
          fontWeight: 800,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function PrintTotalLine({ label, value, bold }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderBottom: "1px solid #999",
        fontSize: 13,
        fontWeight: bold ? 900 : 500,
      }}
    >
      <div
        style={{
          padding: "7px",
          color: "#000",
        }}
      >
        {label}
      </div>

      <div
        style={{
          padding: "7px",
          color: "#000",
          textAlign: "right",
          borderLeft: "1px solid #999",
        }}
      >
        {value}
      </div>
    </div>
  );
}
