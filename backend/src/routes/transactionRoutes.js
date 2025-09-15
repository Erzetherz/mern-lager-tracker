import { Router } from "express";
import {
  listTransactions,
  createTransaction,
  deleteTransaction
} from "../controllers/transactionController.js";

const router = Router();

router.route("/")
  .get(listTransactions)
  .post(createTransaction);

router.route("/:id")
  .delete(deleteTransaction);

export default router;
