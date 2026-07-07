"use client";

import ProductCard from "@/components/product/ProductCard";
import { useRecentStore } from "@/store/recentStore";

type Props = {
  currentProductId?: number;
};

export default function RecentlyViewed({ currentProductId }: Props) {
  const items = useRecentStore((state) => state.items);

  const recentProducts = items.filter(
    (product) => product.id !== currentProductId
  );

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Recently Viewed</h2>
        <p className="mt-2 text-gray-500">Continue where you left off.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}