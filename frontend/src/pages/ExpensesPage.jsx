// =============================================================
// src/pages/ExpensesPage.jsx
// Purpose: Manage daily business expenses for shop and contractor work.
//          Tracks transport, labour, rent, electricity, site expense,
//          supplier payment and other daily spending.
// =============================================================

import { useEffect, useState } from "react";
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
import { C, fmt, today } from "../utils/constants";

const API_URL = "http://localhost:5000/api";

const EXPENSE_CATEGORIES = [
  "Transport",
  "Labour",
  "Loading / Unloading",
  "Electricity",
  "Rent",
  "Tea / Food",
  "Shop Maintenance",
  "Contractor Site Expense",
  "Supplier Payment",
  "Repair / Maintenance",
  "Other",
];

const PAYMENT_TYPES = ["Cash", "UPI", "Cheque", "Bank Transfer"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);

  const blankForm = {
    title: "",
    category: "Transport",
    amount: "",
    paymentType: "Cash",
    expenseDate: today(),
    note: "",
  };

  const [form, setForm] = useState(blankForm);

  const F = (key) => ({
    value: form[key],
    onChange: (value) => setForm((prev) => ({ ...prev, [key]: value })),
  });

  const normalizeDate = (dateValue) => {
    if (!dateValue) return "";
    return String(dateValue).split("T")[0];
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/expenses`);
      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses || []);
      } else {
        alert(data.message || "Failed to fetch expenses");
      }
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const openAdd = () => {
    setForm(blankForm);
    setModal("add");
  };

  const openEdit = (expense) => {
    setForm({
      title: expense.title || "",
      category: expense.category || "Transport",
      amount: String(expense.amount || ""),
      paymentType: expense.paymentType || "Cash",
      expenseDate: expense.expenseDate
        ? normalizeDate(expense.expenseDate)
        : today(),
      note: expense.note || "",
    });

    setModal(expense);
  };

  const closeModal = () => {
    setModal(null);
    setForm(blankForm);
  };

  const saveExpense = async () => {
    if (!form.title || !form.category || !form.amount || !form.expenseDate) {
      alert("Expense title, category, amount and date are required");
      return;
    }

    if (Number(form.amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      amount: Number(form.amount),
      paymentType: form.paymentType,
      expenseDate: form.expenseDate,
      note: form.note.trim(),
    };

    try {
      let response;

      if (modal === "add") {
        response = await fetch(`${API_URL}/expenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_URL}/expenses/${modal.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Expense save failed");
        return;
      }

      closeModal();
      await fetchExpenses();
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
  };

  const deleteExpense = async (id) => {
    if (!confirm("Delete this expense?")) return;

    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Expense delete failed");
        return;
      }

      await fetchExpenses();
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
  };

  const currentMonth = today().slice(0, 7);

  const filtered = expenses.filter((expense) => {
    const searchText = search.toLowerCase();

    return (
      String(expense.title || "").toLowerCase().includes(searchText) ||
      String(expense.category || "").toLowerCase().includes(searchText) ||
      String(expense.paymentType || "").toLowerCase().includes(searchText) ||
      String(expense.note || "").toLowerCase().includes(searchText)
    );
  });

  const todayExpenses = expenses.filter(
    (expense) => normalizeDate(expense.expenseDate) === today()
  );

  const monthExpenses = expenses.filter((expense) =>
    normalizeDate(expense.expenseDate).startsWith(currentMonth)
  );

  const totalExpense = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const todayExpenseTotal = todayExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const monthExpenseTotal = monthExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const cashExpense = expenses
    .filter((expense) => expense.paymentType === "Cash")
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const upiExpense = expenses
    .filter((expense) => expense.paymentType === "UPI")
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

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
          gap: 14,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: C.text,
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            Expenses
          </h2>

          <p style={{ margin: "3px 0 0", color: C.textMuted, fontSize: 13 }}>
            Track daily shop expenses
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search expenses..."
          />

          <Btn onClick={openAdd}>Add Expense</Btn>
        </div>
      </div>

      {/* Summary cards */}
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
          label="TOTAL EXPENSE"
          value={fmt(totalExpense)}
          color={C.danger}
        />

        <StatCard
          icon="DAY"
          label="TODAY EXPENSE"
          value={fmt(todayExpenseTotal)}
          color={C.warning}
        />

        <StatCard
          icon="MON"
          label="THIS MONTH"
          value={fmt(monthExpenseTotal)}
          color={C.purple}
        />

        <StatCard
          icon="CASH"
          label="CASH EXPENSE"
          value={fmt(cashExpense)}
          color={C.success}
        />

        <StatCard
          icon="UPI"
          label="UPI EXPENSE"
          value={fmt(upiExpense)}
          color={C.info}
        />
      </div>

      {/* Expense table */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
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
              Expense List
            </h3>

            <p
              style={{
                margin: "3px 0 0",
                color: C.textMuted,
                fontSize: 12,
              }}
            >
              Showing {filtered.length} of {expenses.length} expenses
            </p>
          </div>
        </div>

        <Table
          cols={[
            {
              key: "title",
              label: "EXPENSE",
              render: (value, row) => (
                <div>
                  <div style={{ fontWeight: 700, color: C.text }}>
                    {value}
                  </div>

                  <div style={{ fontSize: 11, color: C.textMuted }}>
                    {row.note || "No note"}
                  </div>
                </div>
              ),
            },
            {
              key: "category",
              label: "CATEGORY",
              render: (value) => <Badge color="warning">{value}</Badge>,
            },
            {
              key: "amount",
              label: "AMOUNT",
              align: "right",
              render: (value) => (
                <span style={{ color: C.danger, fontWeight: 800 }}>
                  {fmt(value)}
                </span>
              ),
            },
            {
              key: "paymentType",
              label: "PAYMENT",
              render: (value) => (
                <Badge color={value === "Cash" ? "success" : "info"}>
                  {value}
                </Badge>
              ),
            },
            {
              key: "expenseDate",
              label: "DATE",
              render: (value) => normalizeDate(value),
            },
            {
              key: "id",
              label: "ACTIONS",
              align: "right",
              minWidth: 150,
              render: (_, row) => (
                <ActionGroup>
                  <Btn onClick={() => openEdit(row)} variant="ghost" size="sm">
                    Edit
                  </Btn>

                  <Btn
                    onClick={() => deleteExpense(row.id)}
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </Btn>
                </ActionGroup>
              ),
            },
          ]}
          rows={filtered}
          emptyMsg={loading ? "Loading expenses..." : "No expenses found"}
        />
      </Card>

      {/* Add / Edit Modal */}
      {modal && (
        <Modal
          title={modal === "add" ? "Add Expense" : "Edit Expense"}
          onClose={closeModal}
        >
          <FormGrid>
            <Input
              label="Expense Title *"
              {...F("title")}
              style={{ gridColumn: "1/-1" }}
              placeholder="Example: Cement delivery transport"
            />

            <Select
              label="Category *"
              {...F("category")}
              options={EXPENSE_CATEGORIES.map((category) => ({
                value: category,
                label: category,
              }))}
            />

            <Input label="Amount (Rs.) *" {...F("amount")} type="number" />

            <Select
              label="Payment Type"
              {...F("paymentType")}
              options={PAYMENT_TYPES.map((type) => ({
                value: type,
                label: type,
              }))}
            />

            <Input label="Date *" {...F("expenseDate")} type="date" />

            <Input
              label="Note"
              {...F("note")}
              style={{ gridColumn: "1/-1" }}
              placeholder="Optional note"
            />
          </FormGrid>

          <FormActions
            onCancel={closeModal}
            onSave={saveExpense}
            saveLabel={modal === "add" ? "Save Expense" : "Save Changes"}
          />
        </Modal>
      )}
    </div>
  );
}
