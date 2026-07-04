"use client";

import { categories } from "@/constants/categories";
import { useFilterStore } from "@/store/filterStore";

export default function CategoryTabs() {
  const activeCategory = useFilterStore((state) => state.category);
  const setCategory = useFilterStore((state) => state.setCategory);

  return (
    <section className="mx-auto mt-10 max-w-7xl px-6">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setCategory(category.name)}
            className={`min-w-[120px] rounded-2xl border p-4 transition ${
              activeCategory === category.name
                ? "border-green-600 bg-green-50"
                : "border-gray-200 bg-white hover:border-green-500"
            }`}
          >
            <div className="text-3xl">{category.icon}</div>

            <div className="mt-2 font-semibold">
              {category.name}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}