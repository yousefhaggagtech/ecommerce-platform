import mongoose, { Document, Schema , Types } from "mongoose";
import slugify from "slugify";

// ─── Variant Sub-Schema ───────────────────────────────────────────────────────

export interface IVariant {
  size: string;
  stock: number;
}

const variantSchema = new Schema<IVariant>(
  {
    size: {
      type: String,
      required: [true, "Size is required"],
      trim: true,
      uppercase: true, // always store as S, M, L, XL
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
  },
  { _id: false } // no separate _id for each variant
);

// ─── Product Interface ────────────────────────────────────────────────────────

export interface IProduct extends Document {
 _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  gender: "men" | "women" | "unisex";
  images: string[];
  variants: IVariant[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Product Schema ───────────────────────────────────────────────────────────

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be greater than 0"],
    },
    compareAtPrice: {
      type: Number,
      default: null, // shown as original price when product is on sale
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
    },
    gender: {
      type: String,
      enum: {
        values: ["men", "women", "unisex"],
        message: "Gender must be men, women, or unisex",
      },
      required: [true, "Gender is required"],
    },
    images: {
      type: [String],
      validate: {
        validator: (arr: string[]) => arr.length >= 1,
        message: "At least one image is required",
      },
    },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (arr: IVariant[]) => arr.length >= 1,
        message: "At least one size variant is required",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ─── Auto-generate slug before saving ────────────────────────────────────────

productSchema.pre("save", async function () {
  // Only regenerate slug if name was modified
  if (!this.isModified("name")) return;

  let baseSlug = slugify(this.name, { lower: true, strict: true });

  // Ensure slug uniqueness by appending a numeric suffix if needed
  const existing = await mongoose
    .model("Product")
    .findOne({ slug: baseSlug, _id: { $ne: this._id } });

  if (existing) {
    baseSlug = `${baseSlug}-${Date.now()}`;
  }

  this.slug = baseSlug;
});

// ─── Indexes for frequent query fields ───────────────────────────────────────

productSchema.index({ category: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: "text" }); // enables $text search as an alternative

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;