import { useEffect, useRef, useState } from "react";
import { api } from "../api";

export default function TransactionsPage() {
  // Daten
  const [items, setItems] = useState([]);
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");

  // Buchungsformular
  const [form, setForm] = useState({
    itemId: "",
    type: "remove",
    amount: 1,
    personName: "",
    note: ""
  });

  // Suche für Artikelliste im Formular
  const [searchQ, setSearchQ] = useState("");

  // Filter für Tabelle (Autocomplete)
  const [txQuery, setTxQuery] = useState("");
  const [txMatches, setTxMatches] = useState([]);
  const [filterItem, setFilterItem] = useState(null);
  const searchTimer = useRef(null);

  // Gemeinsamer Loader
  const load = async (formItemsQuery, txItemId) => {
    try {
      setErr("");
      const [itemsRes, txRes] = await Promise.all([
        api.listItems(formItemsQuery ? { q: formItemsQuery } : undefined),
        api.listTransactions(txItemId ? { itemId: txItemId } : undefined)
      ]);
      setItems(itemsRes);
      setList(txRes);
      if (!form.itemId && itemsRes[0]?._id) {
        setForm((f) => ({ ...f, itemId: itemsRes[0]._id }));
      }
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  // Buchen
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      const payload = { ...form, amount: Number(form.amount) || 1 };
      await api.createTransaction(payload);
      setForm((f) => ({ ...f, amount: 1, note: "" }));
      await load(searchQ, filterItem?._id || undefined);
    } catch (e) {
      setErr(e.message);
    }
  };

  // Löschen
  const handleDelete = async (id) => {
    if (!confirm("Diese Transaktion löschen? Der Bestand wird entsprechend zurückgebucht.")) return;
    try {
      setErr("");
      await api.deleteTransaction(id);
      await load(searchQ, filterItem?._id || undefined);
    } catch (e) {
      setErr(e.message);
    }
  };

  // Formular-Suche
  const handleFormSearch = async (e) => {
    e.preventDefault();
    await load(searchQ.trim(), filterItem?._id || undefined);
  };

  // --- Autocomplete für Tabellen-Filter ---
  const onTxQueryChange = (val) => {
    setTxQuery(val);
    setTxMatches([]);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) return;

    searchTimer.current = setTimeout(async () => {
      try {
        const matches = await api.listItems({ q: val.trim() });
        setTxMatches(matches.map(m => ({ _id: m._id, name: m.name })));
      } catch (e) {
        setErr(e.message);
      }
    }, 300);
  };

  const chooseTxFilter = async (match) => {
    setFilterItem(match);
    setTxQuery(match.name);
    setTxMatches([]);
    await load(searchQ || undefined, match._id);
  };

  const clearTxFilter = async () => {
    setFilterItem(null);
    setTxQuery("");
    setTxMatches([]);
    await load(searchQ || undefined, undefined);
  };

  return (
    <section>
      <h2>Bewegungen</h2>

      {err && <div className="error">{err}</div>}

      {/* Reihe 1: Suche für Artikelliste im Formular */}
      <form onSubmit={handleFormSearch} className="row">
        <input
          placeholder="Artikel suchen"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />
        <button>Suche</button>
      </form>

      {/* Reihen 2–4: Buchungsformular */}
      <form onSubmit={handleSubmit} className="grid-tx">
        {/* Artikel (6) – mit aktuellem Bestand in Klammern, kurz */}
        <label style={{ gridColumn: "span 6" }}>
          Artikel
          <select
            value={form.itemId}
            onChange={(e) => setForm({ ...form, itemId: e.target.value })}
          >
            {items.map((it) => (
              <option key={it._id} value={it._id} title={it.name}>
                {it.name}{typeof it.quantity === "number" ? ` (${it.quantity} stk)` : ""}
              </option>
            ))}
          </select>
        </label>

        {/* Typ (3) */}
        <label style={{ gridColumn: "span 3" }}>
          Typ
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="remove">Entnahme</option>
            <option value="add">Zugang</option>
          </select>
        </label>

        {/* Menge (3) */}
        <label style={{ gridColumn: "span 3" }}>
          Menge
          <input
            type="number"
            min="1"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </label>

        {/* Person (6) */}
        <label style={{ gridColumn: "span 6" }}>
          Person (optional)
          <input
            value={form.personName}
            onChange={(e) => setForm({ ...form, personName: e.target.value })}
          />
        </label>

        {/* Notiz (6) */}
        <label style={{ gridColumn: "span 6" }}>
          Notiz (optional)
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </label>

        {/* Button-Zeile (12) */}
        <div className="row" style={{ gridColumn: "span 12" }}>
          <button>Buchen</button>
        </div>
      </form>

      {/* Tabellen-Filter (Autocomplete) */}
      <div className="tx-autocomplete" style={{ marginTop: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Bewegungen filtern (Artikel)
          <input
            placeholder="Artikelname oder EAN eingeben"
            value={txQuery}
            onChange={(e) => onTxQueryChange(e.target.value)}
          />
        </label>

        {txMatches.length > 0 && (
          <div className="tx-list">
            {txMatches.map((m) => (
              <div
                key={m._id}
                className="tx-item"
                onClick={() => chooseTxFilter(m)}
                title={m.name}
              >
                {m.name}
              </div>
            ))}
          </div>
        )}

        <div className="row" style={{ marginTop: 8 }}>
          <button type="button" onClick={clearTxFilter}>
            {filterItem ? `Filter löschen (${filterItem.name})` : "Alle anzeigen"}
          </button>
        </div>
      </div>

      <h3>Letzte Buchungen</h3>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Artikel</th>
              <th>Typ</th>
              <th>Menge</th>
              <th>Person</th>
              <th>Datum</th>
              <th>Neuer Bestand</th>{/* NEU */}
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t._id}>
                <td>{t.itemId?.name || "-"}</td>
                <td>{t.type === "remove" ? "Entnahme" : "Zugang"}</td>
                <td>{t.amount}</td>
                <td>{t.personName || "-"}</td>
                <td>{new Date(t.date).toLocaleString()}</td>
                <td>{typeof t.postQuantity === "number" ? `${t.postQuantity} stk` : "-"}</td>
                <td className="nowrap">
                  <button onClick={() => handleDelete(t._id)}>Löschen</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan="7">Noch keine Buchungen</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
