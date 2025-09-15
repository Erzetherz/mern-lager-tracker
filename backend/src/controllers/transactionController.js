// Controller für Transaktionen: Listen, Anlegen (mit postQuantity), Löschen (Rollback)

import { Item } from "../models/Item.js";
import { Transaction } from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/transactions?itemId=...
export const listTransactions = asyncHandler(async (req, res) => {
  const { itemId } = req.query;
  const filter = {};
  if (itemId) filter.itemId = itemId;

  const tx = await Transaction.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .populate("itemId", "name"); // nur Name mitgeben
  res.json(tx);
});

// POST /api/transactions
export const createTransaction = asyncHandler(async (req, res) => {
  const { itemId, type, amount, personName, note } = req.body;

  if (!itemId || !type || !amount) {
    res.status(400);
    throw new Error("itemId, type und amount sind erforderlich");
  }
  if (!["add", "remove"].includes(type)) {
    res.status(400);
    throw new Error("Ungültiger Typ. Erlaubt sind 'add' oder 'remove'.");
  }
  const qty = Number(amount);
  if (!Number.isFinite(qty) || qty < 1) {
    res.status(400);
    throw new Error("Menge muss eine Zahl ≥ 1 sein.");
  }

  // Bestand anpassen und die neue Menge (postQuantity) erhalten
  let updatedItem;

  if (type === "add") {
    updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { $inc: { quantity: qty } },
      { new: true }
    );
    if (!updatedItem) {
      res.status(404);
      throw new Error("Artikel nicht gefunden");
    }
  } else {
    // remove: nur wenn genug Bestand vorhanden ist (atomar)
    updatedItem = await Item.findOneAndUpdate(
      { _id: itemId, quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      { new: true }
    );
    if (!updatedItem) {
      res.status(400);
      throw new Error("Bestand zu niedrig für diese Entnahme.");
    }
  }

  const tx = await Transaction.create({
    itemId,
    type,
    amount: qty,
    personName: personName?.trim() || undefined,
    note: note?.trim() || undefined,
    postQuantity: updatedItem.quantity, // NEU
  });

  // Fürs UI gleich den Artikelnamen mitgeben
  const populated = await tx.populate("itemId", "name");
  res.status(201).json(populated);
});

// DELETE /api/transactions/:id
export const deleteTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx) {
    res.status(404);
    throw new Error("Transaktion nicht gefunden");
  }

  // Rollback: inverse Buchung
  if (tx.type === "remove") {
    const updated = await Item.findByIdAndUpdate(
      tx.itemId,
      { $inc: { quantity: tx.amount } },
      { new: true }
    );
    if (!updated) {
      res.status(404);
      throw new Error("Zugehöriger Artikel nicht gefunden");
    }
  } else if (tx.type === "add") {
    const updated = await Item.findOneAndUpdate(
      { _id: tx.itemId, quantity: { $gte: tx.amount } },
      { $inc: { quantity: -tx.amount } },
      { new: true }
    );
    if (!updated) {
      res.status(400);
      throw new Error(
        "Löschen abgelehnt: aktueller Bestand zu niedrig für den Rückgang."
      );
    }
  } else {
    res.status(400);
    throw new Error("Unbekannter Transaktionstyp");
  }

  await tx.deleteOne();
  res.status(204).end();
});
