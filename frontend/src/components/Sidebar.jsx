// =============================================================
// src/components/Sidebar.jsx
// Purpose: Left navigation sidebar.
//          Now reads shop name/logo/tagline from Settings via AppContext.
// =============================================================

import { Btn } from "./UI";
import { C, buildNav } from "../utils/constants";
import { useAppContext } from "../context/AppContext";

export default function Sidebar({ active, setActive, onLogout, alertCount }) {
  const nav = buildNav();
  const { shopSettings, theme, toggleTheme } = useAppContext();
  const brandMark = "ST";

  return (
    <div
      style={{
        width: 252,
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #07111f 0%, #0b1220 48%, #07111f 100%)",
        borderRight: "1px solid rgba(148, 163, 184, 0.14)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        boxShadow: "8px 0 28px rgba(2, 6, 23, 0.22)",
      }}
    >
      {/* Brand header */}
      <div
        style={{
          padding: "22px 18px 20px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background:
                "linear-gradient(135deg, #d6b447 0%, #a67c00 100%)",
              border: "1px solid rgba(214, 180, 71, 0.36)",
              color: "#07111f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 14,
              letterSpacing: "0.04em",
              boxShadow: "0 12px 28px rgba(214, 180, 71, 0.20)",
            }}
          >
            {brandMark}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: C.sidebarText,
                fontWeight: 900,
                fontSize: 15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {shopSettings.shopName || "Shraddha Traders"}
            </div>

            <div
              style={{
                color: C.sidebarSub,
                fontSize: 11,
                marginTop: 3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {shopSettings.tagline || "Wholesale & Retail Building Materials"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 10px" }}>
        {nav.map((n) => {
          const isActive = active === n.id;

          return (
            <div
              key={n.id}
              onClick={() => setActive(n.id)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(148, 163, 184, 0.10)";
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.12)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 11px",
                borderRadius: 14,
                marginBottom: 6,
                cursor: "pointer",
                background: isActive
                  ? "linear-gradient(135deg, #d6b447 0%, #a67c00 100%)"
                  : "transparent",
                color: isActive ? "#07111f" : C.sidebarSub,
                fontWeight: isActive ? 800 : 600,
                fontSize: 13,
                transition: "all 0.15s ease",
                border: "1px solid transparent",
                boxShadow: isActive
                  ? "0 10px 26px rgba(214, 180, 71, 0.20)"
                  : "none",
              }}
            >
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isActive
                    ? "rgba(17, 24, 39, 0.14)"
                    : "rgba(148, 163, 184, 0.10)",
                  color: isActive ? "#07111f" : C.sidebarSub,
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.03em",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {n.icon}
              </span>
              {n.label}
            </span>

            {n.id === "products" && alertCount > 0 && (
              <span
                style={{
                  background: C.danger,
                  color: "#fff",
                  borderRadius: 99,
                  fontSize: 10,
                  padding: "2px 7px",
                  fontWeight: 800,
                }}
              >
                {alertCount}
              </span>
            )}
            </div>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div
        style={{
          padding: "14px 10px",
          borderTop: "1px solid rgba(148, 163, 184, 0.14)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "10px 11px",
            borderRadius: 14,
            background: "rgba(148, 163, 184, 0.09)",
            border: "1px solid rgba(148, 163, 184, 0.14)",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 11,
              background: "rgba(214, 180, 71, 0.13)",
              border: "1px solid rgba(214, 180, 71, 0.24)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.sidebarText,
              fontWeight: 900,
              fontSize: 12,
            }}
          >
            A
          </div>

          <div>
            <div style={{ color: C.sidebarText, fontSize: 12, fontWeight: 700 }}>
              Admin
            </div>
            <div style={{ color: C.sidebarSub, fontSize: 10 }}>
              Super Admin
            </div>
          </div>
        </div>

        <Btn
          onClick={toggleTheme}
          variant="ghost"
          size="sm"
          full
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            hoverBackground: "rgba(255, 255, 255, 0.10)",
            borderColor: "rgba(148, 163, 184, 0.18)",
            color: C.sidebarText,
            boxShadow: "none",
            marginBottom: 8,
          }}
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </Btn>

        <Btn
          onClick={onLogout}
          variant="ghost"
          size="sm"
          full
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            hoverBackground: "rgba(255, 255, 255, 0.10)",
            borderColor: "rgba(148, 163, 184, 0.18)",
            color: C.sidebarText,
            boxShadow: "none",
          }}
        >
          Logout
        </Btn>
      </div>
    </div>
  );
}
