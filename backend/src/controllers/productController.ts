import type { Request, Response, NextFunction } from "express";
import slugify from "slugify";
import Product from "@/models/productModel.js";
import AppError from "@/utils/AppError.js";
import { catchError } from "@/utils/catchError.js";

// ─── Get All Products ─────────────────────────────────────────────────────────
// Public — supports filtering, searching, sorting, and pagination

export const getAllProducts = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      category,
      gender,
      minPrice,
      maxPrice,
      search,
      sort,
      page = "1",
      limit = "12",
    } = req.query;

    // 1. Build the filter object dynamically
    const filter: Record<string, any> = { isActive: true };

    if (category) filter.category = (category as string).toLowerCase();
    if (gender) filter.gender = gender;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Case-insensitive search on product name
    if (search) {
      filter.name = { $regex: search as string, $options: "i" };
    }

    // 2. Build the sort object
    const sortMap: Record<string, Record<string, number>> = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      newest:     { createdAt: -1 },
    };
    const sortQuery = sortMap[sort as string] || { createdAt: -1 };

    // 3. Pagination
    const currentPage = Math.max(1, Number(page));
    const pageSize    = Math.min(50, Math.max(1, Number(limit))); // cap at 50
    const skip        = (currentPage - 1) * pageSize;

    // 4. Run query and count in parallel for performance
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortQuery).skip(skip).limit(pageSize),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      status: "success",
      results: products.length,
      pagination: {
        currentPage,
        totalPages: Math.ceil(total / pageSize),
        totalProducts: total,
      },
      data: { products },
    });
  }
);

// ─── Get Single Product ───────────────────────────────────────────────────────
// Public

export const getProductById = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { product },
    });
  }
);

// ─── Create Product ───────────────────────────────────────────────────────────
// Admin only

export const createProduct = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.create(req.body);

    res.status(201).json({
      status: "success",
      data: { product },
    });
  }
);

// ─── Update Product ───────────────────────────────────────────────────────────
// Admin only — partial update (PATCH)

export const updateProduct = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    // Regenerate slug if name is being updated
    if (req.body.name) {
      let baseSlug = slugify(req.body.name, { lower: true, strict: true });

      const existing = await Product.findOne({
        slug: baseSlug,
        _id: { $ne: req.params.id },
      });

      if (existing) baseSlug = `${baseSlug}-${Date.now()}`;
      req.body.slug = baseSlug;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,           // return updated document
        runValidators: true, // run schema validators on update
      }
    );

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { product },
    });
  }
);

// ─── Delete Product (Soft Delete) ────────────────────────────────────────────
// Admin only — sets isActive to false instead of removing the document

export const deleteProduct = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    res.status(204).send();
  }
);