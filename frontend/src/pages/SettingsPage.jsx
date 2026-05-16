import { useEffect, useState } from "react";
import { Btn, Card, Input, FormGrid } from "../components/UI";
import { C } from "../utils/constants";
import { useAppContext } from "../context/AppContext";

export default function SettingsPage() {
  const { API_URL, shopSettings, setShopSettings, fetchSettings } =
    useAppContext();
  const [form, setForm] = useState(shopSettings);
  const [saving, setSaving] = useState(false);

  const F = (key) => ({
    value: form[key] || "",
    onChange: (value) => setForm((prev) => ({ ...prev, [key]: value })),
  });

  const saveSettings = async () => {
    if (!form.shopName || !form.phone || !form.address) {
      alert("Shop name, phone and address are required");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Failed to save settings");
        return;
      }

      setShopSettings((prev) => ({
        ...prev,
        ...form,
      }));

      if (fetchSettings) {
        await fetchSettings();
      }

      alert("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Backend server not connected");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setForm(shopSettings);
  }, [shopSettings]);

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
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: C.text, fontSize: 20, fontWeight: 900 }}>
          Shop Settings
        </h2>
        <p style={{ margin: "3px 0 0", color: C.textMuted, fontSize: 13 }}>
          Update shop details used in bills and sidebar
        </p>
      </div>

      <Card>
        <>
            <FormGrid cols={2}>
              <Input label="Shop Name *" {...F("shopName")} />
              <Input label="Owner Name" {...F("ownerName")} />

              <Input label="Tagline" {...F("tagline")} />
              <Input label="Phone *" {...F("phone")} />

              <Input label="GSTIN" {...F("gstin")} />

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    color: C.textSub,
                    fontSize: 11,
                    fontWeight: 800,
                    marginBottom: 6,
                    letterSpacing: "0.05em",
                  }}
                >
                  Address *
                </label>
                <textarea
                  value={form.address || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    borderRadius: 9,
                    padding: "10px 12px",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    color: C.textSub,
                    fontSize: 11,
                    fontWeight: 800,
                    marginBottom: 6,
                    letterSpacing: "0.05em",
                  }}
                >
                  Bill Note
                </label>
                <textarea
                  value={form.invoiceNote || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      invoiceNote: e.target.value,
                    }))
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    borderRadius: 9,
                    padding: "10px 12px",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </FormGrid>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <Btn onClick={saveSettings} variant="primary" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Btn>
            </div>
        </>
      </Card>
    </div>
  );
}


