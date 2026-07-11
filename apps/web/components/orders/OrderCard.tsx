"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Download,
  Pencil,
  RotateCcw,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { mapProduct } from "@/utils/mapProduct";
import { Product } from "@/types/product";
import { SupabaseProduct } from "@/types/supabaseProduct";
import { useCartStore } from "@/store/cartStore";

import { useRealtimeOrderTracking } from "@/hooks/useRealtimeOrderTracking";
import { upsertProductReview } from "@/services/reviewService";
import { useAuthStore } from "@/store/authStore";

import OrderStatusBadge from "./OrderStatusBadge";
import OrderItem from "./OrderItem";
import LiveDeliveryTracking from "./LiveDeliveryTracking";

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

type Props = {
  order: Order;
  highlighted?: boolean;
};

const steps = ["Placed", "Processing", "Packed", "Out for Delivery", "Delivered"];

export default function OrderCard({
    
  order,
  highlighted = false,
}: Props) {
    const router = useRouter();
const addItem = useCartStore((state) => state.addItem);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  

  const [reviewingItem, setReviewingItem] = useState<OrderItemType | null>(
    null
  );
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [reviewedItemIds, setReviewedItemIds] = useState<Set<number>>(
    new Set()
  );

  const currentIndex = steps.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";
  const isDelivered = order.status === "Delivered";
  const orderItemIds = order.order_items.map((item) => item.id);
  const [highlightVisible, setHighlightVisible] = useState(highlighted);
const cardRef = useRef<HTMLDivElement>(null);

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

    for (let i = 0; i < item.quantity; i += 1) {
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
    toast.error(`${skippedCount} item(s) could not be added due to stock`);
  }

  if (addedCount === 0 && skippedCount === 0) {
    toast.error("No items available to reorder");
  }
}
useEffect(() => {
  if (!highlighted) return;

  cardRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  setHighlightVisible(true);

  const timer = setTimeout(() => {
    setHighlightVisible(false);
  }, 2200);

  return () => clearTimeout(timer);
}, [highlighted]);

const { data: alreadyReviewedIds = [] } = useQuery({
  queryKey: ["reviewed-order-items", order.id, user?.id],
  queryFn: async () => {
    if (!user || orderItemIds.length === 0) return [];

    const { data, error } = await supabase
      .from("product_reviews")
      .select("order_item_id, rating, comment")
      .eq("user_id", user.id)
      .in("order_item_id", orderItemIds);

    if (error) throw error;
    

    return data ?? [];
  },
  enabled: !!user && orderItemIds.length > 0,
});
function getExistingReview(itemId: number) {
  return alreadyReviewedIds.find((review) => review.order_item_id === itemId);
}

