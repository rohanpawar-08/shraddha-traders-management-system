const express = require("express");
const router = express.Router();

const db = require("../config/db");

// GET shop settings
router.get("/settings", (req, res) => {
  const sql = "SELECT * FROM shop_settings WHERE id = 1";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch settings",
      });
    }

    res.json({
      success: true,
      settings: result[0] || null,
    });
  });
});

// UPDATE shop settings
router.put("/settings", (req, res) => {
  const {
    shopName,
    tagline,
    ownerName,
    phone,
    address,
    gstin,
    invoiceNote,
  } = req.body;

  if (!shopName || !phone || !address) {
    return res.status(400).json({
      success: false,
      message: "Shop name, phone and address are required",
    });
  }

  const sql = `
    UPDATE shop_settings
    SET shopName = ?, tagline = ?, ownerName = ?, phone = ?, address = ?, gstin = ?, invoiceNote = ?
    WHERE id = 1
  `;

  db.query(
    sql,
    [
      shopName,
      tagline || "",
      ownerName || "",
      phone,
      address,
      gstin || "",
      invoiceNote || "",
    ],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to update settings",
        });
      }

      res.json({
        success: true,
        message: "Settings updated successfully",
      });
    }
  );
});

module.exports = router;