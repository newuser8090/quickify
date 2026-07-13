"use client";

import ProductCard from "@/components/product/ProductCard";
import { useRecentStore } from "@/store/recentStore";

type Props = {
  currentProductId?: number;
};

export default function RecentlyViewed({
  currentProductId,
}: Props) {
  const items = useRecentStore(
    (state) => state.items
  );

  const recentProducts = items
    .filter(
      (product) =>
        product.id !== currentProductId
    )
    .slice(0, 5);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm sm:mt-10">
      <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 via-emerald-50 to-white p-4 sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-wide text-green-700 sm:text-xs">
          Pick up where you left off
        </p>

        <h2 className="mt-2 text-xl font-extrabold text-gray-900 sm:text-3xl">
          Recently Viewed
        </h2>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          Continue browsing products you recently checked.
        </p>
      </div>

      <div className="hide-scrollbar flex gap-3 overflow-x-auto px-3 pb-3 pt-4 sm:gap-4 sm:px-6 sm:pb-6">
  {recentProducts.map((product) => (
    <div
      key={product.id}
      className="w-[170px] shrink-0 sm:w-[210px]"
    >
      <ProductCard product={product} />
    </div>
  ))}
</div>
    </section>
  );
}
