import { supabase } from "@/lib/supabase";

export type AdminReturnOrder = {
  id: number;
  user_id: string | null;
  created_at: string;
  total: number | null;
  status: string;
  payment_method: string | null;
  payment_status: string | null;

  return_status: string | null;
  return_reason: string | null;
  return_requested_at: string | null;
  return_reviewed_at: string | null;
  return_review_note: string | null;

  refund_status: string | null;
  refund_amount: number | null;
  refund_method: string | null;
  refund_requested_at: string | null;
  refunded_at: string | null;
  razorpay_refund_id: string | null;

  addresses:
    | {
        full_name: string | null;
        phone: string | null;
        city: string | null;
      }
    | null;

  order_items:
    | {
        id: number;
        name: string;
        quantity: number | null;
      }[]
    | null;
};

export type AdminReturnSummary = {
  totalRequests: number;
  pendingReview: number;
  pendingRefunds: number;
  completedReturns: number;
  rejectedReturns: number;
  refundedAmount: number;
};

export type AdminReturnsData = {
  returns: AdminReturnOrder[];
  summary: AdminReturnSummary;
};

export async function getAdminReturns(): Promise<AdminReturnsData> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      created_at,
      total,
      status,
      payment_method,
      payment_status,
      return_status,
      return_reason,
      return_requested_at,
      return_reviewed_at,
      return_review_note,
      refund_status,
      refund_amount,
      refund_method,
      refund_requested_at,
      razorpay_refund_id,
      refunded_at,
      addresses (
        full_name,
        phone,
        city
      ),
      order_items (
        id,
        name,
        quantity
      )
      `
    )
  .or("return_status.neq.None,refund_status.neq.None")
  .order("created_at", {
    ascending: false,
  });

  if (error) throw error;

  const returns =
    (data ?? []) as unknown as AdminReturnOrder[];

  const pendingReview = returns.filter(
    (order) =>
      order.return_status?.toLowerCase() === "requested"
  ).length;

  const pendingRefunds = returns.filter((order) => {
    const refundStatus =
      order.refund_status?.toLowerCase() ?? "";

    return (
      refundStatus === "pending" ||
      refundStatus === "processing"
    );
  }).length;

  const completedReturns = returns.filter(
    (order) =>
      order.return_status?.toLowerCase() === "returned" &&
      order.refund_status?.toLowerCase() === "refunded"
  ).length;

  const rejectedReturns = returns.filter(
    (order) =>
      order.return_status?.toLowerCase() === "rejected"
  ).length;

  const refundedAmount = returns.reduce((sum, order) => {
    const refundCompleted =
      order.refund_status?.toLowerCase() === "refunded";

    return refundCompleted
      ? sum + Number(order.refund_amount ?? 0)
      : sum;
  }, 0);

  return {
    returns,
    summary: {
      totalRequests: returns.length,
      pendingReview,
      pendingRefunds,
      completedReturns,
      rejectedReturns,
      refundedAmount,
    },
  };
}
