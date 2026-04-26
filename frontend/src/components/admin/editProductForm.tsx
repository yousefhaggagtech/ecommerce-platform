"use client";

import { useState } from "react";
import { useUpdateProduct } from "@/application/hooks/useProducts";
import { ImageUploader } from "@/components/admin/imageUploader";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/domain/entities/productEntity";
import { X, Plus } from "lucide-react";

// ─── Size Options ─────────────────────────────────────────────────────────────

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

// ─── Edit Product Form ────────────────────────────────────────────────────────

interface EditProductFormProps {
  product:   IProduct;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditProductForm = ({
  product,
  onSuccess,
  onCancel,
}: EditProductFormProps) => {
  // Pre-fill form with existing product data
  const [form, setForm] = useState({
    name:           product.name,
    price:          String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    category:       product.category,
    gender:         product.gender,
    description:    product.description || "",
    images:         product.images,
    variants:       product.variants.map((v) => ({
      size:  v.size,
      stock: v.stock,
    })),
  });

  const [error, setError]                         = useState<string | null>(null);
  const { mutateAsync: updateProduct, isPending } = useUpdateProduct(product.id);

  // ── Field Handlers ─────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Variant Handlers ───────────────────────────────────────────────────────

  const addVariant = () => {
    const usedSizes = form.variants.map((v) => v.size);
    const nextSize  = SIZE_OPTIONS.find((s) => !usedSizes.includes(s));
    if (!nextSize) return;
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: nextSize, stock: 0 }],
    }));
  };

  const updateVariant = (
    index: number,
    field: "size" | "stock",
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    if (form.variants.length === 0) {
      setError("Please add at least one size variant.");
      return;
    }

    try {
      await updateProduct({
        name:           form.name,
        price:          Number(form.price),
        compareAtPrice: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : undefined,
        category:    form.category.toLowerCase(),
        gender:      form.gender as "men" | "women" | "unisex",
        description: form.description,
        images:      form.images,
        variants:    form.variants.map((v) => ({
          size:  v.size,
          stock: Number(v.stock),
        })),
      });

      onSuccess?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to update product. Try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Images */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">
          Product Images
        </label>
        <ImageUploader
          images={form.images}
          onChange={(images) => setForm((prev) => ({ ...prev, images }))}
        />
      </div>

      {/* Name */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700">
          Product Name
        </label>
        <input
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
        />
      </div>

      {/* Price + Compare At Price */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700">
            Price (LE)
          </label>
          <input
            name="price"
            type="number"
            required
            min="1"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700">
            Compare At Price (optional)
          </label>
          <input
            name="compareAtPrice"
            type="number"
            min="1"
            value={form.compareAtPrice}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>
      </div>

      {/* Category + Gender */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700">Category</label>
          <input
            name="category"
            required
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          >
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700">
          Description (optional)
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
        />
      </div>

      {/* Variants */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700">
            Sizes & Stock
          </label>
          <button
            type="button"
            onClick={addVariant}
            disabled={form.variants.length >= SIZE_OPTIONS.length}
            className="flex items-center gap-1 text-xs font-medium text-zinc-600 transition hover:text-zinc-900 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Size
          </button>
        </div>

        <div className="space-y-2">
          {form.variants.map((variant, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={variant.size}
                onChange={(e) => updateVariant(index, "size", e.target.value)}
                className="w-24 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-900"
              >
                {SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                value={variant.stock}
                onChange={(e) =>
                  updateVariant(index, "stock", Number(e.target.value))
                }
                placeholder="Stock"
                className="w-24 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-900"
              />

              <span className="text-xs text-zinc-400">units</span>

              {form.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="ml-auto text-zinc-400 transition hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};