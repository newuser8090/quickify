"use client";

import { ShoppingCart } from "lucide-react";

import useCart from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";

export default function StickyCartBar() {
  const { totalItems, totalPrice } = useCart();
  const openCart = useUIStore((state) => state.openCart);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-40 w-[92%] max-w-xl -translate-x-1/2 md:hidden">
      <button
        onClick={openCart}
        className="flex w-full items-center justify-between rounded-2xl bg-green-600 px-5 py-4 font-bold text-white shadow-2xl transition hover:bg-green-700"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2">
            <ShoppingCart size={20} />
          </div>

          <div className="text-left">
            <p>{totalItems} item{totalItems > 1 ? "s" : ""}</p>
            <p className="text-sm font-medium text-green-50">₹{totalPrice}</p>
          </div>
        </div>

        <span>View Cart</span>
      </button>
    </div>
  );
}