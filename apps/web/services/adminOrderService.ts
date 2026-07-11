import { supabase } from "@/lib/supabase";
import { createUserNotification } from "@/services/notificationService";
import { createRazorpayRefund } from "@/services/razorpayService";

export type ReturnDecision = "Approved" | "Rejected";

type RefundInput = {
  orderId: number;
  refundAmount: number;
  note?: string;
};

export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*),
      addresses (*),
      delivery_partners (*)
      `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function updateOrderStatus(
  orderId: number,
  status: string
) {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, user_id, status")
    .eq("id", orderId)
    .single();

  if (fetchError) throw fetchError;

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (updateError) throw updateError;

  if (order.user_id && order.status !== status) {
    await createUserNotification({
      userId: order.user_id,
      type: "order",
      title: "Order Updated",
      message: `Your order #${orderId} is now ${status}.`,
      link: `/orders/${orderId}`,
    });
  }
}

export async function updateOrderPaymentStatus(
  orderId: number,
  paymentStatus: "Pending" | "Paid"
) {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, payment_method, payment_status"
    )
    .eq("id", orderId)
    .single();

  if (fetchError) throw fetchError;

  const paymentMethod =
    order.payment_method?.toLowerCase() ?? "";

  const isCodOrder =
    paymentMethod === "cod" ||
    paymentMethod === "cash on delivery";

  if (!isCodOrder) {
    throw new Error(
      "Only Cash on Delivery payments can be confirmed manually."
    );
  }

  if (order.status?.toLowerCase() === "cancelled") {
    throw new Error(
      "Payment cannot be confirmed for a cancelled order."
    );
  }

  if (
    paymentStatus === "Paid" &&
    order.status?.toLowerCase() !== "delivered"
  ) {
    throw new Error(
      "The order must be delivered before confirming COD payment."
    );
  }

  if (order.payment_status === paymentStatus) {
    return order;
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
    })
    .eq("id", orderId)
    .select(
      "id, user_id, status, payment_method, payment_status"
    )
    .single();

  if (updateError) throw updateError;

  if (order.user_id && paymentStatus === "Paid") {
    try {
      await createUserNotification({
        userId: order.user_id,
        type: "order",
        title: "Payment Received",
        message: `The Cash on Delivery payment for order #${orderId} has been received.`,
        link: `/orders/${orderId}`,
      });
    } catch (notificationError) {
      console.error(
        "Payment updated, but notification failed:",
        notificationError
      );
    }
  }

  return updatedOrder;
}

export async function reviewOrderReturn({
  orderId,
  decision,
  note,
}: {
  orderId: number;
  decision: ReturnDecision;
  note?: string;
}) {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      return_status,
      refund_status
      `
    )
    .eq("id", orderId)
    .single();

  if (fetchError) throw fetchError;

  if (order.return_status !== "Requested") {
    throw new Error(
      "This return request has already been reviewed."
    );
  }

  if (order.refund_status === "Refunded") {
    throw new Error(
      "This order has already been refunded."
    );
  }

  const reviewNote = note?.trim() || null;

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      return_status: decision,
      return_reviewed_at: new Date().toISOString(),
      return_review_note: reviewNote,
      refund_status:
        decision === "Approved" ? "Pending" : "None",
    })
    .eq("id", orderId);

  if (updateError) throw updateError;

  if (order.user_id) {
    try {
      await createUserNotification({
        userId: order.user_id,
        type: "order",
        title:
          decision === "Approved"
            ? "Return Approved"
            : "Return Rejected",
        message:
          decision === "Approved"
            ? `Your return request for order #${orderId} has been approved.`
            : `Your return request for order #${orderId} was rejected${
                reviewNote ? `: ${reviewNote}` : "."
              }`,
        link: `/orders/${orderId}`,
      });
    } catch (notificationError) {
      console.error(
        "Return reviewed, but notification failed:",
        notificationError
      );
    }
  }
}

