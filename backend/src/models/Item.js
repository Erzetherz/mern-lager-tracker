// Item = Lagerartikel mit Name, optionaler EAN, optionaler Seriennummer,
// Menge und Lagerort. Leere Strings werden nicht gespeichert (-> undefined).

import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name ist erforderlich"],
      trim: true,
      minlength: [1, "Name darf nicht leer sein"]
    },
    // EAN optional; validiere nur, wenn ein Wert gesetzt ist.
    ean: {
      type: String,
      trim: true,
      set: (v) => (v === "" ? undefined : v),
      validate: {
        validator: (v) => !v || /^(?:\d{8}|\d{13})$/.test(v),
        message: "EAN muss 8 oder 13 Ziffern haben"
      }
    },
    // Seriennummer optional; "" -> undefined
    serialNumber: {
      type: String,
      trim: true,
      set: (v) => (v === "" ? undefined : v)
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Bestand darf nicht negativ sein"],
      default: 0
    },
    location: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export const Item = mongoose.model("Item", itemSchema);
