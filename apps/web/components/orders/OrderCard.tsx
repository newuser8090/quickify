"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Download,
  PackageCheck,
  Pencil,
  RotateCcw,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { mapProduct } from "@/utils/mapProduct";
import { SupabaseProduct } from "@/types/supabaseProduct";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useRealtimeOrderTracking } from "@/hooks/useRealtimeOrderTracking";
import { upsertProductReview } from "@/services/reviewService";

import LiveDeliveryTracking from "./LiveDeliveryTracking";
import OrderItem from "./OrderItem";
import OrderStatusBadge from "./OrderStatusBadge";

type OrderAddress = {
  full_name?: string | null;
  phone?: string | null;
  address_line?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | number | null;
  latitude?: number | null;
  longitude?: number | null;
};

type OrderItemType = {
  id: number;
  product_id: number;
  name: string;
  variant_id?: number | null;
  variant_name?: string | null;
  unit?: string | null;
  price: number;
  quantity: number;
  product?: SupabaseProduct | SupabaseProduct[] | null;
};

type OrderUser = {
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
  };
};

type Order = {
  id: number;
  status: string;
  created_at: string;
  payment_method: string;
  payment_status?: string | null;
  razorpay_payment_id?: string | null;
  subtotal?: number | null;
  delivery_fee?: number | null;
  platform_fee?: number | null;
  discount?: number | null;
  total: number;
  addresses?: OrderAddress | OrderAddress[] | null;
  user?: OrderUser | null;
  order_items: OrderItemType[];
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  delivery_location_updated_at?: string | null;
  estimated_delivery_minutes?: number | null;
  delivery_partners?: {
    name: string;
    phone: string;
    vehicle_type: string;
    vehicle_number: string | null;
  } | null;
  delivery_slot?: string | null;
};

type ReviewRow = {
  order_item_id: number;
  rating: number;
  comment: string | null;
};

type Props = {
  order: Order;
  highlighted?: boolean;
};

