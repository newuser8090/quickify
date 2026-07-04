"use client";

import { ShoppingCart } from "lucide-react";
import useCart from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";

export default function CartButton() {
  const { totalItems } = useCart();

  const toggleCart = useUIStore((state) => state.toggleCart);

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
    >
      <ShoppingCart size={20} />

      Cart

      {totalItems > 0 && (
        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {totalItems}
        </span>
      )}
    </button>
  );
}