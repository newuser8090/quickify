import { create } from "zustand";
import { Product } from "@/types/product";

type RecentStore = {
  items: Product[];

  addRecent: (product: Product) => void;
  clearRecent: () => void;
};

export const useRecentStore = create<RecentStore>((set) => ({
  items: [],

  addRecent: (product) =>
    set((state) => {
      const updated = [
        product,
        ...state.items.filter((item) => item.id !== product.id),
      ].slice(0, 8);

      return {
        items: updated,
      };
    }),

  clearRecent: () =>
    set({
      items: [],
    }),
}));