const steps = [
  "Placed",
  "Processing",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

export default function OrderCard({
  order,
  highlighted = false,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const cardRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);

  const [reviewingItem, setReviewingItem] =
    useState<OrderItemType | null>(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [reviewedItemIds, setReviewedItemIds] = useState<Set<number>>(
    new Set()
  );
  const [highlightVisible, setHighlightVisible] = useState(highlighted);

  const isCancelled = order.status === "Cancelled";
  const isDelivered = order.status === "Delivered";
  const currentIndex = steps.indexOf(order.status);
  const orderItemIds = useMemo(
    () => order.order_items.map((item) => item.id),
    [order.order_items]
  );

  const address = Array.isArray(order.addresses)
    ? order.addresses[0]
    : order.addresses;

  const tracking = useRealtimeOrderTracking(order.id, {
    delivery_latitude: order.delivery_latitude,
    delivery_longitude: order.delivery_longitude,
    delivery_location_updated_at: order.delivery_location_updated_at,
    estimated_delivery_minutes: order.estimated_delivery_minutes,
  });

  const { data: existingReviews = [] } = useQuery<ReviewRow[]>({
    queryKey: ["reviewed-order-items", order.id, user?.id],
    queryFn: async () => {
      if (!user || orderItemIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from("product_reviews")
        .select("order_item_id, rating, comment")
        .eq("user_id", user.id)
        .in("order_item_id", orderItemIds);

      if (error) {
        throw error;
      }

      return (data ?? []) as ReviewRow[];
    },
    enabled: Boolean(user) && orderItemIds.length > 0,
  });

  useEffect(() => {
    if (!highlighted) return;

    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setHighlightVisible(true);

    const timer = window.setTimeout(() => {
      setHighlightVisible(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [highlighted]);

  function getExistingReview(itemId: number) {
    return existingReviews.find(
      (review) => review.order_item_id === itemId
    );
  }

  function hasExistingReview(itemId: number) {
    return (
      reviewedItemIds.has(itemId) ||
      Boolean(getExistingReview(itemId))
    );
  }

  function handleOpenReview(item: OrderItemType) {
    const existingReview = getExistingReview(item.id);

    setReviewingItem(item);
    setReviewRating(existingReview?.rating ?? 5);
    setReviewComment(existingReview?.comment ?? "");
  }

  function handleReorder() {
    let addedCount = 0;
    let skippedCount = 0;

    order.order_items.forEach((item) => {
      const rawProduct = Array.isArray(item.product)
        ? item.product[0]
        : item.product;

      if (!rawProduct) {
        skippedCount += 1;
        return;
      }

      const product = mapProduct(rawProduct);

      for (let index = 0; index < item.quantity; index += 1) {
        const success = addItem(product, null);

        if (success) {
          addedCount += 1;
        } else {
          skippedCount += 1;
          break;
        }
      }
    });

    if (addedCount > 0) {
      toast.success(`${addedCount} item(s) added to cart`);
      router.push("/checkout");
    }

    if (skippedCount > 0) {
      toast.error(
        `${skippedCount} item(s) could not be added due to stock`
      );
    }

    if (addedCount === 0 && skippedCount === 0) {
      toast.error("No items available to reorder");
    }
  }

  async function handleSubmitReview() {
    if (!reviewingItem) return;

    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      setSubmittingReview(true);

      await upsertProductReview(
        reviewingItem.product_id,
        user.id,
        user.email ?? null,
        reviewRating,
        reviewComment,
        reviewingItem.id
      );

      setReviewedItemIds((current) => {
        const next = new Set(current);
        next.add(reviewingItem.id);
        return next;
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["product-reviews", reviewingItem.product_id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["product", reviewingItem.product_id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["reviewed-order-items", order.id, user.id],
        }),
      ]);

      setReviewingItem(null);
      setReviewComment("");
      setReviewRating(5);
      setThankYouOpen(true);

      window.setTimeout(() => {
        setThankYouOpen(false);
      }, 1800);
    } catch (error) {
      console.error("Review submission failed:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  }

  function downloadInvoice() {
    const invoiceWindow = window.open("", "_blank");

    if (!invoiceWindow) {
      toast.error("Please allow pop-ups to download the invoice");
      return;
    }

    const customerName =
      address?.full_name ||
      order.user?.user_metadata?.full_name ||
      order.user?.email ||
      "Customer";

    const fullAddress = [
      address?.address_line,
      address?.landmark,
      address?.city,
      address?.state,
      address?.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    const itemsHtml = order.order_items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              <strong>${item.name}</strong>
              ${
                item.variant_name
                  ? `<br/><small>${item.variant_name}</small>`
                  : ""
              }
              ${item.unit ? `<br/><small>${item.unit}</small>` : ""}
            </td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${item.price * item.quantity}</td>
          </tr>
        `
      )
      .join("");

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Quickify Invoice #${order.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #111827;
            }

            .header {
              display: flex;
              justify-content: space-between;
              gap: 24px;
              border-bottom: 2px solid #16a34a;
              padding-bottom: 18px;
            }

            .brand {
              font-size: 32px;
              font-weight: bold;
              color: #16a34a;
            }

            .muted {
              color: #6b7280;
              font-size: 14px;
            }

            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-top: 18px;
            }

            .section {
              padding: 14px 16px;
              background: #f9fafb;
              border-radius: 10px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
            }

            th {
              background: #ecfdf5;
              color: #166534;
            }

            th,
            td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              text-align: left;
            }

            .summary {
              margin-top: 24px;
              margin-left: auto;
              width: 320px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
            }

            .grand {
              font-size: 22px;
              font-weight: bold;
              border-top: 2px solid #111827;
              margin-top: 8px;
              padding-top: 12px;
            }

            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6b7280;
              font-size: 13px;
            }
          </style>
        </head>

        <body>
          <div class="header">
            <div>
              <div class="brand">Quickify</div>
              <p class="muted">Fresh groceries delivered fast</p>
            </div>

            <div>
              <h2>Tax Invoice</h2>
              <p><strong>Invoice No:</strong> QK-${order.id}</p>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Date:</strong> ${new Date(
                order.created_at
              ).toLocaleString()}</p>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <h3>Bill To</h3>
              <p><strong>${customerName}</strong></p>
              <p>${address?.phone ?? ""}</p>
            </div>

            <div class="section">
              <h3>Delivery Address</h3>
              <p>${fullAddress || "Address not available"}</p>
            </div>

            <div class="section">
              <h3>Delivery Slot</h3>
              <p>${order.delivery_slot ?? "Express Delivery"}</p>
            </div>

            <div class="section">
              <h3>Payment</h3>
              <p>${order.payment_method}</p>
              <p>${order.payment_status ?? "Pending"}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div class="row">
              <span>Subtotal</span>
              <strong>₹${order.subtotal ?? order.total}</strong>
            </div>

            <div class="row">
              <span>Delivery Fee</span>
              <strong>₹${order.delivery_fee ?? 0}</strong>
            </div>

            <div class="row">
              <span>Platform Fee</span>
              <strong>₹${order.platform_fee ?? 0}</strong>
            </div>

            <div class="row">
              <span>Discount</span>
              <strong>-₹${order.discount ?? 0}</strong>
            </div>

            <div class="row grand">
              <span>Grand Total</span>
              <span>₹${order.total}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with Quickify.</p>
            <p>This is a computer-generated invoice.</p>
          </div>

          <script>
            window.print();
          </script>
        </body>
      </html>
    `);

    invoiceWindow.document.close();
  }

  return (
    <div
      ref={cardRef}
      className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-500 ${
        highlightVisible
          ? "ring-4 ring-green-500 shadow-2xl"
          : ""
      }`}
    >
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-4 text-white sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-green-100">
              Order details
            </p>

            <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
              Order #{order.id}
            </h2>

            <p className="mt-1 text-xs text-green-50 sm:text-sm">
              {new Date(order.created_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          <div className="shrink-0 origin-top-right scale-90 rounded-full bg-white p-1 sm:scale-100">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {order.delivery_slot && (
            <InfoBadge
              icon={<CalendarClock size={15} />}
              text={order.delivery_slot}
            />
          )}

          <InfoBadge text={order.payment_method} />

          <InfoBadge
            text={order.payment_status ?? "Pending"}
            tone={
              order.payment_status === "Paid"
                ? "success"
                : order.payment_status === "Failed"
                  ? "danger"
                  : "warning"
            }
          />
        </div>
      </section>

      <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
        <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Progress
              </p>

              <h3 className="mt-1 font-bold text-gray-900">
                Order Tracking
              </h3>
            </div>

            {!isCancelled && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold text-green-700">
                {Math.max(0, currentIndex + 1)}/{steps.length}
              </span>
            )}
          </div>

          {isCancelled ? (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              This order has been cancelled.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {steps.map((step, index) => {
                const completed = index <= currentIndex;
                const current = index === currentIndex;

                return (
                  <div
                    key={step}
                    className={`rounded-xl border p-3 transition ${
                      current
                        ? "border-green-300 bg-green-50"
                        : completed
                          ? "border-green-100 bg-white"
                          : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {completed ? (
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-green-600"
                        />
                      ) : (
                        <Circle
                          size={18}
                          className="shrink-0 text-gray-300"
                        />
                      )}

                      <span
                        className={`text-xs font-semibold leading-4 ${
                          completed
                            ? "text-green-700"
                            : "text-gray-400"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <LiveDeliveryTracking
          status={order.status}
          latitude={tracking.delivery_latitude}
          longitude={tracking.delivery_longitude}
          estimatedMinutes={tracking.estimated_delivery_minutes}
          updatedAt={tracking.delivery_location_updated_at}
          partner={order.delivery_partners}
          customerLatitude={address?.latitude}
          customerLongitude={address?.longitude}
        />

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Products
              </p>

              <h3 className="mt-1 font-bold text-gray-900">
                Items in this order
              </h3>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
              {order.order_items.length} item
              {order.order_items.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-2.5">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <OrderItem item={item} />
                  </div>

                  {isDelivered && (
                    <button
                      type="button"
                      onClick={() => handleOpenReview(item)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 sm:w-auto"
                    >
                      <Pencil size={15} />

                      {hasExistingReview(item.id)
                        ? "Edit Review"
                        : "Review"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">
              Order total
            </span>

            <span className="text-2xl font-extrabold text-green-600">
              ₹{Number(order.total).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={downloadInvoice}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs font-bold text-green-700 transition hover:border-green-300 hover:bg-green-50 sm:text-sm"
            >
              <Download size={17} />
              Invoice
            </button>

            <button
              type="button"
              onClick={handleReorder}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-green-700 sm:text-sm"
            >
              <RotateCcw size={17} />
              Reorder
            </button>
          </div>
        </section>
      </div>

      {reviewingItem && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:px-4">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200 sm:hidden" />

            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
              Product review
            </p>

            <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
              {reviewingItem.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Share your experience with this delivered item.
            </p>

            <div className="mt-5 flex justify-center gap-2 sm:justify-start">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReviewRating(value)}
                    aria-label={`Rate ${value} stars`}
                  >
                    <Star
                      size={30}
                      className={
                        value <= reviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                );
              })}
            </div>

            <textarea
              value={reviewComment}
              onChange={(event) =>
                setReviewComment(event.target.value)
              }
              rows={4}
              placeholder="Write your review..."
              className="mt-5 w-full resize-none rounded-2xl border border-gray-200 p-4 text-sm outline-none transition focus:border-green-600 sm:text-base"
            />

            <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={() => setReviewingItem(null)}
                disabled={submittingReview}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submittingReview}
                onClick={handleSubmitReview}
                className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {submittingReview
                  ? "Saving..."
                  : hasExistingReview(reviewingItem.id)
                    ? "Save Changes"
                    : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {thankYouOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
              🎉
            </div>

            <h2 className="mt-4 text-xl font-extrabold">
              Thank you!
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Your review helps other Quickify customers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBadge({
  icon,
  text,
  tone = "default",
}: {
  icon?: React.ReactNode;
  text: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "bg-white text-green-700"
      : tone === "danger"
        ? "bg-red-100 text-red-700"
        : tone === "warning"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-white/15 text-white";

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur ${toneClass}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}

      <span className="truncate">
        {text}
      </span>
    </span>
  );
}
