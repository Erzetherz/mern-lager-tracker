import { useEffect, useState } from "react";
import { api } from "../api";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Formularzustand
  const [form, setForm] = useState({
    name: "",
    ean: "",
    serialNumber: "",
    quantity: 0,
    location: ""
  });
  const [editId, setEditId] = useState(null);

  // Suchtext
  const [q, setQ] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await api.listItems(q ? { q } : undefined);
      setItems(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErr("");

      const payload = {
        name: form.name.trim(),
        ean: form.ean.trim() || undefined,
        serialNumber: form.serialNumber.trim() || undefined,
        quantity: Number(form.quantity) || 0,
        location: form.location.trim()
      };
      if (!payload.name) throw new Error("Name ist erforderlich");

      if (editId) {
        await api.updateItem(editId, payload);
      } else {
        await api.createItem(payload);
      }

      setForm({ name: "", ean: "", serialNumber: "", quantity: 0, location: "" });
      setEditId(null);
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({
      name: item.name || "",
      ean: item.ean || "",
      serialNumber: item.serialNumber || "",
      quantity: item.quantity ?? 0,
      location: item.location || ""
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Diesen Artikel löschen?")) return;
    try {
      setErr("");
      await api.deleteItem(id);
      await load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await load();
  };

  return (
    <section>
      <h2>Artikel</h2>

      {/* Neuen Artikel anlegen */}
      <h3>{editId ? "Artikel bearbeiten" : "Neuen Artikel anlegen"}</h3>
      {err && <div className="error">{err}</div>}

      <form onSubmit={handleSubmit} className="grid" style={{ marginBottom: 16 }}>
        <label>Name
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </label>

        <label>EAN (optional, 8 oder 13 Ziffern)
          <input
            value={form.ean}
            onChange={e => setForm({ ...form, ean: e.target.value })}
          />
        </label>

        <label>Seriennummer (optional)
          <input
            value={form.serialNumber}
            onChange={e => setForm({ ...form, serialNumber: e.target.value })}
          />
        </label>

        <label>Menge
          <input
            type="number"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })}
          />
        </label>

        <label>Ort
          <input
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />
        </label>

        <div className="row">
          <button type="submit">{editId ? "Speichern" : "Anlegen"}</button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm({ name:"", ean:"", serialNumber:"", quantity:0, location:"" });
              }}
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>

      <hr style={{ margin: "12px 0 16px", border: 0, borderTop: "1px solid #ddd" }} />

      {/* Suche über der Tabelle */}
      <form onSubmit={handleSearch} className="row" style={{ marginBottom: 8 }}>
        <input
          placeholder="Artikel suchen"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button>Suche</button>
      </form>

      {/* Tabelle */}
      {loading ? (
        <div>Laden…</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>EAN</th>
                <th>Seriennr.</th>
                <th>Menge</th>
                <th>Ort</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it._id}>
                  <td>{it.name}</td>
                  <td>{it.ean || "-"}</td>
                  <td>{it.serialNumber || "-"}</td>
                  <td>{it.quantity}</td>
                  <td>{it.location || "-"}</td>
                  <td className="nowrap">
                    <button onClick={() => handleEdit(it)}>Bearbeiten</button>
                    <button onClick={() => handleDelete(it._id)}>Löschen</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="6">Keine Artikel gefunden</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
