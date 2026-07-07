import { create } from "zustand";
import { Product } from "@/types/product";

type QuickViewStore = {
  product: Product | null;
  open: (product: Product) => void;
  close: () => void;
};

export const useQuickViewStore = create<QuickViewStore>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));