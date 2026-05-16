const express = require("express");
const router = express.Router();

const db = require("../config/db");

// GET all stock entries
router.get("/stock-entries", (req, res) => {
  const sql = "SELECT * FROM stock_entries ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch stock entries",
      });
    }

    res.json({
      success: true,
      stockEntries: result,
    });
  });
});

// CREATE stock entry and increase product stock
router.post("/stock-entries", (req, res) => {
  const {
    productId,
    productName,
    supplier,
    qty,
    unit,
    purchasePrice,
    entryDate,
    note,
  } = req.body || {};

  if (!productId || !productName || !qty || Number(qty) <= 0 || !entryDate) {
    return res.status(400).json({
      success: false,
      message: "Product, quantity and date are required",
    });
  }

  const totalAmount = Number(qty) * Number(purchasePrice || 0);

  db.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Transaction failed to start",
      });
    }

    const insertSql = `
      INSERT INTO stock_entries
      (productId, productName, supplier, qty, unit, purchasePrice, totalAmount, entryDate, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        productId,
        productName,
        supplier || "",
        Number(qty),
        unit || "",
        Number(purchasePrice || 0),
        totalAmount,
        entryDate,
        note || "",
      ],
      (err, result) => {
        if (err) {
          console.log(err);
          return db.rollback(() => {
            res.status(500).json({
              success: false,
              message: "Failed to save stock entry",
            });
          });
        }

        const updateStockSql = `
          UPDATE products
          SET stock = stock + ?
          WHERE id = ?
        `;

        db.query(updateStockSql, [Number(qty), productId], (err) => {
          if (err) {
            console.log(err);
            return db.rollback(() => {
              res.status(500).json({
                success: false,
                message: "Failed to update product stock",
              });
            });
          }

          db.commit((err) => {
            if (err) {
              console.log(err);
              return db.rollback(() => {
                res.status(500).json({
                  success: false,
                  message: "Failed to save transaction",
                });
              });
            }

            res.json({
              success: true,
              message: "Stock entry saved successfully",
              stockEntryId: result.insertId,
            });
          });
        });
      }
    );
  });
});

module.exports = router;    