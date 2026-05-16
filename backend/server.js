const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const saleRoutes = require("./routes/saleRoutes");
const stockRoutes = require("./routes/stockRoutes");
const reportRoutes = require("./routes/reportRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const backupRoutes = require("./routes/backupRoutes");
const settingsRoutes = require("./routes/settingsRoutes");



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", customerRoutes);
app.use("/api", supplierRoutes);
app.use("/api", saleRoutes);
app.use("/api", stockRoutes);
app.use("/api", reportRoutes);
app.use("/api", paymentRoutes);
app.use("/api", expenseRoutes);
app.use("/api", backupRoutes);
app.use("/api", settingsRoutes);

app.get("/", (req, res) => {
  res.send("Shraddha Traders API Running...");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});