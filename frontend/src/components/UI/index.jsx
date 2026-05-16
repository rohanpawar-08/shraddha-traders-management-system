// =============================================================
// src/components/UI/index.jsx
// Purpose: Shared UI primitives used throughout the frontend.
// =============================================================

import { C } from "../../utils/constants";

const focusRing = `0 0 0 3px ${C.accentGlow}`;

const labelStyle = {
  fontSize: 11,
  color: C.textSub,
  fontWeight: 700,
  letterSpacing: "0.055em",
  textTransform: "uppercase",
};

const controlStyle = {
  width: "100%",
  minHeight: 42,
  background: C.field,
  border: `1px solid ${C.border}`,
  color: C.text,
  padding: "10px 14px",
  borderRadius: 11,
  fontSize: 14,
  outline: "none",
  lineHeight: 1.4,
  transition:
    "border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease",
};

export const PageShell = ({ title, subtitle, actions, children }) => (
  <div
    style={{
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      padding: "24px clamp(18px, 2.2vw, 28px)",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      overflowX: "hidden",
    }}
  >
    {(title || subtitle || actions) && (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          {title && (
            <h2
              style={{
                margin: 0,
                color: C.text,
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 0,
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              style={{
                margin: "5px 0 0",
                color: C.textMuted,
                fontSize: 13,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {actions}
          </div>
        )}
      </div>
    )}
    {children}
  </div>
);

const applyFocus = (e) => {
  e.currentTarget.style.borderColor = C.accent;
  e.currentTarget.style.boxShadow = focusRing;
};

const removeFocus = (e) => {
  e.currentTarget.style.borderColor = C.border;
  e.currentTarget.style.boxShadow = "none";
};

export const Badge = ({ children, color = "accent" }) => {
  const map = {
    accent: {
      bg: "color-mix(in srgb, var(--accent) 12%, transparent)",
      text: C.accent,
      border: "color-mix(in srgb, var(--accent) 28%, transparent)",
    },
    success: {
      bg: "color-mix(in srgb, var(--success) 12%, transparent)",
      text: C.success,
      border: "color-mix(in srgb, var(--success) 28%, transparent)",
    },
    danger: {
      bg: "color-mix(in srgb, var(--danger) 12%, transparent)",
      text: C.danger,
      border: "color-mix(in srgb, var(--danger) 28%, transparent)",
    },
    info: {
      bg: "color-mix(in srgb, var(--info) 12%, transparent)",
      text: C.info,
      border: "color-mix(in srgb, var(--info) 28%, transparent)",
    },
    warning: {
      bg: "color-mix(in srgb, var(--warning) 14%, transparent)",
      text: C.warning,
      border: "color-mix(in srgb, var(--warning) 30%, transparent)",
    },
    muted: { bg: C.surfaceHigh, text: C.textMuted, border: C.border },
    purple: {
      bg: "color-mix(in srgb, var(--purple) 12%, transparent)",
      text: C.purple,
      border: "color-mix(in srgb, var(--purple) 28%, transparent)",
    },
  };
  const s = map[color] || map.accent;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 22,
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.035em",
        whiteSpace: "nowrap",
        lineHeight: 1.2,
      }}
    >
      {children}
    </span>
  );
};

export const Btn = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  full = false,
  style: ext = {},
}) => {
  const { hoverBackground, ...buttonExt } = ext;
  const sizes = {
    sm: { height: 34, minHeight: 34, padding: "0 13px", fontSize: 12 },
    md: { height: 40, minHeight: 40, padding: "0 16px", fontSize: 13 },
    lg: { height: 48, minHeight: 48, padding: "0 24px", fontSize: 14 },
  };

  const variants = {
    primary: {
      background: "linear-gradient(135deg, var(--accent) 0%, #b88900 100%)",
      hover: "linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 100%)",
      color: "#08111f",
      border: "color-mix(in srgb, var(--accent) 72%, #3b2f12)",
      shadow: "0 7px 16px rgba(201, 162, 39, 0.14)",
    },
    danger: {
      background:
        "linear-gradient(135deg, var(--danger) 0%, #b91c1c 100%)",
      hover:
        "linear-gradient(135deg, #b91c1c 0%, var(--danger) 100%)",
      color: "#fff",
      border: "color-mix(in srgb, var(--danger) 72%, #7f1d1d)",
      shadow: "0 7px 14px rgba(220, 38, 38, 0.12)",
    },
    warning: {
      background: C.warning,
      hover: "color-mix(in srgb, var(--warning) 86%, #ffffff)",
      color: "#111827",
      border: C.warning,
      shadow: "0 6px 13px rgba(245, 158, 11, 0.12)",
    },
    ghost: {
      background: "color-mix(in srgb, var(--card) 96%, var(--surface-high))",
      hover: C.surfaceHigh,
      color: C.text,
      border: C.border,
      shadow: "none",
    },
    success: {
      background: "linear-gradient(135deg, var(--success) 0%, #15803d 100%)",
      hover: "linear-gradient(135deg, #15803d 0%, var(--success) 100%)",
      color: "#fff",
      border: "color-mix(in srgb, var(--success) 86%, #ffffff)",
      shadow: "0 7px 15px rgba(22, 163, 74, 0.13)",
    },
    info: {
      background: C.info,
      hover: "color-mix(in srgb, var(--info) 86%, #000000)",
      color: "#fff",
      border: C.info,
      shadow: "0 7px 15px rgba(37, 99, 235, 0.13)",
    },
    purple: {
      background: C.purple,
      hover: "color-mix(in srgb, var(--purple) 86%, #000000)",
      color: "#fff",
      border: C.purple,
      shadow: "0 6px 13px rgba(124, 58, 237, 0.12)",
    },
  };

  const s = variants[variant] || variants.primary;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBackground || s.hover;
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = buttonExt.background || s.background;
        e.currentTarget.style.transform = "translateY(0)";
      }}
      style={{
        border: `1px solid ${buttonExt.borderColor || s.border}`,
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: size === "sm" ? 10 : 12,
        fontWeight: 800,
        letterSpacing: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition:
          "background 0.16s ease, border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease",
        opacity: disabled ? 0.62 : 1,
        width: full ? "100%" : "auto",
        whiteSpace: "nowrap",
        boxShadow: disabled || size === "sm" ? "none" : s.shadow,
        ...sizes[size],
        background: disabled
          ? "color-mix(in srgb, var(--surface-high) 84%, transparent)"
          : s.background,
        color: disabled ? C.textMuted : s.color,
        ...buttonExt,
      }}
    >
      {children}
    </button>
  );
};

