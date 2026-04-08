import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from "@/controllers/authController.js";
import { protect } from "@/middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);
console.log("Auth routes file loaded");
export default router;