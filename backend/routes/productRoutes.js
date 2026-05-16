const express = require("express");
const router = express.Router();

const db = require("../config/db");

// GET all products
router.get("/products", (req, res) => {
  const sql = "SELECT * FROM products ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }

    res.json({
      success: true,
      products: result,
    });
  });
});

// ADD product
router.post("/products", (req, res) => {
  const { name, category, price, stock, minStock, unit, supplier } = req.body;

  if (!name || !category || !unit) {
    return res.status(400).json({
      success: false,
      message: "Product name, category and unit are required",
    });
  }

  const sql = `
    INSERT INTO products (name, category, price, stock, minStock, unit, supplier)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      category,
      Number(price || 0),
      Number(stock || 0),
      Number(minStock || 0),
      unit,
      supplier || "",
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to add product",
        });
      }

      res.json({
        success: true,
        message: "Product added successfully",
        productId: result.insertId,
      });
    }
  );
});

// UPDATE product
router.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, minStock, unit, supplier } = req.body;

  if (!name || !category || !unit) {
    return res.status(400).json({
      success: false,
      message: "Product name, category and unit are required",
    });
  }

  const sql = `
    UPDATE products
    SET name = ?, category = ?, price = ?, stock = ?, minStock = ?, unit = ?, supplier = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      category,
      Number(price || 0),
      Number(stock || 0),
      Number(minStock || 0),
      unit,
      supplier || "",
      id,
    ],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to update product",
        });
      }

      res.json({
        success: true,
        message: "Product updated successfully",
      });
    }
  );
});

// ADD STOCK / STOCK-IN
router.patch("/products/:id/add-stock", (req, res) => {
  const { id } = req.params;
  const { qty } = req.body;

  if (!qty || Number(qty) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid stock quantity is required",
    });
  }

  const sql = `
    UPDATE products
    SET stock = stock + ?
    WHERE id = ?
  `;

  db.query(sql, [Number(qty), id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to add stock",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Stock added successfully",
    });
  });
});

// DELETE product
router.delete("/products/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM products WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete product",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  });
});

module.exports = router;