import { Router } from "express";
import { uploadImage, deleteImage } from "@/controllers/uploadController.js";
import { protect, restrictTo } from "@/middleware/authMiddleware.js";
import { upload } from "@/middleware/uploadMiddleware.js";

const router = Router();

// All upload routes — Admin only
router.use(protect, restrictTo("admin"));

// Single image upload
// multer processes the file before the controller runs
router.post("/",      upload.single("image"), uploadImage);
router.delete("/",    deleteImage);

export default router;