const express = require("express");
const router = express.Router();

const db = require("../config/db");

// =============================================================
// Helper: Convert MySQL rows to CSV
// =============================================================
const toCSV = (rows) => {
  if (!rows || rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return "";

    const stringValue = String(value).replace(/"/g, '""');

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue}"`;
    }

    return stringValue;
  };

  const csvHeaders = headers.join(",");

  const csvRows = rows.map((row) =>
    headers.map((header) => escapeCSV(row[header])).join(",")
  );

  return [csvHeaders, ...csvRows].join("\n");
};

// =============================================================
// Helper: Download table as CSV
// =============================================================
const exportTable = (req, res, tableName, fileName) => {
  const sql = `SELECT * FROM ${tableName}`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: `Failed to export ${tableName}`,
      });
    }

    const csv = toCSV(rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}.csv"`
    );

    res.send(csv);
  });
};

// =============================================================
// GET /api/backup/products
// =============================================================
router.get("/backup/products", (req, res) => {
  exportTable(req, res, "products", "products_backup");
});

// =============================================================
// GET /api/backup/customers
// =============================================================
router.get("/backup/customers", (req, res) => {
  exportTable(req, res, "customers", "customers_backup");
});

// =============================================================
// GET /api/backup/suppliers
// =============================================================
router.get("/backup/suppliers", (req, res) => {
  exportTable(req, res, "suppliers", "suppliers_backup");
});

// =============================================================
// GET /api/backup/sales
// =============================================================
router.get("/backup/sales", (req, res) => {
  exportTable(req, res, "sales", "sales_backup");
});

// =============================================================
// GET /api/backup/sale-items
// =============================================================
router.get("/backup/sale-items", (req, res) => {
  exportTable(req, res, "sale_items", "sale_items_backup");
});

// =============================================================
// GET /api/backup/payments
// =============================================================
router.get("/backup/payments", (req, res) => {
  exportTable(req, res, "payments", "payments_backup");
});

// =============================================================
// GET /api/backup/expenses
// =============================================================
router.get("/backup/expenses", (req, res) => {
  exportTable(req, res, "expenses", "expenses_backup");
});

module.exports = router;