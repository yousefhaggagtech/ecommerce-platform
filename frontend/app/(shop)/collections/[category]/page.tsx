"use client";

import { useSearchParams } from "next/navigation";
import { useProducts } from "@/application/hooks/useProducts";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { Button } from "@/components/ui/button";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CollectionsPageProps {
  params: { category: string };
}

// ─── Collections Page ─────────────────────────────────────────────────────────

export default function CollectionsPage({ params }: CollectionsPageProps) {
  const searchParams = useSearchParams();

  // Build filters from URL search params
  const filters = {
    category: params.category,
    gender:   searchParams.get("gender") || undefined,
    sort:     (searchParams.get("sort") as any) || "newest",
    page:     Number(searchParams.get("page")) || 1,
    limit:    12,
  };

  const { data, isLoading, isError } = useProducts(filters);

  const categoryLabel = params.category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {categoryLabel}
        </h1>
        {data && (
          <p className="mt-1 text-sm text-zinc-500">
            {data.pagination.totalProducts} products
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ProductFilters />
      </div>

      {/* Error State */}
      {isError && (
        <div className="flex h-64 items-center justify-center text-zinc-500">
          Something went wrong. Please try again.
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? // Show skeletons while loading
            Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : data?.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {/* Empty State */}
      {!isLoading && data?.products.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-zinc-500">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <PaginationControls
            currentPage={data.pagination.currentPage}
            totalPages={data.pagination.totalPages}
          />
        </div>
      )}
    </main>
  );
}

// ─── Pagination Controls ──────────────────────────────────────────────────────

const PaginationControls = ({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) => {
  const searchParams = useSearchParams();

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `?${params.toString()}`;
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() =>
          (window.location.href = buildPageUrl(currentPage - 1))
        }
      >
        Previous
      </Button>

      <span className="text-sm text-zinc-600">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() =>
          (window.location.href = buildPageUrl(currentPage + 1))
        }
      >
        Next
      </Button>
    </>
  );
};