"use client";

import { use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProducts } from "@/application/hooks/useProducts";
import { ProductCard } from "@/components/shop/productCard";
import { ProductCardSkeleton } from "@/components/shop/productCardSkeleton";
import { ProductFilters } from "@/components/shop/productFilters";
import { Button } from "@/components/ui/button";

interface CollectionsPageProps {
  params: Promise<{ category: string }>;
}

export default function CollectionsPage({ params }: CollectionsPageProps) {
  
  const { category: slug } = use(params);
  const searchParams = useSearchParams();

  const filters = {
   
    gender: slug, 
   
    category: searchParams.get("category") || undefined, 
    sort: (searchParams.get("sort") as any) || "newest",
    page: Number(searchParams.get("page")) || 1,
    limit: 12,
  };

  const { data, isLoading, isError } = useProducts(filters);
  const categoryLabel = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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

      <div className="mb-6">
        <ProductFilters />
      </div>

      {isError && (
        <div className="flex h-64 items-center justify-center text-zinc-500">
          Something went wrong. Please try again.
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : data?.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {!isLoading && data?.products.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-zinc-500">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      )}

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

const PaginationControls = ({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    // استخدام router.push أفضل من window.location عشان الـ SPA experience
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
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
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};