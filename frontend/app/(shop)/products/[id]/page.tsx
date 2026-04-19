"use client";

import { useState } from "react";
import Image from "next/image";
import { useProduct } from "@/application/hooks/useProducts";
import { useCartStore } from "@/application/store/cartStore";
import { ProductCardSkeleton } from "@/components/shop/productCardSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductDetailPageProps {
  params: { id: string };
}

// ─── Product Detail Page ──────────────────────────────────────────────────────

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { data: product, isLoading, isError } = useProduct(params.id);
  const addItem = useCartStore((state) => state.addItem);

  const [selectedSize, setSelectedSize]     = useState<string | null>(null);
  const [selectedImage, setSelectedImage]   = useState(0);
  const [addedToCart, setAddedToCart]       = useState(false);

  // Loading State
  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductCardSkeleton />
        </div>
      </main>
    );
  }

  // Error State
  if (isError || !product) {
    return (
      <main className="flex h-96 items-center justify-center text-zinc-500">
        Product not found.
      </main>
    );
  }

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize
  );
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;
  const hasDiscount  =
    product.compareAtPrice && product.compareAtPrice > product.price;

  // Add to Cart Handler
  const handleAddToCart = () => {
    if (!selectedSize) return;

    addItem({
      productId: product.id,
      name:      product.name,
      image:     product.images[0] || "",
      price:     product.price,
      size:      selectedSize,
      quantity:  1,
    });

    // Show feedback for 2 seconds
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

        {/* ── Images ────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Main Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-100">
            {product.images[selectedImage] && (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition ${
                    selectedImage === i
                      ? "border-zinc-900"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Category + Name */}
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              {product.category} · {product.gender}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-zinc-900">
              LE {product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-base text-zinc-400 line-through">
                LE {product.compareAtPrice!.toLocaleString()}
              </span>
            )}
            {hasDiscount && (
              <Badge className="bg-red-500 text-white hover:bg-red-500">
                Sale
              </Badge>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed text-zinc-600">
              {product.description}
            </p>
          )}

          {/* Size Selector */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-900">Size</p>
              {selectedSize && (
                <p className="text-xs text-zinc-500">
                  {selectedVariant?.stock} left in stock
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => {
                const outOfStock = variant.stock === 0;
                const isSelected = selectedSize === variant.size;

                return (
                  <button
                    key={variant.size}
                    onClick={() => !outOfStock && setSelectedSize(variant.size)}
                    disabled={outOfStock}
                    className={`h-10 min-w-[2.5rem] rounded-md border px-3 text-sm font-medium transition
                      ${isSelected
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : outOfStock
                        ? "cursor-not-allowed border-zinc-200 text-zinc-300 line-through"
                        : "border-zinc-300 text-zinc-700 hover:border-zinc-900"
                      }`}
                  >
                    {variant.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            size="lg"
            className="w-full"
            disabled={!selectedSize || isOutOfStock}
            onClick={handleAddToCart}
          >
            {addedToCart
              ? "Added to Cart ✓"
              : !selectedSize
              ? "Select a Size"
              : isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"}
          </Button>
        </div>
      </div>
    </main>
  );
}