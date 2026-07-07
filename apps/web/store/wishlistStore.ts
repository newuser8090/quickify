import { create } from "zustand";

import { Product } from "@/types/product";
import { useAuthStore } from "@/store/authStore";
import {
  addWishlistItem,
  deleteWishlistItem,
} from "@/services/wishlistService";

type WishlistStore = {
  items: Product[];

  setItems: (items: Product[]) => void;

  add: (product: Product) => void;

  remove: (id: number) => void;

  isWishlisted: (id: number) => boolean;

  toggle: (product: Product) => void;
};

function getUserId() {
  return useAuthStore.getState().user?.id;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],

  setItems: (items) =>
    set({
      items,
    }),

  add: (product) => {
    const exists = get().isWishlisted(product.id);

    if (exists) return;

    set((state) => ({
      items: [...state.items, product],
    }));

    const userId = getUserId();

    if (userId) {
      addWishlistItem(userId, product.id);
    }
  },

  remove: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));

    const userId = getUserId();

    if (userId) {
      deleteWishlistItem(userId, id);
    }
  },

  isWishlisted: (id) =>
    get().items.some((item) => item.id === id),

  toggle: (product) => {
    if (get().isWishlisted(product.id)) {
      get().remove(product.id);
    } else {
      get().add(product);
    }
  },
}));