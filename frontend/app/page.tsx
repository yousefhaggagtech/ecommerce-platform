"use client";

import Link from "next/link";
import Image from "next/image";
import { useProducts } from "@/application/hooks/useProducts";
import { ProductCard } from "@/components/shop/productCard";
import { ProductCardSkeleton } from "@/components/shop/productCardSkeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// ─── Collections Config ───────────────────────────────────────────────────────

const COLLECTIONS = [
  {
    label:    "Denim",
    href:     "/collections/denim",
    image:    "/images/collections/denim.jpg",
    desc:     "Low waist, straight cut & unisex styles",
  },
  {
    label:    "Hoodies",
    href:     "/collections/hoodies",
    image:    "/images/collections/hoodies.jpg",
    desc:     "Oversized & relaxed fits",
  },
  {
    label:    "T-Shirts",
    href:     "/collections/t-shirts",
    image:    "/images/collections/tshirts.jpg",
    desc:     "Minimal graphics & clean cuts",
  },
  {
    label:    "Outerwear",
    href:     "/collections/outerwear",
    image:    "/images/collections/outerwear.jpg",
    desc:     "Jackets & coats for every season",
  },
];

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CollectionsSection />
      <NewArrivalsSection />
    </main>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

const HeroSection = () => (
  <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-zinc-100">
    {/* Background Image */}
    <Image
      src="/images/hero.jpg"
      alt="StyleShop Hero"
      fill
      priority
      className="object-cover object-top"
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30" />

    {/* Content */}
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/80">
        New Collection
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
        Wear What Moves You
      </h1>
      <p className="mt-4 max-w-md text-base text-white/80">
        Minimalist streetwear designed for everyday life.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          size="lg"
          className="bg-white text-zinc-900 hover:bg-zinc-100"
        >
          <Link href="/collections/shop-all">Shop All</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-white text-white hover:bg-white/10"
        >
          <Link href="/collections/denim">Shop Denim</Link>
        </Button>
      </div>
    </div>
  </section>
);

// ─── Collections Section ──────────────────────────────────────────────────────

const CollectionsSection = () => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    {/* Section Header */}
    <div className="mb-8 flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-zinc-900">
        Shop by Category
      </h2>
    </div>

    {/* Grid */}
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {COLLECTIONS.map((col) => (
        <Link
          key={col.href}
          href={col.href}
          className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-100"
        >
          {/* Image */}
          <Image
            src={col.image}
            alt={col.label}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Label */}
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <p className="text-base font-semibold">{col.label}</p>
            <p className="mt-0.5 text-xs text-white/70">{col.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

// ─── New Arrivals Section ─────────────────────────────────────────────────────

const NewArrivalsSection = () => {
  const { data, isLoading } = useProducts({
    sort:  "newest",
    limit: 4,
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-zinc-900">New Arrivals</h2>
        <Link
          href="/collections/shop-all?sort=newest"
          className="flex items-center gap-1 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : data?.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
};