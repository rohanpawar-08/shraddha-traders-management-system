import { useState } from "react";
import { Input, Btn } from "../components/UI";
import { C, CLIENT_CONFIG } from "../utils/constants";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handle = async () => {
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin();
      } else {
        setError(data.message || "Invalid login details");
      }
    } catch (err) {
      console.error(err);
      setError("Backend server not connected. Please start backend first.");
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") handle();
  };

  return (
    <div
      onKeyDown={onKey}
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 30% 20%, ${C.accent}11 0%, transparent 55%),
                       radial-gradient(ellipse at 75% 80%, ${C.info}09 0%, transparent 55%)`,
        }}
      />

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          width: 400,
          padding: 40,
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>
            {CLIENT_CONFIG.logo}
          </div>

          <h1
            style={{
              margin: 0,
              color: C.accent,
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            {CLIENT_CONFIG.shopName}
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: C.textMuted,
              fontSize: 13,
            }}
          >
            {CLIENT_CONFIG.tagline}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="USERNAME"
            value={username}
            onChange={setUsername}
            required
          />

          <Input
            label="PASSWORD"
            value={password}
            onChange={setPassword}
            type="password"
            required
          />

          {error && (
            <div
              style={{
                background: "#7f1d1d44",
                border: "1px solid #ef444455",
                color: "#fca5a5",
                padding: "9px 13px",
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          <Btn onClick={handle} size="lg" full>
            Sign In →
          </Btn>
        </div>

        <p
          style={{
            textAlign: "center",
            color: C.textMuted,
            fontSize: 11,
            marginTop: 18,
          }}
        >
          Login: admin / admin123
        </p>
      </div>
    </div>
  );
}

