"use client";

import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore, useCartDrawer } from "@/application/store/cartStore";
import { Button } from "@/components/ui/button";

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

export const CartDrawer = () => {
  const { isOpen, close }                         = useCartDrawer();
  const { items, totalItems, totalPrice,
          removeItem, updateQuantity }             = useCartStore();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={close}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            Cart{" "}
            {totalItems > 0 && (
              <span className="ml-1 text-sm font-normal text-zinc-500">
                ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
            )}
          </h2>
          <button
            onClick={close}
            className="rounded-md p-1 text-zinc-400 transition hover:text-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Empty State */}
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag className="h-12 w-12 text-zinc-300" />
              <p className="text-sm font-medium text-zinc-500">
                Your cart is empty
              </p>
              <Button variant="outline" size="sm" onClick={close}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-4"
                >
                  {/* Product Image */}
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-zinc-200" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-medium text-zinc-900 line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Size: {item.size}
                    </p>
                    <p className="text-sm font-semibold text-zinc-900">
                      LE {(item.price * item.quantity).toLocaleString()}
                    </p>

                    {/* Quantity Controls */}
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        className="rounded border border-zinc-300 p-0.5 text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900"
                      >
                        <Minus className="h-3 w-3" />
                      </button>

                      <span className="min-w-[1.5rem] text-center text-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        className="rounded border border-zinc-300 p-0.5 text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900"
                      >
                        <Plus className="h-3 w-3" />
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.size)
                        }
                        className="ml-auto text-zinc-400 transition hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className="border-t border-zinc-200 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">Subtotal</span>
              <span className="font-semibold text-zinc-900">
                LE {totalPrice.toLocaleString()}
              </span>
            </div>

            <Button asChild className="w-full" onClick={close}>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <button
              onClick={close}
              className="w-full text-center text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};