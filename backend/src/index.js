import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

const allowedOrigin = process.env.CLIENT_ORIGIN || "*";
app.use(cors());
app.options("*", cors());

app.get("/", (req, res) => {
  res.send("Lager-Tracker Backend läuft");
});

app.use("/api/items", itemRoutes);
app.use("/api/transactions", transactionRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Fehlende Umgebungsvariable MONGODB_URI");
  process.exit(1);
}

connectDB(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server läuft auf Port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("DB-Verbindung fehlgeschlagen:", err);
    process.exit(1);
  });
