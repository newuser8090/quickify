"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import ProductImage from "./ProductImage";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

type Props = {
  product: Product;
};

export default function ProductRecommendationCard({
  product,
}: Props) {
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

  const cartKey =
    `${product.id}-base`;

  const cartItem = items.find(
    (item) =>
      item.cartKey === cartKey
  );

  const inStock =
    product.stock > 0;

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl">
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-white p-2.5 sm:p-4"
      >
        <ProductImage
          src={product.image}
          alt={product.name}
        />

        {product.discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[9px] font-bold text-white sm:text-xs">
            {product.discount}% OFF
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col border-t border-gray-100 p-3 sm:p-4">
        <div className="flex items-center gap-1 text-[11px]">
          <Star
            size={13}
            className="fill-yellow-400 text-yellow-400"
          />

          <span className="font-bold">
            {product.rating}
          </span>
        </div>

        <Link href={`/product/${product.id}`}>
  <h3 className="mt-1 line-clamp-2 text-[12px] font-extrabold leading-[17px] text-gray-900 transition hover:text-green-700 sm:mt-1.5 sm:text-sm sm:leading-5">
    {product.name}
  </h3>
</Link>

<p className="mt-1 truncate text-[9px] text-gray-500 sm:text-xs">
  {product.unit}
</p>

<div className="mt-1 flex items-baseline gap-1.5 sm:mt-1.5">
          <span className="text-base font-extrabold sm:text-xl">
            ₹{product.price}
          </span>

          {product.mrp >
            product.price && (
            <span className="text-[10px] text-gray-400 line-through sm:text-sm">
              ₹{product.mrp}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          {cartItem ? (
            <div className="flex items-center justify-between rounded-xl border border-green-600 bg-green-50 px-2 py-2">
              <button
                type="button"
                onClick={() =>
                  decreaseQuantity(
                    cartKey
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white"
              >
                <Minus size={14} />
              </button>

              <span className="text-sm font-extrabold text-green-700">
                {cartItem.quantity}
              </span>

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
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!inStock}
              onClick={() => {
                const success =
                  addItem(
                    product,
                    null
                  );

                if (
                  success === false
                ) {
                  toast.error(
                    "Maximum available stock reached"
                  );
                  return;
                }

                toast.success(
                  `${product.name} added to cart`
                );
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-xs font-bold text-white disabled:bg-gray-300 sm:text-sm"
            >
              <ShoppingCart
                size={15}
              />

              {inStock
                ? "Add"
                : "Unavailable"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}