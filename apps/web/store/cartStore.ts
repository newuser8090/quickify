import { create } from "zustand";
import { Product } from "@/types/product";

export type CartItem = Product & {
  quantity: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (product: Product) => void;
  removeItem: (id: number) => void;

  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;

  clearCart: () => void;

  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            ...product,
            quantity: 1,
          },
        ],
      };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  increaseQuantity: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      ),
    })),

  decreaseQuantity: (id) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),

  clearCart: () =>
    set({
      items: [],
    }),

  totalItems: () =>
    get().items.reduce(
      (total, item) => total + item.quantity,
      0
    ),

  totalPrice: () =>
    get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ),
}));