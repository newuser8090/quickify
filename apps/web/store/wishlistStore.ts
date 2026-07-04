import { create } from "zustand";
import { Product } from "@/types/product";

type WishlistStore = {
  items: Product[];

  add: (product: Product) => void;

  remove: (id: number) => void;

  isWishlisted: (id: number) => boolean;

  toggle: (product: Product) => void;
};

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],

  add: (product) =>
    set((state) => ({
      items: [...state.items, product],
    })),

  remove: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  isWishlisted: (id) =>
    get().items.some((item) => item.id === id),

  toggle: (product) => {
    const exists = get().isWishlisted(product.id);

    if (exists) {
      get().remove(product.id);
    } else {
      get().add(product);
    }
  },
}));