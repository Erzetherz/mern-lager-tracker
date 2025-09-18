// Transaktion = eine Lagerbewegung (Zugang/Entnahme) zu einem Item.
// postQuantity speichert den Bestand NACH der Buchung.

import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    type: {
      type: String,
      enum: ["add", "remove"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Menge muss mindestens 1 sein"],
    },
    personName: { type: String, trim: true },
    note: { type: String, trim: true },
    date: { type: Date, default: Date.now },

    // Bestand des Artikels NACH der Bewegung
    postQuantity: {
      type: Number,
      min: [0, "Bestand darf nicht negativ sein"],
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
