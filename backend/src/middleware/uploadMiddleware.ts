import multer from "multer";
import AppError from "@/utils/AppError.js";

// ─── Multer Config ────────────────────────────────────────────────────────────
// Store files in memory — we pass the buffer directly to Cloudinary
// No files are saved to disk

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Only allow image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed", 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
});