import axiosInstance from "@/infrastructure/http/axiosIstance";

// ─── Upload Response ──────────────────────────────────────────────────────────

export interface UploadResponse {
  url:      string;
  publicId: string;
  width:    number;
  height:   number;
}

// ─── Upload API ───────────────────────────────────────────────────────────────

export const uploadApi = {
  // Upload a single image file — returns Cloudinary URL
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("image", file);

    const { data } = await axiosInstance.post<{
      status: string;
      data: UploadResponse;
    }>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data.data;
  },

  // Delete an image from Cloudinary by publicId
  deleteImage: async (publicId: string): Promise<void> => {
    await axiosInstance.delete("/upload", {
      data: { publicId },
    });
  },
};