export async function completeCodRefund({
  orderId,
  refundAmount,
  note,
}: RefundInput) {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      total,
      payment_method,
      payment_status,
      return_status,
      refund_status
      `
    )
    .eq("id", orderId)
    .single();

  if (fetchError) throw fetchError;

  const paymentMethod =
    order.payment_method?.toLowerCase() ?? "";

  const isCodOrder =
    paymentMethod === "cod" ||
    paymentMethod === "cash on delivery";

  if (!isCodOrder) {
    throw new Error(
      "This order must be refunded through Razorpay."
    );
  }

  validateRefund({
    total: Number(order.total ?? 0),
    refundAmount,
    paymentStatus: order.payment_status,
    returnStatus: order.return_status,
    refundStatus: order.refund_status,
  });

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      return_status: "Returned",
      refund_status: "Refunded",
      refund_amount: refundAmount,
      refund_method: "Manual COD Refund",
      refund_requested_at: now,
      refunded_at: now,
      return_review_note: note?.trim() || null,
    })
    .eq("id", orderId);

  if (updateError) throw updateError;

  await sendRefundNotification({
    userId: order.user_id,
    orderId,
    refundAmount,
    completed: true,
  });
}

export async function processRazorpayRefund({
  orderId,
  refundAmount,
  note,
}: RefundInput) {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      total,
      payment_method,
      payment_status,
      razorpay_payment_id,
      return_status,
      refund_status
      `
    )
    .eq("id", orderId)
    .single();

  if (fetchError) throw fetchError;

  const paymentMethod =
    order.payment_method?.toLowerCase() ?? "";

  if (paymentMethod !== "online") {
    throw new Error(
      "Only online orders can be refunded through Razorpay."
    );
  }

  if (!order.razorpay_payment_id) {
    throw new Error(
      "This order does not have a Razorpay payment ID."
    );
  }

  validateRefund({
    total: Number(order.total ?? 0),
    refundAmount,
    paymentStatus: order.payment_status,
    returnStatus: order.return_status,
    refundStatus: order.refund_status,
  });

  const requestedAt = new Date().toISOString();

  const { error: processingError } = await supabase
    .from("orders")
    .update({
      refund_status: "Processing",
      refund_amount: refundAmount,
      refund_method: "Razorpay",
      refund_requested_at: requestedAt,
      return_review_note: note?.trim() || null,
    })
    .eq("id", orderId);

  if (processingError) throw processingError;

  try {
    const result = await createRazorpayRefund({
      paymentId: order.razorpay_payment_id,
      orderId,
      amount: refundAmount,
      note,
    });

    const razorpayStatus =
      result.refund.status?.toLowerCase();

    const refundStatus =
      razorpayStatus === "processed"
        ? "Refunded"
        : razorpayStatus === "failed"
          ? "Failed"
          : "Processing";

    const completed =
      refundStatus === "Refunded";

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        return_status: completed
          ? "Returned"
          : "Approved",
        refund_status: refundStatus,
        refund_amount: refundAmount,
        refund_method: "Razorpay",
        razorpay_refund_id: result.refund.id,
        refunded_at: completed
          ? new Date().toISOString()
          : null,
      })
      .eq("id", orderId);

    if (updateError) throw updateError;

    await sendRefundNotification({
      userId: order.user_id,
      orderId,
      refundAmount,
      completed,
    });

    return {
      refundStatus,
      razorpayRefundId: result.refund.id,
    };
  } catch (error) {
    await supabase
      .from("orders")
      .update({
        refund_status: "Failed",
      })
      .eq("id", orderId);

    throw error;
  }
}

function validateRefund({
  total,
  refundAmount,
  paymentStatus,
  returnStatus,
  refundStatus,
}: {
  total: number;
  refundAmount: number;
  paymentStatus: string | null;
  returnStatus: string | null;
  refundStatus: string | null;
}) {
  if (returnStatus !== "Approved") {
    throw new Error(
      "Approve the return request before processing a refund."
    );
  }

  if (paymentStatus?.toLowerCase() !== "paid") {
    throw new Error(
      "Only paid orders can be refunded."
    );
  }

  if (refundStatus === "Refunded") {
    throw new Error(
      "This order has already been refunded."
    );
  }

  if (
    !Number.isFinite(refundAmount) ||
    refundAmount <= 0 ||
    refundAmount > total
  ) {
    throw new Error(
      `Refund amount must be between ₹1 and ₹${total}.`
    );
  }
}

