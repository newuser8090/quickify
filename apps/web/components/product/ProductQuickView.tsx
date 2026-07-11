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

  const increaseQuantity = useCartStore(
    (state) =>
      state.increaseQuantity
  );

  const decreaseQuantity = useCartStore(
    (state) =>
      state.decreaseQuantity
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
    if (!product) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
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

  if (!product) {
    return null;
  }

  const cartKey = `${product.id}-base`;

  const cartItem = items.find(
    (item) => item.cartKey === cartKey
  );

  const inStock =
    product.stock > 0;

  return (
    <>
      <div
        onClick={close}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />

      <div className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[94%] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={close}
          className="absolute right-5 top-5 z-20 rounded-full border border-gray-200 bg-white p-2.5 shadow-sm transition hover:bg-gray-100"
          aria-label="Close quick view"
        >
          <X size={20} />
        </button>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex min-h-[480px] items-center justify-center overflow-hidden bg-white p-8 lg:min-h-[620px]">
            <div className="relative h-[420px] w-full max-w-xl lg:h-[540px]">
              <ProductImage
                src={product.image}
                alt={product.name}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 p-7 lg:border-l lg:border-t-0 lg:p-10">
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              {product.category}
            </span>

            <h2 className="mt-5 pr-10 text-3xl font-bold leading-tight lg:text-4xl">
              {product.name}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Star
                size={18}
                className="fill-yellow-400 text-yellow-400"
              />

              <span className="font-semibold">
                {product.rating}
              </span>

              <span className="text-gray-500">
                ({product.reviews} reviews)
              </span>

              <span
                className={`ml-2 rounded-full px-3 py-1 text-xs font-bold ${
                  inStock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {inStock
                  ? "In Stock"
                  : "Out of Stock"}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-4xl font-bold">
                ₹{product.price}
              </span>

              {product.mrp >
                product.price && (
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.mrp}
                </span>
              )}

              {product.discount >
                0 && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <p className="mt-3 font-medium text-gray-500">
              {product.unit}
            </p>

            {product.description && (
              <p className="mt-6 line-clamp-4 leading-7 text-gray-600">
                {product.description}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <div className="rounded-full bg-green-100 p-2 text-green-700">
                <Truck size={18} />
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Fast delivery
                </p>

                <p>
                  Delivery in{" "}
                  {product.deliveryTime}
                </p>
              </div>
            </div>

            {cartItem ? (
              <div className="mt-7 flex items-center justify-between rounded-xl border border-green-600 bg-green-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    decreaseQuantity(
                      cartKey
                    )
                  }
                  className="rounded-lg bg-green-600 p-2.5 text-white transition hover:bg-green-700"
                  aria-label={`Decrease ${product.name} quantity`}
                >
                  <Minus size={19} />
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

                    if (!success) {
                      toast.error(
                        "Maximum available stock reached"
                      );
                    }
                  }}
                  className="rounded-lg bg-green-600 p-2.5 text-white transition hover:bg-green-700"
                  aria-label={`Increase ${product.name} quantity`}
                >
                  <Plus size={19} />
                </button>
              </div>
            ) : (
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
                disabled={!inStock}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <ShoppingCart
                  size={20}
                />

                {inStock
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>
            )}

            <Link
              href={`/product/${product.id}`}
              onClick={close}
              className="mt-5 block rounded-xl border border-gray-200 py-3 text-center font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-50"
            >
              View Full Details →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
