import { NextResponse } from "next/server";
import Razorpay from "razorpay";

type RefundRequestBody = {
  paymentId?: string;
  amount?: number;
  orderId?: number;
  note?: string;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as RefundRequestBody;

    const paymentId = body.paymentId?.trim();
    const amount = Number(body.amount);
    const orderId = Number(body.orderId);

    if (!paymentId) {
      return NextResponse.json(
        {
          error:
            "Razorpay payment ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "A valid refund amount is required.",
        },
        {
          status: 400,
        }
      );
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID;

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          error:
            "Razorpay server credentials are missing.",
        },
        {
          status: 500,
        }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const refund =
      await razorpay.payments.refund(
        paymentId,
        {
          amount: Math.round(amount * 100),
          speed: "normal",
          receipt: `quickify_refund_${orderId}_${Date.now()}`,
          notes: {
            quickify_order_id: String(orderId),
            reason:
              body.note?.trim() ||
              "Approved order return",
          },
        }
      );

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        payment_id: refund.payment_id,
        amount:
          Number(refund.amount ?? 0) / 100,
        status: refund.status,
        speed_processed:
          refund.speed_processed,
        created_at: refund.created_at,
      },
    });
  } catch (error) {
    console.error(
      "Razorpay refund creation failed:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Refund could not be initiated.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}