"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { IProduct } from "@/domain/entities/productEntity";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: IProduct;
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

export const ProductCard = ({ product }: ProductCardProps) => {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : null;

  const isOutOfStock = product.variants.every((v) => v.stock === 0);

  return (
    <Link href={`/products/${product.id}`} className="group block">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Fallback when no image is available
          <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
            No Image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercent && (
            <Badge className="bg-red-500 text-white hover:bg-red-500">
              -{discountPercent}%
            </Badge>
          )}
          {isOutOfStock && (
            <Badge
              variant="secondary"
              className="bg-zinc-800 text-white hover:bg-zinc-800"
            >
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        <p className="text-xs text-zinc-500 uppercase tracking-wide">
          {product.category}
        </p>

        <h3 className="text-sm font-medium text-zinc-900 line-clamp-2 group-hover:underline">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900">
            LE {product.price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-zinc-400 line-through">
              LE {product.compareAtPrice!.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
