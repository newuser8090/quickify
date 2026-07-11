"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import { TableSkeleton } from "@/components/common/Skeleton";
import { supabase } from "@/lib/supabase";
import {
  completeCodRefund,
  processRazorpayRefund,
  reviewOrderReturn,
} from "@/services/adminOrderService";
import {
  type AdminReturnOrder,
  getAdminReturns,
} from "@/services/adminReturnService";

type ReturnFilter =
  | "all"
  | "requested"
  | "approved"
  | "processing"
  | "refunded"
  | "rejected";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function getItemCount(order: AdminReturnOrder) {
  return (order.order_items ?? []).reduce(
    (sum, item) => sum + Number(item.quantity ?? 0),
    0
  );
}

function isCancelledOrder(order: AdminReturnOrder) {
  return order.status?.toLowerCase() === "cancelled";
}

function isCancellationRefund(order: AdminReturnOrder) {
  return (
    isCancelledOrder(order) &&
    !order.return_requested_at &&
    (order.refund_status?.toLowerCase() ?? "none") !== "none"
  );
}

function matchesFilter(
  order: AdminReturnOrder,
  filter: ReturnFilter
) {
  if (filter === "all") return true;

  const returnStatus =
    order.return_status?.toLowerCase() ?? "";

  const refundStatus =
    order.refund_status?.toLowerCase() ?? "";

  if (filter === "requested") {
    return returnStatus === "requested";
  }

  if (filter === "approved") {
    return (
      returnStatus === "approved" &&
      refundStatus !== "processing" &&
      refundStatus !== "refunded"
    );
  }

  if (filter === "processing") {
    return refundStatus === "processing";
  }

  if (filter === "refunded") {
    return refundStatus === "refunded";
  }

  if (filter === "rejected") {
    return returnStatus === "rejected";
  }

  return true;
}

function isCodOrder(paymentMethod: string | null) {
  const normalizedPaymentMethod =
    paymentMethod?.toLowerCase() ?? "";

  return (
    normalizedPaymentMethod === "cod" ||
    normalizedPaymentMethod === "cash on delivery"
  );
}

