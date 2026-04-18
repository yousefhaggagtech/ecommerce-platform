"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/infrastructure/api/orderApi";
import { IPlaceOrderPayload } from "@/domain/repositories/orderRepository";
import { OrderStatus } from "@/domain/entities/orderEntity";
import { useCartStore } from "@/application/store/cartStore";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const orderKeys = {
  all:      ["orders"] as const,
  myOrders: ["orders", "my-orders"] as const,
  detail:   (id: string) => ["orders", "detail", id] as const,
  admin:    (filters?: object) => ["orders", "admin", filters] as const,
};

// ─── useMyOrders ──────────────────────────────────────────────────────────────
// Fetch the current user's order history

export const useMyOrders = () => {
  return useQuery({
    queryKey: orderKeys.myOrders,
    queryFn: orderApi.getMyOrders,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ─── useOrder ─────────────────────────────────────────────────────────────────
// Fetch a single order by ID

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });
};

// ─── useAllOrders ─────────────────────────────────────────────────────────────
// Admin only — fetch all orders with optional filters

export const useAllOrders = (filters?: {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: orderKeys.admin(filters),
    queryFn: () => orderApi.getAll(filters),
    staleTime: 1000 * 60 * 1, // 1 minute — orders change more frequently
  });
};

// ─── usePlaceOrder ────────────────────────────────────────────────────────────
// Place a new order and clear the cart on success

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  const clearCart   = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: (payload: IPlaceOrderPayload) => orderApi.place(payload),
    onSuccess: () => {
      // Clear cart after successful order
      clearCart();

      // Invalidate my orders list so it refetches
      queryClient.invalidateQueries({ queryKey: orderKeys.myOrders });
    },
  });
};

// ─── useUpdateOrderStatus ─────────────────────────────────────────────────────
// Admin only

export const useUpdateOrderStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: OrderStatus) => orderApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};