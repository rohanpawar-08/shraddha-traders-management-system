// =============================================================
// src/pages/BackupPage.jsx
// Purpose: Export business data as CSV backups.
// =============================================================

import { Card, Btn, StatCard } from "../components/UI";
import { C } from "../utils/constants";

const API_URL = "http://localhost:5000/api";

const backupItems = [
  {
    title: "Products Backup",
    description: "Download all products, stock, price, unit and supplier details.",
    endpoint: "products",
    icon: "PRD",
  },
  {
    title: "Customers Backup",
    description: "Download all customer names, phone numbers, addresses and pending amount details.",
    endpoint: "customers",
    icon: "CUS",
  },
  {
    title: "Suppliers Backup",
    description: "Download supplier contact details and payable balance.",
    endpoint: "suppliers",
    icon: "SUP",
  },
  {
    title: "Sales Backup",
    description: "Download all bills with customer, total, paid and status.",
    endpoint: "sales",
    icon: "INV",
  },
  {
    title: "Sale Items Backup",
    description: "Download bill item details like product, qty, rate and subtotal.",
    endpoint: "sale-items",
    icon: "ITM",
  },
  {
    title: "Payments Backup",
    description: "Download payment collection history.",
    endpoint: "payments",
    icon: "PAY",
  },
  {
    title: "Expenses Backup",
    description: "Download all shop expenses, category, payment type and notes.",
    endpoint: "expenses",
    icon: "EXP",
  },
];

export default function BackupPage() {
  const downloadBackup = (endpoint) => {
    window.open(`${API_URL}/backup/${endpoint}`, "_blank");
  };

  const downloadAllBackups = () => {
    backupItems.forEach((item, index) => {
      setTimeout(() => {
        window.open(`${API_URL}/backup/${item.endpoint}`, "_blank");
      }, index * 500);
    });
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        padding: "24px clamp(18px, 2.2vw, 28px)",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: C.text,
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            Backup
          </h2>

          <p style={{ margin: "3px 0 0", color: C.textMuted, fontSize: 13 }}>
            Download business data backup
          </p>
        </div>

        <Btn onClick={downloadAllBackups} variant="primary">
          Download All
        </Btn>
      </div>

      {/* Info cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <StatCard
          icon="BK"
          label="DATA SAFETY"
          value="CSV Backup"
          sub="Client can keep offline copy"
          color={C.success}
        />

        <StatCard
          icon="CSV"
          label="EXCEL READY"
          value="Openable"
          sub="Works with Excel / Google Sheets"
          color={C.info}
        />

        <StatCard
          icon="DB"
          label="CLIENT READY"
          value="Professional"
          sub="Useful for real shop owner"
          color={C.accent}
        />
      </div>

      {/* Backup cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 18,
        }}
      >
        {backupItems.map((item) => (
          <Card key={item.endpoint}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 18,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: C.accentGlow,
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.accent,
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.icon}
                </div>

                <div>
                  <div
                    style={{
                      color: C.text,
                      fontSize: 15,
                      fontWeight: 900,
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      color: C.textMuted,
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              </div>

              <Btn onClick={() => downloadBackup(item.endpoint)}>
                Download CSV
              </Btn>
            </div>
          </Card>
        ))}
      </div>

      {/* Help note */}
      <Card style={{ marginTop: 20 }}>
        <h3
          style={{
            margin: "0 0 8px",
            color: C.text,
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          Backup Advice
        </h3>

        <p style={{ margin: 0, color: C.textSub, fontSize: 13, lineHeight: 1.6 }}>
          Download backup files every week and store them in Google Drive,
          pen drive, or another safe location. This protects shop data if the
          computer has any issue.
        </p>
      </Card>
    </div>
  );
}

