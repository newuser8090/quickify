"use client";

import {
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import { useFilterStore } from "@/store/filterStore";

type SortValue =
  | "default"
  | "price-low"
  | "price-high"
  | "rating"
  | "discount";

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

  const hasFilters =
    sort !== "default" ||
    inStockOnly ||
    discountedOnly ||
    minRating > 0;

  return (
    <section className="mx-auto mt-4 max-w-7xl px-3 sm:mt-6 sm:px-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <div className="flex items-center gap-2 text-sm font-bold sm:text-base">
            <SlidersHorizontal
              size={17}
            />
            Filters & Sorting
          </div>

          <button
            type="button"
            onClick={
              resetAdvancedFilters
            }
            disabled={!hasFilters}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:text-gray-300 sm:gap-2 sm:px-0 sm:py-0 sm:text-sm"
          >
            <RotateCcw
              size={14}
            />
            Reset
          </button>
        </div>

        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0">
          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target
                  .value as SortValue
              )
            }
            className="min-w-[145px] shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-medium outline-none transition focus:border-green-600 focus:bg-white sm:text-sm md:min-w-0 md:px-4 md:py-3"
          >
            <option value="default">
              Default sorting
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating">
              Top Rated
            </option>

            <option value="discount">
              Highest Discount
            </option>
          </select>

          <select
            value={minRating}
            onChange={(event) =>
              setMinRating(
                Number(
                  event.target.value
                )
              )
            }
            className="min-w-[125px] shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-medium outline-none transition focus:border-green-600 focus:bg-white sm:text-sm md:min-w-0 md:px-4 md:py-3"
          >
            <option value={0}>
              Any Rating
            </option>

            <option value={4}>
              4★ & above
            </option>

            <option value={3}>
              3★ & above
            </option>
          </select>

          <label
            className={`flex min-w-max shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition sm:text-sm md:px-4 md:py-3 ${
              inStockOnly
                ? "border-green-600 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            <input
              type="checkbox"
              checked={
                inStockOnly
              }
              onChange={(event) =>
                setInStockOnly(
                  event.target
                    .checked
                )
              }
              className="h-4 w-4 accent-green-600"
            />

            In Stock
          </label>

          <label
            className={`flex min-w-max shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition sm:text-sm md:px-4 md:py-3 ${
              discountedOnly
                ? "border-green-600 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            <input
              type="checkbox"
              checked={
                discountedOnly
              }
              onChange={(event) =>
                setDiscountedOnly(
                  event.target
                    .checked
                )
              }
              className="h-4 w-4 accent-green-600"
            />

            Discounted
          </label>
        </div>
      </div>
    </section>
  );
}
