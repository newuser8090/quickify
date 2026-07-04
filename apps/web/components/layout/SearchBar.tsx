"use client";

import { Search } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";

export default function SearchBar() {
  const search = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);

  return (
    <div className="relative flex-1">
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for fruits, vegetables, groceries..."
        className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 outline-none transition focus:border-green-600 focus:bg-white"
      />
    </div>
  );
}