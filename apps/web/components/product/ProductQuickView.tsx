"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AnimatePresence,
  motion,
} from "motion/react";

import ProductImage from "@/components/product/ProductImage";
import { useCartStore } from "@/store/cartStore";
import { useQuickViewStore } from "@/store/quickViewStore";
import { useRecentStore } from "@/store/recentStore";

export default function ProductQuickView() {
  const product =
    useQuickViewStore(
      (state) => state.product
    );

  const close =
    useQuickViewStore(
      (state) => state.close
    );

  const items = useCartStore(
    (state) => state.items
  );

  const addItem = useCartStore(
    (state) => state.addItem
  );

  const increaseQuantity =
    useCartStore(
      (state) =>
        state.increaseQuantity
    );

  const decreaseQuantity =
    useCartStore(
      (state) =>
        state.decreaseQuantity
    );

  const addRecent =
    useRecentStore(
      (state) => state.addRecent
    );

  useEffect(() => {
    if (product) {
      addRecent(product);
    }
  }, [product, addRecent]);

  useEffect(() => {
    if (!product) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        close();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [product, close]);

  return (
    <AnimatePresence>
      {product && (
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
            onClick={close}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              opacity: 0,
              y: 80,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 80,
            }}
            transition={{
              duration: 0.22,
            }}
            className="fixed inset-x-0 bottom-0 z-[80] max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[94%] sm:max-w-5xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
          >
            <div className="sticky top-0 z-30 flex justify-center bg-white py-2 sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-gray-300" />
            </div>

            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 z-30 rounded-full border border-gray-200 bg-white p-2 shadow-sm transition hover:bg-gray-100 sm:right-5 sm:top-5 sm:p-2.5"
              aria-label="Close quick view"
            >
              <X size={20} />
            </button>

            <div className="grid sm:grid-cols-2 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="flex min-h-[300px] items-center justify-center overflow-hidden bg-white px-4 pb-2 pt-4 sm:min-h-[480px] sm:p-8 lg:min-h-[620px]">
                <div className="relative h-[280px] w-full max-w-xl sm:h-[420px] lg:h-[540px]">
                  <ProductImage
                    src={
                      product.image
                    }
                    alt={
                      product.name
                    }
                  />
                </div>
              </div>

              <div
                className="border-t border-gray-100 p-5 pb-6 sm:border-l sm:border-t-0 sm:p-7 lg:p-10"
                style={{
                  paddingBottom:
                    "max(24px, env(safe-area-inset-bottom))",
                }}
              >
                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 sm:text-sm">
                  {
                    product.category
                  }
                </span>

                <h2 className="mt-3 pr-10 text-2xl font-bold leading-tight sm:mt-5 sm:text-3xl lg:text-4xl">
                  {product.name}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
                  <Star
                    size={17}
                    className="fill-yellow-400 text-yellow-400"
                  />

                  <span className="font-semibold">
                    {
                      product.rating
                    }
                  </span>

                  <span className="text-sm text-gray-500 sm:text-base">
                    (
                    {
                      product.reviews
                    }{" "}
                    reviews)
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      product.stock >
                      0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock >
                    0
                      ? "In Stock"
                      : "Out of Stock"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
                  <span className="text-3xl font-bold sm:text-4xl">
                    ₹
                    {
                      product.price
                    }
                  </span>

                  {product.mrp >
                    product.price && (
                    <span className="text-base text-gray-400 line-through sm:text-lg">
                      ₹
                      {
                        product.mrp
                      }
                    </span>
                  )}

                  {product.discount >
                    0 && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600 sm:text-sm">
                      {
                        product.discount
                      }
                      % OFF
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm font-medium text-gray-500 sm:mt-3 sm:text-base">
                  {product.unit}
                </p>

                {product.description && (
                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-gray-600 sm:mt-6 sm:text-base sm:leading-7">
                    {
                      product.description
                    }
                  </p>
                )}

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 sm:mt-6 sm:p-4">
                  <div className="rounded-full bg-green-100 p-2 text-green-700">
                    <Truck
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      Fast delivery
                    </p>

                    <p>
                      Delivery in{" "}
                      {
                        product.deliveryTime
                      }
                    </p>
                  </div>
                </div>

                {(() => {
                  const cartKey = `${product.id}-base`;

                  const cartItem =
                    items.find(
                      (item) =>
                        item.cartKey ===
                        cartKey
                    );

                  if (cartItem) {
                    return (
                      <div className="mt-5 flex items-center justify-between rounded-xl border border-green-600 bg-green-50 px-4 py-3 sm:mt-7">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(
                              cartKey
                            )
                          }
                          className="rounded-lg bg-green-600 p-2.5 text-white"
                        >
                          <Minus
                            size={19}
                          />
                        </button>

                        <div className="text-center">
                          <p className="text-xs font-semibold text-gray-500">
                            Quantity
                          </p>

                          <span className="text-xl font-bold text-green-700">
                            {
                              cartItem.quantity
                            }
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const success =
                              increaseQuantity(
                                cartKey
                              );

                            if (
                              !success
                            ) {
                              toast.error(
                                "Maximum available stock reached"
                              );
                            }
                          }}
                          className="rounded-lg bg-green-600 p-2.5 text-white"
                        >
                          <Plus
                            size={19}
                          />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => {
                        addItem(
                          product,
                          null
                        );

                        toast.success(
                          `${product.name} added to cart`
                        );
                      }}
                      disabled={
                        product.stock <=
                        0
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-300 sm:mt-7 sm:py-4"
                    >
                      <ShoppingCart
                        size={20}
                      />

                      {product.stock >
                      0
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </button>
                  );
                })()}

                <Link
                  href={`/product/${product.id}`}
                  onClick={close}
                  className="mt-4 block rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-50 sm:mt-5 sm:text-base"
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}