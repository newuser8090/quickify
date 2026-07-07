import { create } from "zustand";

export type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "rating"
  | "discount";

type FilterStore = {
  category: string;
  search: string;
  recentSearches: string[];

  sort: SortOption;
  inStockOnly: boolean;
  discountedOnly: boolean;
  minRating: number;

  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;

  setSort: (sort: SortOption) => void;
  setInStockOnly: (value: boolean) => void;
  setDiscountedOnly: (value: boolean) => void;
  setMinRating: (value: number) => void;
  resetAdvancedFilters: () => void;

  reset: () => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
  category: "All",
  search: "",
  recentSearches: [],

  sort: "default",
  inStockOnly: false,
  discountedOnly: false,
  minRating: 0,

  setCategory: (category) => set({ category }),

  setSearch: (search) => set({ search }),

  addRecentSearch: (search) =>
    set((state) => {
      const value = search.trim();
      if (!value) return state;

      const recent = [
        value,
        ...state.recentSearches.filter(
          (item) => item.toLowerCase() !== value.toLowerCase()
        ),
      ].slice(0, 5);

      return { recentSearches: recent };
    }),

  clearRecentSearches: () => set({ recentSearches: [] }),

  setSort: (sort) => set({ sort }),
  setInStockOnly: (value) => set({ inStockOnly: value }),
  setDiscountedOnly: (value) => set({ discountedOnly: value }),
  setMinRating: (value) => set({ minRating: value }),

  resetAdvancedFilters: () =>
    set({
      sort: "default",
      inStockOnly: false,
      discountedOnly: false,
      minRating: 0,
    }),

  reset: () =>
    set({
      category: "All",
      search: "",
      sort: "default",
      inStockOnly: false,
      discountedOnly: false,
      minRating: 0,
    }),
}));