"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  PackageCheck,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import OrderCard from "@/components/orders/OrderCard";
import useRealtimeOrders from "@/hooks/useRealtimeOrders";
import {
  getOrder,
  requestOrderReturn,
} from "@/services/orderService";
import { useAuthStore } from "@/store/authStore";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type CustomerOrder = {
  id: number;
  total: number | null;
  status: string;
  payment_status: string | null;
  return_status?: string | null;
  return_reason?: string | null;
  return_requested_at?: string | null;
  return_reviewed_at?: string | null;
  return_review_note?: string | null;
  refund_status?: string | null;
  refund_amount?: number | null;
  refund_method?: string | null;
  refunded_at?: string | null;
};

export default function OrderDetailsPage({ params }: Props) {
  const { id } = use(params);
  const orderId = Number(id);

  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [showReturnForm, setShowReturnForm] =
    useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] =
    useState(false);

  useRealtimeOrders(user?.id);

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    enabled:
      Number.isFinite(orderId) &&
      Boolean(user?.id),
  });

  const typedOrder =
    order as CustomerOrder | undefined;

  const normalizedOrderStatus =
    typedOrder?.status?.toLowerCase() ?? "";

  const normalizedPaymentStatus =
    typedOrder?.payment_status?.toLowerCase() ?? "";

  const returnStatus =
    typedOrder?.return_status ?? "None";

  const refundStatus =
    typedOrder?.refund_status ?? "None";

  const canRequestReturn =
    normalizedOrderStatus === "delivered" &&
    normalizedPaymentStatus === "paid" &&
    returnStatus === "None" &&
    refundStatus !== "Refunded";

  async function handleReturnRequest() {
    const reason = returnReason.trim();

    if (reason.length < 5) {
      toast.error(
        "Please enter a return reason of at least 5 characters."
      );
      return;
    }

    try {
      setSubmittingReturn(true);

      await requestOrderReturn(orderId, reason);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["order", orderId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["orders", user?.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-orders"],
        }),
      ]);

      toast.success(
        "Your return request has been submitted."
      );

      setReturnReason("");
      setShowReturnForm(false);
    } catch (error) {
      console.error(
        "Return request failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "The return request could not be submitted."
      );
    } finally {
      setSubmittingReturn(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/orders"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to orders
        </Link>

        {isLoading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading order details...
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
            <h2 className="text-xl font-bold text-red-700">
              Order could not be loaded
            </h2>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : !order || !typedOrder ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Order not found.
          </div>
        ) : (
          <div className="space-y-6">
            <OrderCard order={order} />

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="text-green-600" />

                    <h2 className="text-xl font-bold">
                      Return and Refund
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Request a return for an eligible
                    delivered and paid order.
                  </p>
                </div>

                {canRequestReturn && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowReturnForm((current) => !current)
                    }
                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                  >
                    Request Return
                  </button>
                )}
              </div>

              {canRequestReturn && showReturnForm && (
                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <label className="block">
                    <span className="font-semibold">
                      Why are you returning this order?
                    </span>

                    <textarea
                      value={returnReason}
                      onChange={(event) =>
                        setReturnReason(
                          event.target.value
                        )
                      }
                      rows={4}
                      maxLength={500}
                      placeholder="Explain the issue with your order..."
                      className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-green-600"
                    />
                  </label>

                  <div className="mt-2 text-right text-xs text-gray-400">
                    {returnReason.length}/500
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReturnForm(false);
                        setReturnReason("");
                      }}
                      disabled={submittingReturn}
                      className="rounded-xl border border-gray-200 px-5 py-2.5 font-semibold transition hover:bg-white"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleReturnRequest}
                      disabled={submittingReturn}
                      className="rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {submittingReturn
                        ? "Submitting..."
                        : "Submit Return Request"}
                    </button>
                  </div>
                </div>
              )}

              <ReturnStatusPanel order={typedOrder} />

              {!canRequestReturn &&
                returnStatus === "None" &&
                refundStatus !== "Refunded" && (
                  <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                    Returns become available after the
                    order is delivered and its payment is
                    confirmed.
                  </div>
                )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function ReturnStatusPanel({
  order,
}: {
  order: CustomerOrder;
}) {
  const returnStatus =
    order.return_status ?? "None";

  const refundStatus =
    order.refund_status ?? "None";

  if (
    returnStatus === "None" &&
    refundStatus === "None"
  ) {
    return null;
  }

  const refundedAmount =
    Number(order.refund_amount ?? 0);

  return (
    <div className="mt-6 space-y-4">
      {returnStatus === "Requested" && (
        <StatusMessage
          icon={<Clock3 size={20} />}
          title="Return request under review"
          message={
            order.return_reason
              ? `Reason: ${order.return_reason}`
              : "The admin team is reviewing your request."
          }
          className="bg-yellow-50 text-yellow-800"
        />
      )}

      {returnStatus === "Approved" && (
        <StatusMessage
          icon={<PackageCheck size={20} />}
          title="Return approved"
          message="Your return was approved. The refund is awaiting processing."
          className="bg-blue-50 text-blue-800"
        />
      )}

      {returnStatus === "Rejected" && (
        <StatusMessage
          icon={<XCircle size={20} />}
          title="Return request rejected"
          message={
            order.return_review_note ||
            "The return request was not approved."
          }
          className="bg-red-50 text-red-800"
        />
      )}

      {refundStatus === "Pending" && (
        <StatusMessage
          icon={<Clock3 size={20} />}
          title="Refund pending"
          message="Your approved refund is waiting to be processed."
          className="bg-yellow-50 text-yellow-800"
        />
      )}

      {refundStatus === "Processing" && (
        <StatusMessage
          icon={<Clock3 size={20} />}
          title="Refund processing"
          message="Your refund has been initiated and is being processed."
          className="bg-blue-50 text-blue-800"
        />
      )}

      {refundStatus === "Refunded" && (
        <StatusMessage
          icon={<CheckCircle2 size={20} />}
          title="Refund completed"
          message={`₹${refundedAmount.toLocaleString(
            "en-IN"
          )} has been refunded${
            order.refund_method
              ? ` through ${order.refund_method}`
              : ""
          }.`}
          className="bg-green-50 text-green-800"
        />
      )}

      {refundStatus === "Failed" && (
        <StatusMessage
          icon={<XCircle size={20} />}
          title="Refund failed"
          message="The refund could not be completed. The admin team will review it."
          className="bg-red-50 text-red-800"
        />
      )}
    </div>
  );
}

function StatusMessage({
  icon,
  title,
  message,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  className: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl p-4 ${className}`}
    >
      <div className="mt-0.5 shrink-0">
        {icon}
      </div>

      <div>
        <p className="font-bold">{title}</p>

        <p className="mt-1 text-sm opacity-90">
          {message}
        </p>
      </div>
    </div>
  );
}