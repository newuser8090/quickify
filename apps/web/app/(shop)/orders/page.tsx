"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderCard from "@/components/orders/OrderCard";

import { useAuthStore } from "@/store/authStore";
import { getOrders } from "@/services/orderService";
import useRealtimeOrders from "@/hooks/useRealtimeOrders";

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user);

  useRealtimeOrders(user?.id);

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => getOrders(user!.id),
    enabled: !!user,
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to shopping
        </Link>

        <h1 className="text-4xl font-bold">My Orders</h1>

        <p className="mt-2 text-gray-500">
          Track all your previous purchases.
        </p>

        {loading ? (
          <div className="mt-10 text-center">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="mt-12 rounded-3xl border bg-white p-12 text-center">
            <h2 className="text-2xl font-bold">No orders yet</h2>

            <p className="mt-2 text-gray-500">
              Start shopping to see your orders here.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}