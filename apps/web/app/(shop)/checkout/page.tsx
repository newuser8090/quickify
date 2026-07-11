"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  calculateCouponDiscount,
  getCoupons,
  type Coupon,
} from "@/services/couponService";
import { getStoreSettings } from "@/services/storeSettingsService";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  Home,
  MapPin,
  Ticket,
  Wallet,
  X,
  Zap,
  Lock,
} from "lucide-react";

import useCart from "@/hooks/useCart";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { useCouponStore } from "@/store/couponStore";
import { createOrder } from "@/services/orderService";
import { validateCartStock } from "@/services/stockService";
import { useNotificationStore } from "@/store/notificationStore";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/services/razorpayService";
type DeliverySlot = {
  id: string;
  label: string;
  time: string;
  description: string;
  icon: "zap" | "calendar";
  recommended?: boolean;
};

const scheduledDeliverySlots: DeliverySlot[] = [
  {
    id: "today-evening-1",
    label: "Today Evening",
    time: "6:00 PM – 7:00 PM",
    description: "Schedule for later today",
    icon: "calendar",
  },
  {
    id: "today-evening-2",
    label: "Today Night",
    time: "7:00 PM – 8:00 PM",
    description: "Convenient evening delivery",
    icon: "calendar",
  },
  {
    id: "tomorrow-morning",
    label: "Tomorrow Morning",
    time: "8:00 AM – 10:00 AM",
    description: "Fresh start delivery",
    icon: "calendar",
  },
  {
    id: "tomorrow-afternoon",
    label: "Tomorrow Afternoon",
    time: "2:00 PM – 4:00 PM",
    description: "Planned afternoon delivery",
    icon: "calendar",
  },
];
function getCouponSaving(
  coupon: Coupon,
  orderAmount: number
) {
  return calculateCouponDiscount(
    coupon,
    orderAmount
  );
}

