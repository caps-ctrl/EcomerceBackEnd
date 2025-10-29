import express from "express";
import {
  getCart,
  addToCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  deleteAll,
} from "../controllers/cartController";
import { authenticate } from "../midleware/auth";
const router = express.Router();

router.get("/", authenticate, getCart);
router.post("/increase", authenticate, increaseQuantity);
router.post("/decrease", authenticate, decreaseQuantity);
router.post("/add", authenticate, addToCart);
router.delete("/:productId", authenticate, removeFromCart);
router.delete("/", authenticate, deleteAll);

export default router;
