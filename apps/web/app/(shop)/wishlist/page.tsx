"use client";

import { Heart } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { useWishlistStore } from "@/store/wishlistStore";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <PageHeader title="My Wishlist" />

        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              icon={<Heart size={44} />}
              title="Your wishlist is empty"
              description="Save products you like and find them here later."
              actionLabel="Explore Products"
              actionHref="/"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}