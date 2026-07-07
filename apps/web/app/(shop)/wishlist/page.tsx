"use client";

import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-green-700"
        >
          <ArrowLeft size={18} />
          Back to shopping
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <Heart className="fill-red-500 text-red-500" />
          <h1 className="text-4xl font-bold">My Wishlist</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold">Your wishlist is empty</h2>

            <p className="mt-3 text-gray-500">
              Save products you like and find them here later.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}