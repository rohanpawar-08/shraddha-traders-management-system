// =============================================================
// src/pages/ReportsPage.jsx
// Purpose: Business analytics with sales, collections,
//          pending payments, expenses, net cash, inventory,
//          top customers and low stock.
// =============================================================

import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { StatCard, Card } from "../components/UI";
import { C, fmt, today } from "../utils/constants";

const API_URL = "http://localhost:5000/api";

export default function ReportsPage() {
  const { sales, products, customers } = useAppContext();

  const [expenses, setExpenses] = useState([]);

  const normalizeDate = (dateValue) => {
    if (!dateValue) return "";
    return String(dateValue).split("T")[0];
  };

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

  useEffect(() => {
    fetchExpenses();
  }, []);

  const currentMonth = today().slice(0, 7);

  // =============================================================
  // Sales calculations
  // =============================================================
  const grossSales = sales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  const collected = sales.reduce(
    (sum, sale) => sum + Number(sale.paid || 0),
    0
  );

  const pending = grossSales - collected;

  const collectionRate = grossSales
    ? Math.round((collected / grossSales) * 100)
    : 0;

  const totalBills = sales.length;

  // =============================================================
  // Expense calculations
  // =============================================================
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const todayExpenses = expenses
    .filter((expense) => normalizeDate(expense.expenseDate) === today())
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const monthExpenses = expenses
    .filter((expense) => normalizeDate(expense.expenseDate).startsWith(currentMonth))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const netCash = collected - totalExpenses;

  // =============================================================
  // Low stock
  // =============================================================
  const lowStock = products.filter(
    (product) => Number(product.stock) <= Number(product.minStock)
  );

  // =============================================================
  // Product category data
  // =============================================================
  const productCategoryMap = {};

  products.forEach((product) => {
    const category = product.category || "Other";
    productCategoryMap[category] = (productCategoryMap[category] || 0) + 1;
  });

  const productCategoryData = Object.entries(productCategoryMap).sort(
    (a, b) => b[1] - a[1]
  );

  const maxProductCategory = Math.max(
    ...productCategoryData.map((item) => item[1]),
    1
  );

  // =============================================================
  // Expense category data
  // =============================================================
  const expenseCategoryMap = {};

  expenses.forEach((expense) => {
    const category = expense.category || "Other";
    expenseCategoryMap[category] =
      (expenseCategoryMap[category] || 0) + Number(expense.amount || 0);
  });

  const expenseCategoryData = Object.entries(expenseCategoryMap).sort(
    (a, b) => b[1] - a[1]
  );

  const maxExpenseCategory = Math.max(
    ...expenseCategoryData.map((item) => item[1]),
    1
  );

  // =============================================================
  // Top customers by sales
  // =============================================================
  const topCustomers = customers
    .map((customer) => ({
      ...customer,
      revenue: sales
        .filter((sale) => Number(sale.customerId) === Number(customer.id))
        .reduce((sum, sale) => sum + Number(sale.total || 0), 0),
      pending: sales
        .filter((sale) => Number(sale.customerId) === Number(customer.id))
        .reduce(
          (sum, sale) =>
            sum + (Number(sale.total || 0) - Number(sale.paid || 0)),
          0
        ),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // =============================================================
  // Sales breakdown
  // =============================================================
  const cashSales = sales.filter((sale) => sale.type === "Cash");
  const pendingSales = sales.filter((sale) => sale.type === "Credit");
  const otherSales = sales.filter(
    (sale) => !["Cash", "Credit"].includes(sale.type)
  );
  const fullyPaidSales = sales.filter((sale) => sale.status === "Paid");
  const openBills = sales.filter((sale) => sale.status !== "Paid");

  const breakdown = [
    {
      label: "Cash Bills",
      value: cashSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
      count: cashSales.length,
      color: C.success,
    },
    {
      label: "Pending Payment Bills",
      value: pendingSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
      count: pendingSales.length,
      color: C.info,
    },
    {
      label: "UPI / Cheque / Bank Bills",
      value: otherSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
      count: otherSales.length,
      color: C.purple,
    },
    {
      label: "Fully Paid Bills",
      value: fullyPaidSales.reduce(
        (sum, sale) => sum + Number(sale.total || 0),
        0
      ),
      count: fullyPaidSales.length,
      color: C.success,
    },
    {
      label: "Pending Collection",
      value: pending,
      count: openBills.length,
      color: C.danger,
    },
  ];

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
          Reports
        </h2>

        <p style={{ margin: "3px 0 0", color: C.textMuted, fontSize: 13 }}>
          View sales, expenses and pending summary
        </p>
      </div>

      {/* Sales KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <StatCard
          icon="REV"
          label="GROSS SALES"
          value={fmt(grossSales)}
          color={C.accent}
        />

        <StatCard
          icon="COL"
          label="COLLECTED"
          value={fmt(collected)}
          color={C.success}
        />

        <StatCard
          icon="DUE"
          label="PENDING PAYMENTS"
          value={fmt(pending)}
          color={C.danger}
        />

        <StatCard
          icon="RATE"
          label="COLLECTION RATE"
          value={`${collectionRate}%`}
          color={C.info}
        />
      </div>

      {/* Expense KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <StatCard
          icon="EXP"
          label="TOTAL EXPENSES"
          value={fmt(totalExpenses)}
          color={C.danger}
        />

        <StatCard
          icon="DAY"
          label="TODAY EXPENSE"
          value={fmt(todayExpenses)}
          color={C.warning}
        />

        <StatCard
          icon="MON"
          label="THIS MONTH EXPENSE"
          value={fmt(monthExpenses)}
          color={C.purple}
        />

        <StatCard
          icon="NET"
          label="NET CASH"
          value={fmt(netCash)}
          color={netCash >= 0 ? C.success : C.danger}
        />

        <StatCard
          icon="BILL"
          label="TOTAL BILLS"
          value={totalBills}
          color={C.info}
        />
      </div>

      {/* Sales + Expense breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 18,
          marginBottom: 18,
        }}
      >
        <Card>
          <h3
            style={{
              margin: "0 0 14px",
              color: C.text,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Sales Breakdown
          </h3>

          {breakdown.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "9px 0",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: row.color,
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    color: C.textSub,
                    fontSize: 13,
                    overflowWrap: "anywhere",
                  }}
                >
                  {row.label}
                </span>

                <span
                  style={{
                    background: C.surfaceHigh,
                    color: C.textMuted,
                    padding: "2px 8px",
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {row.count}
                </span>
              </div>

              <span
                style={{
                  color: C.text,
                  fontWeight: 700,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {fmt(row.value)}
              </span>
            </div>
          ))}
        </Card>

        <Card>
          <h3
            style={{
              margin: "0 0 14px",
              color: C.text,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Expense Breakdown
          </h3>

          {expenseCategoryData.length === 0 ? (
            <div
              style={{
                color: C.textMuted,
                textAlign: "center",
                padding: 30,
                fontSize: 13,
              }}
            >
              No expenses recorded
            </div>
          ) : (
            expenseCategoryData.map(([category, amount]) => (
              <div key={category} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      color: C.textSub,
                      fontSize: 13,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {category}
                  </span>

                  <span
                    style={{
                      color: C.danger,
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {fmt(amount)}
                  </span>
                </div>

                <div
                  style={{
                    height: 6,
                    background: C.border,
                    borderRadius: 3,
                  }}
                >
                  <div
                    style={{
                      width: `${(amount / maxExpenseCategory) * 100}%`,
                      height: "100%",
                      background: C.danger,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Inventory + Top customers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 18,
          marginBottom: 18,
        }}
      >
        <Card>
          <h3
            style={{
              margin: "0 0 14px",
              color: C.text,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Inventory by Category
          </h3>

          {productCategoryData.length === 0 ? (
            <div
              style={{
                color: C.textMuted,
                textAlign: "center",
                padding: 30,
                fontSize: 13,
              }}
            >
              No product data found
            </div>
          ) : (
            productCategoryData.map(([category, count]) => (
              <div key={category} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: C.textSub, fontSize: 13 }}>
                    {category}
                  </span>

                  <span
                    style={{
                      color: C.text,
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {count} products
                  </span>
                </div>

                <div
                  style={{
                    height: 6,
                    background: C.border,
                    borderRadius: 3,
                  }}
                >
                  <div
                    style={{
                      width: `${(count / maxProductCategory) * 100}%`,
                      height: "100%",
                      background: C.accent,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </Card>

        <Card>
          <h3
            style={{
              margin: "0 0 14px",
              color: C.text,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Top Customers by Sales
          </h3>

          {topCustomers.length === 0 ? (
            <div
              style={{
                color: C.textMuted,
                textAlign: "center",
                padding: 30,
                fontSize: 13,
              }}
            >
              No customer sales found
            </div>
          ) : (
            topCustomers.map((customer, index) => (
              <div
                key={customer.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: C.accentGlow,
                      border: `1px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.accent,
                      fontWeight: 900,
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color: C.text,
                        fontSize: 13,
                        fontWeight: 700,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {customer.name}
                    </div>

                    {customer.pending > 0 && (
                      <div style={{ color: C.danger, fontSize: 11 }}>
                        Due: {fmt(customer.pending)}
                      </div>
                    )}
                  </div>
                </div>

                <span
                  style={{
                    color: C.accent,
                    fontWeight: 800,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {fmt(customer.revenue)}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Low stock */}
      <Card>
        <h3
          style={{
            margin: "0 0 14px",
            color: C.text,
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          Low Stock Report
        </h3>

        {lowStock.length === 0 ? (
          <div style={{ color: C.success, textAlign: "center", padding: 30 }}>
            All products adequately stocked
          </div>
        ) : (
          lowStock.map((product) => (
            <div
              key={product.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "8px 0",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: C.text,
                    fontSize: 13,
                    fontWeight: 600,
                    overflowWrap: "anywhere",
                  }}
                >
                  {product.name}
                </div>

                <div style={{ fontSize: 11, color: C.textMuted }}>
                  {product.category}
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ color: C.danger, fontWeight: 900 }}>
                  {product.stock} / {product.minStock}
                </div>

                <div style={{ fontSize: 10, color: C.textMuted }}>
                  stock / min
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
