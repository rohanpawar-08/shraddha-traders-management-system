const express = require("express");
const router = express.Router();

const db = require("../config/db");

// =============================================================
// DAILY COLLECTION REPORT
// URL: GET /api/reports/daily?date=2026-05-12
// If date not given, it uses today
// =============================================================
router.get("/reports/daily", (req, res) => {
  const date = req.query.date || new Date().toISOString().split("T")[0];

  const sql = `
    SELECT 
      id,
      customer,
      date,
      total,
      paid,
      (total - paid) AS balance,
      type,
      status
    FROM sales
    WHERE DATE(date) = ?
    ORDER BY id DESC
  `;

  db.query(sql, [date], (err, sales) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch daily report",
      });
    }

    const totalSales = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
    const totalCollected = sales.reduce((sum, s) => sum + Number(s.paid || 0), 0);
    const totalPending = sales.reduce(
      (sum, s) => sum + (Number(s.total || 0) - Number(s.paid || 0)),
      0
    );

    const cashCollection = sales
      .filter((s) => s.type === "Cash")
      .reduce((sum, s) => sum + Number(s.paid || 0), 0);

    const upiCollection = sales
      .filter((s) => s.type === "UPI")
      .reduce((sum, s) => sum + Number(s.paid || 0), 0);

    const creditCollection = sales
      .filter((s) => s.type === "Credit")
      .reduce((sum, s) => sum + Number(s.paid || 0), 0);

    const chequeCollection = sales
      .filter((s) => s.type === "Cheque")
      .reduce((sum, s) => sum + Number(s.paid || 0), 0);

    res.json({
      success: true,
      date,
      summary: {
        totalInvoices: sales.length,
        totalSales,
        totalCollected,
        totalPending,
        cashCollection,
        upiCollection,
        creditCollection,
        chequeCollection,
      },
      sales,
    });
  });
});

// =============================================================
// OVERALL BUSINESS SUMMARY
// URL: GET /api/reports/summary
// =============================================================
router.get("/reports/summary", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS totalInvoices,
      IFNULL(SUM(total), 0) AS totalSales,
      IFNULL(SUM(paid), 0) AS totalCollected,
      IFNULL(SUM(total - paid), 0) AS totalPending
    FROM sales
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch report summary",
      });
    }

    res.json({
      success: true,
      summary: result[0],
    });
  });
});

module.exports = router;