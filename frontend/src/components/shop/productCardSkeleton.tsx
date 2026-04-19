import { Skeleton } from "@/components/ui/skeleton";

// ─── ProductCardSkeleton ──────────────────────────────────────────────────────
// Shown while products are loading — matches the shape of ProductCard

export const ProductCardSkeleton = () => {
  return (
    <div className="block">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
};