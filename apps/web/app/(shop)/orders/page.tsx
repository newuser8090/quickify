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
      <CheckCircle2 size={13} />
    );
  }

  if (
    normalized ===
    "out for delivery"
  ) {
    return <Truck size={13} />;
  }

  return <Clock3 size={13} />;
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
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-4 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <Link
            href="/"
            aria-label="Back to home"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 active:scale-95 sm:right-6 sm:top-6 sm:h-10 sm:w-10"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="relative pr-12 sm:pr-16">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur sm:px-3 sm:py-1.5 sm:text-xs">
              <Sparkles size={12} />
              Order history
            </div>

            <h1 className="mt-3 text-2xl font-extrabold sm:mt-4 sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-1.5 max-w-xl text-xs leading-5 text-green-50 sm:mt-2 sm:text-base sm:leading-6">
              Track deliveries and
              view complete order
              details.
            </p>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2 sm:mt-7 sm:gap-4">
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
          <div className="mt-4 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl bg-white shadow-sm sm:h-48"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5 text-center sm:rounded-3xl sm:p-6">
            <h2 className="font-bold text-red-700">
              Orders could not
              be loaded
            </h2>

            <p className="mt-1 text-xs text-red-600 sm:text-sm">
              Please check your
              connection and try
              again.
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
          <div className="mt-4 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {orders.map((order) => {
              const items =
                (order.order_items ??
                  []) as OrderItemPreview[];

              const visibleItems =
                items.slice(0, 3);

              const additionalCount =
                Math.max(
                  0,
                  items.length -
                    visibleItems.length
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

              const firstNames =
                items
                  .slice(0, 2)
                  .map(
                    (item) =>
                      item.name
                  )
                  .join(", ");

              const createdAt =
                new Date(
                  order.created_at
                );

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition active:scale-[0.99] sm:hover:-translate-y-0.5 sm:hover:border-green-100 sm:hover:shadow-lg"
                >
                  <div className="p-3.5 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400 sm:text-[10px]">
                          Order
                        </p>

                        <h2 className="mt-0.5 text-base font-extrabold text-gray-900 sm:text-lg">
                          #{order.id}
                        </h2>

                        <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
                          {createdAt.toLocaleString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month:
                                "short",
                              hour:
                                "numeric",
                              minute:
                                "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 origin-top-right scale-[0.82] sm:scale-90">
                        <OrderStatusBadge
                          status={
                            order.status
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <ProductPreviewStack
                        items={
                          visibleItems
                        }
                        additionalCount={
                          additionalCount
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-bold text-gray-900 sm:text-sm">
                          {firstNames ||
                            "Order items"}

                          {items.length >
                          2
                            ? ` +${items.length - 2} more`
                            : ""}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                          {totalQuantity}{" "}
                          item
                          {totalQuantity ===
                          1
                            ? ""
                            : "s"}{" "}
                          in this order
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <InfoPill
                        icon={
                          <CalendarDays
                            size={12}
                          />
                        }
                        text={createdAt.toLocaleDateString(
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
                            size={12}
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

                      {order.payment_status && (
                        <InfoPill
                          text={
                            order.payment_status
                          }
                          tone={
                            order.payment_status ===
                            "Paid"
                              ? "success"
                              : "default"
                          }
                        />
                      )}
                    </div>

                    {order.delivery_slot && (
                      <div className="mt-2.5 flex min-w-0 items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1.5 text-[10px] font-semibold text-green-700 sm:text-xs">
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

                  <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-green-700 transition group-hover:bg-green-600 group-hover:text-white sm:px-4 sm:py-3 sm:text-sm">
                    <span>
                      View details
                    </span>

                    <ArrowRight
                      size={15}
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

function ProductPreviewStack({
  items,
  additionalCount,
}: {
  items: OrderItemPreview[];
  additionalCount: number;
}) {
  if (items.length === 0) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-green-50 text-green-600 shadow-sm sm:h-12 sm:w-12">
        <Package size={19} />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center pl-1">
      {items.map(
        (item, index) => {
          const image =
            getProductImage(item);

          return (
            <div
              key={item.id}
              className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-gray-50 shadow-sm sm:h-11 sm:w-11"
              style={{
                marginLeft:
                  index === 0
                    ? 0
                    : -12,
                zIndex:
                  items.length -
                  index,
              }}
            >
              {image ? (
                <Image
                  src={image}
                  alt={item.name}
                  fill
                  sizes="44px"
                  className="object-contain p-1"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-green-600">
                  <Package
                    size={16}
                  />
                </div>
              )}
            </div>
          );
        }
      )}

      {additionalCount > 0 && (
        <div className="-ml-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-green-600 text-[9px] font-extrabold text-white shadow-sm sm:h-11 sm:w-11 sm:text-[10px]">
          +{additionalCount}
        </div>
      )}
    </div>
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
    <div className="rounded-xl bg-white/15 px-2 py-2.5 text-center backdrop-blur sm:rounded-2xl sm:px-5 sm:py-4">
      <p className="text-lg font-extrabold sm:text-3xl">
        {value}
      </p>

      <p className="mt-0.5 text-[9px] font-semibold text-green-50 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function InfoPill({
  icon,
  text,
  strong = false,
  tone = "default",
}: {
  icon?: React.ReactNode;
  text: string;
  strong?: boolean;
  tone?:
    | "default"
    | "success";
}) {
  return (
    <div
      className={`inline-flex min-w-0 items-center gap-1 rounded-full px-2 py-1 ${
        tone === "success"
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {icon && (
        <span
          className={`shrink-0 ${
            tone === "success"
              ? "text-green-600"
              : "text-gray-500"
          }`}
        >
          {icon}
        </span>
      )}

      <span
        className={`truncate text-[9px] sm:text-[10px] ${
          strong
            ? "font-extrabold text-gray-900"
            : "font-semibold"
        }`}
      >
        {text}
      </span>
    </div>
  );
}