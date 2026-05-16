// =============================================================
// src/pages/CreditPage.jsx
// Purpose: Track pending invoices, collect payments from backend,
//          and show recent payment history from MySQL.
// =============================================================

import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  StatCard,
  Card,
  Modal,
  Table,
  Badge,
  Input,
  Select,
  FormActions,
  Btn,
  ActionGroup,
} from "../components/UI";
import { C, fmt } from "../utils/constants";

const API_URL = "http://localhost:5000/api";

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) return dateValue;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CreditPage() {
  const { sales, setSales, customers, setCustomers } = useAppContext();

  const [payModal, setPayModal] = useState(null);
  const [payAmt, setPayAmt] = useState("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [paymentNote, setPaymentNote] = useState("");

  const [payments, setPayments] = useState([]);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // =============================================================
  // Fetch latest sales from backend
  // =============================================================
  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_URL}/sales`);
      const data = await response.json();

      if (data.success) {
        setSales(data.sales);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // =============================================================
  // Fetch latest customers from backend
  // =============================================================
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // =============================================================
  // Fetch payments history
  // =============================================================
  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);

      const response = await fetch(`${API_URL}/payments`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // =============================================================
  // Pending credit invoices
  // =============================================================
  const creditSales = sales.filter((sale) => sale.status !== "Paid");

  const totalOut = creditSales.reduce(
    (sum, sale) => sum + (Number(sale.total || 0) - Number(sale.paid || 0)),
    0
  );

  const creditCustomers = customers.filter(
    (customer) => Number(customer.creditUsed || 0) > 0
  );

  // =============================================================
  // Open payment modal
  // =============================================================
  const openPaymentModal = (sale) => {
    setPayModal(sale);
    setPayAmt("");
    setPaymentType("Cash");
    setPaymentNote("");
  };

  // =============================================================
  // Record payment using backend API
  // =============================================================
  const recordPayment = async () => {
    const amount = Number(payAmt);

    if (!payModal) {
      alert("No invoice selected");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Enter valid payment amount");
      return;
    }

    const balance = Number(payModal.total || 0) - Number(payModal.paid || 0);

    if (amount > balance) {
      const ok = confirm(
        `Payment amount is greater than balance.\nBalance is ${fmt(
          balance
        )}.\nSystem will collect only balance amount. Continue?`
      );

      if (!ok) return;
    }

    try {
      setLoadingPayment(true);

      const response = await fetch(`${API_URL}/sales/${payModal.id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          paymentType,
          note: paymentNote || "Payment received",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Payment collection failed");
        return;
      }

      alert("Payment received successfully");

      setPayModal(null);
      setPayAmt("");
      setPaymentType("Cash");
      setPaymentNote("");

      await fetchSales();
      await fetchCustomers();
      await fetchPayments();
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    } finally {
      setLoadingPayment(false);
    }
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
      <div style={{ marginBottom: 18 }}>
        <h2
          style={{
            margin: 0,
            color: C.text,
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          Pending Payments
        </h2>

        <p
          style={{
            margin: "3px 0 0",
            color: C.textMuted,
            fontSize: 13,
          }}
        >
          Track and receive pending customer payments
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <StatCard
          icon="DUE"
          label="TOTAL PENDING AMOUNT"
          value={fmt(totalOut)}
          color={C.danger}
        />

        <StatCard
          icon="INV"
          label="PENDING BILLS"
          value={creditSales.length}
          color={C.warning}
        />

        <StatCard
          icon="CUS"
          label="CUSTOMERS WITH PENDING AMOUNT"
          value={creditCustomers.length}
          color={C.info}
        />
      </div>

      {/* Customer credit utilization */}
      <Card style={{ marginBottom: 20 }}>
        <h3
          style={{
            margin: "0 0 14px",
            color: C.text,
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          Pending Amount by Customer
        </h3>

        {customers.filter((c) => Number(c.creditLimit || 0) > 0).length ===
        0 ? (
          <div
            style={{
              color: C.textMuted,
              textAlign: "center",
              padding: 30,
              fontSize: 13,
            }}
          >
            No customer pending limits found
          </div>
        ) : (
          customers
            .filter((customer) => Number(customer.creditLimit || 0) > 0)
            .map((customer) => {
              const creditLimit = Number(customer.creditLimit || 0);
              const creditUsed = Number(customer.creditUsed || 0);
              const pct =
                creditLimit > 0
                  ? Math.min(100, Math.round((creditUsed / creditLimit) * 100))
                  : 0;

              return (
                <div key={customer.id} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 5,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        color: C.text,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {customer.name}
                    </span>

                    <span style={{ fontSize: 12 }}>
                      <span
                        style={{
                          color: pct > 80 ? C.danger : C.textSub,
                          fontWeight: 700,
                        }}
                      >
                        {fmt(creditUsed)}
                      </span>

                      <span style={{ color: C.textMuted }}>
                        {" "}
                        / {fmt(creditLimit)}
                      </span>
                    </span>
                  </div>

                  <div
                    style={{
                      height: 7,
                      background: C.border,
                      borderRadius: 4,
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        borderRadius: 4,
                        background:
                          pct > 80
                            ? C.danger
                            : pct > 50
                            ? C.warning
                            : C.success,
                        transition: "width 0.5s",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: C.textMuted,
                      marginTop: 3,
                    }}
                  >
                    {pct}% used - {customer.type}
                  </div>
                </div>
              );
            })
        )}
      </Card>

      {/* Pending bills table */}
      <Card style={{ marginBottom: 20 }}>
        <h3
          style={{
            margin: "0 0 14px",
            color: C.text,
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          Pending Bills
        </h3>

        <Table
          cols={[
            {
              key: "id",
              label: "Bill No.",
              render: (value) => (
                <span style={{ color: C.accent, fontWeight: 800 }}>
                  #{value}
                </span>
              ),
            },
            {
              key: "customer",
              label: "CUSTOMER",
            },
            {
              key: "date",
              label: "DATE",
              render: (value) => formatDate(value),
            },
            {
              key: "total",
              label: "TOTAL",
              align: "right",
              render: (value) => fmt(value),
            },
            {
              key: "paid",
              label: "PAID",
              align: "right",
              render: (value) => fmt(value),
            },
            {
              key: "total",
              label: "PENDING AMOUNT",
              align: "right",
              render: (_, row) => (
                <span
                  style={{
                    color: C.danger,
                    fontWeight: 800,
                  }}
                >
                  {fmt(Number(row.total || 0) - Number(row.paid || 0))}
                </span>
              ),
            },
            {
              key: "status",
              label: "STATUS",
              render: (value) => (
                <Badge color={value === "Partial" ? "warning" : "danger"}>
                  {value}
                </Badge>
              ),
            },
            {
              key: "id",
              label: "ACTION",
              align: "right",
              minWidth: 140,
              render: (_, row) => (
                <ActionGroup>
                  <Btn
                    onClick={() => openPaymentModal(row)}
                    variant="success"
                    size="sm"
                  >
                    Receive Payment
                  </Btn>
                </ActionGroup>
              ),
            },
          ]}
          rows={creditSales}
          emptyMsg="No pending payments"
        />
      </Card>

      {/* Recent payments history */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: C.text,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Recent Payment History
          </h3>

          <Btn onClick={fetchPayments} variant="ghost" size="sm">
            {paymentsLoading ? "Loading..." : "Refresh"}
          </Btn>
        </div>

        <Table
          cols={[
            {
              key: "id",
              label: "PAY#",
              render: (value) => (
                <span style={{ color: C.accent, fontWeight: 800 }}>
                  #{value}
                </span>
              ),
            },
            {
              key: "saleId",
              label: "Bill No.",
              render: (value) => (
                <span style={{ color: C.info, fontWeight: 800 }}>#{value}</span>
              ),
            },
            {
              key: "customer",
              label: "CUSTOMER",
            },
            {
              key: "amount",
              label: "AMOUNT",
              align: "right",
              render: (value) => (
                <span style={{ color: C.success, fontWeight: 800 }}>
                  {fmt(value)}
                </span>
              ),
            },
            {
              key: "paymentType",
              label: "TYPE",
              render: (value) => (
                <Badge
                  color={
                    value === "Cash"
                      ? "success"
                      : value === "UPI"
                      ? "info"
                      : value === "Credit"
                      ? "warning"
                      : "purple"
                  }
                >
                  {value}
                </Badge>
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
            {
              key: "date",
              label: "DATE",
              render: (value) => formatDate(value),
            },
          ]}
          rows={payments.slice(0, 10)}
          emptyMsg="No payment history found"
        />
      </Card>

      {/* Payment modal */}
      {payModal && (
        <Modal
          title="Receive Payment"
          onClose={() => {
            if (!loadingPayment) {
              setPayModal(null);
              setPayAmt("");
              setPaymentType("Cash");
              setPaymentNote("");
            }
          }}
          width={460}
        >
          <div
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
            }}
          >
            {[
              ["Customer", payModal.customer],
              ["Bill", `#${payModal.id}`],
              ["Total", fmt(payModal.total)],
              ["Paid Till Now", fmt(payModal.paid)],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ color: C.textSub }}>{label}</span>
                <span style={{ fontWeight: 700, color: C.text }}>{value}</span>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 10,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <span style={{ color: C.danger, fontWeight: 700 }}>
                Pending Amount
              </span>

              <span
                style={{
                  color: C.danger,
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                {fmt(Number(payModal.total || 0) - Number(payModal.paid || 0))}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input
              label="Payment received (Rs.) *"
              value={payAmt}
              onChange={setPayAmt}
              type="number"
              placeholder="Enter amount"
            />

            <Select
              label="Payment Type"
              value={paymentType}
              onChange={setPaymentType}
              options={[
                { value: "Cash", label: "Cash" },
                { value: "UPI", label: "UPI" },
                { value: "Cheque", label: "Cheque" },
                { value: "Bank Transfer", label: "Bank Transfer" },
              ]}
            />

            <Input
              label="Note"
              value={paymentNote}
              onChange={setPaymentNote}
              placeholder="Optional note"
            />
          </div>

          <FormActions
            onCancel={() => {
              if (!loadingPayment) {
                setPayModal(null);
                setPayAmt("");
                setPaymentType("Cash");
                setPaymentNote("");
              }
            }}
            onSave={recordPayment}
            saveLabel={loadingPayment ? "Saving..." : "Receive Payment"}
          />
        </Modal>
      )}
    </div>
  );
}

