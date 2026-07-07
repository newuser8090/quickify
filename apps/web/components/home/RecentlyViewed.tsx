"use client";

import ProductGrid from "@/components/product/ProductGrid";
import { useRecentStore } from "@/store/recentStore";

export default function RecentlyViewed() {
  const items = useRecentStore((state) => state.items);

  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mx-auto mb-6 max-w-7xl px-6">
        <h2 className="text-3xl font-bold">🕒 Recently Viewed</h2>
        <p className="mt-2 text-gray-500">Continue where you left off.</p>
      </div>

      <ProductGrid products={items} showEmptyState={false} />
    </section>
  );
}