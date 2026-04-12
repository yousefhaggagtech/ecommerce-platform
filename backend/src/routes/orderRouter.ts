import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "@/controllers/orderController.js";
import { protect, restrictTo } from "@/middleware/authMiddleware.js";

const router = Router();

// All order routes require authentication
router.use(protect);

// ─── Customer Routes ──────────────────────────────────────────────────────────

router.post("/",              placeOrder);
router.get("/my-orders",      getMyOrders);
router.get("/:id",            getOrderById);

// ─── Admin Only Routes ────────────────────────────────────────────────────────

router.get("/",                           restrictTo("admin"), getAllOrders);
router.put("/:id/status",                 restrictTo("admin"), updateOrderStatus);

export default router;