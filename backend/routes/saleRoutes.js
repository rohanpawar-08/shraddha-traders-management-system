const express = require("express");
const router = express.Router();

const db = require("../config/db");

// =============================================================
// GET all sales with items
// URL: GET /api/sales
// =============================================================
router.get("/sales", (req, res) => {
  const salesSql = "SELECT * FROM sales ORDER BY id DESC";

  db.query(salesSql, (err, sales) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch sales",
      });
    }

    const itemsSql = "SELECT * FROM sale_items";

    db.query(itemsSql, (err, items) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch sale items",
        });
      }

      const salesWithItems = sales.map((sale) => ({
        ...sale,
        total: Number(sale.total),
        paid: Number(sale.paid),
        subtotal: Number(sale.subtotal || 0),
        gst: Number(sale.gst || 0),
        items: items
          .filter((item) => Number(item.saleId) === Number(sale.id))
          .map((item) => ({
            ...item,
            qty: Number(item.qty),
            price: Number(item.price),
            subtotal: Number(item.subtotal),
          })),
      }));

      res.json({
        success: true,
        sales: salesWithItems,
      });
    });
  });
});

// =============================================================
// GET all payments
// URL: GET /api/payments
// Purpose: Later we use this for Daily Collection / Reports
// =============================================================
router.get("/payments", (req, res) => {
  const sql = "SELECT * FROM payments ORDER BY id DESC";

  db.query(sql, (err, payments) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payments",
      });
    }

    res.json({
      success: true,
      payments: payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    });
  });
});

