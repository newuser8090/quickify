export async function createRazorpayOrder(amount: number) {
  const response = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create Razorpay order");
  }

  return data;
}

export async function verifyRazorpayPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const response = await fetch("/api/razorpay/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error("Payment verification failed");
  }

  return result;
}
export type RazorpayRefundResult = {
  success: boolean;
  refund: {
    id: string;
    payment_id: string;
    amount: number;
    status: string;
    speed_processed?: string | null;
    created_at?: number;
  };
};

export async function createRazorpayRefund(input: {
  paymentId: string;
  orderId: number;
  amount: number;
  note?: string;
}): Promise<RazorpayRefundResult> {
  const response = await fetch(
    "/api/razorpay/refund",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Razorpay refund could not be initiated."
    );
  }

  return result as RazorpayRefundResult;
}