export function ActionGroup({ children }) {
  return (
    <div
      className="action-group"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
        flexWrap: "nowrap",
        minWidth: "max-content",
      }}
    >
      {children}
    </div>
  );
}

export const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  style: ext = {},
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
    {label && (
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: C.danger }}> *</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={applyFocus}
      onBlur={removeFocus}
      placeholder={placeholder}
      style={{ ...controlStyle, ...ext }}
    />
  </div>
);

export const Select = ({
  label,
  value,
  onChange,
  options,
  required = false,
  style: ext = {},
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
    {label && (
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: C.danger }}> *</span>}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={applyFocus}
      onBlur={removeFocus}
      style={{ ...controlStyle, appearance: "auto", ...ext }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export const Card = ({ children, style: ext = {} }) => (
  <div
    style={{
      background: `linear-gradient(180deg, color-mix(in srgb, ${C.card} 94%, ${C.surfaceHigh}) 0%, ${C.card} 100%)`,
      border: `1px solid ${C.border}`,
      borderRadius: 18,
      padding: 20,
      boxShadow: C.shadowSoft,
      transition: "border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease",
      ...ext,
    }}
  >
    {children}
  </div>
);

export const Modal = ({ title, children, onClose, width = 560 }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.42)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 18,
      overflowY: "auto",
    }}
  >
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        width: "100%",
        maxWidth: width,
        maxHeight: "min(92vh, 860px)",
        overflow: "auto",
        boxShadow: C.shadow,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          padding: "18px 22px",
          borderBottom: `1px solid ${C.borderSoft}`,
          background: C.surface,
        }}
      >
        <h3 style={{ margin: 0, color: C.text, fontSize: 16, fontWeight: 800 }}>
          {title}
        </h3>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 32,
            height: 32,
            background: C.surfaceHigh,
            border: `1px solid ${C.border}`,
            borderRadius: 9,
            color: C.textSub,
            fontSize: 18,
            cursor: "pointer",
            lineHeight: 1,
            transition: "background 0.16s ease, color 0.16s ease",
          }}
        >
          x
        </button>
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </div>
  </div>
);

