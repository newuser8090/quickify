"use client";



import { ShoppingCart } from "lucide-react";



import useCart from "@/hooks/useCart";

import { useUIStore } from "@/store/uiStore";



export default function StickyCartBar() {

  const { totalItems, totalPrice } = useCart();



  const openCart = useUIStore(

    (state) => state.openCart

  );



  if (totalItems === 0) return null;



  return (

    <div

      className="fixed left-1/2 z-40 w-[calc(100%-24px)] max-w-xl -translate-x-1/2 md:hidden"

      style={{

        bottom:

          "max(12px, env(safe-area-inset-bottom))",

      }}

    >

      <button

        type="button"

        onClick={openCart}

        className="flex w-full items-center justify-between rounded-2xl bg-green-600 px-4 py-3.5 font-bold text-white shadow-2xl transition active:scale-[0.98]"

      >

        <div className="flex min-w-0 items-center gap-3">

          <div className="shrink-0 rounded-xl bg-white/20 p-2">

            <ShoppingCart size={19} />

          </div>



          <div className="min-w-0 text-left">

            <p className="text-sm">

              {totalItems} item

              {totalItems === 1 ? "" : "s"}

            </p>



            <p className="truncate text-xs font-medium text-green-50">

              ₹

              {Number(totalPrice).toLocaleString(

                "en-IN"

              )}

            </p>

          </div>

        </div>



        <span className="shrink-0 text-sm">

          View Cart

        </span>

      </button>

    </div>

  );

}