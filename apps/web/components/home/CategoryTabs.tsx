"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { getCategories } from "@/services/categoryService";
import { useFilterStore } from "@/store/filterStore";

export default function CategoryTabs() {
  const queryClient = useQueryClient();

  const activeCategory = useFilterStore((state) => state.category);
  const setCategory = useFilterStore((state) => state.setCategory);

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategories,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const channel = supabase
      .channel("homepage-categories-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
        },
        () => {
          queryClient.refetchQueries({ queryKey: ["admin-categories"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const visibleCategories = [...categories]
    .filter((category) => category.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="mx-auto mt-10 max-w-7xl px-6">
      <div className="flex gap-4 overflow-x-auto pb-2">
        <button
          onClick={() => setCategory("All")}
          className={`min-w-[120px] rounded-2xl border p-4 transition ${
            activeCategory === "All"
              ? "border-green-600 bg-green-50"
              : "border-gray-200 bg-white hover:border-green-500"
          }`}
        >
          <div className="text-3xl">🛒</div>
          <div className="mt-2 font-semibold">All</div>
        </button>

        {visibleCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setCategory(category.name)}
            className={`min-w-[120px] rounded-2xl border p-4 transition ${
              activeCategory === category.name
                ? "border-green-600 bg-green-50"
                : "border-gray-200 bg-white hover:border-green-500"
            }`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-green-50 text-3xl">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              ) : (
                category.emoji || "🛍️"
              )}
            </div>

            <div className="mt-2 font-semibold">{category.name}</div>
          </button>
        ))}
      </div>
    </section>
  );
}