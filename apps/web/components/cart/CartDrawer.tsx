"use client";

import {
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ShoppingCart,
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
  const [mounted, setMounted] =
    useState(false);

  const {
    items,
    totalPrice,
  } = useCart();

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!cartOpen) {
      return;
    }

    const scrollY =
      window.scrollY;

    const previousBodyPosition =
      document.body.style.position;

    const previousBodyTop =
      document.body.style.top;

    const previousBodyLeft =
      document.body.style.left;

    const previousBodyRight =
      document.body.style.right;

    const previousBodyWidth =
      document.body.style.width;

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style
        .overflow;

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.position =
      "fixed";

    document.body.style.top =
      `-${scrollY}px`;

    document.body.style.left =
      "0";

    document.body.style.right =
      "0";

    document.body.style.width =
      "100%";

    document.body.style.overflow =
      "hidden";

    return () => {
      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.position =
        previousBodyPosition;

      document.body.style.top =
        previousBodyTop;

      document.body.style.left =
        previousBodyLeft;

      document.body.style.right =
        previousBodyRight;

      document.body.style.width =
        previousBodyWidth;

      document.body.style.overflow =
        previousBodyOverflow;

      window.scrollTo({
        top: scrollY,
        left: 0,
        behavior: "instant",
      });
    };
  }, [cartOpen]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button
            key="cart-overlay"
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.22,
            }}
            className="fixed inset-0 z-[9996] cursor-default bg-black/40 backdrop-blur-[6px]"
          />

          <motion.aside
            key="cart-drawer"
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 32,
            }}
            className="fixed inset-y-0 right-0 z-[9997] flex h-[100dvh] w-[78%] max-w-[340px] flex-col bg-white shadow-2xl sm:w-full sm:max-w-[420px]"
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="flex shrink-0 items-center justify-between border-b px-4 py-4 sm:p-5">
              <div className="min-w-0">
                <h2 className="text-xl font-bold sm:text-2xl">
                  My Cart
                </h2>

                <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
                  {items.length} cart item
                  {items.length === 1
                    ? ""
                    : "s"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
                aria-label="Close cart"
              >
                <ChevronRight
                  size={24}
                />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4 sm:space-y-5 sm:p-5">
              {items.length === 0 &&
                savedItems.length ===
                  0 && (
                  <div className="pt-6">
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
                      className="mx-auto mt-4 block w-fit rounded-2xl bg-green-600 px-5 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-green-700 sm:px-7 sm:text-base"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}

              {items.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.cartKey}
                      className="rounded-2xl border p-2.5 sm:p-3"
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
                        className="mt-3 w-full rounded-xl border px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50 sm:px-4 sm:text-sm"
                      >
                        Save for Later
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {savedItems.length >
                0 && (
                <div className="border-t pt-5">
                  <h3 className="mb-3 text-base font-bold sm:text-lg">
                    Saved for Later
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    {savedItems.map(
                      (item) => (
                        <div
                          key={
                            item.cartKey
                          }
                          className="rounded-2xl border bg-gray-50 p-3 sm:p-4"
                        >
                          <div className="flex gap-3">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white sm:h-20 sm:w-20">
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
                                <div className="flex h-full w-full items-center justify-center text-xl sm:text-2xl">
                                  📦
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-bold sm:text-base">
                                {
                                  item.name
                                }
                              </p>

                              {item.variantName && (
                                <p className="mt-1 text-xs font-medium text-green-700 sm:text-sm">
                                  {
                                    item.variantName
                                  }
                                </p>
                              )}

                              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                {
                                  item.unit
                                }{" "}
                                • ₹
                                {
                                  item.price
                                }
                              </p>

                              <p className="mt-1 text-xs font-semibold text-gray-700">
                                Qty{" "}
                                {
                                  item.quantity
                                }
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
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
                              className="rounded-xl bg-green-600 px-2 py-2.5 text-[11px] font-semibold text-white transition hover:bg-green-700 sm:px-4 sm:text-sm"
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
                              className="rounded-xl border px-2 py-2.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-50 sm:px-4 sm:text-sm"
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

            <div
              className="shrink-0 border-t bg-white px-3 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:px-5 sm:pt-5"
              style={{
                paddingBottom:
                  "max(12px, env(safe-area-inset-bottom))",
              }}
            >
              <div className="mb-3 flex items-center justify-between text-base font-bold sm:mb-4 sm:text-xl">
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
                className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition sm:py-4 sm:text-base ${
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
    </AnimatePresence>,
    document.body
  );
}
