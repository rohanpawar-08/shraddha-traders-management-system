const express = require("express");
const router = express.Router();

const db = require("../config/db");

// GET all customers
router.get("/customers", (req, res) => {
  const sql = "SELECT * FROM customers ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch customers",
      });
    }

    res.json({
      success: true,
      customers: result,
    });
  });
});

// ADD customer
router.post("/customers", (req, res) => {
  const { name, phone, email, address, type, creditLimit, creditUsed } = req.body;

  const sql = `
    INSERT INTO customers (name, phone, email, address, type, creditLimit, creditUsed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      phone,
      email,
      address,
      type,
      creditLimit || 0,
      creditUsed || 0,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to add customer",
        });
      }

      res.json({
        success: true,
        message: "Customer added successfully",
        customerId: result.insertId,
      });
    }
  );
});

// UPDATE customer
router.put("/customers/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address, type, creditLimit, creditUsed } = req.body;

  const sql = `
    UPDATE customers
    SET name = ?, phone = ?, email = ?, address = ?, type = ?, creditLimit = ?, creditUsed = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      phone,
      email,
      address,
      type,
      creditLimit || 0,
      creditUsed || 0,
      id,
    ],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to update customer",
        });
      }

      res.json({
        success: true,
        message: "Customer updated successfully",
      });
    }
  );
});

// DELETE customer
router.delete("/customers/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM customers WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete customer",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  });
});

// =============================================================
// GET customer ledger
// URL: GET /api/customers/:id/ledger
// Purpose: Show all invoices and payments for one customer
// =============================================================
router.get("/customers/:id/ledger", (req, res) => {
  const { id } = req.params;

  const customerSql = `
    SELECT id, name, phone, address, type, creditLimit, creditUsed
    FROM customers
    WHERE id = ?
    LIMIT 1
  `;

  db.query(customerSql, [id], (err, customerRows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch customer",
      });
    }

    if (customerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = customerRows[0];

    const salesSql = `
      SELECT 
        id,
        date,
        total,
        paid,
        (total - paid) AS balance,
        type,
        status
      FROM sales
      WHERE customerId = ?
      ORDER BY id DESC
    `;

    db.query(salesSql, [id], (err, sales) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch customer invoices",
        });
      }

      const paymentsSql = `
        SELECT 
          id,
          saleId,
          amount,
          paymentType,
          note,
          date
        FROM payments
        WHERE customerId = ?
        ORDER BY id DESC
      `;

      db.query(paymentsSql, [id], (err, payments) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch customer payments",
          });
        }

        const totalInvoiceAmount = sales.reduce(
          (sum, sale) => sum + Number(sale.total),
          0
        );

        const totalPaidAmount = payments.reduce(
          (sum, payment) => sum + Number(payment.amount),
          0
        );

        const totalBalance = sales.reduce(
          (sum, sale) => sum + Number(sale.balance),
          0
        );

        res.json({
          success: true,
          customer,
          summary: {
            totalInvoices: sales.length,
            totalInvoiceAmount,
            totalPaidAmount,
            totalBalance,
            currentCreditUsed: Number(customer.creditUsed),
          },
          sales,
          payments,
        });
      });
    });
  });
});

module.exports = router;
