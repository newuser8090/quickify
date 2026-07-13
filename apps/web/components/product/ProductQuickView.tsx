"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
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
  const product = useQuickViewStore(
    (state) => state.product
  );

  const close = useQuickViewStore(
    (state) => state.close
  );

  const items = useCartStore(
    (state) => state.items
  );

  const addItem = useCartStore(
    (state) => state.addItem
  );

  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  );

  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  );

  const addRecent = useRecentStore(
    (state) => state.addRecent
  );

  useEffect(() => {
    if (product) {
      addRecent(product);
    }
  }, [product, addRecent]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [product, close]);

  const cartKey = product
    ? `${product.id}-base`
    : "";

  const cartItem = product
    ? items.find(
        (item) => item.cartKey === cartKey
      )
    : undefined;

  function handleAddToCart() {
    if (!product) {
      return;
    }

    const success = addItem(
      product,
      null
    );

    if (success === false) {
      toast.error(
        "Maximum available stock reached"
      );
      return;
    }

    toast.success(
      `${product.name} added to cart`
    );
  }

  function handleIncrease() {
    if (!cartKey) {
      return;
    }

    const success =
      increaseQuantity(cartKey);

    if (!success) {
      toast.error(
        "Maximum available stock reached"
      );
    }
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.button
            key="quick-view-overlay"
            type="button"
            aria-label="Close quick view"
            onClick={close}
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
              duration: 0.2,
            }}
            className="fixed inset-0 z-[9990] cursor-default bg-black/45 backdrop-blur-[5px]"
          />

          <motion.section
            key="quick-view-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view of ${product.name}`}
            initial={{
              opacity: 0,
              y: 52,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 52,
              scale: 0.97,
            }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 30,
            }}
            className="fixed inset-x-0 bottom-0 z-[9991] max-h-[88dvh] overflow-y-auto rounded-t-[28px] border border-white/70 bg-white shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[92%] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[30px]"
          >
            <div className="sticky top-0 z-30 flex justify-center bg-white/90 py-2 backdrop-blur-xl sm:hidden">
              <div className="h-1 w-11 rounded-full bg-gray-300" />
            </div>

            <button
              type="button"
              onClick={close}
              aria-label="Close quick view"
              className="absolute right-3 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/80 text-gray-700 shadow-lg backdrop-blur-xl transition hover:bg-white sm:right-4 sm:top-4"
            >
              <X size={18} />
            </button>

            <div className="grid sm:grid-cols-[0.92fr_1.08fr]">
              <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 px-5 py-5 sm:min-h-[430px] sm:px-6 sm:py-7">
                <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-green-200/30 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />

                {product.discount > 0 && (
                  <span className="absolute left-4 top-4 z-20 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md">
                    {product.discount}% OFF
                  </span>
                )}

                <div className="relative h-[220px] w-full sm:h-[350px]">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                  />
                </div>
              </div>

              <div
                className="border-t border-gray-100 p-4 sm:border-l sm:border-t-0 sm:p-6"
                style={{
                  paddingBottom:
                    "max(20px, env(safe-area-inset-bottom))",
                }}
              >
                <div className="flex flex-wrap items-center gap-2 pr-10">
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-extrabold text-green-700 sm:text-xs">
                    {product.category}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold sm:text-xs ${
                      product.stock > 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock > 0
                      ? "In stock"
                      : "Out of stock"}
                  </span>
                </div>

                <h2 className="mt-3 pr-8 text-xl font-black leading-tight text-gray-950 sm:text-2xl">
                  {product.name}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="text-xs font-extrabold">
                      {product.rating}
                    </span>
                  </div>

                  <span className="text-xs text-gray-500">
                    {product.reviews} reviews
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-950 sm:text-3xl">
                    ₹{product.price}
                  </span>

                  {product.mrp >
                    product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{product.mrp}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs font-semibold text-gray-500">
                  {product.unit}
                </p>

                {product.description && (
                  <p className="mt-4 line-clamp-3 text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
                    {product.description}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50/70 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                    <Truck size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-gray-900">
                      Fast delivery
                    </p>

                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Arrives in{" "}
                      {product.deliveryTime}
                    </p>
                  </div>
                </div>

                {cartItem ? (
                  <div className="mt-5 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(
                          cartKey
                        )
                      }
                      aria-label={`Decrease ${product.name} quantity`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white transition hover:bg-green-700"
                    >
                      <Minus size={17} />
                    </button>

                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-gray-500">
                        Quantity
                      </p>

                      <span className="text-lg font-black text-green-700">
                        {cartItem.quantity}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleIncrease
                      }
                      aria-label={`Increase ${product.name} quantity`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white transition hover:bg-green-700"
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    whileTap={{
                      scale: 0.97,
                    }}
                    onClick={
                      handleAddToCart
                    }
                    disabled={
                      product.stock <= 0
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(22,163,74,0.24)] transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                  >
                    <ShoppingCart
                      size={18}
                    />

                    {product.stock > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </motion.button>
                )}

                <Link
                  href={`/product/${product.id}`}
                  onClick={close}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-xs font-extrabold text-gray-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 sm:text-sm"
                >
                  View Full Details
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}