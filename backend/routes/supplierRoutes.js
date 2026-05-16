const express = require("express");
const router = express.Router();

const db = require("../config/db");

// GET all suppliers
router.get("/suppliers", (req, res) => {
  const sql = "SELECT * FROM suppliers ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch suppliers",
      });
    }

    res.json({
      success: true,
      suppliers: result,
    });
  });
});

// ADD supplier
router.post("/suppliers", (req, res) => {
  const { name, phone, email, address, category, balance } = req.body;

  const sql = `
    INSERT INTO suppliers (name, phone, email, address, category, balance)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, phone, email, address, category, balance || 0],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to add supplier",
        });
      }

      res.json({
        success: true,
        message: "Supplier added successfully",
        supplierId: result.insertId,
      });
    }
  );
});

// UPDATE supplier
router.put("/suppliers/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address, category, balance } = req.body;

  const sql = `
    UPDATE suppliers
    SET name = ?, phone = ?, email = ?, address = ?, category = ?, balance = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, phone, email, address, category, balance || 0, id],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to update supplier",
        });
      }

      res.json({
        success: true,
        message: "Supplier updated successfully",
      });
    }
  );
});

// DELETE supplier
router.delete("/suppliers/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM suppliers WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete supplier",
      });
    }

    res.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  });
});

module.exports = router;