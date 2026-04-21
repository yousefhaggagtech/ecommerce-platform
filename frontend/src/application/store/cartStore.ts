import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ICartItem } from "@/domain/entities/cartEntity";

// ─── Cart State ───────────────────────────────────────────────────────────────

interface CartState {
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
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

      addItem: (newItem) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.productId === newItem.productId && i.size === newItem.size
        );

        let updatedItems: ICartItem[];

        if (existingIndex !== -1) {
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

      updateQuantity: (productId, size, quantity) => {
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

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    { name: "cart-storage" }
  )
);

// ─── Cart Drawer Store ────────────────────────────────────────────────────────
// Separate store — drawer open/close state doesn't need to be persisted

interface CartDrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCartDrawer = create<CartDrawerState>()((set) => ({
  isOpen: false,
  open:   () => set({ isOpen: true }),
  close:  () => set({ isOpen: false }),
}));