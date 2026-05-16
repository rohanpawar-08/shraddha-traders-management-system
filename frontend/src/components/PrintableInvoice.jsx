// =============================================================
// src/components/PrintableInvoice.jsx
// Purpose: Clean professional print-only invoice layout.
// =============================================================

import { CLIENT_CONFIG, fmt } from "../utils/constants";

export default function PrintableInvoice({ sale, customer }) {
  if (!sale) return null;

  const subtotal = Number(sale.subtotal || sale.total || 0);
  const gst = Number(sale.gst || 0);
  const total = Number(sale.total || 0);
  const paid = Number(sale.paid || 0);
  const balance = total - paid;

  return (
    <>
      <style>
        {`
          .print-only-invoice {
            display: none;
          }

          @media print {
            body * {
              visibility: hidden !important;
            }

            .print-only-invoice,
            .print-only-invoice * {
              visibility: visible !important;
            }

            .print-only-invoice {
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
              color: black;
              padding: 24px;
              font-family: Arial, sans-serif;
            }

            @page {
              size: A4;
              margin: 12mm;
            }
          }
        `}
      </style>

      <div className="print-only-invoice">
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            border: "1px solid #222",
            padding: "22px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "2px solid #222",
              paddingBottom: "14px",
              marginBottom: "16px",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "28px" }}>
                {CLIENT_CONFIG.shopName}
              </h1>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                {CLIENT_CONFIG.tagline}
              </p>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Address: {CLIENT_CONFIG.address}
              </p>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Phone: {CLIENT_CONFIG.phone}
              </p>

              {CLIENT_CONFIG.features.gstInvoice && (
                <p style={{ margin: "4px 0", fontSize: "13px" }}>
                  GSTIN: {CLIENT_CONFIG.gstin}
                </p>
              )}
            </div>

            <div style={{ textAlign: "right" }}>
              <h2 style={{ margin: 0, fontSize: "22px" }}>INVOICE</h2>

              <p style={{ margin: "8px 0 0", fontSize: "13px" }}>
                Invoice No: <strong>#{sale.id}</strong>
              </p>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Date: <strong>{sale.date}</strong>
              </p>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Status: <strong>{sale.status}</strong>
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "18px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: "14px",
                  borderBottom: "1px solid #999",
                  paddingBottom: "4px",
                }}
              >
                Bill To
              </h3>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Name: <strong>{sale.customer}</strong>
              </p>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Phone: {customer?.phone || "-"}
              </p>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Address: {customer?.address || "-"}
              </p>
            </div>

            <div>
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: "14px",
                  borderBottom: "1px solid #999",
                  paddingBottom: "4px",
                }}
              >
                Payment Details
              </h3>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Payment Type: <strong>{sale.type}</strong>
              </p>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Paid Amount: <strong>{fmt(paid)}</strong>
              </p>

              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Balance Due: <strong>{fmt(balance)}</strong>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "18px",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr>
                <th style={th}>Sr.</th>
                <th style={thLeft}>Material / Item</th>
                <th style={th}>Qty</th>
                <th style={th}>Rate</th>
                <th style={th}>Amount</th>
              </tr>
            </thead>

            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index}>
                  <td style={tdCenter}>{index + 1}</td>
                  <td style={tdLeft}>{item.name}</td>
                  <td style={tdCenter}>
                    {item.qty} {item.unit}
                  </td>
                  <td style={tdRight}>{fmt(item.price)}</td>
                  <td style={tdRight}>{fmt(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "22px",
            }}
          >
            <table style={{ width: "330px", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={totalLabel}>Subtotal</td>
                  <td style={totalValue}>{fmt(subtotal)}</td>
                </tr>

                {CLIENT_CONFIG.features.gstInvoice && gst > 0 && (
                  <tr>
                    <td style={totalLabel}>GST {CLIENT_CONFIG.gstRate}%</td>
                    <td style={totalValue}>{fmt(gst)}</td>
                  </tr>
                )}

                <tr>
                  <td style={grandLabel}>Grand Total</td>
                  <td style={grandValue}>{fmt(total)}</td>
                </tr>

                <tr>
                  <td style={totalLabel}>Paid</td>
                  <td style={totalValue}>{fmt(paid)}</td>
                </tr>

                <tr>
                  <td style={totalLabel}>Balance</td>
                  <td style={totalValue}>{fmt(balance)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginTop: "35px",
            }}
          >
            <div>
              <p style={{ fontSize: "12px", margin: 0 }}>
                Thank you for your business.
              </p>
              <p style={{ fontSize: "12px", margin: "4px 0 0" }}>
                Goods once sold will not be taken back.
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  borderTop: "1px solid #222",
                  paddingTop: "8px",
                  display: "inline-block",
                  minWidth: "180px",
                  fontSize: "13px",
                }}
              >
                Authorized Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const th = {
  border: "1px solid #222",
  padding: "8px",
  background: "#f2f2f2",
  textAlign: "center",
  fontWeight: "bold",
};

const thLeft = {
  ...th,
  textAlign: "left",
};

const tdCenter = {
  border: "1px solid #222",
  padding: "8px",
  textAlign: "center",
};

const tdLeft = {
  border: "1px solid #222",
  padding: "8px",
  textAlign: "left",
};

const tdRight = {
  border: "1px solid #222",
  padding: "8px",
  textAlign: "right",
};

const totalLabel = {
  border: "1px solid #222",
  padding: "8px",
  fontSize: "13px",
};

const totalValue = {
  border: "1px solid #222",
  padding: "8px",
  fontSize: "13px",
  textAlign: "right",
};

const grandLabel = {
  ...totalLabel,
  fontWeight: "bold",
  fontSize: "15px",
};

const grandValue = {
  ...totalValue,
  fontWeight: "bold",
  fontSize: "15px",
};