import { NavLink, Route, Routes } from "react-router-dom";
import ItemsPage from "./pages/Items.jsx";
import TransactionsPage from "./pages/Transactions.jsx";

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>Lager & Entnahme-Tracker</h1>
        <nav>
          <NavLink to="/" end>Artikel</NavLink>
          <NavLink to="/transactions">Bewegungen</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ItemsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
      </main>

      <footer>
        <small>Demo – MERN</small>
      </footer>
    </div>
  );
}