export const StatCard = ({ icon, label, value, sub, color = C.accent }) => (
  <Card style={{ minHeight: 118 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ ...labelStyle, color: C.textMuted, marginBottom: 9 }}>
          {label}
        </div>
        <div
          style={{
            fontSize: 25,
            fontWeight: 900,
            color: C.text,
            letterSpacing: 0,
            lineHeight: 1.15,
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 8 }}>
            {sub}
          </div>
        )}
      </div>
      <div
        style={{
          width: 40,
          height: 40,
          flex: "0 0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `color-mix(in srgb, ${color} 13%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
          borderRadius: 13,
          color,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: "0.04em",
        }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

export const Table = ({ cols, rows, emptyMsg = "No records found" }) => (
  <>
    <style>
      {`
        .saas-table-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .saas-table-scroll::-webkit-scrollbar {
          height: 8px;
        }

        .saas-table-scroll::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 999px;
        }

        .action-group {
          flex-wrap: nowrap;
        }

        .action-group > * {
          flex: 0 0 auto;
        }

        .action-group button {
          white-space: nowrap;
        }
      `}
    </style>
    <div
      className="saas-table-scroll"
      style={{
        overflowX: "auto",
        width: "100%",
        maxWidth: "100%",
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        background: C.card,
        boxShadow: "0 1px 0 rgba(15, 23, 42, 0.03)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          tableLayout: "auto",
          fontSize: 13,
          minWidth: 760,
        }}
      >
        <thead>
          <tr>
            {cols.map((c, index) => {
              const label = String(c.label || c.key || "").toLowerCase();
              const isAction = label.includes("action");

              return (
                <th
                  key={`${c.key}-${index}`}
                  style={{
                    padding: "14px 16px",
                    textAlign: c.align || (isAction ? "right" : "left"),
                    color: C.textMuted,
                    background: C.surfaceHigh,
                    borderBottom: `1px solid ${C.border}`,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    fontWeight: 900,
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                    minWidth: isAction ? c.minWidth || 190 : c.minWidth,
                    width: c.width,
                  }}
                >
                  {c.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={cols.length}
                style={{
                  padding: "38px 20px",
                  textAlign: "center",
                  color: C.textMuted,
                  background: C.card,
                  fontSize: 13,
                  fontWeight: 700,
                  borderBottom: "none",
                }}
              >
                {emptyMsg}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "color-mix(in srgb, var(--accent-glow) 72%, transparent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                style={{
                  transition: "background 0.14s ease",
                }}
              >
                {cols.map((c, index) => {
                  const label = String(c.label || c.key || "").toLowerCase();
                  const isAction = label.includes("action");
                  const canWrap =
                    c.wrap ||
                    ["name", "customer", "supplier", "material", "address", "description", "note"].some((part) =>
                      label.includes(part)
                    );

                  return (
                    <td
                      key={`${c.key}-${index}`}
                      style={{
                        padding: "15px 16px",
                        color: C.text,
                        fontSize: 13,
                        textAlign: c.align || (isAction ? "right" : "left"),
                        verticalAlign: "middle",
                        borderBottom:
                          i === rows.length - 1
                            ? "none"
                            : `1px solid ${C.borderSoft}`,
                        lineHeight: 1.4,
                        whiteSpace: isAction || !canWrap ? "nowrap" : "normal",
                        overflowWrap: canWrap ? "anywhere" : "normal",
                        wordBreak: "normal",
                        minWidth: isAction ? c.minWidth || 190 : c.minWidth,
                        width: c.width,
                      }}
                    >
                      {c.render ? c.render(row[c.key], row) : row[c.key]}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </>
);

export const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div style={{ position: "relative", maxWidth: "100%" }}>
    <span
      style={{
        position: "absolute",
        left: 13,
        top: "50%",
        transform: "translateY(-50%)",
        color: C.textMuted,
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      /
    </span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={applyFocus}
      onBlur={removeFocus}
      placeholder={placeholder}
      style={{
        ...controlStyle,
        width: "min(240px, 100%)",
        paddingLeft: 32,
        fontSize: 13,
      }}
    />
  </div>
);

export const FormGrid = ({ children, cols = 2 }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${
        cols >= 3 ? 180 : 220
      }px), 1fr))`,
      gap: 15,
    }}
  >
    {children}
  </div>
);

export const FormActions = ({ onCancel, onSave, saveLabel = "Save" }) => (
  <div
    style={{
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      flexWrap: "wrap",
      marginTop: 22,
      paddingTop: 16,
      borderTop: `1px solid ${C.borderSoft}`,
    }}
  >
    <Btn onClick={onCancel} variant="ghost">
      Cancel
    </Btn>
    <Btn onClick={onSave}>{saveLabel}</Btn>
  </div>
);
