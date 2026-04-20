"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { uploadApi } from "@/infrastructure/api/uploadApi";
import { X, Upload, Loader2 } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ImageUploaderProps {
  images:   string[];                    // current image URLs
  onChange: (images: string[]) => void;  // called when images change
  max?:     number;                      // max number of images (default: 4)
}

// ─── ImageUploader ────────────────────────────────────────────────────────────

export const ImageUploader = ({
  images,
  onChange,
  max = 4,
}: ImageUploaderProps) => {
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected
    e.target.value = "";

    setError(null);
    setUploading(true);

    try {
      const result = await uploadApi.uploadImage(file);
      onChange([...images, result.url]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const canUploadMore = images.length < max && !uploading;

  return (
    <div className="space-y-3">
      {/* Images Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Existing Images */}
        {images.map((url, index) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100"
          >
            <Image
              src={url}
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover"
            />

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-1 top-1 rounded-full bg-white/80 p-0.5 text-zinc-700 opacity-0 shadow transition group-hover:opacity-100 hover:bg-white hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* First image badge */}
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                Main
              </span>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {canUploadMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-300 text-zinc-400 transition hover:border-zinc-900 hover:text-zinc-900"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs">Upload</span>
          </button>
        )}

        {/* Loading State */}
        {uploading && (
          <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-zinc-200 bg-zinc-50">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Helper Text */}
      <p className="text-xs text-zinc-500">
        {images.length}/{max} images · Max 5MB per image · JPG, PNG, WEBP
      </p>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};