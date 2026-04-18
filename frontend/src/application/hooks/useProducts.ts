"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/infrastructure/api/productApi";
import { IProductFilters } from "@/domain/entities/productEntity";

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Centralized to avoid typos and enable precise cache invalidation

export const productKeys = {
  all:    ["products"] as const,
  list:   (filters?: IProductFilters) => ["products", "list", filters] as const,
  detail: (id: string) => ["products", "detail", id] as const,
};

// ─── useProducts ──────────────────────────────────────────────────────────────
// Fetch paginated + filtered product list

export const useProducts = (filters?: IProductFilters) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productApi.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes — products don't change that often
  });
};

// ─── useProduct ───────────────────────────────────────────────────────────────
// Fetch a single product by ID

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getById(id),
    enabled: !!id, // only run if id is provided
  });
};

// ─── useCreateProduct ─────────────────────────────────────────────────────────
// Admin only

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      // Invalidate all product lists so they refetch with the new product
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

// ─── useUpdateProduct ─────────────────────────────────────────────────────────
// Admin only

export const useUpdateProduct = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof productApi.update>[1]) =>
      productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

// ─── useDeleteProduct ─────────────────────────────────────────────────────────
// Admin only

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};