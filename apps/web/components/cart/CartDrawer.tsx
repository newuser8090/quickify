"use client";

import CartItem from "./CartItem";
import useCart from "@/hooks/useCart";
import { useUIStore } from "@/store/uiStore";

export default function CartDrawer() {
  const { items, totalPrice } = useCart();

  const cartOpen = useUIStore((state) => state.cartOpen);
  const closeCart = useUIStore((state) => state.closeCart);

  if (!cartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={closeCart} />

      <div className="fixed right-0 top-0 z-50 flex h-screen w-[420px] flex-col bg-white shadow-xl">
        <div className="border-b p-5">
          <h2 className="text-2xl font-bold">My Cart</h2>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {items.length === 0 && (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          )}

          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="border-t p-5">
          <div className="mb-4 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>

          <button className="w-full rounded-xl bg-green-600 py-4 font-semibold text-white hover:bg-green-700">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
}