// =============================================================
// CREATE invoice
// URL: POST /api/sales
// =============================================================
router.post("/sales", (req, res) => {
  const {
    customerId,
    customer,
    date,
    items,
    subtotal,
    gst,
    total,
    paid,
    type,
    status,
  } = req.body;

  if (!customerId || !customer || !date || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invoice data is incomplete",
    });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Transaction failed to start",
      });
    }

    // ---------------------------------------------------------
    // 1. Backend stock validation
    // ---------------------------------------------------------
    const productIds = items.map((item) => Number(item.productId));

    const stockSql = `
      SELECT id, name, stock
      FROM products
      WHERE id IN (?)
    `;

    db.query(stockSql, [productIds], (err, products) => {
      if (err) {
        console.log(err);
        return db.rollback(() => {
          res.status(500).json({
            success: false,
            message: "Failed to check product stock",
          });
        });
      }

      for (const item of items) {
        const product = products.find(
          (p) => Number(p.id) === Number(item.productId)
        );

        if (!product) {
          return db.rollback(() => {
            res.status(400).json({
              success: false,
              message: `Product not found: ${item.name}`,
            });
          });
        }

        if (Number(item.qty) > Number(product.stock)) {
          return db.rollback(() => {
            res.status(400).json({
              success: false,
              message: `Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`,
            });
          });
        }
      }

      // ---------------------------------------------------------
      // 2. Insert sale
      // ---------------------------------------------------------
      const saleSql = `
        INSERT INTO sales 
        (customerId, customer, date, subtotal, gst, total, paid, type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        saleSql,
        [
          customerId,
          customer,
          date,
          Number(subtotal || 0),
          Number(gst || 0),
          Number(total || 0),
          Number(paid || 0),
          type,
          status,
        ],
        (err, saleResult) => {
          if (err) {
            console.log(err);
            return db.rollback(() => {
              res.status(500).json({
                success: false,
                message: "Failed to create invoice",
              });
            });
          }

          const saleId = saleResult.insertId;

          // ---------------------------------------------------------
          // 3. Insert sale items
          // ---------------------------------------------------------
          const itemValues = items.map((item) => [
            saleId,
            Number(item.productId),
            item.name,
            Number(item.qty),
            Number(item.price),
            item.unit,
            Number(item.subtotal),
          ]);

          const itemsSql = `
            INSERT INTO sale_items 
            (saleId, productId, name, qty, price, unit, subtotal)
            VALUES ?
          `;

          db.query(itemsSql, [itemValues], (err) => {
            if (err) {
              console.log(err);
              return db.rollback(() => {
                res.status(500).json({
                  success: false,
                  message: "Failed to save invoice items",
                });
              });
            }

            // ---------------------------------------------------------
            // 4. Reduce stock
            // ---------------------------------------------------------
            const stockUpdates = items.map((item) => {
              return new Promise((resolve, reject) => {
                const updateStockSql = `
                  UPDATE products
                  SET stock = stock - ?
                  WHERE id = ?
                `;

                db.query(
                  updateStockSql,
                  [Number(item.qty), Number(item.productId)],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            });

            Promise.all(stockUpdates)
              .then(() => {
                const paidAmount = Number(paid || 0);
                const balance = Number(total || 0) - paidAmount;

                // ---------------------------------------------------------
                // 5. Save initial payment if paid amount > 0
                // Example: Cash invoice full paid OR Credit invoice partial paid
                // ---------------------------------------------------------
                const saveInitialPayment = () => {
                  return new Promise((resolve, reject) => {
                    if (paidAmount <= 0) return resolve();

                    const paymentSql = `
                      INSERT INTO payments
                      (saleId, customerId, customer, amount, paymentType, note)
                      VALUES (?, ?, ?, ?, ?, ?)
                    `;

                    db.query(
                      paymentSql,
                      [
                        saleId,
                        customerId,
                        customer,
                        paidAmount,
                        type || "Cash",
                        "Initial invoice payment",
                      ],
                      (err) => {
                        if (err) reject(err);
                        else resolve();
                      }
                    );
                  });
                };

                saveInitialPayment()
                  .then(() => {
                    // ---------------------------------------------------------
                    // 6. If balance exists, update customer creditUsed
                    // ---------------------------------------------------------
                    if (balance > 0) {
                      const creditSql = `
                        UPDATE customers
                        SET creditUsed = creditUsed + ?
                        WHERE id = ?
                      `;

                      db.query(creditSql, [balance, customerId], (err) => {
                        if (err) {
                          console.log(err);
                          return db.rollback(() => {
                            res.status(500).json({
                              success: false,
                              message: "Failed to update customer credit",
                            });
                          });
                        }

                        db.commit((err) => {
                          if (err) {
                            return db.rollback(() => {
                              res.status(500).json({
                                success: false,
                                message: "Failed to save transaction",
                              });
                            });
                          }

                          res.json({
                            success: true,
                            message: "Invoice created successfully",
                            saleId,
                          });
                        });
                      });
                    } else {
                      db.commit((err) => {
                        if (err) {
                          return db.rollback(() => {
                            res.status(500).json({
                              success: false,
                              message: "Failed to save transaction",
                            });
                          });
                        }

                        res.json({
                          success: true,
                          message: "Invoice created successfully",
                          saleId,
                        });
                      });
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message: "Failed to save payment history",
                      });
                    });
                  });
              })
              .catch((error) => {
                console.log(error);
                db.rollback(() => {
                  res.status(500).json({
                    success: false,
                    message: "Failed to update product stock",
                  });
                });
              });
          });
        }
      );
    });
  });
});

// =============================================================
// COLLECT payment against pending invoice
// URL: POST /api/sales/:id/payment
// Body: { "amount": 500, "paymentType": "Cash", "note": "Paid today" }
// =============================================================
router.post("/sales/:id/payment", (req, res) => {
  const saleId = req.params.id;
  const amount = Number(req.body.amount);
  const paymentType = req.body.paymentType || "Cash";
  const note = req.body.note || "Credit payment collection";

  if (!saleId || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid payment amount is required",
    });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Transaction failed to start",
      });
    }

    const getSaleSql = `
      SELECT *
      FROM sales
      WHERE id = ?
      LIMIT 1
    `;

    db.query(getSaleSql, [saleId], (err, rows) => {
      if (err) {
        console.log(err);
        return db.rollback(() => {
          res.status(500).json({
            success: false,
            message: "Failed to fetch invoice",
          });
        });
      }

      if (rows.length === 0) {
        return db.rollback(() => {
          res.status(404).json({
            success: false,
            message: "Invoice not found",
          });
        });
      }

      const sale = rows[0];

      const total = Number(sale.total);
      const paid = Number(sale.paid);
      const balance = total - paid;

      if (balance <= 0) {
        return db.rollback(() => {
          res.status(400).json({
            success: false,
            message: "This invoice is already fully paid",
          });
        });
      }

      const actualPayment = Math.min(amount, balance);
      const newPaid = paid + actualPayment;
      const newStatus = newPaid >= total ? "Paid" : "Partial";

      const updateSaleSql = `
        UPDATE sales
        SET paid = ?, status = ?
        WHERE id = ?
      `;

      db.query(updateSaleSql, [newPaid, newStatus, saleId], (err) => {
        if (err) {
          console.log(err);
          return db.rollback(() => {
            res.status(500).json({
              success: false,
              message: "Failed to update invoice payment",
            });
          });
        }

        const updateCustomerSql = `
          UPDATE customers
          SET creditUsed = GREATEST(creditUsed - ?, 0)
          WHERE id = ?
        `;

        db.query(
          updateCustomerSql,
          [actualPayment, sale.customerId],
          (err) => {
            if (err) {
              console.log(err);
              return db.rollback(() => {
                res.status(500).json({
                  success: false,
                  message: "Failed to update customer credit",
                });
              });
            }

            // ---------------------------------------------------------
            // Save payment history
            // ---------------------------------------------------------
            const paymentSql = `
              INSERT INTO payments
              (saleId, customerId, customer, amount, paymentType, note)
              VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
              paymentSql,
              [
                saleId,
                sale.customerId,
                sale.customer,
                actualPayment,
                paymentType,
                note,
              ],
              (err) => {
                if (err) {
                  console.log(err);
                  return db.rollback(() => {
                    res.status(500).json({
                      success: false,
                      message: "Failed to save payment history",
                    });
                  });
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message: "Failed to save payment",
                      });
                    });
                  }

                  res.json({
                    success: true,
                    message: "Payment collected successfully",
                    payment: actualPayment,
                    newPaid,
                    newStatus,
                  });
                });
              }
            );
          }
        );
      });
    });
  });
});

module.exports = router;