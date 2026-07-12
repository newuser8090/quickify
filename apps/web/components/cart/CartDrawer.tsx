"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import { toast } from "sonner";

import CartItem from "./CartItem";
import EmptyState from "@/components/ui/EmptyState";
import useCart from "@/hooks/useCart";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";

export default function CartDrawer() {
  const { items, totalPrice } =
    useCart();

  const savedItems = useCartStore(
    (state) => state.savedItems
  );

  const saveForLater = useCartStore(
    (state) => state.saveForLater
  );

  const moveToCart = useCartStore(
    (state) => state.moveToCart
  );

  const removeSavedItem =
    useCartStore(
      (state) =>
        state.removeSavedItem
    );

  const cartOpen = useUIStore(
    (state) => state.cartOpen
  );

  const closeCart = useUIStore(
    (state) => state.closeCart
  );

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={closeCart}
          />

          <motion.aside
            initial={{
              x: 450,
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: 450,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28,
            }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[420px] flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-2xl font-bold">
                  My Cart
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {items.length} cart item
                  {items.length === 1
                    ? ""
                    : "s"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                aria-label="Close cart"
              >
                <X size={21} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {items.length === 0 &&
                savedItems.length ===
                  0 && (
                  <div>
                    <EmptyState
                      icon={
                        <ShoppingCart
                          size={42}
                        />
                      }
                      title="Your cart is empty"
                      description="Add fresh groceries and daily essentials to your cart."
                    />

                    <Link
                      href="/"
                      onClick={closeCart}
                      className="mx-auto mt-4 block w-fit rounded-2xl bg-green-600 px-7 py-3 font-bold text-white shadow-sm transition hover:bg-green-700"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}

              {items.length > 0 && (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.cartKey}
                      className="rounded-2xl border p-3"
                    >
                      <CartItem
                        item={item}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          saveForLater(
                            item.cartKey
                          );

                          toast.success(
                            "Saved for later"
                          );
                        }}
                        className="mt-3 w-full rounded-xl border px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                      >
                        Save for Later
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {savedItems.length > 0 && (
                <div className="border-t pt-5">
                  <h3 className="mb-3 text-lg font-bold">
                    Saved for Later
                  </h3>

                  <div className="space-y-4">
                    {savedItems.map(
                      (item) => (
                        <div
                          key={
                            item.cartKey
                          }
                          className="rounded-2xl border bg-gray-50 p-4"
                        >
                          <div className="flex gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white">
                              {item.image ? (
                                <Image
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.name
                                  }
                                  fill
                                  sizes="80px"
                                  className="object-contain p-1"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl">
                                  📦
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="line-clamp-2 font-bold">
                                    {
                                      item.name
                                    }
                                  </p>

                                  {item.variantName && (
                                    <p className="mt-1 text-sm font-medium text-green-700">
                                      {
                                        item.variantName
                                      }
                                    </p>
                                  )}

                                  <p className="mt-1 text-sm text-gray-500">
                                    {
                                      item.unit
                                    }{" "}
                                    • ₹
                                    {
                                      item.price
                                    }
                                  </p>
                                </div>

                                <p className="shrink-0 font-bold">
                                  Qty{" "}
                                  {
                                    item.quantity
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                const success =
                                  moveToCart(
                                    item.cartKey
                                  );

                                toast[
                                  success
                                    ? "success"
                                    : "error"
                                ](
                                  success
                                    ? "Moved to cart"
                                    : "Item is out of stock"
                                );
                              }}
                              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                            >
                              Move to Cart
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                removeSavedItem(
                                  item.cartKey
                                );

                                toast.success(
                                  "Removed from saved items"
                                );
                              }}
                              className="rounded-xl border px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t bg-white p-5">
              <div className="mb-4 flex justify-between text-xl font-bold">
                <span>Total</span>

                <span>
                  ₹
                  {Number(
                    totalPrice
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className={`block w-full rounded-xl py-4 text-center font-semibold transition ${
                  items.length === 0
                    ? "pointer-events-none bg-gray-300 text-gray-500"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                Proceed to Checkout
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
