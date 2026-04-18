import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ICartItem } from "@/domain/entities/cartEntity";

// ─── State Interface ──────────────────────────────────────────────────────────

interface CartState {
  items: ICartItem[];

  // Computed
  totalItems: number;
  totalPrice: number;

  // Actions
  addItem: (item: ICartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcTotalItems = (items: ICartItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity, 0);

const calcTotalPrice = (items: ICartItem[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

// ─── Cart Store ───────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      // ── Add Item ─────────────────────────────────────────────────────────────
      // If the same product + size already exists — increment quantity
      addItem: (newItem) => {
        const { items } = get();

        const existingIndex = items.findIndex(
          (i) => i.productId === newItem.productId && i.size === newItem.size
        );

        let updatedItems: ICartItem[];

        if (existingIndex !== -1) {
          // Increment quantity of existing item
          updatedItems = items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        } else {
          updatedItems = [...items, newItem];
        }

        set({
          items: updatedItems,
          totalItems: calcTotalItems(updatedItems),
          totalPrice: calcTotalPrice(updatedItems),
        });
      },

      // ── Remove Item ───────────────────────────────────────────────────────────
      removeItem: (productId, size) => {
        const updatedItems = get().items.filter(
          (item) => !(item.productId === productId && item.size === size)
        );

        set({
          items: updatedItems,
          totalItems: calcTotalItems(updatedItems),
          totalPrice: calcTotalPrice(updatedItems),
        });
      },

      // ── Update Quantity ───────────────────────────────────────────────────────
      updateQuantity: (productId, size, quantity) => {
        // Remove item if quantity drops to 0
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }

        const updatedItems = get().items.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity }
            : item
        );

        set({
          items: updatedItems,
          totalItems: calcTotalItems(updatedItems),
          totalPrice: calcTotalPrice(updatedItems),
        });
      },

      // ── Clear Cart ────────────────────────────────────────────────────────────
      // Called after successful order placement
      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },
    }),
    {
      name: "cart-storage", // localStorage key — cart survives page refresh
    }
  )
);