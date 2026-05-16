// =============================================================
// src/pages/CustomersPage.jsx
// Purpose: Manage customers + Customer Account / Khata.
//          Add / edit / delete customers.
//          Account shows customer bills, payments, balance,
//          and printable khata report.
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
import { C, fmt } from "../utils/constants";

export default function CustomersPage() {
  const {
    API_URL,
    customers,
    setCustomers,
    fetchCustomers,
    sales,
    payments,
  } = useAppContext();

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [ledgerCustomer, setLedgerCustomer] = useState(null);

  const blankForm = {
    name: "",
    phone: "",
    address: "",
    type: "Retail",
    creditLimit: "",
  };

  const [form, setForm] = useState(blankForm);

  const F = (key) => ({
    value: form[key],
    onChange: (v) =>
      setForm((f) => ({
        ...f,
        [key]: v,
      })),
  });

  // =============================================================
  // Helpers
  // =============================================================
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const d = new Date(dateValue);

    if (Number.isNaN(d.getTime())) {
      return String(dateValue);
    }

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const invoiceBalance = (sale) => {
    const total = Number(sale.total || 0);
    const paid = Number(sale.paid || 0);

    return Math.max(total - paid, 0);
  };

  const invoicePaidDisplay = (sale) => {
    const total = Number(sale.total || 0);
    const paid = Number(sale.paid || 0);

    return Math.min(paid, total);
  };

  // =============================================================
  // Filter customers
  // =============================================================
  const filtered = customers.filter((c) => {
    const name = String(c.name || "").toLowerCase();
    const phone = String(c.phone || "");

    return (
      name.includes(search.toLowerCase()) ||
      phone.includes(search)
    );
  });

  // =============================================================
  // CRUD
  // =============================================================
  const openAdd = () => {
    setForm(blankForm);
    setModal("add");
  };

  const openEdit = (c) => {
    setForm({
      name: c.name || "",
      phone: c.phone || "",
      address: c.address || "",
      type: c.type || "Retail",
      creditLimit: String(c.creditLimit || 0),
    });

    setModal(c);
  };

  const openLedger = (customer) => {
    setLedgerCustomer(customer);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete customer?")) return;

    try {
      const response = await fetch(`${API_URL}/customers/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Failed to delete customer");
        return;
      }

      if (fetchCustomers) {
        await fetchCustomers();
      } else {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      alert("Name and phone required");
      return;
    }

    const data = {
      name: form.name,
      phone: form.phone,
      email: "",
      address: form.address || "",
      type: form.type || "Retail",
      creditLimit: Number(form.creditLimit || 0),
      creditUsed: modal === "add" ? 0 : Number(modal.creditUsed || 0),
    };

    try {
      const response =
        modal === "add"
          ? await fetch(`${API_URL}/customers`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            })
          : await fetch(`${API_URL}/customers/${modal.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

      const result = await response.json();

      if (!result.success) {
        alert(result.message || "Failed to save customer");
        return;
      }

      setModal(null);

      if (fetchCustomers) {
        await fetchCustomers();
      } else if (modal === "add") {
        setCustomers((prev) => [
          { ...data, id: result.customerId || Date.now() },
          ...prev,
        ]);
      } else {
        setCustomers((prev) =>
          prev.map((c) => (c.id === modal.id ? { ...c, ...data } : c))
        );
      }
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
  };

  // =============================================================
  // Ledger data
  // =============================================================
  const customerInvoices = ledgerCustomer
    ? sales.filter(
        (s) => Number(s.customerId) === Number(ledgerCustomer.id)
      )
    : [];

  const customerPayments = ledgerCustomer
    ? payments.filter(
        (p) => Number(p.customerId) === Number(ledgerCustomer.id)
      )
    : [];

  const ledgerTotalBilling = customerInvoices.reduce(
    (sum, s) => sum + Number(s.total || 0),
    0
  );

  const ledgerTotalPaid = customerInvoices.reduce(
    (sum, s) => sum + invoicePaidDisplay(s),
    0
  );

  const ledgerBalance = customerInvoices.reduce(
    (sum, s) => sum + invoiceBalance(s),
    0
  );

  const wholesaleCustomers = customers.filter(
    (customer) => customer.type === "Wholesale"
  ).length;

  const retailCustomers = customers.filter(
    (customer) => customer.type === "Retail"
  ).length;

  const totalCreditDue = customers.reduce(
    (sum, customer) => sum + Number(customer.creditUsed || 0),
    0
  );

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
      {/* =========================================================
          Header
      ========================================================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
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
            Customers
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: C.textMuted,
              fontSize: 14,
            }}
          >
            Manage customers, pending limit and account history
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search customers..."
          />

          <Btn onClick={openAdd}>Add Customer</Btn>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <StatCard
          icon="CUS"
          label="TOTAL CUSTOMERS"
          value={customers.length}
          color={C.info}
        />

        <StatCard
          icon="WH"
          label="WHOLESALE CUSTOMERS"
          value={wholesaleCustomers}
          color={C.success}
        />

        <StatCard
          icon="RT"
          label="RETAIL CUSTOMERS"
          value={retailCustomers}
          color={C.purple}
        />

        <StatCard
          icon="DUE"
          label="TOTAL PENDING AMOUNT"
          value={fmt(totalCreditDue)}
          color={totalCreditDue > 0 ? C.danger : C.success}
        />
      </div>

      {/* =========================================================
          Customer Table
      ========================================================= */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <h3
            style={{
              margin: 0,
              color: C.text,
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            Customer List
          </h3>

          <p
            style={{
              margin: "4px 0 0",
              color: C.textMuted,
              fontSize: 13,
            }}
          >
            Showing {filtered.length} of {customers.length} customers
          </p>
        </div>

        <Table
          cols={[
            {
              key: "name",
              label: "CUSTOMER",
              minWidth: 220,
              wrap: true,
              render: (v, r) => (
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: C.text,
                    }}
                  >
                    {v}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                    }}
                  >
                    {r.phone}
                  </div>
                </div>
              ),
            },
            {
              key: "type",
              label: "TYPE",
              minWidth: 105,
              render: (v) => (
                <Badge color={v === "Wholesale" ? "success" : "info"}>
                  {v}
                </Badge>
              ),
            },
            {
              key: "address",
              label: "ADDRESS",
              minWidth: 240,
              wrap: true,
              render: (v) => (
                <span
                  style={{
                    color: C.textSub,
                    fontSize: 12,
                  }}
                >
                  {v}
                </span>
              ),
            },
            {
              key: "creditLimit",
              label: "ALLOWED PENDING LIMIT",
              minWidth: 165,
              render: (v) => fmt(v),
              align: "right",
            },
            {
              key: "creditUsed",
              label: "CURRENT PENDING",
              align: "right",
              minWidth: 145,
              render: (v, r) => (
                <span
                  style={{
                    color:
                      Number(v) > Number(r.creditLimit || 0) * 0.8
                        ? C.danger
                        : C.text,
                    fontWeight: 700,
                  }}
                >
                  {fmt(v)}
                </span>
              ),
            },
            {
            key: "id",
            label: "ACTIONS",
            align: "right",
            minWidth: 235,
            render: (_, row) => (
              <ActionGroup>
                <Btn
                  onClick={() => openLedger(row)}
                  variant="info"
                  size="sm"
                  style={{
                    minWidth: 82,
                    height: 34,
                    padding: "0 12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Account
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
                  onClick={() => handleDelete(row.id)}
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
          rows={filtered}
        />
      </Card>

      {/* =========================================================
          Add / Edit Customer Modal
      ========================================================= */}
      {modal && (
        <Modal
          title={modal === "add" ? "Add Customer" : "Edit Customer"}
          onClose={() => setModal(null)}
        >
          <FormGrid>
            <Input
              label="Customer Name *"
              {...F("name")}
              style={{ gridColumn: "1/-1" }}
            />

            <Input label="Phone *" {...F("phone")} />

            <Input
              label="Address"
              {...F("address")}
              style={{ gridColumn: "1/-1" }}
            />

            <Select
              label="Customer Type"
              {...F("type")}
              options={[
                {
                  value: "Retail",
                  label: "Retail",
                },
                {
                  value: "Wholesale",
                  label: "Wholesale",
                },
              ]}
            />

            <Input
              label="Allowed Pending Limit Optional (₹)"
              {...F("creditLimit")}
              type="number"
            />
          </FormGrid>

          <FormActions
            onCancel={() => setModal(null)}
            onSave={handleSave}
            saveLabel={modal === "add" ? "Add Customer" : "Save"}
          />
        </Modal>
      )}

      {/* =========================================================
          Customer Account Modal
      ========================================================= */}
      {ledgerCustomer && (
        <Modal
          title={`Customer Account - ${ledgerCustomer.name}`}
          onClose={() => setLedgerCustomer(null)}
          width={900}
        >
          <div id="ledger-print-area">
            {/* Ledger Header */}
            <div
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 18,
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px",
                  color: C.accent,
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                {ledgerCustomer.name}
              </h2>

              <div
                style={{
                  color: C.textSub,
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                <div>Phone: {ledgerCustomer.phone || "-"}</div>
                <div>Type: {ledgerCustomer.type || "-"}</div>
                <div>Address: {ledgerCustomer.address || "-"}</div>
                <div>Allowed Pending Limit: {fmt(ledgerCustomer.creditLimit || 0)}</div>
                <div>Current Pending: {fmt(ledgerBalance)}</div>
              </div>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <StatCard
                icon="INV"
                label="TOTAL BILLS"
                value={customerInvoices.length}
                color={C.info}
              />

              <StatCard
                icon="BILL"
                label="TOTAL BILL AMOUNT"
                value={fmt(ledgerTotalBilling)}
                color={C.accent}
              />

              <StatCard
                icon="PAY"
                label="TOTAL PAID"
                value={fmt(ledgerTotalPaid)}
                color={C.success}
              />

              <StatCard
                icon="DUE"
                label="PENDING AMOUNT"
                value={fmt(ledgerBalance)}
                color={ledgerBalance > 0 ? C.danger : C.success}
              />
            </div>

            {/* Bill History */}
            <Card style={{ marginBottom: 18 }}>
              <h3
                style={{
                  margin: "0 0 14px",
                  color: C.text,
                  fontSize: 16,
                  fontWeight: 900,
                }}
              >
                Bill History
              </h3>

              <Table
                cols={[
                  {
                    key: "id",
                    label: "Bill No.",
                    render: (v) => (
                      <span
                        style={{
                          color: C.accent,
                          fontWeight: 800,
                        }}
                      >
                        #{v}
                      </span>
                    ),
                  },
                  {
                    key: "date",
                    label: "DATE",
                    render: (v) => formatDate(v),
                  },
                  {
                    key: "type",
                    label: "TYPE",
                    render: (v) => (
                      <Badge
                        color={
                          v === "Cash"
                            ? "success"
                            : v === "Credit"
                            ? "info"
                            : "warning"
                        }
                      >
                        {v}
                      </Badge>
                    ),
                  },
                  {
                    key: "total",
                    label: "TOTAL",
                    render: (v) => fmt(v),
                    align: "right",
                  },
                  {
                    key: "paid",
                    label: "PAID",
                    render: (_, r) => fmt(invoicePaidDisplay(r)),
                    align: "right",
                  },
                  {
                    key: "balance",
                    label: "BALANCE",
                    render: (_, r) => {
                      const bal = invoiceBalance(r);

                      return (
                        <span
                          style={{
                            color: bal > 0 ? C.danger : C.success,
                            fontWeight: 800,
                          }}
                        >
                          {fmt(bal)}
                        </span>
                      );
                    },
                    align: "right",
                  },
                  {
                    key: "status",
                    label: "STATUS",
                    render: (v) => (
                      <Badge
                        color={
                          v === "Paid"
                            ? "success"
                            : v === "Partial"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {v}
                      </Badge>
                    ),
                  },
                ]}
                rows={customerInvoices}
                emptyMsg="No bills found"
              />
            </Card>

            {/* Payment History */}
            <Card>
              <h3
                style={{
                  margin: "0 0 14px",
                  color: C.text,
                  fontSize: 16,
                  fontWeight: 900,
                }}
              >
                Payment History
              </h3>

              <Table
                cols={[
                  {
                    key: "date",
                    label: "DATE",
                    render: (v) => formatDate(v),
                  },
                  {
                    key: "amount",
                    label: "AMOUNT",
                    render: (v) => (
                      <span
                        style={{
                          color: C.success,
                          fontWeight: 800,
                        }}
                      >
                        {fmt(v)}
                      </span>
                    ),
                    align: "right",
                  },
                  {
                    key: "paymentType",
                    label: "PAYMENT TYPE",
                    render: (v) => (
                      <Badge
                        color={
                          v === "Cash"
                            ? "success"
                            : v === "UPI"
                            ? "info"
                            : v === "Cheque"
                            ? "warning"
                            : "accent"
                        }
                      >
                        {v}
                      </Badge>
                    ),
                  },
                  {
                    key: "note",
                    label: "NOTE",
                    render: (v) => (
                      <span
                        style={{
                          color: C.textSub,
                          fontSize: 12,
                        }}
                      >
                        {v || "-"}
                      </span>
                    ),
                  },
                ]}
                rows={customerPayments}
                emptyMsg="No payments found"
              />
            </Card>
          </div>

          {/* Account Footer Buttons */}
          <div
            className="no-print"
            style={{
              marginTop: 16,
            }}
          >
            <ActionGroup>
              <Btn
                onClick={() => setLedgerCustomer(null)}
                variant="ghost"
              >
                Close
              </Btn>

              <Btn onClick={() => window.print()} variant="info">
                Print Account
              </Btn>
            </ActionGroup>
          </div>
        </Modal>
      )}
    </div>
  );
}


