import type { Request, Response, NextFunction } from "express";
import Order from "@/models/orderModel.js";
import Product from "@/models/productModel.js";
import AppError from "@/utils/AppError.js";
import { catchError } from "@/utils/catchError.js";

// ─── Place Order ──────────────────────────────────────────────────────────────
// Authenticated customers only
// Validates stock, captures price snapshots, decrements stock atomically

export const placeOrder = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return next(new AppError("Order must contain at least one item", 400));
    }

    // ── Step 1: Validate all products and stock before touching the DB ────────
    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        isActive: true,
      });

      if (!product) {
        return next(new AppError(`Product not found: ${item.productId}`, 404));
      }

      // Find the requested size variant
      const variant = product.variants.find(
        (v) => v.size === item.size.toUpperCase()
      );

      if (!variant) {
        return next(
          new AppError(
            `Size ${item.size} not available for product: ${product.name}`,
            400
          )
        );
      }

      // Check sufficient stock before placing
      if (variant.stock < item.quantity) {
        return next(
          new AppError(
            `Insufficient stock for size ${item.size} — available: ${variant.stock}`,
            400
          )
        );
      }

      // Capture price snapshot at order time (BR-001)
      const unitPrice  = product.price;
      const discount   = 0; // coupon support will be added in a future feature
      const finalPrice = unitPrice - discount;

      totalPrice += finalPrice * item.quantity;

      orderItems.push({
        product: product._id,
        size:       item.size.toUpperCase(),
        quantity:   item.quantity,
        unitPrice,
        discount,
        finalPrice,
      });
    }

    // ── Step 2: Decrement stock atomically using $inc (BR-002) ────────────────
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId, "variants.size": item.size.toUpperCase() },
        { $inc: { "variants.$.stock": -item.quantity } }
      );
    }

    // ── Step 3: Create the order ──────────────────────────────────────────────
    const order = await Order.create({
      user: (req as any).user._id,
      items: orderItems,
      shippingAddress,
      totalPrice,
    });

    res.status(201).json({
      status: "success",
      data: { order },
    });
  }
);

// ─── Get My Orders ────────────────────────────────────────────────────────────
// Returns only the authenticated user's orders

export const getMyOrders = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await Order.find({ user: (req as any).user._id })
      .populate("items.product", "name images") // only return name and first image
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders },
    });
  }
);

// ─── Get Single Order ─────────────────────────────────────────────────────────
// Accessible by the order owner or an admin

export const getOrderById = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id).populate(
      "items.product",
      "name images price"
    );

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Ensure the requester is the owner or an admin (BR-005)
    const requesterId = (req as any).user._id.toString();
    const isOwner     = order.user.toString() === requesterId;
    const isAdmin     = (req as any).user.role === "admin";

    if (!isOwner && !isAdmin) {
      return next(new AppError("You do not have permission to view this order", 403));
    }

    res.status(200).json({
      status: "success",
      data: { order },
    });
  }
);

// ─── Get All Orders ───────────────────────────────────────────────────────────
// Admin only — supports filtering by status and pagination

export const getAllOrders = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, page = "1", limit = "20" } = req.query;

    const filter: Record<string, any> = {};
    if (status) filter.status = status;

    const currentPage = Math.max(1, Number(page));
    const pageSize    = Math.min(50, Math.max(1, Number(limit)));
    const skip        = (currentPage - 1) * pageSize;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .populate("items.product", "name images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      status: "success",
      results: orders.length,
      pagination: {
        currentPage,
        totalPages: Math.ceil(total / pageSize),
        totalOrders: total,
      },
      data: { orders },
    });
  }
);

// ─── Update Order Status ──────────────────────────────────────────────────────
// Admin only

export const updateOrderStatus = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;

    const allowed = ["pending", "paid", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return next(
        new AppError(
          `Invalid status — allowed values: ${allowed.join(", ")}`,
          400
        )
      );
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { order },
    });
  }
);