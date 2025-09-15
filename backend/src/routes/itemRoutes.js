import { Router } from "express";
import {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} from "../controllers/itemController.js";

const router = Router();

router.route("/")
  .get(listItems)
  .post(createItem);

router.route("/:id")
  .get(getItem)
  .put(updateItem)
  .delete(deleteItem);

export default router;
