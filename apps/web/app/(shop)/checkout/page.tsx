"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CreditCard,
  Home,
  MapPin,
  Ticket,
  Wallet,
  X,
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

export default function CheckoutPage() {
  const addNotification = useNotificationStore(
  (state) => state.addNotification
);
  const router = useRouter();

  const { items, totalPrice, clearCart } = useCart();
  const user = useAuthStore((state) => state.user);
  const selectedAddress = useAddressStore((state) => state.selectedAddress);

  const [couponInput, setCouponInput] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash on Delivery" | "Online"
  >("Cash on Delivery");

  const couponCode = useCouponStore((state) => state.code);
  const discount = useCouponStore((state) => state.discount);
  const applyCoupon = useCouponStore((state) => state.applyCoupon);
  const couponLoading = useCouponStore((state) => state.loading);
  const clearCoupon = useCouponStore((state) => state.clearCoupon);

  const deliveryFee = totalPrice > 199 ? 0 : 25;
  const platformFee = 5;
  const grandTotal = Math.max(
    0,
    totalPrice + deliveryFee + platformFee - discount
  );

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
}else {
      toast.error(result.message);
    }
  }

  async function placeCODOrder() {
    await createOrder({
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
    });

    clearCart();
    clearCoupon();

    toast.success("Order placed successfully");
    addNotification({
  type: "order",
  title: "Order Placed",
  message: "Your order has been placed successfully.",
});
    router.push("/order-success");
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
      name: "Quickify",
      description: "Order Payment",
      order_id: razorpayOrder.id,

      handler: async function (response: RazorpayPaymentResponse) {
        try {
          const verification = await verifyRazorpayPayment(response);

          if (!verification.success) {
            toast.error("Payment verification failed");
            return;
          }

          await createOrder({
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
          });
          addNotification({
  type: "order",
  title: "Payment Successful",
  message: "Your online payment was successful.",
});

addNotification({
  type: "order",
  title: "Order Placed",
  message: "Your order has been placed successfully.",
});

          clearCart();
          clearCoupon();

          toast.success("Payment successful. Order placed!");
          router.push("/order-success");
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
        await placeCODOrder();
        return;
      }

      await placeOnlineOrder();
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order");
      setPlacingOrder(false);
    }
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
                          Delivering in 10–15 minutes
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

            <div className="mt-6 rounded-2xl border bg-green-50 p-4">
              <div className="mb-3 flex items-center gap-2 font-bold text-green-700">
                <Ticket size={18} />
                Apply Coupon
              </div>

              {couponCode ? (
                <div className="flex items-center justify-between rounded-xl bg-white p-3">
                  <div>
                    <p className="font-bold">{couponCode}</p>
                    <p className="text-sm text-green-700">
                      ₹{discount} discount applied
                    </p>
                  </div>

                  <button
                    onClick={clearCoupon}
                    className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="WELCOME50"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
                  />

                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="rounded-xl bg-green-600 px-5 font-bold text-white hover:bg-green-700 disabled:bg-gray-300"
                  >
                    {couponLoading ? "Checking..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t pt-5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between border-t pt-4 text-xl font-bold">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={items.length === 0 || placingOrder}
              className="mt-6 w-full rounded-2xl bg-green-600 py-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {placingOrder
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