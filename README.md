# Lager-Tracker (MERN)

Eine einfache, praxistaugliche Lagerverwaltung für kleine Bestände.  
Technik: **MongoDB Atlas, Express.js, React (Vite), Node.js**.  

- **Live-Demo (Frontend):** https://mern-lager-tracker-cb0d6nvze-adrians-projects-bb29b229.vercel.app/
- **Backend:** https://lager-tracker-backend.onrender.com

---

## Ziele
- Artikel mit Grunddaten verwalten (Name, EAN optional, Seriennummer optional, Lagerort, Bestand).
- Zu- und Abgänge buchen; Bestand wird automatisch angepasst.
- Buchung löschen ⇒ Bestand wird korrekt zurückgebucht.
- Suche/Filter (z. B. Autocomplete für Bewegungen).
- Responsives UI (Desktop & mobil), schlanke REST-API, Cloud-Deployment.

---

## Projektstruktur

```plaintext
mern-lager-tracker/
├─ backend/               # Express API
│  ├─ src/
│  │  ├─ config/          # DB-Verbindung, .env
│  │  ├─ controllers/     # Items/Transactions Logik
│  │  ├─ middleware/      # Error-Handler, 404
│  │  ├─ models/          # Mongoose-Modelle
│  │  ├─ routes/          # /api/items, /api/transactions
│  │  └─ index.js         # App-Bootstrap
│  └─ package.json
├─ frontend/              # React (Vite)
│  ├─ src/
│  │  ├─ api.js           # API-Basis-URL
│  │  ├─ pages/           # Items.jsx, Transactions.jsx
│  │  ├─ App.jsx, main.jsx
│  │  └─ styles.css
│  ├─ index.html
│  └─ package.json
└─ README.md
```

---

## Datenmodell

**Item**
```json
{
  "_id": "…",
  "name": "Klebestift 10g",
  "ean": "12345678",        // optional, 8 oder 13 Ziffern
  "serialNumber": "A-001",  // optional
  "quantity": 42,
  "location": "Lager A",
  "createdAt": "…",
  "updatedAt": "…"
}
```

**Transaction**
```json
{
  "_id": "…",
  "itemId": "<ref Item>",
  "type": "add" | "remove",
  "amount": 3,
  "personName": "Adrian",   // optional
  "note": "optional",
  "date": "…",
  "postQuantity": 39,
  "createdAt": "…",
  "updatedAt": "…"
}
```

---

## API (Kurzüberblick)

### Items
- `GET /api/items?q=<text>` – Liste (Suche über Name/EAN)
- `POST /api/items` – anlegen
- `PATCH /api/items/:id` – ändern
- `DELETE /api/items/:id` – löschen

### Transactions
- `GET /api/transactions?itemId=<id>` – Liste (optional nach Artikel filtern)
- `POST /api/transactions` – buchen `{ itemId, type, amount, personName?, note? }`
- `DELETE /api/transactions/:id` – Buchung löschen (Rollback des Bestands)

---

## Lokale Installation

### Backend
```bash
cd backend
cp .env.example .env
# .env befüllen:
# MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/lagerapp?retryWrites=true&w=majority
# CLIENT_ORIGIN=http://localhost:5173
# PORT=4000   # optional

npm install
npm run dev
```

### Frontend
```bash
cd ../frontend
# API-Basis (lokal): 
# echo VITE_API_URL=http://localhost:4000/api > .env

npm install
npm run dev
# Browser: http://localhost:5173
```

---

## Deployment

### Backend (Render)
- **New → Web Service** → Repo wählen → **Root Directory:** `backend`
- **Environment:** Node 18+
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `MONGODB_URI` = Atlas Connection String (z. B. `/lagerapp`)
  - `CLIENT_ORIGIN` = Frontend-Domain (z. B. `https://…vercel.app`)
  - `PORT` (optional; Default 4000)
- **Atlas Network Access**: während der Abgabe ggf. `0.0.0.0/0` zulassen.
- Test: `GET /api/items` sollte JSON liefern.

### Frontend (Vercel)
- **Add New → Project** → Repo → **Root Directory:** `frontend`
- Preset: **Vite**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **ENV (Production):**
  - `VITE_API_URL` = `https://<dein-backend>.onrender.com/api`
- Nach Deploy: App-URL öffnen, Funktionen testen.

---

## Bedienung
1. Artikel anlegen/bearbeiten/löschen (EAN/Seriennummer optional).
2. Bewegungen buchen:
   - Artikel wählen (Bestand wird angezeigt),
   - Typ „Zugang“/„Entnahme“,
   - Menge, optional Person + Notiz,
   - „Buchen“.
3. Letzte Buchungen:
   - Spalte „Neuer Bestand“ (postQuantity),
   - Buchung löschen ⇒ Bestand wird zurückgebucht.
4. Filter/Autocomplete für Artikel in Bewegungen.

---

## Troubleshooting
- **CORS**: `CLIENT_ORIGIN` im Backend exakt auf die Frontend-Domain setzen (ohne Slash).  
- **Atlas Verbindung**: IP in Atlas freigeben (Network Access).  
- **Leere Listen**: Prüfe `VITE_API_URL` (muss auf `/api` enden).  
- **Mobile Ansicht**: Tabellen sind horizontal scrollbar (`.table-wrap`).  

---

## Reflexion (kurz)
- **Konsistenz bei Löschen von Buchungen**  
  → `DELETE /api/transactions/:id` macht „inverse Buchung“ mit `$inc`.  
- **Responsive Tabellen**  
  → Min-Breite + scrollbare Hülle, Formular-Grid bricht mobil einspaltig.  
- **EAN optional, aber valide**  
  → Validierung nur, wenn Feld gesetzt ist (8/13 Ziffern).  

---

## Lizenz
Nur für Ausbildungs-/Demozwecke.
