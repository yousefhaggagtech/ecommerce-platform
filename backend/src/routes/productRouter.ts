import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/controllers/productController.js";
import { protect } from "@/middleware/authMiddleware.js";
import { restrictTo } from "@/middleware/authMiddleware.js";

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

router.get("/",   getAllProducts);
router.get("/:id", getProductById);

// ─── Admin Only Routes ────────────────────────────────────────────────────────

router.use(protect, restrictTo("admin")); // applies to all routes below

router.post("/",        createProduct);
router.patch("/:id",    updateProduct);
router.delete("/:id",   deleteProduct);

export default router;