"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  LayoutGrid,
} from "lucide-react";
import {
  motion,
} from "motion/react";

import { supabase } from "@/lib/supabase";
import {
  getCategories,
} from "@/services/categoryService";
import {
  useFilterStore,
} from "@/store/filterStore";

export default function CategoryTabs() {
  const queryClient =
    useQueryClient();

  const activeCategory =
    useFilterStore(
      (state) =>
        state.category
    );

  const setCategory =
    useFilterStore(
      (state) =>
        state.setCategory
    );

  const {
    data: categories = [],
  } = useQuery({
    queryKey: [
      "admin-categories",
    ],
    queryFn: getCategories,
    staleTime: 0,
    refetchOnMount:
      "always",
    refetchOnWindowFocus:
      true,
  });

  useEffect(() => {
    const channel =
      supabase
        .channel(
          "homepage-categories-realtime"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "categories",
          },
          () => {
            queryClient.refetchQueries(
              {
                queryKey: [
                  "admin-categories",
                ],
              }
            );
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [queryClient]);

  const visibleCategories =
    [...categories]
      .filter(
        (category) =>
          category.is_active
      )
      .sort(
        (first, second) =>
          first.sort_order -
          second.sort_order
      );

  return (
    <section className="mx-auto mt-5 max-w-7xl sm:mt-8">
      <div className="mb-3 flex items-center justify-between px-3 sm:px-6">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 sm:text-xl">
            Shop by category
          </h2>

          <p className="mt-0.5 text-[11px] text-gray-500 sm:text-sm">
            Find your everyday essentials faster.
          </p>
        </div>
      </div>

      <div className="hide-scrollbar flex gap-2.5 overflow-x-auto px-3 pb-2 sm:gap-3 sm:px-6">
        <CategoryButton
          active={
            activeCategory ===
            "All"
          }
          label="All"
          onClick={() =>
            setCategory("All")
          }
          icon={
            <LayoutGrid
              size={20}
            />
          }
        />

        {visibleCategories.map(
          (category) => (
            <CategoryButton
              key={category.id}
              active={
                activeCategory ===
                category.name
              }
              label={
                category.name
              }
              onClick={() =>
                setCategory(
                  category.name
                )
              }
              image={
                category.image
              }
              emoji={
                category.emoji ||
                "🛍️"
              }
            />
          )
        )}
      </div>
    </section>
  );
}

function CategoryButton({
  active,
  label,
  onClick,
  image,
  emoji,
  icon,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  image?: string | null;
  emoji?: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{
        scale: 0.96,
      }}
      className={`relative flex min-w-[78px] shrink-0 flex-col items-center rounded-2xl border px-2.5 py-2.5 text-center transition sm:min-w-[104px] sm:px-3 sm:py-3 ${
        active
          ? "border-green-500 bg-green-50 shadow-[0_8px_24px_rgba(22,163,74,0.12)]"
          : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/40"
      }`}
    >
      {active && (
        <motion.span
          layoutId="active-category-dot"
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-600"
        />
      )}

      <div
        className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl sm:h-11 sm:w-11 ${
          active
            ? "bg-white text-green-700 shadow-sm"
            : "bg-gray-50 text-gray-700"
        }`}
      >
        {image ? (
          <Image
            src={image}
            alt={label}
            width={44}
            height={44}
            className="h-full w-full object-contain p-1"
          />
        ) : icon ? (
          icon
        ) : (
          <span className="text-xl sm:text-2xl">
            {emoji}
          </span>
        )}
      </div>

      <span
        className={`mt-2 line-clamp-2 min-h-8 text-[11px] font-bold leading-4 sm:text-sm ${
          active
            ? "text-green-800"
            : "text-gray-700"
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}