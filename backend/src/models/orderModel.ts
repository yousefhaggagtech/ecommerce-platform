import mongoose, { Document, Schema } from "mongoose";

// ─── Order Item Sub-Schema ────────────────────────────────────────────────────

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  size: string;
  quantity: number;
  unitPrice: number;   // snapshot of product.price at order time
  discount: number;    // snapshot of discount at order time (default 0)
  finalPrice: number;  // unitPrice - discount
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    size: {
      type: String,
      required: [true, "Size is required"],
      uppercase: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

// ─── Shipping Address Sub-Schema ──────────────────────────────────────────────

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  governorate: string;
}

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    firstName:   { type: String, required: [true, "First name is required"] },
    lastName:    { type: String, required: [true, "Last name is required"] },
    phone:       { type: String, required: [true, "Phone is required"] },
    street:      { type: String, required: [true, "Street is required"] },
    city:        { type: String, required: [true, "City is required"] },
    governorate: { type: String, required: [true, "Governorate is required"] },
  },
  { _id: false }
);

// ─── Order Interface ──────────────────────────────────────────────────────────

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  totalPrice: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  stripePaymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Order Schema ─────────────────────────────────────────────────────────────

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr: IOrderItem[]) => arr.length >= 1,
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "paid", "shipped", "delivered", "cancelled"],
        message: "Invalid order status",
      },
      default: "pending",
    },
    stripePaymentId: {
      type: String,
      default: null, // populated after Stripe payment is confirmed
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;