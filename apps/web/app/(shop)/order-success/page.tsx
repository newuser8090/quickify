"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const deliveryTime = 10 + Math.floor(Math.random() * 6);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-10 text-center shadow-xl">
        <CheckCircle2 size={90} className="mx-auto text-green-600" />

        <h1 className="mt-6 text-4xl font-bold">
          Order Placed Successfully!
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          Thank you for shopping with Quickify.
        </p>

        <div className="mt-10 space-y-5 rounded-2xl bg-gray-50 p-6 text-left">
          <div className="flex items-center gap-4">
            <PackageCheck className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-bold">
                {orderId ? `#${orderId}` : "Order placed"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Clock3 className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Estimated Delivery</p>
              <p className="font-bold">{deliveryTime} minutes</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
  href={orderId ? `/orders/${orderId}` : "/orders"}
  className="flex flex-1 items-center justify-center rounded-2xl border border-green-600 py-4 font-semibold text-green-700 transition hover:bg-green-50"
>
  Track Order
</Link>

          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 font-semibold text-white transition hover:bg-green-700"
          >
            <ShoppingBag size={20} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}