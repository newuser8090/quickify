"use client";

import {
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Tag,
  PackageCheck,
} from "lucide-react";
import {
  motion,
} from "motion/react";

import {
  useFilterStore,
} from "@/store/filterStore";

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
    <section className="mx-auto mt-3 max-w-7xl px-3 sm:mt-5 sm:px-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <SlidersHorizontal
                size={16}
              />
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-gray-900 sm:text-base">
                Filters
              </h2>

              <p className="text-[10px] text-gray-500 sm:text-xs">
                Refine products quickly
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              resetAdvancedFilters
            }
            disabled={!hasFilters}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:text-gray-300 sm:text-xs"
          >
            <RotateCcw
              size={13}
            />
            Reset
          </button>
        </div>

        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          <SelectFilter
            value={sort}
            onChange={(value) =>
              setSort(
                value as SortValue
              )
            }
            icon={
              <SlidersHorizontal
                size={14}
              />
            }
            ariaLabel="Sort products"
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
          </SelectFilter>

          <SelectFilter
            value={String(
              minRating
            )}
            onChange={(value) =>
              setMinRating(
                Number(value)
              )
            }
            icon={
              <Star
                size={14}
              />
            }
            ariaLabel="Filter by rating"
          >
            <option value="0">
              Any Rating
            </option>

            <option value="4">
              4★ & above
            </option>

            <option value="3">
              3★ & above
            </option>
          </SelectFilter>

          <FilterChip
            active={
              inStockOnly
            }
            label="In Stock"
            icon={
              <PackageCheck
                size={14}
              />
            }
            onClick={() =>
              setInStockOnly(
                !inStockOnly
              )
            }
          />

          <FilterChip
            active={
              discountedOnly
            }
            label="Discounted"
            icon={
              <Tag size={14} />
            }
            onClick={() =>
              setDiscountedOnly(
                !discountedOnly
              )
            }
          />
        </div>

        {hasFilters && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
            {sort !==
              "default" && (
              <ActiveFilter
                label={getSortLabel(
                  sort
                )}
              />
            )}

            {minRating >
              0 && (
              <ActiveFilter
                label={`${minRating}★ & above`}
              />
            )}

            {inStockOnly && (
              <ActiveFilter label="In Stock" />
            )}

            {discountedOnly && (
              <ActiveFilter label="Discounted" />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function SelectFilter({
  value,
  onChange,
  icon,
  ariaLabel,
  children,
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
  icon: React.ReactNode;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-w-[150px] shrink-0">
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-green-700">
        {icon}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        aria-label={
          ariaLabel
        }
        className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-8 text-[11px] font-semibold text-gray-700 outline-none transition hover:border-green-300 focus:border-green-600 focus:bg-white sm:h-11 sm:text-xs"
      >
        {children}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

function FilterChip({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{
        scale: 0.96,
      }}
      className={`flex h-10 min-w-max shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition sm:h-11 sm:text-xs ${
        active
          ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
          : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50/40"
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function ActiveFilter({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full bg-green-100 px-2.5 py-1 text-[9px] font-bold text-green-700 sm:text-[10px]">
      {label}
    </span>
  );
}

function getSortLabel(
  sort: SortValue
) {
  const labels: Record<
    SortValue,
    string
  > = {
    default:
      "Default sorting",
    "price-low":
      "Price: Low to High",
    "price-high":
      "Price: High to Low",
    rating: "Top Rated",
    discount:
      "Highest Discount",
  };

  return labels[sort];
}