"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import useRealtimeOrders from "@/hooks/useRealtimeOrders";
import { getOrders } from "@/services/orderService";
import { useAuthStore } from "@/store/authStore";

type OrderItemPreview = {
  id: number;
  name: string;
  quantity?: number | null;
  product?:
    | {
        image?: string | null;
      }
    | {
        image?: string | null;
      }[]
    | null;
};

function getProductImage(
  item?: OrderItemPreview
) {
  if (!item?.product) {
    return null;
  }

  const product = Array.isArray(
    item.product
  )
    ? item.product[0]
    : item.product;

  return product?.image ?? null;
}

function getStatusIcon(
  status: string
) {
  const normalized =
    status.toLowerCase();

  if (
    normalized === "delivered"
  ) {
    return (
      <CheckCircle2 size={16} />
    );
  }

  if (
    normalized ===
    "out for delivery"
  ) {
    return <Truck size={16} />;
  }

  return <Clock3 size={16} />;
}

export default function OrdersPage() {
  const user = useAuthStore(
    (state) => state.user
  );

  useRealtimeOrders(user?.id);

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "orders",
      user?.id,
    ],
    queryFn: () =>
      getOrders(user!.id),
    enabled: Boolean(user?.id),
  });

  const stats = useMemo(() => {
    const delivered =
      orders.filter(
        (order) =>
          order.status
            ?.toLowerCase() ===
          "delivered"
      ).length;

    const active =
      orders.filter((order) => {
        const status =
          order.status?.toLowerCase();

        return (
          status !== "delivered" &&
          status !== "cancelled"
        );
      }).length;

    return {
      total: orders.length,
      active,
      delivered,
    };
  }, [orders]);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-5 text-white shadow-lg sm:p-8">
          <Link
            href="/"
            aria-label="Back to home"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 active:scale-95 sm:right-6 sm:top-6"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="pr-14 sm:pr-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
              <Sparkles size={14} />
              Order history
            </div>

            <h1 className="mt-4 text-2xl font-extrabold sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
              Track deliveries, view invoices and quickly reorder your favourites.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-7 sm:gap-4">
            <OrderStat
              label="Total"
              value={stats.total}
            />

            <OrderStat
              label="Active"
              value={stats.active}
            />

            <OrderStat
              label="Delivered"
              value={stats.delivered}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-5 space-y-3 sm:grid sm:grid-cols-2 sm:gap-5 sm:space-y-0 xl:grid-cols-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-3xl bg-white shadow-sm"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-5 rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
            <h2 className="font-bold text-red-700">
              Orders could not be loaded
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={() =>
                refetch()
              }
              className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={
                <ShoppingBag
                  size={42}
                />
              }
              title="No orders yet"
              description="Your purchases will appear here once you place your first order."
              actionLabel="Start Shopping"
              actionHref="/"
            />
          </div>
        ) : (
          <div className="mt-5 space-y-3 sm:mt-8 sm:grid sm:grid-cols-2 sm:gap-5 sm:space-y-0 xl:grid-cols-3">
            {orders.map((order) => {
              const items =
                (order.order_items ??
                  []) as OrderItemPreview[];

              const firstItem =
                items[0];

              const firstImage =
                getProductImage(
                  firstItem
                );

              const totalQuantity =
                items.reduce(
                  (sum, item) =>
                    sum +
                    Number(
                      item.quantity ??
                        1
                    ),
                  0
                );

              const names = items
                .slice(0, 2)
                .map(
                  (item) =>
                    item.name
                )
                .join(", ");

              const additionalCount =
                Math.max(
                  0,
                  items.length - 2
                );

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition active:scale-[0.99] sm:hover:-translate-y-1 sm:hover:shadow-lg"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                          Order
                        </p>

                        <h2 className="mt-0.5 text-lg font-extrabold text-gray-900">
                          #{order.id}
                        </h2>
                      </div>

                      <div className="origin-top-right scale-90 sm:scale-100">
                        <OrderStatusBadge
                          status={
                            order.status
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                        {firstImage ? (
                          <Image
                            src={
                              firstImage
                            }
                            alt={
                              firstItem?.name ??
                              "Order item"
                            }
                            fill
                            sizes="64px"
                            className="object-contain p-1.5"
                          />
                        ) : (
                          <Package
                            size={26}
                            className="text-green-600"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold leading-5 text-gray-900">
                          {names ||
                            "Order items"}

                          {additionalCount >
                          0
                            ? ` +${additionalCount} more`
                            : ""}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            totalQuantity
                          }{" "}
                          item
                          {totalQuantity ===
                          1
                            ? ""
                            : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <InfoPill
                        icon={
                          <CalendarDays
                            size={15}
                          />
                        }
                        text={new Date(
                          order.created_at
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month:
                              "short",
                          }
                        )}
                      />

                      <InfoPill
                        icon={
                          <IndianRupee
                            size={15}
                          />
                        }
                        text={Number(
                          order.total ??
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                        strong
                      />
                    </div>

                    {order.delivery_slot && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                        {getStatusIcon(
                          order.status
                        )}

                        <span className="truncate">
                          {
                            order.delivery_slot
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold text-green-700 transition group-hover:bg-green-600 group-hover:text-white sm:px-5">
                    <span>
                      View order details
                    </span>

                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function OrderStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-3 text-center backdrop-blur sm:px-5 sm:py-4">
      <p className="text-xl font-extrabold sm:text-3xl">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-semibold text-green-50 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function InfoPill({
  icon,
  text,
  strong = false,
}: {
  icon: React.ReactNode;
  text: string;
  strong?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 text-gray-600">
      <span className="shrink-0 text-green-600">
        {icon}
      </span>

      <span
        className={`truncate text-xs ${
          strong
            ? "font-bold text-gray-900"
            : "font-medium"
        }`}
      >
        {text}
      </span>
    </div>
  );
}
