# Lager & Entnahme‑Tracker (MERN)

Einfache Lagerverwaltung mit Artikeln (CRUD) und Bewegungen (Entnahme/Zugang).

## Schnellstart (lokal)

### Voraussetzungen
- Node.js 18+
- MongoDB Atlas (oder lokale MongoDB)

### Backend
```bash
cd backend
cp .env.example .env
# In .env MONGODB_URI setzen (Atlas-URI), optional CLIENT_ORIGIN anpassen
npm install
npm run dev
```

### Frontend
```bash
cd ../frontend
npm install
# Optional: .env anlegen -> VITE_API_URL=http://localhost:4000
npm run dev
```

## Deployment

### Backend auf Render.com
1. Repo zu GitHub pushen.
2. In Render: New → Web Service → Root: `backend/`
3. Build: `npm install` – Start: `npm start`
4. Env Vars: `MONGODB_URI`, `CLIENT_ORIGIN` (Frontend-URL oder `*` für Tests)

### Frontend (z. B. Vercel)
- Projekt importieren → Root: `frontend/`
- Env Var: `VITE_API_URL` = URL des Render-Backends
- Build: automatisch durch Vite

## API (Kurzüberblick)
- `GET /api/items` – Liste (optional: `q`, `minQty`, `maxQty`)
- `POST /api/items` – anlegen
- `GET /api/items/:id` – lesen
- `PUT /api/items/:id` – aktualisieren
- `DELETE /api/items/:id` – löschen

- `GET /api/transactions` – Liste (optional: `itemId`)
- `POST /api/transactions` – buchen (passt Bestand an, kein negativer Bestand)
- `DELETE /api/transactions/:id` – löschen (ohne Rückbuchung)

## Hinweise
- Code ist bewusst klar kommentiert.
- Erweiterbar um Auth, Rollen, Exporte etc.
