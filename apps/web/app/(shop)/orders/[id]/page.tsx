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

export default function OrderDetailsPage({
  params,
}: Props) {
  const { id } = use(params);
  const orderId = Number(id);

  const queryClient = useQueryClient();

  const user = useAuthStore(
    (state) => state.user
  );

  const [showReturnForm, setShowReturnForm] =
    useState(false);

  const [returnReason, setReturnReason] =
    useState("");

  const [
    submittingReturn,
    setSubmittingReturn,
  ] = useState(false);

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
    typedOrder?.status
      ?.toLowerCase() ?? "";

  const normalizedPaymentStatus =
    typedOrder?.payment_status
      ?.toLowerCase() ?? "";

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

      await requestOrderReturn(
        orderId,
        reason
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "order",
            orderId,
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "orders",
            user?.id,
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "admin-orders",
          ],
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
      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-10">
        <Link
          href="/orders"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline sm:mb-6 sm:text-base"
        >
          <ArrowLeft size={18} />
          Back to orders
        </Link>

        {isLoading ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm sm:rounded-3xl sm:p-8 sm:text-base">
            Loading order details...
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center sm:rounded-3xl sm:p-8">
            <h2 className="text-lg font-bold text-red-700 sm:text-xl">
              Order could not be loaded
            </h2>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white sm:mt-5 sm:px-5 sm:text-base"
            >
              Try Again
            </button>
          </div>
        ) : !order || !typedOrder ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm sm:rounded-3xl sm:p-8 sm:text-base">
            Order not found.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <OrderCard order={order} />

            <section className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <RotateCcw
                      className="shrink-0 text-green-600"
                      size={21}
                    />

                    <h2 className="text-lg font-bold sm:text-xl">
                      Return and Refund
                    </h2>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Request a return for an eligible delivered and paid order.
                  </p>
                </div>

                {canRequestReturn && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowReturnForm(
                        (current) =>
                          !current
                      )
                    }
                    className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 sm:w-auto sm:px-5 sm:py-3 sm:text-base"
                  >
                    {showReturnForm
                      ? "Close Form"
                      : "Request Return"}
                  </button>
                )}
              </div>

              {canRequestReturn &&
                showReturnForm && (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:mt-6 sm:p-5">
                    <label className="block">
                      <span className="text-sm font-semibold sm:text-base">
                        Why are you returning this order?
                      </span>

                      <textarea
                        value={
                          returnReason
                        }
                        onChange={(
                          event
                        ) =>
                          setReturnReason(
                            event.target
                              .value
                          )
                        }
                        rows={4}
                        maxLength={500}
                        placeholder="Explain the issue with your order..."
                        className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-green-600 sm:px-4 sm:text-base"
                      />
                    </label>

                    <div className="mt-2 text-right text-xs text-gray-400">
                      {
                        returnReason.length
                      }
                      /500
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowReturnForm(
                            false
                          );

                          setReturnReason(
                            ""
                          );
                        }}
                        disabled={
                          submittingReturn
                        }
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:text-base"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleReturnRequest
                        }
                        disabled={
                          submittingReturn
                        }
                        className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:px-5 sm:text-base"
                      >
                        {submittingReturn
                          ? "Submitting..."
                          : "Submit Request"}
                      </button>
                    </div>
                  </div>
                )}

              <ReturnStatusPanel
                order={typedOrder}
              />

              {!canRequestReturn &&
                returnStatus ===
                  "None" &&
                refundStatus !==
                  "Refunded" && (
                  <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-600 sm:mt-5">
                    Returns become available after the order is delivered and its payment is confirmed.
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

  const refundedAmount = Number(
    order.refund_amount ?? 0
  );

  return (
    <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
      {returnStatus === "Requested" && (
        <StatusMessage
          icon={<Clock3 size={19} />}
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
          icon={
            <PackageCheck
              size={19}
            />
          }
          title="Return approved"
          message="Your return was approved. The refund is awaiting processing."
          className="bg-blue-50 text-blue-800"
        />
      )}

      {returnStatus === "Rejected" && (
        <StatusMessage
          icon={
            <XCircle size={19} />
          }
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
          icon={<Clock3 size={19} />}
          title="Refund pending"
          message="Your approved refund is waiting to be processed."
          className="bg-yellow-50 text-yellow-800"
        />
      )}

      {refundStatus ===
        "Processing" && (
        <StatusMessage
          icon={<Clock3 size={19} />}
          title="Refund processing"
          message="Your refund has been initiated and is being processed."
          className="bg-blue-50 text-blue-800"
        />
      )}

      {refundStatus === "Refunded" && (
        <StatusMessage
          icon={
            <CheckCircle2
              size={19}
            />
          }
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
          icon={
            <XCircle size={19} />
          }
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
      className={`flex items-start gap-3 rounded-2xl p-3.5 sm:p-4 ${className}`}
    >
      <div className="mt-0.5 shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold sm:text-base">
          {title}
        </p>

        <p className="mt-1 break-words text-xs leading-5 opacity-90 sm:text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}
