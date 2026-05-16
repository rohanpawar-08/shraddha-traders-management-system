const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "shraddha_traders",
});

db.connect((err) => {
  if (err) {
    console.log("❌ MySQL Connection Failed");
    console.log(err);
    return;
  }

  console.log("✅ MySQL Connected");
});

module.exports = db;