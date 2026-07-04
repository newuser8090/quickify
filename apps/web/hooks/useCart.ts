"use client";

import { useCartStore } from "@/store/cartStore";

export default function useCart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const increase = useCartStore((state) => state.increaseQuantity);
  const decrease = useCartStore((state) => state.decreaseQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalItems = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice());

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    increase,
    decrease,
    clearCart,
  };
}