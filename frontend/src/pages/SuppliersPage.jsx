// =============================================================
// src/pages/SuppliersPage.jsx
// Purpose: Manage material suppliers.
//          Tracks outstanding payable balance per supplier.
// =============================================================

import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Btn, Badge, Card, Modal, Table, ActionGroup,
  SearchBar, Input, Select, FormGrid, FormActions,
} from "../components/UI";
import { C, CLIENT_CONFIG, fmt } from "../utils/constants";

export default function SuppliersPage() {
  const { suppliers, fetchSuppliers } = useAppContext();

  const [search, setSearch] = useState("");
  const [modal,  setModal]  = useState(null);

  const blankForm = {
    name: "", phone: "", email: "", address: "",
    category: "Cement", balance: "0",
  };
  const [form, setForm] = useState(blankForm);
  const F = key => ({ value: form[key], onChange: v => setForm(f => ({ ...f, [key]: v })) });

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = ()  => { setForm(blankForm); setModal("add"); };
  const openEdit = (s) => { setForm({ ...s, balance: String(s.balance) }); setModal(s); };
    const handleDelete = async (id) => {
    if (!confirm("Delete supplier?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/suppliers/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await fetchSuppliers();
        alert("Supplier deleted successfully");
      } else {
        alert(data.message || "Failed to delete supplier");
      }
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
  };
    const handleSave = async () => {
    if (!form.name || !form.phone) {
      alert("Name and phone required");
      return;
    }

    const supplierData = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      category: form.category,
      balance: Number(form.balance || 0),
    };

    try {
      let response;

      if (modal === "add") {
        response = await fetch("http://localhost:5000/api/suppliers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplierData),
        });
      } else {
        response = await fetch(`http://localhost:5000/api/suppliers/${modal.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplierData),
        });
      }

      const data = await response.json();

      if (data.success) {
        await fetchSuppliers();
        setModal(null);
        alert(modal === "add" ? "Supplier added successfully" : "Supplier updated successfully");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Backend server not connected");
    }
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

      {/* ── Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0, color: C.text, fontSize: 20, fontWeight: 900 }}>Suppliers</h2>
          <p style={{ margin: "3px 0 0", color: C.textMuted, fontSize: 13 }}>
            Manage supplier details
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search suppliers..." />
          <Btn onClick={openAdd}>Add Supplier</Btn>
        </div>
      </div>

      {/* ── Table */}
      <Card>
        <Table
          cols={[
            {
              key: "name", label: "SUPPLIER",
              render: (v, r) => (
                <div>
                  <div style={{ fontWeight: 700, color: C.text }}>{v}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{r.phone} · {r.email}</div>
                </div>
              ),
            },
            { key: "category", label: "CATEGORY", render: v => <Badge color="warning">{v}</Badge> },
            { key: "address",  label: "ADDRESS",  render: v => <span style={{ color: C.textSub, fontSize: 12 }}>{v}</span> },
            {
              key: "balance", label: "PAYABLE", align: "right",
              render: v => (
                <span style={{ color: v > 0 ? C.danger : C.success, fontWeight: 800 }}>
                  {fmt(v)}
                </span>
              ),
            },
            {
              key: "id", label: "ACTIONS",
              align: "right",
              minWidth: 150,
              render: (_, r) => (
                <ActionGroup>
                  <Btn onClick={() => openEdit(r)} variant="ghost" size="sm">Edit</Btn>
                  <Btn onClick={() => handleDelete(r.id)} variant="danger" size="sm">Delete</Btn>
                </ActionGroup>
              ),
            },
          ]}
          rows={filtered}
        />
      </Card>

      {/* ── Modal */}
      {modal && (
        <Modal
          title={modal === "add" ? "Add Supplier" : "Edit Supplier"}
          onClose={() => setModal(null)}
        >
          <FormGrid>
            <Input label="Supplier Name *" {...F("name")} style={{ gridColumn: "1/-1" }} />
            <Input label="Phone *" {...F("phone")} />
            <Input label="Email"   {...F("email")} type="email" />
            <Input label="Address" {...F("address")} style={{ gridColumn: "1/-1" }} />
            <Select
              label="Category"
              {...F("category")}
              options={[...CLIENT_CONFIG.categories, "Other"].map(c => ({ value: c, label: c }))}
            />
            <Input label="Outstanding Balance (₹)" {...F("balance")} type="number" />
          </FormGrid>
          <FormActions
            onCancel={() => setModal(null)}
            onSave={handleSave}
            saveLabel={modal === "add" ? "Add Supplier" : "Save"}
          />
        </Modal>
      )}
    </div>
  );
}


