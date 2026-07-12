"use client";

import {
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

import useCart from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";

export default function StickyCartBar() {
  const {
    totalItems,
    totalPrice,
  } = useCart();

  const openCart = useUIStore(
    (state) => state.openCart
  );

  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className="fixed left-1/2 z-50 w-[calc(100%-20px)] max-w-xl -translate-x-1/2 md:hidden"
      style={{
        bottom:
          "max(10px, env(safe-area-inset-bottom))",
      }}
    >
      <button
        type="button"
        onClick={openCart}
        className="flex min-h-[68px] w-full items-center justify-between rounded-2xl border border-green-500 bg-green-600 px-4 py-3.5 font-bold text-white shadow-[0_14px_35px_rgba(22,163,74,0.38)] transition active:scale-[0.98]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0 rounded-xl bg-white/20 p-2.5">
            <ShoppingCart
              size={21}
            />

            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold text-green-700 shadow-sm">
              {totalItems > 99
                ? "99+"
                : totalItems}
            </span>
          </div>

          <div className="min-w-0 text-left">
            <p className="text-sm font-extrabold">
              {totalItems} item
              {totalItems === 1
                ? ""
                : "s"}{" "}
              added
            </p>

            <p className="mt-0.5 truncate text-sm font-semibold text-green-50">
              Total ₹
              {Number(
                totalPrice
              ).toLocaleString(
                "en-IN"
              )}
            </p>
          </div>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-1 rounded-xl bg-white px-3 py-2.5 text-sm font-extrabold text-green-700 shadow-sm">
          View Cart
          <ChevronRight
            size={17}
          />
        </div>
      </button>
    </div>
  );
}
