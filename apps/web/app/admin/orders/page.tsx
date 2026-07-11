"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  IndianRupee,
  ShoppingBag,
  User,
} from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import { TableSkeleton } from "@/components/common/Skeleton";
import { supabase } from "@/lib/supabase";
import {
  getAllOrders,
  updateOrderPaymentStatus,
} from "@/services/adminOrderService";

type AdminOrderItem = {
  id: number;
  quantity: number;
};

type AdminOrder = {
  id: number;
  created_at: string;
  total: number;
  payment_method: string;
  payment_status: string | null;
  status: string;
  delivery_slot?: string | null;
  order_items?: AdminOrderItem[];
  addresses?: {
    full_name: string;
    phone: string;
    city: string;
  } | null;
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ${
        status === "Delivered"
          ? "bg-green-100 text-green-700"
          : status === "Cancelled"
            ? "bg-red-100 text-red-700"
            : status === "Out for Delivery"
              ? "bg-blue-100 text-blue-700"
              : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({
  status,
}: {
  status: string | null;
}) {
  const normalizedStatus = status?.toLowerCase();

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ${
        normalizedStatus === "paid"
          ? "bg-green-100 text-green-700"
          : normalizedStatus === "failed"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status ?? "Pending"}
    </span>
  );
}

function isCashOnDelivery(paymentMethod: string) {
  const normalizedPaymentMethod =
    paymentMethod.toLowerCase();

  return (
    normalizedPaymentMethod === "cod" ||
    normalizedPaymentMethod === "cash on delivery"
  );
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const [updatingPaymentId, setUpdatingPaymentId] =
    useState<number | null>(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAllOrders,
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["admin-orders"],
          });

          queryClient.invalidateQueries({
            queryKey: ["admin-dashboard-stats"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  async function handleConfirmCodPayment(orderId: number) {
    try {
      setUpdatingPaymentId(orderId);

      await updateOrderPaymentStatus(orderId, "Paid");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-orders"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-dashboard-stats"],
        }),
      ]);

      toast.success("COD payment marked as received.");
    } catch (error) {
      console.error(
        "Failed to confirm COD payment:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the payment status."
      );
    } finally {
      setUpdatingPaymentId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>

        <p className="mt-2 text-gray-500">
          View customer orders, manage delivery, and confirm COD
          payments.
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
          <h2 className="text-xl font-bold text-red-700">
            Orders could not be loaded
          </h2>

          <p className="mt-2 text-sm text-red-600">
            Please check your connection and try again.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold">
            No orders yet
          </h2>

          <p className="mt-2 text-gray-500">
            Customer orders will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {(orders as AdminOrder[]).map((order) => {
            const itemCount =
              order.order_items?.reduce(
                (sum, item) => sum + item.quantity,
                0
              ) ?? 0;

            const codOrder = isCashOnDelivery(
              order.payment_method
            );

            const paymentReceived =
              order.payment_status?.toLowerCase() === "paid";

            const delivered =
              order.status.toLowerCase() === "delivered";

            const cancelled =
              order.status.toLowerCase() === "cancelled";

            const canConfirmCodPayment =
              codOrder &&
              delivered &&
              !cancelled &&
              !paymentReceived;

            const isUpdatingPayment =
              updatingPaymentId === order.id;

            return (
              <article
                key={order.id}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <h2 className="mt-1 text-2xl font-extrabold">
                      #{order.id}
                    </h2>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <User
                      size={18}
                      className="text-green-600"
                    />

                    <span className="font-semibold text-gray-900">
                      {order.addresses?.full_name ??
                        "Customer"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <CalendarClock
                      size={18}
                      className="text-green-600"
                    />

                    <span>
                      {new Date(
                        order.created_at
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <ShoppingBag
                      size={18}
                      className="text-green-600"
                    />

                    <span>
                      {itemCount} item
                      {itemCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <IndianRupee
                      size={18}
                      className="text-green-600"
                    />

                    <span className="text-lg font-bold text-gray-900">
                      ₹
                      {Number(order.total).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex h-7 items-center rounded-full bg-blue-50 px-3 text-xs font-bold text-blue-700">
                    {order.payment_method}
                  </span>

                  <PaymentBadge
                    status={order.payment_status}
                  />

                  {order.delivery_slot && (
                    <span className="inline-flex h-7 items-center rounded-full bg-green-50 px-3 text-xs font-bold text-green-700">
                      {order.delivery_slot}
                    </span>
                  )}
                </div>

                {codOrder &&
                  !paymentReceived &&
                  !delivered &&
                  !cancelled && (
                    <p className="mt-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-700">
                      COD payment can be confirmed after the order
                      is delivered.
                    </p>
                  )}

                {codOrder && paymentReceived && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                    <CheckCircle2 size={18} />
                    COD payment received
                  </div>
                )}

                <div
                  className={`mt-6 grid gap-3 ${
                    canConfirmCodPayment
                      ? "sm:grid-cols-2"
                      : ""
                  }`}
                >
                  {canConfirmCodPayment && (
                    <button
                      type="button"
                      onClick={() =>
                        handleConfirmCodPayment(order.id)
                      }
                      disabled={isUpdatingPayment}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <CheckCircle2 size={18} />

                      {isUpdatingPayment
                        ? "Confirming..."
                        : "Mark Payment Received"}
                    </button>
                  )}

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="group flex items-center justify-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 font-bold text-green-700 transition hover:bg-green-600 hover:text-white"
                  >
                    View Order Details

                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
