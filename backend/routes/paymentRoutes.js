const express = require("express");
const router = express.Router();

const db = require("../config/db");

// =============================================================
// GET all payments
// URL: GET /api/payments
// =============================================================
router.get("/payments", (req, res) => {
  const sql = `
    SELECT *
    FROM payments
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payments",
      });
    }

    res.json({
      success: true,
      payments: result,
    });
  });
});

// =============================================================
// GET payments by customer
// URL: GET /api/payments/customer/:customerId
// =============================================================
router.get("/payments/customer/:customerId", (req, res) => {
  const { customerId } = req.params;

  const sql = `
    SELECT *
    FROM payments
    WHERE customerId = ?
    ORDER BY id DESC
  `;

  db.query(sql, [customerId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch customer payments",
      });
    }

    res.json({
      success: true,
      payments: result,
    });
  });
});

module.exports = router;