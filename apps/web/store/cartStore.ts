import { create } from "zustand";

import { Product } from "@/types/product";
import { useAuthStore } from "@/store/authStore";
import {
  clearUserCart,
  deleteCartItem,
  deleteSavedCartItem,
  upsertCartItem,
  upsertSavedCartItem,
} from "@/services/cartService";

export type CartItem = Product & {
  quantity: number;
  variantId?: number | null;
  variantName?: string | null;
  cartKey: string;
};

type ProductVariantInput = {
  id: number;
  name: string;
  unit: string;
  price: number;
  mrp: number;
  stock: number;
};

type CartStore = {
  items: CartItem[];
  savedItems: CartItem[];

  setItems: (items: CartItem[]) => void;
  setSavedItems: (items: CartItem[]) => void;

  addItem: (product: Product, variant?: ProductVariantInput | null) => boolean;
  removeItem: (cartKey: string) => void;
  increaseQuantity: (cartKey: string) => boolean;
  decreaseQuantity: (cartKey: string) => void;
  clearCart: () => void;

  saveForLater: (cartKey: string) => void;
  moveToCart: (cartKey: string) => boolean;
  removeSavedItem: (cartKey: string) => void;

  totalItems: () => number;
  totalPrice: () => number;
};

function getUserId() {
  return useAuthStore.getState().user?.id;
}

function createCartKey(productId: number, variantId?: number | null) {
  return `${productId}-${variantId ?? "base"}`;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  savedItems: [],

  setItems: (items) => set({ items }),
  setSavedItems: (savedItems) => set({ savedItems }),

  addItem: (product, variant) => {
    const cartKey = createCartKey(product.id, variant?.id);
    const stock = variant?.stock ?? product.stock;

    if (stock <= 0) return false;

    let quantity = 1;
    let allowed = true;

    set((state) => {
      const existing = state.items.find((item) => item.cartKey === cartKey);

      if (existing) {
        if (existing.quantity >= existing.stock) {
          allowed = false;
          quantity = existing.quantity;
          return state;
        }

        quantity = existing.quantity + 1;

        return {
          items: state.items.map((item) =>
            item.cartKey === cartKey ? { ...item, quantity } : item
          ),
          savedItems: state.savedItems.filter(
            (item) => item.cartKey !== cartKey
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            ...product,
            unit: variant?.unit ?? product.unit,
            price: variant?.price ?? product.price,
            mrp: variant?.mrp ?? product.mrp,
            stock,
            variantId: variant?.id ?? null,
            variantName: variant?.name ?? null,
            quantity: 1,
            cartKey,
          },
        ],
        savedItems: state.savedItems.filter((item) => item.cartKey !== cartKey),
      };
    });

    if (!allowed) return false;

    const userId = getUserId();

    if (userId) {
      upsertCartItem(userId, product.id, quantity, variant?.id ?? null);
      deleteSavedCartItem(userId, product.id, variant?.id ?? null);
    }

    return true;
  },

  removeItem: (cartKey) => {
    const item = get().items.find((i) => i.cartKey === cartKey);
    if (!item) return;

    set((state) => ({
      items: state.items.filter((i) => i.cartKey !== cartKey),
    }));

    const userId = getUserId();

    if (userId) {
      deleteCartItem(userId, item.id, item.variantId);
    }
  },

  increaseQuantity: (cartKey) => {
    const item = get().items.find((i) => i.cartKey === cartKey);
    if (!item) return false;

    if (item.quantity >= item.stock) return false;

    const quantity = item.quantity + 1;

    set((state) => ({
      items: state.items.map((i) =>
        i.cartKey === cartKey ? { ...i, quantity } : i
      ),
    }));

    const userId = getUserId();

    if (userId) {
      upsertCartItem(userId, item.id, quantity, item.variantId);
    }

    return true;
  },

  decreaseQuantity: (cartKey) => {
    const item = get().items.find((i) => i.cartKey === cartKey);
    if (!item) return;

    const quantity = item.quantity - 1;

    set((state) => ({
      items: state.items
        .map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0),
    }));

    const userId = getUserId();

    if (!userId) return;

    if (quantity <= 0) {
      deleteCartItem(userId, item.id, item.variantId);
    } else {
      upsertCartItem(userId, item.id, quantity, item.variantId);
    }
  },

  clearCart: () => {
    set({ items: [] });

    const userId = getUserId();

    if (userId) {
      clearUserCart(userId);
    }
  },

  saveForLater: (cartKey) => {
    const item = get().items.find((i) => i.cartKey === cartKey);
    if (!item) return;

    set((state) => ({
      items: state.items.filter((i) => i.cartKey !== cartKey),
      savedItems: state.savedItems.some((i) => i.cartKey === cartKey)
        ? state.savedItems
        : [...state.savedItems, item],
    }));

    const userId = getUserId();

    if (userId) {
      deleteCartItem(userId, item.id, item.variantId);
      upsertSavedCartItem(userId, item.id, item.quantity, item.variantId);
    }
  },

  moveToCart: (cartKey) => {
    const item = get().savedItems.find((i) => i.cartKey === cartKey);
    if (!item) return false;

    if (item.stock <= 0) return false;

    set((state) => ({
      savedItems: state.savedItems.filter((i) => i.cartKey !== cartKey),
      items: state.items.some((i) => i.cartKey === cartKey)
        ? state.items
        : [...state.items, item],
    }));

    const userId = getUserId();

    if (userId) {
      upsertCartItem(userId, item.id, item.quantity, item.variantId);
      deleteSavedCartItem(userId, item.id, item.variantId);
    }

    return true;
  },

  removeSavedItem: (cartKey) => {
    const item = get().savedItems.find((i) => i.cartKey === cartKey);

    set((state) => ({
      savedItems: state.savedItems.filter((i) => i.cartKey !== cartKey),
    }));

    const userId = getUserId();

    if (userId && item) {
      deleteSavedCartItem(userId, item.id, item.variantId);
    }
  },

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));