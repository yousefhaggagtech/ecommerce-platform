"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// ─── ProductFilters ───────────────────────────────────────────────────────────
// Updates URL search params — no local state needed
// URL is the single source of truth for filters

export const ProductFilters = () => {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // Build new URL with updated param
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Reset to page 1 when filter changes
      params.delete("page");

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters =
    searchParams.has("gender") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    searchParams.has("sort");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Gender Filter */}
      <Select
        value={searchParams.get("gender") || "all"}
        onValueChange={(val) => updateFilter("gender", val)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="men">Men</SelectItem>
          <SelectItem value="women">Women</SelectItem>
          <SelectItem value="unisex">Unisex</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={searchParams.get("sort") || "newest"}
        onValueChange={(val) => updateFilter("sort", val)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
};