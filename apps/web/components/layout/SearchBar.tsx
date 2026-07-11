"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Flame, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

import { getAllProducts } from "@/services/productService";
import { useFilterStore } from "@/store/filterStore";

const trendingSearches = ["Milk", "Bread", "Banana", "Cold Drink", "Tomato"];

export default function SearchBar() {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const search = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);
  const recentSearches = useFilterStore((state) => state.recentSearches);
  const addRecentSearch = useFilterStore((state) => state.addRecentSearch);
  const clearRecentSearches = useFilterStore(
    (state) => state.clearRecentSearches
  );

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.unit.toLowerCase().includes(query)
      )
      .slice(0, 7);
  }, [products, search]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("click", handleClickOutside);

    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  function openProduct(productId: number, productName: string) {
    addRecentSearch(productName);
    setSearch("");
    setOpen(false);
    router.push(`/product/${productId}`);
  }

  function applySearch(value: string) {
    setSearch(value);
    addRecentSearch(value);
    setOpen(false);
  }

  function clearSearch() {
    setSearch("");
    setOpen(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) setOpen(true);

    if (e.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!search.trim()) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev >= suggestions.length - 1 ? 0 : prev + 1
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();

      const selected = suggestions[activeIndex];

      if (selected) {
        openProduct(selected.id, selected.name);
      } else if (search.trim()) {
        applySearch(search);
      }
    }
  }

  function highlight(text: string, query: string) {
    const cleanQuery = query.trim();

    if (!cleanQuery) return text;

    const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === cleanQuery.toLowerCase() ? (
            <mark key={index} className="rounded bg-yellow-200 px-1">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  }

  return (
    <div ref={boxRef} className="relative flex-1">
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        value={search}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        placeholder="Search for atta, milk, chips, cold drink..."
        className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-12 pr-10 outline-none transition focus:border-green-600 focus:bg-white"
      />

      {search && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-[110%] z-50 overflow-hidden rounded-3xl border bg-white shadow-2xl"
          >
            {search.trim() ? (
              suggestions.length > 0 ? (
                <div className="py-2">
                  <div className="px-5 py-3 text-sm font-bold text-gray-500">
                    Products matching “{search}”
                  </div>

                  {suggestions.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => openProduct(product.id, product.name)}
                      className={`flex w-full items-center gap-4 px-5 py-4 text-left transition ${
                        activeIndex === index ? "bg-green-50" : "hover:bg-green-50"
                      }`}
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-green-50">
                        {product.image ? (
                          <Image
  src={product.image}
  alt={product.name}
  width={64}
  height={64}
  className="h-full w-full object-cover"
/>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 font-semibold">
                          {highlight(product.name, search)}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span>{product.category}</span>
                          <span>•</span>
                          <span>{product.unit}</span>
                          <span>•</span>
                          <span className="font-semibold text-green-700">
                            ₹{product.price}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-5xl">🔍</div>
                  <h3 className="mt-4 font-bold">No products found</h3>
                  <p className="mt-2 text-gray-500">Try another keyword.</p>
                </div>
              )
            ) : (
              <div className="p-5">
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold">
                        <Clock size={17} />
                        Recent Searches
                      </div>

                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-sm font-semibold text-green-700"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => applySearch(item)}
                          className="rounded-full bg-gray-100 px-4 py-2 text-sm hover:bg-green-50"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3 flex items-center gap-2 font-bold">
                  <Flame size={17} className="text-orange-500" />
                  Trending Searches
                </div>

                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => applySearch(item)}
                      className="rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}