import { create } from "zustand";

type FilterStore = {
  category: string;
  search: string;

  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
  reset: () => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
  category: "All",
  search: "",

  setCategory: (category) =>
    set({
      category,
    }),

  setSearch: (search) =>
    set({
      search,
    }),

  reset: () =>
    set({
      category: "All",
      search: "",
    }),
}));