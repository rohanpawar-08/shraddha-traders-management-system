// =============================================================
// src/pages/Dashboard.jsx
// Purpose: Professional dashboard overview for Shraddha Traders.
// Shows revenue, collection, pending credit, expenses, today stats,
// recent invoices, low stock alerts, and business summary.
// =============================================================

import { useAppContext } from "../context/AppContext";
import { StatCard, Card, Table, Badge } from "../components/UI";
import { C, fmt, today } from "../utils/constants";

export default function Dashboard() {
  const { products, customers, sales, expenses = [] } = useAppContext();

  const todayDate = today();

  const revenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const collected = sales.reduce((sum, sale) => sum + Number(sale.paid || 0), 0);
  const pending = revenue - collected;

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const todaySales = sales.filter((sale) => {
    const saleDate = String(sale.date || "").slice(0, 10);
    return saleDate === todayDate;
  });

  const todayExpenses = expenses.filter((expense) => {
    const expenseDate = String(expense.date || "").slice(0, 10);
    return expenseDate === todayDate;
  });

  const todayRevenue = todaySales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  const todayCollected = todaySales.reduce(
    (sum, sale) => sum + Number(sale.paid || 0),
    0
  );

  const todayExpense = todayExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const todayNetCash = todayCollected - todayExpense;

  const lowStock = products.filter(
    (product) => Number(product.stock) <= Number(product.minStock)
  );

  const recentSales = [...sales]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 6);

  const collectionRate = revenue ? Math.round((collected / revenue) * 100) : 0;

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
      <div style={{ marginBottom: 22 }}>
        <h2
          style={{
            margin: 0,
            color: C.text,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "-0.03em",
          }}
        >
          Dashboard Overview
        </h2>

        <p
          style={{
            margin: "5px 0 0",
            color: C.textMuted,
            fontSize: 13,
          }}
        >
          Today&apos;s business summary and complete shop overview
        </p>
      </div>

      {/* Main KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <StatCard
          icon="REV"
          label="TOTAL SALES"
          value={fmt(revenue)}
          sub={`${sales.length} bills`}
          color={C.accent}
        />

        <StatCard
          icon="COL"
          label="COLLECTED"
          value={fmt(collected)}
          sub={`${collectionRate}% payment collection rate`}
          color={C.success}
        />

        <StatCard
          icon="DUE"
          label="TOTAL PENDING AMOUNT"
          value={fmt(pending)}
          sub={`${sales.filter((sale) => sale.status !== "Paid").length} pending bills due`}
          color={C.danger}
        />

        <StatCard
          icon="EXP"
          label="TOTAL EXPENSES"
          value={fmt(totalExpenses)}
          sub="All shop expenses"
          color={C.warning}
        />
      </div>

      {/* Today KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <StatCard
          icon="DAY"
          label="TODAY SALES"
          value={fmt(todayRevenue)}
          sub={`${todaySales.length} bills today`}
          color={C.info}
        />

        <StatCard
          icon="REC"
          label="TODAY COLLECTED"
          value={fmt(todayCollected)}
          sub="Cash received today"
          color={C.success}
        />

        <StatCard
          icon="OUT"
          label="TODAY EXPENSE"
          value={fmt(todayExpense)}
          sub="Expenses today"
          color={C.warning}
        />

        <StatCard
          icon="NET"
          label="TODAY NET CASH"
          value={fmt(todayNetCash)}
          sub="Collected minus expenses"
          color={todayNetCash >= 0 ? C.success : C.danger}
        />
      </div>

      {/* Recent invoices and alerts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(260px, 0.7fr)",
          gap: 18,
          alignItems: "start",
        }}
      >
        <Card>
          <h3
            style={{
              margin: "0 0 14px",
              color: C.text,
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            Recent Bills
          </h3>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <Table
              cols={[
                {
                  key: "id",
                  label: "Bill No.",
                  render: (value) => (
                    <span style={{ color: C.accent, fontWeight: 900 }}>
                      #{value}
                    </span>
                  ),
                },
                {
                  key: "customer",
                  label: "CUSTOMER",
                  render: (value) => (
                    <span style={{ color: C.text, fontWeight: 700 }}>
                      {String(value || "-").split(" ").slice(0, 2).join(" ")}
                    </span>
                  ),
                },
                {
                  key: "date",
                  label: "DATE",
                  render: (value) => String(value || "").slice(0, 10),
                },
                {
                  key: "total",
                  label: "AMOUNT",
                  align: "right",
                  render: (value) => fmt(value),
                },
                {
                  key: "type",
                  label: "TYPE",
                  render: (value) => (
                    <Badge color={value === "Cash" ? "success" : "info"}>
                      {value}
                    </Badge>
                  ),
                },
                {
                  key: "status",
                  label: "STATUS",
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
              ]}
              rows={recentSales}
              emptyMsg="No bills found"
            />
          </div>
        </Card>

        <Card>
          <h3
            style={{
              margin: "0 0 14px",
              color: C.text,
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            Low Stock Alerts
          </h3>

          {lowStock.length === 0 ? (
            <div
              style={{
                color: C.success,
                textAlign: "center",
                padding: "32px 10px",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              All products are well stocked.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {lowStock.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "11px 13px",
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    background: C.surfaceHigh,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: C.text,
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {product.name}
                    </div>

                    <div
                      style={{
                        color: C.textMuted,
                        fontSize: 11,
                        marginTop: 2,
                      }}
                    >
                      {product.category}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: C.danger,
                        fontWeight: 900,
                        fontSize: 13,
                      }}
                    >
                      {product.stock} {product.unit}
                    </div>

                    <div
                      style={{
                        color: C.textMuted,
                        fontSize: 10,
                        marginTop: 2,
                      }}
                    >
                      Min: {product.minStock}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Bottom summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 16,
          marginTop: 22,
        }}
      >
        <StatCard
          icon="CUS"
          label="CUSTOMERS"
          value={customers.length}
          sub={`${customers.filter((c) => c.type === "Wholesale").length} wholesale`}
          color={C.info}
        />

        <StatCard
          icon="MAT"
          label="PRODUCTS"
          value={products.length}
          sub={lowStock.length > 0 ? `${lowStock.length} low stock` : "All stocked"}
          color={C.success}
        />

        <StatCard
          icon="CRD"
          label="TOTAL PENDING AMOUNT"
          value={fmt(
            customers.reduce(
              (sum, customer) => sum + Number(customer.creditUsed || 0),
              0
            )
          )}
          sub="Customer pending amount"
          color={C.danger}
        />

        <StatCard
          icon="RTE"
          label="PAYMENT COLLECTION RATE"
          value={`${collectionRate}%`}
          sub="Of total sales"
          color={C.accent}
        />
      </div>
    </div>
  );
}
