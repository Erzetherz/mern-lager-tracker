// CRUD-Operationen für Items. Suche in name und ean.
import { Item } from "../models/Item.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listItems = asyncHandler(async (req, res) => {
  const { q, minQty, maxQty } = req.query;

  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { ean: { $regex: q, $options: "i" } }
    ];
  }
  if (minQty !== undefined || maxQty !== undefined) {
    filter.quantity = {};
    if (minQty !== undefined) filter.quantity.$gte = Number(minQty);
    if (maxQty !== undefined) filter.quantity.$lte = Number(maxQty);
  }

  const items = await Item.find(filter).sort({ createdAt: -1 });
  res.json(items);
});

export const getItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Item nicht gefunden");
  }
  res.json(item);
});

export const createItem = asyncHandler(async (req, res) => {
  const { name, ean, serialNumber, quantity = 0, location } = req.body;

  const item = await Item.create({
    name,
    ean,
    serialNumber,
    quantity,
    location
  });

  res.status(201).json(item);
});

export const updateItem = asyncHandler(async (req, res) => {
  const { name, ean, serialNumber, quantity, location } = req.body;

  const item = await Item.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Item nicht gefunden");
  }

  if (name !== undefined) item.name = name;
  if (ean !== undefined) item.ean = ean;
  if (serialNumber !== undefined) item.serialNumber = serialNumber;
  if (quantity !== undefined) {
    if (quantity < 0) {
      res.status(400);
      throw new Error("Bestand darf nicht negativ sein");
    }
    item.quantity = quantity;
  }
  if (location !== undefined) item.location = location;

  const saved = await item.save();
  res.json(saved);
});

export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Item nicht gefunden");
  }
  await item.deleteOne();
  res.status(204).end();
});
