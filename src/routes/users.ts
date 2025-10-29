import express from "express";
import {
  getUsers,
  registerUser,
  loginUser,
  getMe,
} from "../controllers/userController";
const router = express.Router();

router.get("/", getUsers);
router.get("/me", getMe);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