async function sendRefundNotification({
  userId,
  orderId,
  refundAmount,
  completed,
}: {
  userId: string | null;
  orderId: number;
  refundAmount: number;
  completed: boolean;
}) {
  if (!userId) return;

  try {
    await createUserNotification({
      userId,
      type: "order",
      title: completed
        ? "Refund Completed"
        : "Refund Initiated",
      message: completed
        ? `A refund of ₹${refundAmount} for order #${orderId} has been completed.`
        : `A refund of ₹${refundAmount} for order #${orderId} has been initiated.`,
      link: `/orders/${orderId}`,
    });
  } catch (notificationError) {
    console.error(
      "Refund updated, but notification failed:",
      notificationError
    );
  }
}
export async function cancelOnlineOrder({
  orderId,
  refundPayment,
}: {
  orderId: number;
  refundPayment: boolean;
}) {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      total,
      status,
      payment_method,
      payment_status,
      razorpay_payment_id,
      refund_status
      `
    )
    .eq("id", orderId)
    .single();

  if (fetchError) throw fetchError;

  const paymentMethod =
    order.payment_method?.toLowerCase() ?? "";

  const paymentStatus =
    order.payment_status?.toLowerCase() ?? "";

  const isOnlineOrder = paymentMethod === "online";
  const isPaidOrder = paymentStatus === "paid";

  if (!isOnlineOrder || !isPaidOrder) {
    throw new Error(
      "Cancellation refunds are available only for paid online orders."
    );
  }

  if (order.status?.toLowerCase() === "cancelled") {
    throw new Error("This order is already cancelled.");
  }

  if (
    refundPayment &&
    order.refund_status?.toLowerCase() === "refunded"
  ) {
    throw new Error("This order has already been refunded.");
  }

  /*
   * The admin chose to cancel without initiating a refund.
   */
  if (!refundPayment) {
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "Cancelled",
      })
      .eq("id", orderId);

    if (updateError) throw updateError;

    if (order.user_id) {
      try {
        await createUserNotification({
          userId: order.user_id,
          type: "order",
          title: "Order Cancelled",
          message: `Your order #${orderId} has been cancelled.`,
          link: `/orders/${orderId}`,
        });
      } catch (notificationError) {
        console.error(
          "Order cancelled, but customer notification failed:",
          notificationError
        );
      }
    }

    return {
      status: "Cancelled",
      refundStatus: "None",
    };
  }

  if (!order.razorpay_payment_id) {
    throw new Error(
      "This order does not have a Razorpay payment ID."
    );
  }

  const refundAmount = Number(order.total ?? 0);

  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    throw new Error("The order refund amount is invalid.");
  }

  /*
   * Start the Razorpay refund before finalising cancellation.
   * If Razorpay rejects the request, the order remains unchanged,
   * allowing the admin to try again.
   */
  const result = await createRazorpayRefund({
    paymentId: order.razorpay_payment_id,
    orderId,
    amount: refundAmount,
    note: "Refund for admin-cancelled online order",
  });

  const razorpayStatus =
    result.refund.status?.toLowerCase() ?? "pending";

  const refundStatus =
    razorpayStatus === "processed"
      ? "Refunded"
      : razorpayStatus === "failed"
        ? "Failed"
        : "Processing";

  const refundCompleted =
    refundStatus === "Refunded";

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "Cancelled",
      refund_status: refundStatus,
      refund_amount: refundAmount,
      refund_method: "Razorpay",
      razorpay_refund_id: result.refund.id,
      refund_requested_at: now,
      refunded_at: refundCompleted ? now : null,
    })
    .eq("id", orderId);

  if (updateError) throw updateError;

  if (order.user_id) {
    try {
      await createUserNotification({
        userId: order.user_id,
        type: "order",
        title: "Order Cancelled",
        message: refundCompleted
          ? `Your order #${orderId} was cancelled and ${formatRefundAmount(
              refundAmount
            )} has been refunded.`
          : `Your order #${orderId} was cancelled and a refund of ${formatRefundAmount(
              refundAmount
            )} has been initiated.`,
        link: `/orders/${orderId}`,
      });
    } catch (notificationError) {
      console.error(
        "Cancellation completed, but customer notification failed:",
        notificationError
      );
    }
  }

  return {
    status: "Cancelled",
    refundStatus,
    razorpayRefundId: result.refund.id,
  };
}

function formatRefundAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export async function getAdminOrder(orderId: number) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*),
      addresses (*),
      delivery_partners (*)
      `
    )
    .eq("id", orderId)
    .single();

  if (error) throw error;

  return data;
}