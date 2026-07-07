"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";

export default function ProductFilters() {
  const {
    sort,
    inStockOnly,
    discountedOnly,
    minRating,
    setSort,
    setInStockOnly,
    setDiscountedOnly,
    setMinRating,
    resetAdvancedFilters,
  } = useFilterStore();

  return (
    <section className="mx-auto mt-6 max-w-7xl px-6">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <SlidersHorizontal size={18} />
            Filters & Sorting
          </div>

          <button
            onClick={resetAdvancedFilters}
            className="flex items-center gap-2 text-sm font-semibold text-green-700"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <select
            value={sort}
            onChange={(e) =>
  setSort(
    e.target.value as
      | "default"
      | "price-low"
      | "price-high"
      | "rating"
      | "discount"
  )
}
            className="rounded-xl border px-4 py-3 outline-none focus:border-green-600"
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Highest Discount</option>
          </select>

          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="rounded-xl border px-4 py-3 outline-none focus:border-green-600"
          >
            <option value={0}>Any Rating</option>
            <option value={4}>4★ & above</option>
            <option value={3}>3★ & above</option>
          </select>

          <label className="flex items-center gap-3 rounded-xl border px-4 py-3">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            In Stock Only
          </label>

          <label className="flex items-center gap-3 rounded-xl border px-4 py-3">
            <input
              type="checkbox"
              checked={discountedOnly}
              onChange={(e) => setDiscountedOnly(e.target.checked)}
            />
            Discounted Only
          </label>
        </div>
      </div>
    </section>
  );
}