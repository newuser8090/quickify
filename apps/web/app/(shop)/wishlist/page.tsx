"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import EmptyState from "@/components/ui/EmptyState";
import ProductImage from "@/components/product/ProductImage";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const items = useWishlistStore(
    (state) => state.items
  );

  const availableCount = items.filter(
    (product) => product.stock > 0
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 p-5 text-white shadow-[0_20px_60px_rgba(244,63,94,0.35)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-rose-200/25 blur-3xl" />

          <Link
            href="/"
            aria-label="Back to home"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30 active:scale-95 sm:right-6 sm:top-6"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="relative z-[1] pr-14 sm:pr-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
              <Heart
                size={14}
                className="fill-white"
              />

              Saved favourites
            </div>

            <h1 className="mt-4 text-2xl font-extrabold sm:text-4xl">
              My Wishlist
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-rose-50 sm:text-base">
              Keep your favourite products ready for your next Quickify order.
            </p>
          </div>

          <div className="relative z-[1] mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:max-w-md sm:gap-4">
            <WishlistStat
              label="Saved Products"
              value={items.length}
            />

            <WishlistStat
              label="Ready to Shop"
              value={availableCount}
            />
          </div>
        </div>

        <div className="mt-5 sm:mt-8">
          {items.length === 0 ? (
            <EmptyState
              icon={<Heart size={44} />}
              title="Your wishlist is empty"
              description="Save products you like and find them here later."
              actionLabel="Explore Products"
              actionHref="/"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => (
                <WishlistProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function WishlistStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/15 px-3 py-3 text-center backdrop-blur sm:px-5 sm:py-4">
      <p className="text-xl font-extrabold sm:text-3xl">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-semibold text-rose-50 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function WishlistProductCard({
  product,
}: {
  product: Product;
}) {
  const cartItems = useCartStore(
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

  const toggleWishlist = useWishlistStore(
    (state) => state.toggle
  );

  const cartKey = `${product.id}-base`;

  const cartItem = cartItems.find(
    (item) => item.cartKey === cartKey
  );

  const inStock = product.stock > 0;

  function handleRemove() {
    toggleWishlist(product);

    toast.success(
      `${product.name} removed from wishlist`
    );
  }

  function handleAddToCart() {
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

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(244,63,94,0.18)] sm:rounded-3xl">
      <div className="relative aspect-square overflow-hidden bg-white p-2 sm:p-4">
        <Link
          href={`/product/${product.id}`}
          className="relative block h-full w-full"
        >
          <ProductImage
            src={product.image}
            alt={product.name}
          />
        </Link>

        {product.discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-2 py-1 text-[9px] font-bold text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs">
            {product.discount}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 bg-white/95 text-rose-500 shadow-sm transition hover:bg-rose-50 hover:text-rose-600 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex flex-1 flex-col border-t border-rose-100 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1">
            <Star
              size={13}
              className="shrink-0 fill-amber-400 text-amber-400"
            />

            <span className="text-[11px] font-bold text-gray-700 sm:text-xs">
              {product.rating}
            </span>
          </div>

          <span
            className={`truncate rounded-full px-2 py-1 text-[9px] font-bold sm:text-[10px] ${
              inStock
                ? "bg-rose-100 text-rose-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {inStock
              ? "In stock"
              : "Out"}
          </span>
        </div>

        <Link
          href={`/product/${product.id}`}
          className="mt-2"
        >
          <h2 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-gray-900 transition hover:text-rose-600 sm:min-h-12 sm:text-base sm:leading-6">
            {product.name}
          </h2>
        </Link>

        <p className="mt-1 truncate text-[11px] text-gray-500 sm:text-sm">
          {product.unit}
        </p>

        <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
          <span className="text-base font-extrabold text-rose-600 sm:text-xl">
            ₹{product.price}
          </span>

          {product.mrp > product.price && (
            <span className="text-[10px] text-gray-400 line-through sm:text-sm">
              ₹{product.mrp}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          {cartItem ? (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 via-pink-50 to-red-50 px-2 py-2 sm:px-3">
              <button
                type="button"
                onClick={() =>
                  decreaseQuantity(cartKey)
                }
                aria-label={`Decrease ${product.name} quantity`}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 text-white shadow-sm transition hover:brightness-110 active:scale-95 sm:h-8 sm:w-8"
              >
                <Minus size={14} />
              </button>

              <span className="text-sm font-extrabold text-rose-700">
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
                aria-label={`Increase ${product.name} quantity`}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 text-white shadow-sm transition hover:brightness-110 active:scale-95 sm:h-8 sm:w-8"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 px-2 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-110 hover:shadow-xl hover:shadow-rose-500/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300 disabled:shadow-none sm:gap-2 sm:py-3 sm:text-sm"
            >
              <ShoppingCart size={15} />

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
