const express = require("express");
const router = express.Router();

const db = require("../config/db");

// =============================================================
// GET all expenses
// URL: GET /api/expenses
// =============================================================
router.get("/expenses", (req, res) => {
  const sql = `
    SELECT *
    FROM expenses
    ORDER BY expenseDate DESC, id DESC
  `;

  db.query(sql, (err, expenses) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch expenses",
      });
    }

    res.json({
      success: true,
      expenses,
    });
  });
});

// =============================================================
// ADD expense
// URL: POST /api/expenses
// =============================================================
router.post("/expenses", (req, res) => {
  const { title, category, amount, paymentType, expenseDate, note } = req.body;

  if (!title || !category || !amount || !expenseDate) {
    return res.status(400).json({
      success: false,
      message: "Title, category, amount and date are required",
    });
  }

  const sql = `
    INSERT INTO expenses
    (title, category, amount, paymentType, expenseDate, note)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title,
      category,
      Number(amount),
      paymentType || "Cash",
      expenseDate,
      note || "",
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to add expense",
        });
      }

      res.json({
        success: true,
        message: "Expense added successfully",
        expenseId: result.insertId,
      });
    }
  );
});

// =============================================================
// UPDATE expense
// URL: PUT /api/expenses/:id
// =============================================================
router.put("/expenses/:id", (req, res) => {
  const { id } = req.params;
  const { title, category, amount, paymentType, expenseDate, note } = req.body;

  if (!title || !category || !amount || !expenseDate) {
    return res.status(400).json({
      success: false,
      message: "Title, category, amount and date are required",
    });
  }

  const sql = `
    UPDATE expenses
    SET title = ?, category = ?, amount = ?, paymentType = ?, expenseDate = ?, note = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title,
      category,
      Number(amount),
      paymentType || "Cash",
      expenseDate,
      note || "",
      id,
    ],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to update expense",
        });
      }

      res.json({
        success: true,
        message: "Expense updated successfully",
      });
    }
  );
});

// =============================================================
// DELETE expense
// URL: DELETE /api/expenses/:id
// =============================================================
router.delete("/expenses/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM expenses WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete expense",
      });
    }

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  });
});

module.exports = router;