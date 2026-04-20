import type { Request, Response, NextFunction } from "express";
import cloudinary from "@/config/cloudinaryConfig.js";
import AppError from "@/utils/AppError.js";
import { catchError } from "@/utils/catchError.js";

// ─── Upload Single Image ──────────────────────────────────────────────────────
// Admin only — receives file from multer, uploads to Cloudinary

export const uploadImage = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    // multer puts the file in req.file
    if (!req.file) {
      return next(new AppError("Please provide an image file", 400));
    }

    // Convert buffer to base64 for Cloudinary upload
    const base64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder:         "styleshop/products", // organized folder in Cloudinary
      transformation: [
        { width: 1200, height: 1600, crop: "limit" }, // max dimensions
        { quality: "auto" },                            // auto optimize quality
        { fetch_format: "auto" },                       // serve webp when supported
      ],
    });

    res.status(200).json({
      status:  "success",
      data: {
        url:       result.secure_url,
        publicId:  result.public_id,
        width:     result.width,
        height:    result.height,
      },
    });
  }
);

// ─── Delete Image ─────────────────────────────────────────────────────────────
// Admin only — deletes image from Cloudinary by publicId

export const deleteImage = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { publicId } = req.body;

    if (!publicId) {
      return next(new AppError("Please provide a publicId", 400));
    }

    await cloudinary.uploader.destroy(publicId);

    res.status(204).send();
  }
);