function getCouponOfferLabel(coupon: Coupon) {
  if (
    coupon.discount_type === "percentage"
  ) {
    return `${
      coupon.discount_percentage ?? 0
    }% off`;
  }

  return `₹${Number(
    coupon.discount ?? 0
  ).toLocaleString("en-IN")} off`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  async function handleApplySuggestedCoupon(code: string) {
  const result = await applyCoupon(code, totalPrice);

  if (result.success) {
    toast.success(`${code} applied successfully`);

    addNotification({
      type: "coupon",
      title: "Coupon Applied",
      message: `${code} applied successfully.`,
    });
  } else {
    toast.error(result.message);
  }
}
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  const { items, totalPrice, clearCart } = useCart();
  const user = useAuthStore((state) => state.user);
  const selectedAddress = useAddressStore((state) => state.selectedAddress);

  const [couponInput, setCouponInput] = useState("");
const [placingOrder, setPlacingOrder] = useState(false);
const [selectedDeliverySlotId, setSelectedDeliverySlotId] =
  useState("express");

  const { data: coupons = [] } = useQuery({
    queryKey: ["checkout-coupons"],
    queryFn: getCoupons,
  });

const { data: storeSettings, isLoading: settingsLoading } = useQuery({
  queryKey: ["store-settings"],
  queryFn: getStoreSettings,
});

const deliverySlots: DeliverySlot[] = [
  {
    id: "express",
    label: "Express Delivery",
    time: storeSettings?.default_delivery_time ?? "10–15 minutes",
    description: "Fastest delivery available",
    icon: "zap",
    recommended: true,
  },
  ...scheduledDeliverySlots,
];

const selectedDeliverySlot: DeliverySlot =
  deliverySlots.find((slot) => slot.id === selectedDeliverySlotId) ?? {
    id: "express",
    label: "Express Delivery",
    time: storeSettings?.default_delivery_time ?? "10–15 minutes",
    description: "Fastest delivery available",
    icon: "zap",
    recommended: true,
  };

  const [paymentMethod, setPaymentMethod] = useState<
    "Cash on Delivery" | "Online"
  >("Cash on Delivery");

  const couponCode = useCouponStore(
  (state) => state.code
);

const discount = useCouponStore(
  (state) => state.discount
);

const couponDiscountType = useCouponStore(
  (state) => state.discountType
);

const couponDiscountValue = useCouponStore(
  (state) => state.discountValue
);
  const applyCoupon = useCouponStore((state) => state.applyCoupon);
  const couponLoading = useCouponStore((state) => state.loading);
  const clearCoupon = useCouponStore((state) => state.clearCoupon);

  const configuredDeliveryFee = Number(storeSettings?.delivery_fee ?? 25);
const freeDeliveryThreshold = Number(
  storeSettings?.free_delivery_threshold ?? 199
);
const platformFee = Number(storeSettings?.platform_fee ?? 5);
const taxPercentage = Number(storeSettings?.tax_percentage ?? 0);

const deliveryFee =
  totalPrice >= freeDeliveryThreshold ? 0 : configuredDeliveryFee;

const discountedSubtotal = Math.max(0, totalPrice - discount);
const taxAmount = Number(
  ((discountedSubtotal * taxPercentage) / 100).toFixed(2)
);
const now = new Date();

const availableCoupons = coupons.filter(
  (coupon) => {
    const notExpired =
      !coupon.expires_at ||
      new Date(coupon.expires_at) >= now;

    return coupon.is_active && notExpired;
  }
);

const applicableCoupons = availableCoupons
  .filter(
    (coupon) =>
      totalPrice >=
      Number(coupon.min_order_value)
  )
  .sort(
    (firstCoupon, secondCoupon) =>
      getCouponSaving(
        secondCoupon,
        totalPrice
      ) -
      getCouponSaving(
        firstCoupon,
        totalPrice
      )
  );

const bestCoupon =
  applicableCoupons[0] ?? null;

const nextCoupon = availableCoupons
  .filter(
    (coupon) =>
      totalPrice <
      Number(coupon.min_order_value)
  )
  .sort(
    (firstCoupon, secondCoupon) =>
      Number(
        firstCoupon.min_order_value
      ) -
      Number(
        secondCoupon.min_order_value
      )
  )[0];

const bestCouponSaving = bestCoupon
  ? getCouponSaving(bestCoupon, totalPrice)
  : 0;

const nextCouponSaving = nextCoupon
  ? getCouponSaving(
      nextCoupon,
      Number(nextCoupon.min_order_value)
    )
  : 0;

const amountNeededForNextCoupon = nextCoupon
  ? Math.max(0, Number(nextCoupon.min_order_value) - totalPrice)
  : 0;
const grandTotal = Math.max(
  0,
  totalPrice + deliveryFee + platformFee + taxAmount - discount
);

const currencySymbol =
  storeSettings?.currency === "USD"
    ? "$"
    : storeSettings?.currency === "EUR"
      ? "€"
      : "₹";

  const deliverySlotText = `${selectedDeliverySlot.label} • ${selectedDeliverySlot.time}`;

  async function handleApplyCoupon() {
    if (!couponInput.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    const result = await applyCoupon(couponInput, totalPrice);

    if (result.success) {
      toast.success(result.message);

      addNotification({
        type: "coupon",
        title: "Coupon Applied",
        message: `${couponInput.toUpperCase()} applied successfully.`,
      });

      setCouponInput("");
    } else {
      toast.error(result.message);
    }
  }

  async function placeCODOrder() {
    const orderId = await createOrder({
      userId: user!.id,
      addressId: selectedAddress!.id,
      items,
      subtotal: totalPrice,
      deliveryFee,
      platformFee,
      discount,
      total: grandTotal,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      deliverySlot: deliverySlotText,
    });

    clearCart();
    clearCoupon();

    toast.success("Order placed successfully");


    return orderId;
  }

  async function placeOnlineOrder() {
    const razorpayOrder = await createRazorpayOrder(grandTotal);

    if (!window.Razorpay) {
      toast.error("Razorpay failed to load");
      setPlacingOrder(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: storeSettings?.store_name ?? "Quickify",
      description: "Order Payment",
      order_id: razorpayOrder.id,

      handler: async function (response: RazorpayPaymentResponse) {
        try {
          const verification = await verifyRazorpayPayment(response);

          if (!verification.success) {
            toast.error("Payment verification failed");
            return;
          }

          const orderId = await createOrder({
            userId: user!.id,
            addressId: selectedAddress!.id,
            items,
            subtotal: totalPrice,
            deliveryFee,
            platformFee,
            discount,
            total: grandTotal,
            paymentMethod: "Online",
            paymentStatus: "Paid",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            deliverySlot: deliverySlotText,
          });

          clearCart();
          clearCoupon();

          toast.success("Payment successful. Order placed!");
          await queryClient.invalidateQueries({
  queryKey: ["orders", user!.id],
});

await queryClient.invalidateQueries({
  queryKey: ["admin-orders"],
});
          router.push(`/order-success?orderId=${orderId}`);
        } catch (error) {
          console.error(error);
          toast.error("Failed to place order after payment");
        } finally {
          setPlacingOrder(false);
        }
      },

      prefill: {
        name: selectedAddress!.full_name,
        email: user?.email ?? "",
        contact: selectedAddress!.phone,
      },

      theme: {
        color: "#16a34a",
      },

      modal: {
        ondismiss: function () {
          toast.error("Payment cancelled");
          setPlacingOrder(false);
        },
      },
    });

    razorpay.open();
  }

  async function handlePlaceOrder() {
    if (!user) {
      toast.error("Please login to place order");
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    try {
      setPlacingOrder(true);

      const validation = await validateCartStock(items);

      if (!validation.valid) {
        validation.issues.forEach((issue) => toast.error(issue));
        setPlacingOrder(false);
        return;
      }

      if (paymentMethod === "Cash on Delivery") {
        const orderId = await placeCODOrder();
        queryClient.invalidateQueries({ queryKey: ["orders", user!.id] });
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        router.push(`/order-success?orderId=${orderId}`);
        return;
      }

      await placeOnlineOrder();
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order");
      setPlacingOrder(false);
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-3xl text-center">
            <h1 className="text-4xl font-bold">Login required</h1>

            <p className="mt-3 text-gray-500">
              Please login to continue checkout and select your delivery address.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Login to Checkout
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-green-700"
        >
          <ArrowLeft size={18} />
          Back to shopping
        </Link>

        <h1 className="text-4xl font-bold">Checkout</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <MapPin className="text-green-600" />
                <h2 className="text-2xl font-bold">Delivery Address</h2>
              </div>

              <div className="mt-5 rounded-2xl border p-5">
                {selectedAddress ? (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Home className="mt-1 text-green-600" />

                      <div>
                        <h3 className="font-bold">{selectedAddress.label}</h3>
                        <p className="mt-1 font-medium">
                          {selectedAddress.full_name}
                        </p>
                        <p className="mt-1 text-gray-600">
                          {selectedAddress.address_line}
                        </p>

                        {selectedAddress.landmark && (
                          <p className="text-gray-600">
                            {selectedAddress.landmark}
                          </p>
                        )}

                        <p className="text-gray-600">
                          {selectedAddress.city}, {selectedAddress.state} -{" "}
                          {selectedAddress.pincode}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {selectedAddress.phone}
                        </p>

                        <p className="mt-2 text-sm text-green-600">
                          Selected slot: {selectedDeliverySlot.time}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/addresses?mode=checkout"
                      className="rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50"
                    >
                      Change
                    </Link>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-500">
                      No delivery address selected.
                    </p>

                    <Link
                      href="/addresses"
                      className="mt-4 inline-block rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                    >
                      Add Address
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <CalendarClock className="text-green-600" />
                <h2 className="text-2xl font-bold">Choose Delivery Slot</h2>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {deliverySlots.map((slot) => {
                  const selected = selectedDeliverySlot.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedDeliverySlotId(slot.id)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-green-600 bg-green-50 ring-2 ring-green-100"
                          : "bg-white hover:border-green-300 hover:bg-green-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-2xl p-3 ${
                            selected
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-green-700"
                          }`}
                        >
                          {slot.icon === "zap" ? (
                            <Zap size={20} />
                          ) : (
                            <CalendarClock size={20} />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold">{slot.label}</h3>

                            {slot.recommended && (
                              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                                Recommended
                              </span>
                            )}
                          </div>

                          <p className="mt-1 font-semibold text-green-700">
                            {slot.time}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {slot.description}
                          </p>
                        </div>

                        <div
                          className={`mt-1 h-5 w-5 rounded-full border ${
                            selected
                              ? "border-green-600 bg-green-600"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <CreditCard className="text-green-600" />
                <h2 className="text-2xl font-bold">Payment Method</h2>
              </div>

              <div className="mt-5 space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border p-5">
                  <div className="flex items-center gap-3">
                    <Wallet className="text-green-600" />
                    <span className="font-semibold">Cash on Delivery</span>
                  </div>

                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "Cash on Delivery"}
                    onChange={() => setPaymentMethod("Cash on Delivery")}
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border p-5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-green-600" />
                    <span className="font-semibold">Pay Online</span>
                  </div>

                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "Online"}
                    onChange={() => setPaymentMethod("Online")}
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Order Summary</h2>

            <div className="mt-5 space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.cartKey}
                    className="flex justify-between border-b pb-3"
                  >
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>

                      {item.variantName && (
                        <p className="text-sm font-medium text-green-700">
                          {item.variantName}
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        {item.unit} • Qty: {item.quantity}
                      </p>
                    </div>

                    <span className="font-bold">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-green-50 p-4">
              <p className="text-sm text-gray-500">Delivery Slot</p>
              <p className="mt-1 font-bold text-green-700">
                {selectedDeliverySlot.label}
              </p>
              <p className="text-sm text-gray-600">
                {selectedDeliverySlot.time}
              </p>
            </div>
           {/* 1. RECOMMENDED COUPON (BEST SAVINGS) */}
{!couponCode && bestCoupon && (
  <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/40 shadow-sm transition-all duration-300 hover:shadow-md">
    {/* Header Section */}
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 bg-white">
      <div className="flex items-center gap-2.5">
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-black tracking-wider text-emerald-700 uppercase">
          Best Savings
        </div>
        <p className="text-xs font-semibold text-gray-700">
          Recommended for your cart
        </p>
      </div>
      <Ticket size={16} className="text-emerald-600" />
    </div>

    {/* Content Section */}
    <div className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Coupon Code
          </p>
          
          <div className="mt-1.5 inline-flex items-center justify-center rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-1.5">
            <h3 className="font-mono text-xl font-bold tracking-widest text-emerald-800">
              {bestCoupon.code}
            </h3>
          </div>
          <p className="mt-2 text-sm font-bold text-emerald-700">
  {getCouponOfferLabel(bestCoupon)}
</p>

          <p className="mt-2.5 text-xs text-gray-500">
            Valid on orders above {currencySymbol}{bestCoupon.min_order_value}
          </p>
        </div>

        {/* Highlighted Savings Tag */}
        <div className="flex flex-col items-end shrink-0 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            You Save
          </span>
          <span className="text-lg font-extrabold text-emerald-600 mt-0.5">
  {currencySymbol}
  {bestCouponSaving.toLocaleString(
    "en-IN"
  )}
</span>
        </div>
      </div>

      {/* Premium Action Button */}
      <button
        type="button"
        onClick={() => handleApplySuggestedCoupon(bestCoupon.code)}
        disabled={couponLoading}
        className="mt-5 w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
      >
        {couponLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Applying...
          </span>
        ) : (
          `Apply Code ${bestCoupon.code}`
        )}
      </button>
    </div>
  </div>
)}

{/* 2. MILESTONE UNLOCK BADGE */}
{!couponCode && !bestCoupon && nextCoupon && (
  <div className="mt-6 rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 p-5 shadow-sm transition-all duration-300">
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
        <Lock size={16} className="animate-pulse" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-amber-800 tracking-tight">
          Add {currencySymbol}{amountNeededForNextCoupon} more to unlock
        </p>

        <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
          Unlock exclusive coupon{" "}
          <span className="inline-block font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-dashed border-amber-200 text-[11px] tracking-wider mx-0.5">
            {nextCoupon.code}
          </span>{" "}
          to save an extra{" "}
<strong className="font-semibold text-gray-700">
  {currencySymbol}
  {nextCouponSaving.toLocaleString(
    "en-IN"
  )}
</strong>{" "}
with {getCouponOfferLabel(nextCoupon)}.
        </p>

        <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: '70%' }}
          />
        </div>
      </div>
    </div>
  </div>
)}

{/* 3. ALTERNATIVE APPLICABLE COUPONS */}
{!couponCode && applicableCoupons.length > 1 && (
  <div className="mt-6">
    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
      Other applicable coupons
    </p>

    <div className="space-y-2.5">
      {applicableCoupons.slice(1, 4).map((coupon) => (
        <div
          key={coupon.id}
          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-gray-200"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Clean Mini Ticket Visual */}
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-2.5 py-1">
              <p className="font-mono text-xs font-bold text-gray-700 tracking-wider">
                {coupon.code}
              </p>
            </div>
            <div className="min-w-0">
  <p className="truncate text-xs font-bold text-emerald-700">
    {getCouponOfferLabel(coupon)}
  </p>

  <p className="truncate text-xs font-medium text-emerald-600">
    You save {currencySymbol}
    {getCouponSaving(
      coupon,
      totalPrice
    ).toLocaleString("en-IN")}
  </p>
</div>
          </div>

          <button
            type="button"
            onClick={() => handleApplySuggestedCoupon(coupon.code)}
            className="rounded-xl border border-emerald-600 px-3.5 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 active:scale-[0.97]"
          >
            Apply
          </button>
        </div>
      ))}
    </div>
  </div>
)}

{/* 4. MANUAL INPUT / ACTIVE STATUS PANEL */}
<div className="mt-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
  <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
    <Ticket size={14} className="text-emerald-600" />
    Apply Coupon Manually
  </div>

  {couponCode ? (
    /* Applied Active Success UI Box */
    <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 transition-all duration-200">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-bold text-emerald-800 tracking-wide">
            {couponCode}
          </span>
          <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            Applied
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-emerald-700">
  {couponDiscountType === "percentage"
    ? `${couponDiscountValue}% off • `
    : ""}
  You saved {currencySymbol}
  {discount.toLocaleString("en-IN")}
</p>
      </div>

      <button
        type="button"
        onClick={clearCoupon}
        className="rounded-xl bg-white border border-gray-100 p-2 text-gray-400 shadow-sm transition-all hover:bg-gray-50 hover:text-red-500"
        title="Remove coupon"
      >
        <X size={15} />
      </button>
    </div>
  ) : (
    /* Input Field Shell Row */
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value)}
          placeholder="Enter custom coupon code..."
          className="w-full rounded-2xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-sm font-medium tracking-wide outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:shadow-inner"
        />
      </div>

      <button
        type="button"
        onClick={handleApplyCoupon}
        disabled={couponLoading || !couponInput.trim()}
        className="rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
      >
        {couponLoading ? "..." : "Apply"}
      </button>
    </div>
  )}
</div>

            <div className="mt-6 space-y-3 border-t pt-5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
  {currencySymbol}
  {totalPrice}
</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
  {deliveryFee === 0 ? "FREE" : `${currencySymbol}${deliveryFee}`}
</span>
              </div>

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>
  {currencySymbol}
  {platformFee}
</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({taxPercentage}%)</span>
                  <span>
                    {currencySymbol}
                    {taxAmount}
                  </span>
                </div>
              )}

              {discount > 0 && (
  <div className="rounded-xl bg-green-50 px-3 py-2 text-green-700">
    <div className="flex justify-between font-semibold">
      <span>
        Coupon Savings
        {couponDiscountType ===
          "percentage" &&
          ` (${couponDiscountValue}% off)`}
      </span>

      <span>
        -{currencySymbol}
        {discount.toLocaleString(
          "en-IN"
        )}
      </span>
    </div>

    <p className="mt-1 text-xs">
      You saved {currencySymbol}
      {discount.toLocaleString("en-IN")} on
      this order.
    </p>
  </div>
)}

              <div className="flex justify-between border-t pt-4 text-xl font-bold">
                <span>Total</span>
                <span>
  {currencySymbol}
  {grandTotal}
</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={items.length === 0 || placingOrder || settingsLoading}
              className="mt-6 w-full rounded-2xl bg-green-600 py-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {settingsLoading
  ? "Loading Checkout..."
  : placingOrder
    ? paymentMethod === "Online"
      ? "Processing Payment..."
      : "Placing Order..."
    : paymentMethod === "Online"
      ? "Pay & Place Order"
      : "Place Order"}
            </button>
          </aside>
        </div>
      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </main>
  );
}