function hasExistingReview(itemId: number) {
  return reviewedItemIds.has(itemId) || !!getExistingReview(itemId);
}

  const tracking = useRealtimeOrderTracking(order.id, {
    delivery_latitude: order.delivery_latitude,
    delivery_longitude: order.delivery_longitude,
    delivery_location_updated_at: order.delivery_location_updated_at,
    estimated_delivery_minutes: order.estimated_delivery_minutes,
  });

  const address = Array.isArray(order.addresses)
    ? order.addresses[0]
    : order.addresses;

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

      setReviewedItemIds((prev) => new Set(prev).add(reviewingItem.id));

      queryClient.invalidateQueries({
        queryKey: ["product-reviews", reviewingItem.product_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["product", reviewingItem.product_id],
      });
      queryClient.invalidateQueries({
  queryKey: ["reviewed-order-items", order.id, user.id],
});

      setReviewingItem(null);
      setReviewComment("");
      setReviewRating(5);

      setThankYouOpen(true);

      setTimeout(() => {
        setThankYouOpen(false);
      }, 1800);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  }

  function downloadInvoice() {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) return;

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
              ${item.variant_name ? `<br/><small>${item.variant_name}</small>` : ""}
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
            body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #16a34a; padding-bottom: 18px; }
            .brand { font-size: 32px; font-weight: bold; color: #16a34a; }
            .muted { color: #6b7280; font-size: 14px; }
            .section { padding: 14px 16px; background: #f9fafb; border-radius: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { background: #ecfdf5; color: #166534; }
            th, td { padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }
            .summary { margin-top: 24px; margin-left: auto; width: 320px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand { font-size: 22px; font-weight: bold; border-top: 2px solid #111827; margin-top: 8px; padding-top: 12px; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 13px; }
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
              <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div class="grid">
            <div class="section">
                <h3 style="margin:0 0 8px;font-size:16px;">Bill To</h3>
                <p style="margin:2px 0;"><strong>${customerName}</strong></p>
                <p style="margin:2px 0;">${address?.phone ?? ""}</p>
            </div>

            <div class="section">
                <h3 style="margin:0 0 8px;font-size:16px;">Delivery Address</h3>
                <p style="margin:2px 0;">${fullAddress || "Address not available"}</p>
            </div>

            <div class="section">
                <h3 style="margin:0 0 8px;font-size:16px;">Delivery Slot</h3>
                <p style="margin:2px 0;">
                ${order.delivery_slot ?? "Express Delivery"}
                </p>
            </div>
            </div>
            <div class="section">
            <h3 style="margin:0 0 8px;font-size:16px;">Delivery Address</h3>
            <p style="margin:2px 0;">${fullAddress || "Address not available"}</p>
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
            <tbody>${itemsHtml}</tbody>
          </table>

          <div class="summary">
            <div class="row"><span>Subtotal</span><strong>₹${order.subtotal ?? order.total}</strong></div>
            <div class="row"><span>Delivery Fee</span><strong>₹${order.delivery_fee ?? 0}</strong></div>
            <div class="row"><span>Platform Fee</span><strong>₹${order.platform_fee ?? 0}</strong></div>
            <div class="row"><span>Discount</span><strong>-₹${order.discount ?? 0}</strong></div>
            <div class="row grand"><span>Grand Total</span><span>₹${order.total}</span></div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with Quickify.</p>
            <p>This is a computer-generated invoice.</p>
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `);

    invoiceWindow.document.close();
  }

  return (
    <div
  ref={cardRef}
  className={`rounded-3xl bg-white p-6 shadow-sm transition-all duration-500 ${
    highlightVisible ? "ring-4 ring-green-500 shadow-2xl" : ""
  }`}
>
  <div className="flex items-start justify-between gap-4">
  <div>
    <h2 className="text-xl font-bold">Order #{order.id}</h2>

    <p className="text-sm text-gray-500">
      {new Date(order.created_at).toLocaleString()}
    </p>

    <div className="mt-4 flex flex-wrap items-center gap-2">
      {order.delivery_slot && (
        <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-green-700">
          <CalendarClock size={18} />
          <span className="text-sm font-bold">{order.delivery_slot}</span>
        </div>
      )}
      
      <span className="inline-flex h-7 items-center rounded-full bg-blue-50 px-3 text-xs font-bold text-blue-700">
        {order.payment_method}
      </span>

      <span
        className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ${
          order.payment_status === "Paid"
            ? "bg-green-100 text-green-700"
            : order.payment_status === "Failed"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {order.payment_status ?? "Pending"}
      </span>
    </div>
  </div>

  {/* SCALE & POSITION: Wrapped the component to increase size and control top spacing */}
  <div className="scale-110 transform origin-top-right mt-1">
    <OrderStatusBadge status={order.status} />
  </div>
</div>

  <div className="mt-6 rounded-2xl bg-gray-50 p-5">
    <h3 className="mb-5 font-bold">Order Tracking</h3>

    {isCancelled ? (
      <p className="font-semibold text-red-600">
        This order has been cancelled.
      </p>
    ) : (
      <div className="grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => {
          const completed = index <= currentIndex;

          return (
            <div key={step} className="flex items-center gap-3">
              {completed ? (
                <CheckCircle2 className="text-green-600" size={24} />
              ) : (
                <Circle className="text-gray-300" size={24} />
              )}

              <span
                className={`font-semibold ${
                  completed ? "text-green-700" : "text-gray-400"
                    }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    )}
  </div>

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

  <div className="mt-6 space-y-3">
    {order.order_items.map((item) => (
      <div key={item.id} className="rounded-2xl border bg-gray-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <OrderItem item={item} />

          {isDelivered && (
            <button
              onClick={() => {
                const existingReview = getExistingReview(item.id);

                setReviewingItem(item);
                setReviewRating(existingReview?.rating ?? 5);
                setReviewComment(existingReview?.comment ?? "");
              }}
              className="flex shrink-0 items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
            >
              <Pencil size={16} />
              {hasExistingReview(item.id) ? "Edit Review" : "Review"}
            </button>
          )}
        </div>
      </div>
    ))}
  </div>

  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
    <div className="flex flex-wrap gap-3">
      <button
        onClick={downloadInvoice}
        className="flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold text-green-700 hover:bg-green-50"
      >
        <Download size={18} />
        Download Invoice
      </button>
    <button
      onClick={handleReorder}
      className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
    >
      <RotateCcw size={18} />
      Reorder
    </button>
  </div>

  <span className="text-xl font-bold text-green-600">
    ₹{order.total}
  </span>
</div>

      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Review {reviewingItem.name}</h2>

            <p className="mt-2 text-gray-500">
              Share your experience with this delivered item.
            </p>

            <div className="mt-5 flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReviewRating(value)}
                  >
                    <Star
                      size={28}
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
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              placeholder="Write your review..."
              className="mt-5 w-full rounded-xl border p-4 outline-none focus:border-green-600"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewingItem(null)}
                className="rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submittingReview}
                onClick={handleSubmitReview}
                className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-300"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
          <div className="rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              🎉
            </div>

            <h2 className="mt-4 text-2xl font-bold">Thank you!</h2>

            <p className="mt-2 text-gray-500">
              Your review helps other Quickify customers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}