export default function AdminReturnsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<ReturnFilter>("all");

  const [activeOrderId, setActiveOrderId] =
    useState<number | null>(null);

  const [reviewNote, setReviewNote] =
    useState("");

  const [refundAmount, setRefundAmount] =
    useState("");

  const [processingAction, setProcessingAction] =
    useState(false);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: getAdminReturns,
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-returns-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["admin-returns"],
          });

          queryClient.invalidateQueries({
            queryKey: ["admin-dashboard-stats"],
          });

          queryClient.invalidateQueries({
            queryKey: ["sales-report"],
          });

          queryClient.invalidateQueries({
            queryKey: ["admin-users"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const returns = data?.returns ?? [];
  const summary = data?.summary;

  const visibleReturns = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return returns.filter((order) => {
      if (!matchesFilter(order, filter)) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      const customerName =
        order.addresses?.full_name?.toLowerCase() ?? "";

      const customerPhone =
        order.addresses?.phone?.toLowerCase() ?? "";

      const reason =
        order.return_reason?.toLowerCase() ?? "";

      const refundId =
        order.razorpay_refund_id?.toLowerCase() ?? "";

      return (
        String(order.id).includes(searchValue) ||
        customerName.includes(searchValue) ||
        customerPhone.includes(searchValue) ||
        reason.includes(searchValue) ||
        refundId.includes(searchValue)
      );
    });
  }, [returns, search, filter]);

  async function refreshReturnData(
    orderId?: number
  ) {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin-returns"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-dashboard-stats"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["sales-report"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      }),
      orderId
        ? queryClient.invalidateQueries({
            queryKey: ["admin-order", orderId],
          })
        : Promise.resolve(),
    ]);
  }

  function toggleActions(orderId: number) {
    setActiveOrderId((current) =>
      current === orderId ? null : orderId
    );

    setReviewNote("");
    setRefundAmount("");
  }

  async function handleReturnDecision(
    order: AdminReturnOrder,
    decision: "Approved" | "Rejected"
  ) {
    if (
      decision === "Rejected" &&
      reviewNote.trim().length < 3
    ) {
      toast.error(
        "Please provide a rejection reason."
      );

      return;
    }

    try {
      setProcessingAction(true);

      await reviewOrderReturn({
        orderId: order.id,
        decision,
        note: reviewNote,
      });

      toast.success(
        decision === "Approved"
          ? "Return request approved"
          : "Return request rejected"
      );

      setReviewNote("");
      setRefundAmount("");
      setActiveOrderId(null);

      await refreshReturnData(order.id);
    } catch (error) {
      console.error(
        "Return review failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Return request could not be reviewed."
      );
    } finally {
      setProcessingAction(false);
    }
  }

  async function handleRefund(
    order: AdminReturnOrder
  ) {
    const amount = Number(refundAmount);
    const maximumAmount =
      Number(order.total ?? 0);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > maximumAmount
    ) {
      toast.error(
        `Enter a refund amount between ₹1 and ${formatCurrency(
          maximumAmount
        )}.`
      );

      return;
    }

    const confirmed = window.confirm(
      `Process a refund of ${formatCurrency(
        amount
      )} for order #${order.id}?`
    );

    if (!confirmed) return;

    try {
      setProcessingAction(true);

      if (isCodOrder(order.payment_method)) {
        await completeCodRefund({
          orderId: order.id,
          refundAmount: amount,
          note: reviewNote,
        });

        toast.success(
          "COD refund marked as completed"
        );
      } else {
        const result =
          await processRazorpayRefund({
            orderId: order.id,
            refundAmount: amount,
            note: reviewNote,
          });

        toast.success(
          result.refundStatus === "Refunded"
            ? "Razorpay refund completed"
            : "Razorpay refund initiated"
        );
      }

      setReviewNote("");
      setRefundAmount("");
      setActiveOrderId(null);

      await refreshReturnData(order.id);
    } catch (error) {
      console.error(
        "Refund processing failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Refund could not be processed."
      );
    } finally {
      setProcessingAction(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Returns, Cancellations & Refunds
          </h1>

          <p className="mt-2 text-gray-500">
            Review customer returns, track cancelled-order
            refunds, and process customer reimbursements.
          </p>
        </div>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          <SummaryCard
            icon={RotateCcw}
            label="Total Requests"
            value={summary?.totalRequests ?? 0}
          />

          <SummaryCard
            icon={Clock3}
            label="Pending Review"
            value={summary?.pendingReview ?? 0}
          />

          <SummaryCard
            icon={Package}
            label="Pending Refunds"
            value={summary?.pendingRefunds ?? 0}
          />

          <SummaryCard
            icon={CheckCircle2}
            label="Completed"
            value={summary?.completedReturns ?? 0}
          />

          <SummaryCard
            icon={XCircle}
            label="Rejected"
            value={summary?.rejectedReturns ?? 0}
          />

          <SummaryCard
            icon={IndianRupee}
            label="Refunded Amount"
            value={formatCurrency(
              summary?.refundedAmount ?? 0
            )}
          />
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All
              </FilterButton>

              <FilterButton
                active={filter === "requested"}
                onClick={() =>
                  setFilter("requested")
                }
              >
                Pending Review
              </FilterButton>

              <FilterButton
                active={filter === "approved"}
                onClick={() =>
                  setFilter("approved")
                }
              >
                Approved
              </FilterButton>

              <FilterButton
                active={filter === "processing"}
                onClick={() =>
                  setFilter("processing")
                }
              >
                Processing
              </FilterButton>

              <FilterButton
                active={filter === "refunded"}
                onClick={() =>
                  setFilter("refunded")
                }
              >
                Refunded
              </FilterButton>

              <FilterButton
                active={filter === "rejected"}
                onClick={() =>
                  setFilter("rejected")
                }
              >
                Rejected
              </FilterButton>
            </div>

            <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 xl:w-96">
              <Search
                size={18}
                className="shrink-0 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order, customer, reason, refund ID..."
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
        </section>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <section className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
            <h2 className="text-xl font-bold text-red-700">
              Returns and refunds could not be loaded
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
          </section>
        ) : visibleReturns.length === 0 ? (
          <section className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <RotateCcw
              size={44}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-2xl font-bold">
              No returns or refunds found
            </h2>

            <p className="mt-2 text-gray-500">
              Records matching this filter will appear
              here.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 xl:grid-cols-2">
            {visibleReturns.map((order) => (
              <ReturnCard
                key={order.id}
                order={order}
                isOpen={
                  activeOrderId === order.id
                }
                reviewNote={reviewNote}
                refundAmount={refundAmount}
                processing={
                  processingAction &&
                  activeOrderId === order.id
                }
                onToggle={() =>
                  toggleActions(order.id)
                }
                onReviewNoteChange={
                  setReviewNote
                }
                onRefundAmountChange={
                  setRefundAmount
                }
                onApprove={() =>
                  handleReturnDecision(
                    order,
                    "Approved"
                  )
                }
                onReject={() =>
                  handleReturnDecision(
                    order,
                    "Rejected"
                  )
                }
                onRefund={() =>
                  handleRefund(order)
                }
              />
            ))}
          </section>
        )}
      </div>
    </AdminLayout>
  );
}

