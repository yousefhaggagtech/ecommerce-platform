import { v2 as cloudinary } from "cloudinary";

// ─── Cloudinary Config ────────────────────────────────────────────────────────

let isInitialized = false;

function validateAndInitCloudinary() {
  if (isInitialized) return;
  
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary configuration in environment variables");
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  isInitialized = true;
}

// Create a proxy to validate on first use
const cloudinaryProxy = new Proxy(cloudinary, {
  get(target, prop) {
    validateAndInitCloudinary();
    return Reflect.get(target, prop);
  },
});

export default cloudinaryProxy;