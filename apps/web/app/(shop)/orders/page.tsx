"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  IndianRupee,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

import { useAuthStore } from "@/store/authStore";
import { getOrders } from "@/services/orderService";
import useRealtimeOrders from "@/hooks/useRealtimeOrders";

type OrderItemPreview = {
  id: number;
  name: string;
  product?: {
    image?: string | null;
  } | { image?: string | null }[] | null;
};

function getProductImage(item?: OrderItemPreview) {
  if (!item?.product) return null;

  const product = Array.isArray(item.product) ? item.product[0] : item.product;

  return product?.image ?? null;
}

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
        <PageHeader
          title="My Orders"
          description="View your orders and open details when needed."
        />

        {loading ? (
          <div className="mt-10 rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<ShoppingBag size={44} />}
              title="No orders yet"
              description="Start shopping to see your orders here."
              actionLabel="Start Shopping"
              actionHref="/"
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => {
              const items = (order.order_items ?? []) as OrderItemPreview[];
              const firstItem = items[0];
              const firstImage = getProductImage(firstItem);

              const itemNames = items.map((item) => item.name);
              const itemSummary =
                itemNames.length > 2
                  ? `${itemNames.slice(0, 2).join(", ")} +${
                      itemNames.length - 2
                    } more`
                  : itemNames.join(", ");

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <h2 className="mt-1 text-2xl font-extrabold">
                          #{order.id}
                        </h2>
                      </div>

                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="mt-5 flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-green-100 text-green-700">
                        {firstImage ? (
                          <Image
                            src={firstImage}
                            alt={firstItem?.name ?? "Order item"}
                            width={64}
                            height={64}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <Package size={28} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="line-clamp-1 font-bold text-gray-900">
                          {itemSummary || "Order items"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {items.length} item{items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-3 text-gray-600">
                        <CalendarClock size={18} className="text-green-600" />
                        <span className="text-sm font-medium">
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <IndianRupee size={18} className="text-green-600" />
                        <span className="text-lg font-bold text-gray-900">
                          ₹{order.total}
                        </span>
                      </div>

                      {order.delivery_slot && (
                        <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                          {order.delivery_slot}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 border-t bg-gray-50 px-6 py-4 font-bold text-green-700 transition group-hover:bg-green-600 group-hover:text-white">
                    View Order Details
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}