function ReturnCard({
  order,
  isOpen,
  reviewNote,
  refundAmount,
  processing,
  onToggle,
  onReviewNoteChange,
  onRefundAmountChange,
  onApprove,
  onReject,
  onRefund,
}: {
  order: AdminReturnOrder;
  isOpen: boolean;
  reviewNote: string;
  refundAmount: string;
  processing: boolean;
  onToggle: () => void;
  onReviewNoteChange: (value: string) => void;
  onRefundAmountChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onRefund: () => void;
}) {
  const itemCount = getItemCount(order);

  const returnStatus =
    order.return_status ?? "None";

  const refundStatus =
    order.refund_status ?? "None";

  const normalizedReturnStatus =
    returnStatus.toLowerCase();

  const normalizedRefundStatus =
    refundStatus.toLowerCase();

  const refundCompleted =
    normalizedRefundStatus === "refunded";

  const returnRequested =
    normalizedReturnStatus === "requested";

  const returnApproved =
    normalizedReturnStatus === "approved";

  const refundProcessing =
    normalizedRefundStatus === "processing";

  const refundFailed =
    normalizedRefundStatus === "failed";

  const cancelledRefund =
    isCancellationRefund(order);

  const codOrder = isCodOrder(
    order.payment_method
  );

  const canManage =
    returnRequested ||
    returnApproved ||
    refundProcessing ||
    refundCompleted ||
    refundFailed ||
    normalizedReturnStatus === "rejected";

  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Order ID
          </p>

          <h2 className="mt-1 text-2xl font-extrabold">
            #{order.id}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {cancelledRefund ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              Cancelled Order
            </span>
          ) : (
            <ReturnStatusBadge
              status={returnStatus}
            />
          )}

          <RefundStatusBadge
            status={refundStatus}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <InfoItem
          label="Customer"
          value={
            order.addresses?.full_name ??
            "Customer"
          }
        />

        <InfoItem
          label="Phone"
          value={order.addresses?.phone ?? "-"}
        />

        <InfoItem
          label="Order amount"
          value={formatCurrency(
            Number(order.total ?? 0)
          )}
        />

        <InfoItem
          label="Items"
          value={`${itemCount} item${
            itemCount === 1 ? "" : "s"
          }`}
        />

        <InfoItem
          label="Payment"
          value={`${
            order.payment_method ?? "Unknown"
          } • ${
            order.payment_status ?? "Pending"
          }`}
        />

        <InfoItem
          label={
            cancelledRefund
              ? "Refund requested"
              : "Return requested"
          }
          value={
            order.refund_requested_at
              ? new Date(
                  order.refund_requested_at
                ).toLocaleString("en-IN")
              : order.return_requested_at
                ? new Date(
                    order.return_requested_at
                  ).toLocaleString("en-IN")
                : "-"
          }
        />
      </div>

      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {cancelledRefund
            ? "Cancellation reason"
            : "Return reason"}
        </p>

        <p className="mt-2 text-sm font-medium text-gray-700">
          {order.return_reason ||
            (cancelledRefund
              ? "Online order cancelled by admin."
              : "No reason provided")}
        </p>
      </div>

      {order.return_review_note && (
        <div className="mt-3 rounded-2xl bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
            Admin note
          </p>

          <p className="mt-2 text-sm font-medium text-blue-800">
            {order.return_review_note}
          </p>
        </div>
      )}

      {Number(order.refund_amount ?? 0) > 0 && (
        <div
          className={`mt-4 rounded-2xl p-4 ${
            refundCompleted
              ? "bg-green-50"
              : "bg-yellow-50"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <span
              className={`text-sm font-semibold ${
                refundCompleted
                  ? "text-green-700"
                  : "text-yellow-700"
              }`}
            >
              {refundCompleted
                ? "Refunded amount"
                : "Refund amount"}
            </span>

            <span
              className={`text-xl font-bold ${
                refundCompleted
                  ? "text-green-700"
                  : "text-yellow-700"
              }`}
            >
              {formatCurrency(
                Number(
                  order.refund_amount ?? 0
                )
              )}
            </span>
          </div>

          {order.refund_method && (
            <div className="mt-3 border-t border-black/5 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Refund method
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-700">
                {order.refund_method}
              </p>
            </div>
          )}

          {order.razorpay_refund_id && (
            <div className="mt-3 rounded-xl bg-white/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Razorpay Refund ID
              </p>

              <p className="mt-1 break-all font-mono text-sm text-gray-800">
                {order.razorpay_refund_id}
              </p>
            </div>
          )}

          {order.refunded_at && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Refunded on
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {new Date(
                  order.refunded_at
                ).toLocaleString("en-IN")}
              </p>
            </div>
          )}
        </div>
      )}

      <div
        className={`mt-5 grid gap-3 ${
          canManage ? "sm:grid-cols-2" : ""
        }`}
      >
        {canManage && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-2xl bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700"
          >
            {isOpen
              ? "Close Details"
              : refundCompleted
                ? "View Refund Details"
                : cancelledRefund
                  ? "View Refund Status"
                  : "Manage Return"}
          </button>
        )}

        <Link
          href={`/admin/orders/${order.id}`}
          className="group flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 font-bold text-gray-700 transition hover:bg-gray-200"
        >
          View Order Details

          <ArrowRight
            size={18}
            className="transition group-hover:translate-x-1"
          />
        </Link>
      </div>

      {isOpen && (
        <div className="mt-5 border-t border-gray-200 pt-5">
          {returnRequested && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <h3 className="font-bold text-yellow-900">
                Review return request
              </h3>

              <p className="mt-1 text-sm text-yellow-700">
                Approve the request or reject it with a
                reason.
              </p>

              <textarea
                value={reviewNote}
                onChange={(event) =>
                  onReviewNoteChange(
                    event.target.value
                  )
                }
                rows={3}
                maxLength={500}
                placeholder="Optional approval note or required rejection reason..."
                className="mt-4 w-full resize-none rounded-xl border border-yellow-200 bg-white px-4 py-3 outline-none transition focus:border-yellow-500"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onApprove}
                  disabled={processing}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <CheckCircle2 size={18} />

                  {processing
                    ? "Updating..."
                    : "Approve Return"}
                </button>

                <button
                  type="button"
                  onClick={onReject}
                  disabled={processing}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <XCircle size={18} />
                  Reject Return
                </button>
              </div>
            </div>
          )}

          {returnApproved &&
            !refundCompleted &&
            !refundProcessing && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <h3 className="font-bold text-blue-900">
                  Process refund
                </h3>

                <p className="mt-1 text-sm text-blue-700">
                  {codOrder
                    ? "Confirm the amount manually returned to the customer."
                    : "The refund will be initiated through Razorpay."}
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-semibold text-blue-900">
                      Refund amount
                    </span>

                    <input
                      type="number"
                      min="1"
                      max={Number(
                        order.total ?? 0
                      )}
                      step="0.01"
                      value={refundAmount}
                      onChange={(event) =>
                        onRefundAmountChange(
                          event.target.value
                        )
                      }
                      placeholder={`Maximum ${formatCurrency(
                        Number(
                          order.total ?? 0
                        )
                      )}`}
                      className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 outline-none transition focus:border-blue-600"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-semibold text-blue-900">
                      Refund note
                    </span>

                    <input
                      value={reviewNote}
                      onChange={(event) =>
                        onReviewNoteChange(
                          event.target.value
                        )
                      }
                      placeholder="Optional refund note"
                      className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 outline-none transition focus:border-blue-600"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={onRefund}
                  disabled={processing}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <Clock3 size={18} />

                  {processing
                    ? "Processing..."
                    : codOrder
                      ? "Mark Refund Completed"
                      : "Initiate Razorpay Refund"}
                </button>
              </div>
            )}

          {refundProcessing && (
            <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-5 text-blue-800">
              <Clock3 className="mt-0.5 shrink-0" />

              <div>
                <p className="font-bold">
                  Refund is processing
                </p>

                <p className="mt-1 text-sm">
                  Razorpay has accepted the refund request.
                  Revenue will be adjusted after the refund
                  is completed.
                </p>

                {order.razorpay_refund_id && (
                  <p className="mt-3 break-all font-mono text-xs">
                    Refund ID:{" "}
                    {order.razorpay_refund_id}
                  </p>
                )}
              </div>
            </div>
          )}

          {refundCompleted && (
            <div className="flex items-start gap-3 rounded-2xl bg-green-50 p-5 text-green-800">
              <CheckCircle2 className="mt-0.5 shrink-0" />

              <div>
                <p className="font-bold">
                  Refund completed
                </p>

                <p className="mt-1 text-sm">
                  {formatCurrency(
                    Number(
                      order.refund_amount ?? 0
                    )
                  )}{" "}
                  has been refunded and deducted from net
                  revenue.
                </p>

                {order.refund_method && (
                  <p className="mt-2 text-sm">
                    Method: {order.refund_method}
                  </p>
                )}

                {order.razorpay_refund_id && (
                  <p className="mt-2 break-all font-mono text-xs">
                    Refund ID:{" "}
                    {order.razorpay_refund_id}
                  </p>
                )}
              </div>
            </div>
          )}

          {refundFailed && (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-5 text-red-800">
              <XCircle className="mt-0.5 shrink-0" />

              <div>
                <p className="font-bold">
                  Refund failed
                </p>

                <p className="mt-1 text-sm">
                  Review the payment details before trying
                  the refund again.
                </p>
              </div>
            </div>
          )}

          {normalizedReturnStatus === "rejected" && (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-5 text-red-800">
              <XCircle className="mt-0.5 shrink-0" />

              <div>
                <p className="font-bold">
                  Return rejected
                </p>

                <p className="mt-1 text-sm">
                  {order.return_review_note ||
                    "The return request was rejected."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof RotateCcw;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon
          size={20}
          className="text-green-600"
        />

        <p className="text-sm font-semibold text-gray-600">
          {label}
        </p>
      </div>

      <p className="mt-4 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-green-600 text-white"
          : "border border-gray-200 bg-white text-gray-600 hover:bg-green-50 hover:text-green-700"
      }`}
    >
      {children}
    </button>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function ReturnStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    status.toLowerCase();

  const className =
    normalizedStatus === "requested"
      ? "bg-yellow-100 text-yellow-700"
      : normalizedStatus === "approved"
        ? "bg-blue-100 text-blue-700"
        : normalizedStatus === "rejected"
          ? "bg-red-100 text-red-700"
          : normalizedStatus === "returned"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      Return: {status}
    </span>
  );
}

function RefundStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    status.toLowerCase();

  const className =
    normalizedStatus === "refunded"
      ? "bg-green-100 text-green-700"
      : normalizedStatus === "processing"
        ? "bg-blue-100 text-blue-700"
        : normalizedStatus === "failed"
          ? "bg-red-100 text-red-700"
          : normalizedStatus === "pending"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-gray-100 text-gray-600";

  const label =
    normalizedStatus === "refunded"
      ? "Refunded"
      : normalizedStatus === "processing"
        ? "Refund Processing"
        : normalizedStatus === "failed"
          ? "Refund Failed"
          : normalizedStatus === "pending"
            ? "Refund Pending"
            : `Refund: ${status}`;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      {label}
    </span>
  );
}
