"use client";

import {
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  useRouter,
} from "next/navigation";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Home,
  Lock,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Truck,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import { toast } from "sonner";

import useCart from "@/hooks/useCart";
import {
  calculateCouponDiscount,
  getCoupons,
  type Coupon,
} from "@/services/couponService";
import { createOrder } from "@/services/orderService";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/services/razorpayService";
import { getStoreSettings } from "@/services/storeSettingsService";
import { validateCartStock } from "@/services/stockService";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { useCouponStore } from "@/store/couponStore";
import { useNotificationStore } from "@/store/notificationStore";

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

function getCouponOfferLabel(
  coupon: Coupon
) {
  if (
    coupon.discount_type ===
    "percentage"
  ) {
    return `${
      coupon.discount_percentage ??
      0
    }% off`;
  }

  return `₹${Number(
    coupon.discount ?? 0
  ).toLocaleString("en-IN")} off`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient =
    useQueryClient();

  const {
    items,
    totalPrice,
    clearCart,
  } = useCart();

  const user = useAuthStore(
    (state) => state.user
  );

  const selectedAddress =
    useAddressStore(
      (state) =>
        state.selectedAddress
    );

  const addNotification =
    useNotificationStore(
      (state) =>
        state.addNotification
    );

  const couponCode =
    useCouponStore(
      (state) => state.code
    );

  const discount =
    useCouponStore(
      (state) => state.discount
    );

  const couponDiscountType =
    useCouponStore(
      (state) =>
        state.discountType
    );

  const couponDiscountValue =
    useCouponStore(
      (state) =>
        state.discountValue
    );

  const applyCoupon =
    useCouponStore(
      (state) =>
        state.applyCoupon
    );

  const couponLoading =
    useCouponStore(
      (state) => state.loading
    );

  const clearCoupon =
    useCouponStore(
      (state) =>
        state.clearCoupon
    );

  const [
    couponInput,
    setCouponInput,
  ] = useState("");

  const [
    placingOrder,
    setPlacingOrder,
  ] = useState(false);

  const [
    selectedDeliverySlotId,
    setSelectedDeliverySlotId,
  ] = useState("express");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<
    "Cash on Delivery" | "Online"
  >("Cash on Delivery");

  const {
    data: coupons = [],
  } = useQuery({
    queryKey: [
      "checkout-coupons",
    ],
    queryFn: getCoupons,
  });

  const {
    data: storeSettings,
    isLoading: settingsLoading,
  } = useQuery({
    queryKey: [
      "store-settings",
    ],
    queryFn: getStoreSettings,
  });

  const fallbackDeliverySlot: DeliverySlot = {
  id: "express",
  label: "Express Delivery",
  time:
    storeSettings
      ?.default_delivery_time ??
    "10–15 minutes",
  description:
    "Fastest delivery available",
  icon: "zap",
  recommended: true,
};

const deliverySlots: DeliverySlot[] = [
  fallbackDeliverySlot,
  ...scheduledDeliverySlots,
];

const selectedDeliverySlot: DeliverySlot =
  deliverySlots.find(
    (slot) =>
      slot.id ===
      selectedDeliverySlotId
  ) ?? fallbackDeliverySlot;

  const configuredDeliveryFee =
    Number(
      storeSettings
        ?.delivery_fee ?? 25
    );

  const freeDeliveryThreshold =
    Number(
      storeSettings
        ?.free_delivery_threshold ??
        199
    );

  const platformFee =
    Number(
      storeSettings
        ?.platform_fee ?? 5
    );

  const taxPercentage =
    Number(
      storeSettings
        ?.tax_percentage ?? 0
    );

  const deliveryFee =
    totalPrice >=
    freeDeliveryThreshold
      ? 0
      : configuredDeliveryFee;

  const discountedSubtotal =
    Math.max(
      0,
      totalPrice - discount
    );

  const taxAmount = Number(
    (
      (discountedSubtotal *
        taxPercentage) /
      100
    ).toFixed(2)
  );

  const grandTotal = Math.max(
    0,
    totalPrice +
      deliveryFee +
      platformFee +
      taxAmount -
      discount
  );

  const currencySymbol =
    storeSettings?.currency ===
    "USD"
      ? "$"
      : storeSettings
            ?.currency === "EUR"
        ? "€"
        : "₹";

  const deliverySlotText =
    `${selectedDeliverySlot.label} • ${selectedDeliverySlot.time}`;

  const availableCoupons =
    useMemo(() => {
      const now = new Date();

      return coupons.filter(
        (coupon) => {
          const notExpired =
            !coupon.expires_at ||
            new Date(
              coupon.expires_at
            ) >= now;

          return (
            coupon.is_active &&
            notExpired
          );
        }
      );
    }, [coupons]);

  const applicableCoupons =
    useMemo(
      () =>
        availableCoupons
          .filter(
            (coupon) =>
              totalPrice >=
              Number(
                coupon.min_order_value
              )
          )
          .sort(
            (
              firstCoupon,
              secondCoupon
            ) =>
              getCouponSaving(
                secondCoupon,
                totalPrice
              ) -
              getCouponSaving(
                firstCoupon,
                totalPrice
              )
          ),
      [
        availableCoupons,
        totalPrice,
      ]
    );

  const bestCoupon =
    applicableCoupons[0] ??
    null;

  const nextCoupon =
    useMemo(
      () =>
        availableCoupons
          .filter(
            (coupon) =>
              totalPrice <
              Number(
                coupon.min_order_value
              )
          )
          .sort(
            (
              firstCoupon,
              secondCoupon
            ) =>
              Number(
                firstCoupon.min_order_value
              ) -
              Number(
                secondCoupon.min_order_value
              )
          )[0] ?? null,
      [
        availableCoupons,
        totalPrice,
      ]
    );

  const bestCouponSaving =
    bestCoupon
      ? getCouponSaving(
          bestCoupon,
          totalPrice
        )
      : 0;

  const nextCouponSaving =
    nextCoupon
      ? getCouponSaving(
          nextCoupon,
          Number(
            nextCoupon.min_order_value
          )
        )
      : 0;

  const amountNeededForNextCoupon =
    nextCoupon
      ? Math.max(
          0,
          Number(
            nextCoupon.min_order_value
          ) - totalPrice
        )
      : 0;

  const freeDeliveryRemaining =
    Math.max(
      0,
      freeDeliveryThreshold -
        totalPrice
    );

  async function applySuggestedCoupon(
    code: string
  ) {
    const result =
      await applyCoupon(
        code,
        totalPrice
      );

    if (result.success) {
      toast.success(
        `${code} applied successfully`
      );

      addNotification({
        type: "coupon",
        title: "Coupon Applied",
        message:
          `${code} applied successfully.`,
      });

      return;
    }

    toast.error(result.message);
  }

  async function handleApplyCoupon() {
    const normalizedCode =
      couponInput
        .trim()
        .toUpperCase();

    if (!normalizedCode) {
      toast.error(
        "Enter a coupon code"
      );
      return;
    }

    const result =
      await applyCoupon(
        normalizedCode,
        totalPrice
      );

    if (result.success) {
      toast.success(
        result.message
      );

      addNotification({
        type: "coupon",
        title: "Coupon Applied",
        message:
          `${normalizedCode} applied successfully.`,
      });

      setCouponInput("");
      return;
    }

    toast.error(result.message);
  }

  async function placeCODOrder() {
    const orderId =
      await createOrder({
        userId: user!.id,
        addressId:
          selectedAddress!.id,
        items,
        subtotal: totalPrice,
        deliveryFee,
        platformFee,
        discount,
        total: grandTotal,
        paymentMethod:
          "Cash on Delivery",
        paymentStatus: "Pending",
        deliverySlot:
          deliverySlotText,
      });

    clearCart();
    clearCoupon();

    toast.success(
      "Order placed successfully"
    );

    return orderId;
  }

  async function placeOnlineOrder() {
    const razorpayOrder =
      await createRazorpayOrder(
        grandTotal
      );

    if (!window.Razorpay) {
      toast.error(
        "Razorpay failed to load"
      );

      setPlacingOrder(false);
      return;
    }

    const razorpay =
      new window.Razorpay({
        key:
          process.env
            .NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:
          razorpayOrder.amount,
        currency:
          razorpayOrder.currency,
        name:
          storeSettings
            ?.store_name ??
          "Quickify",
        description:
          "Order Payment",
        order_id:
          razorpayOrder.id,

        handler: async function (
          response:
            RazorpayPaymentResponse
        ) {
          try {
            const verification =
              await verifyRazorpayPayment(
                response
              );

            if (
              !verification.success
            ) {
              toast.error(
                "Payment verification failed"
              );
              return;
            }

            const orderId =
              await createOrder({
                userId: user!.id,
                addressId:
                  selectedAddress!
                    .id,
                items,
                subtotal:
                  totalPrice,
                deliveryFee,
                platformFee,
                discount,
                total:
                  grandTotal,
                paymentMethod:
                  "Online",
                paymentStatus:
                  "Paid",
                razorpayOrderId:
                  response.razorpay_order_id,
                razorpayPaymentId:
                  response.razorpay_payment_id,
                razorpaySignature:
                  response.razorpay_signature,
                deliverySlot:
                  deliverySlotText,
              });

            clearCart();
            clearCoupon();

            toast.success(
              "Payment successful. Order placed!"
            );

            await Promise.all([
              queryClient.invalidateQueries(
                {
                  queryKey: [
                    "orders",
                    user!.id,
                  ],
                }
              ),
              queryClient.invalidateQueries(
                {
                  queryKey: [
                    "admin-orders",
                  ],
                }
              ),
            ]);

            router.push(
              `/order-success?orderId=${orderId}`
            );
          } catch (error) {
            console.error(
              error
            );

            toast.error(
              "Failed to place order after payment"
            );
          } finally {
            setPlacingOrder(
              false
            );
          }
        },

        prefill: {
          name:
            selectedAddress!
              .full_name,
          email:
            user?.email ?? "",
          contact:
            selectedAddress!
              .phone,
        },

        theme: {
          color: "#16a34a",
        },

        modal: {
          ondismiss() {
            toast.error(
              "Payment cancelled"
            );

            setPlacingOrder(
              false
            );
          },
        },
      });

    razorpay.open();
  }

  async function handlePlaceOrder() {
    if (!user) {
      toast.error(
        "Please login to place order"
      );
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      toast.error(
        "Your cart is empty"
      );
      return;
    }

    if (!selectedAddress) {
      toast.error(
        "Please select a delivery address"
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const validation =
        await validateCartStock(
          items
        );

      if (!validation.valid) {
        validation.issues.forEach(
          (issue) =>
            toast.error(issue)
        );

        setPlacingOrder(false);
        return;
      }

      if (
        paymentMethod ===
        "Cash on Delivery"
      ) {
        const orderId =
          await placeCODOrder();

        await Promise.all([
          queryClient.invalidateQueries(
            {
              queryKey: [
                "orders",
                user.id,
              ],
            }
          ),
          queryClient.invalidateQueries(
            {
              queryKey: [
                "admin-orders",
              ],
            }
          ),
        ]);

        router.push(
          `/order-success?orderId=${orderId}`
        );

        return;
      }

      await placeOnlineOrder();
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to place order"
      );

      setPlacingOrder(false);
    }
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-lg sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
            <Lock size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
            Login required
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Sign in to select a delivery address and complete your order.
          </p>

          <Link
            href="/login"
            className="mt-6 flex w-full items-center justify-center rounded-2xl bg-green-600 py-3.5 font-extrabold text-white transition hover:bg-green-700"
          >
            Login to Checkout
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-50 pb-32 lg:pb-10">
      <section className="mx-auto w-full min-w-0 max-w-7xl px-2.5 py-3 sm:px-6 sm:py-8">
        <CheckoutHero />

        <CheckoutSteps
          hasAddress={
            Boolean(
              selectedAddress
            )
          }
          hasSlot={
            Boolean(
              selectedDeliverySlot
            )
          }
          hasPayment={
            Boolean(
              paymentMethod
            )
          }
        />

        <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:mt-5 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="min-w-0 space-y-3 sm:space-y-5">
            <CheckoutSection
              number="1"
              icon={<MapPin />}
              title="Delivery address"
              description="Choose where your order should arrive."
            >
              {selectedAddress ? (
                <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
                  <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
                      <Home size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-gray-900">
                          {
                            selectedAddress.label
                          }
                        </h3>

                        {selectedAddress.is_default && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
                            <BadgeCheck
                              size={12}
                            />
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm font-bold text-gray-800">
                        {
                          selectedAddress.full_name
                        }
                      </p>

                      <p className="mt-1 break-words text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
                        {
                          selectedAddress.address_line
                        }
                        {selectedAddress.landmark
                          ? `, ${selectedAddress.landmark}`
                          : ""}
                        ,{" "}
                        {
                          selectedAddress.city
                        }
                        ,{" "}
                        {
                          selectedAddress.state
                        }{" "}
                        -{" "}
                        {
                          selectedAddress.pincode
                        }
                      </p>

                      <p className="mt-2 text-xs font-medium text-gray-500">
                        {
                          selectedAddress.phone
                        }
                      </p>
                    </div>

                    <Link
                      href="/addresses?mode=checkout"
                      className="shrink-0 rounded-lg border border-green-200 bg-white px-2.5 py-2 text-[10px] font-bold text-green-700 transition hover:bg-green-50 sm:rounded-xl sm:px-3 sm:text-xs"
                    >
                      Change
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-green-700 shadow-sm">
                    <Clock3 size={15} />
                    Delivering via{" "}
                    {
                      selectedDeliverySlot.label
                    }
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/50 p-5 text-center">
                  <MapPin
                    size={28}
                    className="mx-auto text-green-600"
                  />

                  <h3 className="mt-3 font-extrabold text-gray-900">
                    No address selected
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Add or choose an address to continue.
                  </p>

                  <Link
                    href="/addresses?mode=checkout"
                    className="mt-4 inline-flex rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white"
                  >
                    Select Address
                  </Link>
                </div>
              )}
            </CheckoutSection>

            <CheckoutSection
              number="2"
              icon={
                <CalendarClock />
              }
              title="Delivery slot"
              description="Select a convenient delivery time."
            >
              <div className="hide-scrollbar flex w-full min-w-0 max-w-full gap-2.5 overflow-x-auto overscroll-x-contain pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible">
                {deliverySlots.map(
                  (slot) => {
                    const selected =
                      selectedDeliverySlot.id ===
                      slot.id;

                    return (
                      <motion.button
                        layout
                        key={slot.id}
                        type="button"
                        onClick={() =>
                          setSelectedDeliverySlotId(
                            slot.id
                          )
                        }
                        whileTap={{
                          scale: 0.98,
                        }}
                        className={`relative w-[190px] max-w-[82vw] shrink-0 overflow-hidden rounded-xl border p-3 text-left transition sm:w-[230px] sm:max-w-none sm:rounded-2xl sm:p-4 lg:w-auto ${
                          selected
                            ? "border-green-600 bg-green-50 shadow-sm ring-2 ring-green-100"
                            : "border-gray-200 bg-white hover:border-green-300"
                        }`}
                      >
                        {slot.recommended && (
                          <span className="absolute right-3 top-3 rounded-full bg-yellow-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-yellow-800">
                            Recommended
                          </span>
                        )}

                        <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl ${
                              selected
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-green-700"
                            }`}
                          >
                            {slot.icon ===
                            "zap" ? (
                              <Zap
                                size={18}
                              />
                            ) : (
                              <CalendarClock
                                size={18}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pr-3">
                            <h3 className="text-xs font-extrabold text-gray-900 sm:text-sm">
                              {
                                slot.label
                              }
                            </h3>

                            <p className="mt-0.5 text-xs font-bold text-green-700 sm:mt-1 sm:text-sm">
                              {
                                slot.time
                              }
                            </p>

                            <p className="mt-0.5 text-[10px] leading-4 text-gray-500 sm:mt-1 sm:text-xs sm:leading-5">
                              {
                                slot.description
                              }
                            </p>
                          </div>
                        </div>

                        <span
                          className={`absolute bottom-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-green-600 bg-green-600 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {selected && (
                            <Check
                              size={12}
                            />
                          )}
                        </span>
                      </motion.button>
                    );
                  }
                )}
              </div>
            </CheckoutSection>

            <CheckoutSection
              number="3"
              icon={<CreditCard />}
              title="Payment method"
              description="Choose how you want to pay."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <PaymentOption
                  selected={
                    paymentMethod ===
                    "Cash on Delivery"
                  }
                  icon={<Wallet />}
                  title="Cash on Delivery"
                  description="Pay when your order arrives."
                  badge="Simple"
                  onClick={() =>
                    setPaymentMethod(
                      "Cash on Delivery"
                    )
                  }
                />

                <PaymentOption
                  selected={
                    paymentMethod ===
                    "Online"
                  }
                  icon={
                    <CreditCard />
                  }
                  title="Pay Online"
                  description="Cards, UPI and more via Razorpay."
                  badge="Secure"
                  onClick={() =>
                    setPaymentMethod(
                      "Online"
                    )
                  }
                />
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-[11px] font-medium text-gray-500">
                <ShieldCheck
                  size={15}
                  className="text-green-600"
                />
                Payments are protected and securely processed.
              </div>
            </CheckoutSection>

            <CheckoutSection
              number="4"
              icon={<Ticket />}
              title="Coupons & offers"
              description="Apply the best available discount."
            >
              {!couponCode &&
                bestCoupon && (
                  <RecommendedCoupon
                    coupon={
                      bestCoupon
                    }
                    saving={
                      bestCouponSaving
                    }
                    currencySymbol={
                      currencySymbol
                    }
                    loading={
                      couponLoading
                    }
                    onApply={() =>
                      applySuggestedCoupon(
                        bestCoupon.code
                      )
                    }
                  />
                )}

              {!couponCode &&
                !bestCoupon &&
                nextCoupon && (
                  <CouponMilestone
                    coupon={
                      nextCoupon
                    }
                    amountNeeded={
                      amountNeededForNextCoupon
                    }
                    saving={
                      nextCouponSaving
                    }
                    totalPrice={
                      totalPrice
                    }
                    currencySymbol={
                      currencySymbol
                    }
                  />
                )}

              {!couponCode &&
                applicableCoupons.length >
                  1 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
                      More applicable coupons
                    </p>

                    <div className="space-y-2">
                      {applicableCoupons
                        .slice(1, 4)
                        .map(
                          (
                            coupon
                          ) => (
                            <div
                              key={
                                coupon.id
                              }
                              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3"
                            >
                              <div className="min-w-0">
                                <p className="font-mono text-sm font-extrabold tracking-wider text-gray-900">
                                  {
                                    coupon.code
                                  }
                                </p>

                                <p className="mt-1 text-xs font-semibold text-green-700">
                                  {getCouponOfferLabel(
                                    coupon
                                  )}{" "}
                                  • Save{" "}
                                  {
                                    currencySymbol
                                  }
                                  {getCouponSaving(
                                    coupon,
                                    totalPrice
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  applySuggestedCoupon(
                                    coupon.code
                                  )
                                }
                                className="shrink-0 rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-bold text-green-700"
                              >
                                Apply
                              </button>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                )}

              <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-3 sm:p-4">
                {couponCode ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-green-100 bg-green-50 p-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm font-extrabold tracking-wider text-green-800">
                          {
                            couponCode
                          }
                        </p>

                        <span className="rounded-full bg-green-600 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                          Applied
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-semibold text-green-700">
                        {couponDiscountType ===
                          "percentage" &&
                          `${couponDiscountValue}% off • `}
                        You saved{" "}
                        {
                          currencySymbol
                        }
                        {discount.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        clearCoupon
                      }
                      aria-label="Remove coupon"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-500 shadow-sm hover:text-red-500"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex min-w-0 gap-2">
                    <input
                      value={
                        couponInput
                      }
                      onChange={(
                        event
                      ) =>
                        setCouponInput(
                          event.target.value.toUpperCase()
                        )
                      }
                      placeholder="Enter coupon code"
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold uppercase tracking-wide outline-none transition focus:border-green-500 focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={
                        handleApplyCoupon
                      }
                      disabled={
                        couponLoading ||
                        !couponInput.trim()
                      }
                      className="rounded-xl bg-green-600 px-4 text-sm font-bold text-white disabled:bg-gray-300"
                    >
                      {couponLoading
                        ? "..."
                        : "Apply"}
                    </button>
                  </div>
                )}
              </div>
            </CheckoutSection>
          </div>

          <aside className="min-w-0 max-w-full space-y-4 lg:sticky lg:top-5">
            <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-white p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <ShoppingBag
                      size={19}
                    />
                  </div>

                  <div>
                    <h2 className="font-extrabold text-gray-900">
                      Order Summary
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {
                        items.length
                      }{" "}
                      product
                      {items.length ===
                      1
                        ? ""
                        : "s"}{" "}
                      in your basket
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[260px] space-y-2 overflow-y-auto p-3 sm:max-h-[340px] sm:space-y-3 sm:p-4">
                {items.length ===
                0 ? (
                  <p className="py-6 text-center text-sm text-gray-500">
                    Your cart is empty.
                  </p>
                ) : (
                  items.map(
                    (item) => (
                      <div
                        key={
                          item.cartKey
                        }
                        className="flex min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-2 sm:gap-3 sm:rounded-2xl sm:p-2.5"
                      >
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white sm:h-14 sm:w-14 sm:rounded-xl">
                          {item.image ? (
                            <Image
                              src={
                                item.image
                              }
                              alt={
                                item.name
                              }
                              fill
                              sizes="56px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              📦
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-extrabold leading-5 text-gray-900">
                            {
                              item.name
                            }
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-gray-500">
                            {
                              item.variantName ??
                              item.unit
                            }{" "}
                            • Qty{" "}
                            {
                              item.quantity
                            }
                          </p>
                        </div>

                        <p className="max-w-[82px] shrink-0 truncate text-right text-xs font-extrabold text-gray-900 sm:max-w-none sm:text-sm">
                          {
                            currencySymbol
                          }
                          {(
                            item.price *
                            item.quantity
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    )
                  )
                )}
              </div>

              <div className="border-t border-gray-100 p-4">
                <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-3">
                  <Truck
                    size={18}
                    className="shrink-0 text-green-700"
                  />

                  <div>
                    <p className="text-[10px] font-semibold text-green-700">
                      Delivery slot
                    </p>

                    <p className="mt-0.5 text-xs font-extrabold text-green-900">
                      {
                        selectedDeliverySlot.label
                      }{" "}
                      •{" "}
                      {
                        selectedDeliverySlot.time
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {freeDeliveryRemaining >
              0 ? (
              <FreeDeliveryProgress
                remaining={
                  freeDeliveryRemaining
                }
                current={
                  totalPrice
                }
                target={
                  freeDeliveryThreshold
                }
                currencySymbol={
                  currencySymbol
                }
              />
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-3">
                <PackageCheck
                  size={19}
                  className="text-green-700"
                />

                <div>
                  <p className="text-xs font-extrabold text-green-900">
                    Free delivery unlocked
                  </p>

                  <p className="mt-0.5 text-[10px] text-green-700">
                    No delivery charge on this order.
                  </p>
                </div>
              </div>
            )}

            <BillSummary
              currencySymbol={
                currencySymbol
              }
              subtotal={
                totalPrice
              }
              deliveryFee={
                deliveryFee
              }
              platformFee={
                platformFee
              }
              taxAmount={
                taxAmount
              }
              taxPercentage={
                taxPercentage
              }
              discount={discount}
              grandTotal={
                grandTotal
              }
            />

            <button
              type="button"
              onClick={
                handlePlaceOrder
              }
              disabled={
                items.length === 0 ||
                placingOrder ||
                settingsLoading ||
                !selectedAddress
              }
              className="hidden w-full rounded-2xl bg-green-600 py-4 font-extrabold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none lg:block"
            >
              {getOrderButtonText({
                settingsLoading,
                placingOrder,
                paymentMethod,
              })}
            </button>

            <div className="hidden items-center justify-center gap-2 text-[10px] font-semibold text-gray-400 lg:flex">
              <ShieldCheck
                size={13}
                className="text-green-600"
              />
              Secure and encrypted checkout
            </div>
          </aside>
        </div>
      </section>

      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white/95 px-3 pt-2.5 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] backdrop-blur lg:hidden"
        style={{
          paddingBottom:
            "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Total payable
            </p>

            <p className="text-xl font-extrabold text-gray-950">
              {currencySymbol}
              {grandTotal.toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

          {discount > 0 && (
            <p className="rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-extrabold text-green-700">
              Saved{" "}
              {currencySymbol}
              {discount.toLocaleString(
                "en-IN"
              )}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={
            handlePlaceOrder
          }
          disabled={
            items.length === 0 ||
            placingOrder ||
            settingsLoading ||
            !selectedAddress
          }
       className="flex w-full items-center justify-between rounded-xl bg-green-600 px-4 py-3 text-white sm:rounded-2xl sm:px-5 sm:py-3.5 shadow-lg shadow-green-600/20 disabled:bg-gray-300 disabled:shadow-none"
        >
          <div className="text-left">
            <p className="text-[10px] font-semibold text-green-100">
              {
                paymentMethod
              }
            </p>

            <p className="mt-0.5 text-sm font-extrabold">
              {getOrderButtonText({
                settingsLoading,
                placingOrder,
                paymentMethod,
              })}
            </p>
          </div>

          <ChevronRight
            size={21}
          />
        </button>
      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </main>
  );
}

function CheckoutHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-4 text-white shadow-[0_16px_40px_rgba(22,163,74,0.22)] sm:rounded-3xl sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/15 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-20 left-12 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />

      <Link
        href="/"
        aria-label="Back to shopping"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30"
      >
        <ArrowLeft size={20} />
      </Link>

      <div className="relative pr-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur">
          <ShieldCheck size={13} />
          Secure checkout
        </div>

        <h1 className="mt-3 text-xl font-extrabold sm:mt-4 sm:text-4xl">
          Complete your order
        </h1>

        <p className="mt-1.5 max-w-xl text-xs leading-5 text-green-50 sm:mt-2 sm:text-base sm:leading-6">
          Confirm delivery, choose payment and place your Quickify order.
        </p>
      </div>
    </div>
  );
}

function CheckoutSteps({
  hasAddress,
  hasSlot,
  hasPayment,
}: {
  hasAddress: boolean;
  hasSlot: boolean;
  hasPayment: boolean;
}) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2">
      <CheckoutStep
        number="1"
        label="Address"
        complete={hasAddress}
      />

      <CheckoutStep
        number="2"
        label="Delivery"
        complete={hasSlot}
      />

      <CheckoutStep
        number="3"
        label="Payment"
        complete={hasPayment}
      />
    </div>
  );
}

function CheckoutStep({
  number,
  label,
  complete,
}: {
  number: string;
  label: string;
  complete: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-xl border px-2 py-2 sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-3 ${
        complete
          ? "border-green-200 bg-green-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold sm:h-7 sm:w-7 sm:text-xs ${
          complete
            ? "bg-green-600 text-white"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {complete ? (
          <Check size={14} />
        ) : (
          number
        )}
      </div>

      <p
        className={`truncate text-[10px] font-bold sm:text-xs ${
          complete
            ? "text-green-800"
            : "text-gray-500"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

function CheckoutSection({
  number,
  icon,
  title,
  description,
  children,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 sm:h-11 sm:w-11 sm:rounded-2xl [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
          {icon}

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[9px] font-extrabold text-white">
            {number}
          </span>
        </div>

        <div>
          <h2 className="text-base font-extrabold text-gray-900 sm:text-xl">
            {title}
          </h2>

          <p className="mt-0.5 text-[11px] leading-4 text-gray-500 sm:mt-1 sm:text-sm sm:leading-5">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-3.5 min-w-0 max-w-full sm:mt-5">
        {children}
      </div>
    </section>
  );
}

function PaymentOption({
  selected,
  icon,
  title,
  description,
  badge,
  onClick,
}: {
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{
        scale: 0.98,
      }}
      className={`relative rounded-xl border p-3 text-left transition sm:rounded-2xl sm:p-4 ${
        selected
          ? "border-green-600 bg-green-50 ring-2 ring-green-100"
          : "border-gray-200 bg-white hover:border-green-300"
      }`}
    >
      <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-gray-600">
        {badge}
      </span>

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl [&>svg]:h-[19px] [&>svg]:w-[19px] ${
          selected
            ? "bg-green-600 text-white"
            : "bg-gray-100 text-green-700"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-2 text-xs font-extrabold text-gray-900 sm:mt-3 sm:text-sm">
        {title}
      </h3>

      <p className="mt-0.5 pr-5 text-[10px] leading-4 text-gray-500 sm:mt-1 sm:text-xs sm:leading-5">
        {description}
      </p>

      <span
        className={`absolute bottom-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border ${
          selected
            ? "border-green-600 bg-green-600 text-white"
            : "border-gray-300"
        }`}
      >
        {selected && (
          <Check size={12} />
        )}
      </span>
    </motion.button>
  );
}

function RecommendedCoupon({
  coupon,
  saving,
  currencySymbol,
  loading,
  onApply,
}: {
  coupon: Coupon;
  saving: number;
  currencySymbol: string;
  loading: boolean;
  onApply: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white">
      <div className="flex items-center justify-between border-b border-green-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <SparkleBadge />

          <p className="text-xs font-bold text-green-900">
            Best savings for your cart
          </p>
        </div>

        <Ticket
          size={17}
          className="text-green-700"
        />
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Coupon code
            </p>

            <div className="mt-2 inline-flex rounded-xl border border-dashed border-green-300 bg-white px-3 py-2">
              <p className="break-all font-mono text-base font-extrabold tracking-wider text-green-800 sm:text-lg sm:tracking-widest">
                {coupon.code}
              </p>
            </div>

            <p className="mt-2 text-sm font-extrabold text-green-700">
              {getCouponOfferLabel(
                coupon
              )}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Valid above{" "}
              {currencySymbol}
              {
                coupon.min_order_value
              }
            </p>
          </div>

          <div className="max-w-[105px] shrink-0 rounded-xl border border-green-100 bg-white px-2.5 py-2 text-right shadow-sm sm:max-w-none sm:rounded-2xl sm:px-3">
            <p className="text-[9px] font-bold uppercase text-gray-400">
              You save
            </p>

            <p className="mt-0.5 text-lg font-extrabold text-green-700">
              {currencySymbol}
              {saving.toLocaleString(
                "en-IN"
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onApply}
          disabled={loading}
          className="mt-3 w-full rounded-xl bg-green-600 py-2.5 text-xs font-extrabold text-white disabled:bg-gray-300 sm:mt-4 sm:py-3 sm:text-sm"
        >
          {loading
            ? "Applying..."
            : `Apply ${coupon.code}`}
        </button>
      </div>
    </div>
  );
}

function SparkleBadge() {
  return (
    <span className="rounded-full bg-green-600 px-2 py-1 text-[8px] font-extrabold uppercase tracking-wide text-white">
      Best
    </span>
  );
}

function CouponMilestone({
  coupon,
  amountNeeded,
  saving,
  totalPrice,
  currencySymbol,
}: {
  coupon: Coupon;
  amountNeeded: number;
  saving: number;
  totalPrice: number;
  currencySymbol: string;
}) {
  const threshold =
    Number(
      coupon.min_order_value
    );

  const percentage =
    Math.min(
      100,
      Math.max(
        0,
        (totalPrice /
          Math.max(
            threshold,
            1
          )) *
          100
      )
    );

  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
      <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
          <Lock size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-amber-900">
            Add{" "}
            {currencySymbol}
            {amountNeeded.toLocaleString(
              "en-IN"
            )}{" "}
            more
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-600">
            Unlock{" "}
            <span className="font-mono font-extrabold text-amber-800">
              {coupon.code}
            </span>{" "}
            and save up to{" "}
            {currencySymbol}
            {saving.toLocaleString(
              "en-IN"
            )}
            .
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
              style={{
                width:
                  `${percentage}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FreeDeliveryProgress({
  remaining,
  current,
  target,
  currencySymbol,
}: {
  remaining: number;
  current: number;
  target: number;
  currencySymbol: string;
}) {
  const percentage =
    Math.min(
      100,
      Math.max(
        0,
        (current /
          Math.max(target, 1)) *
          100
      )
    );

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
      <div className="flex items-center gap-3">
        <Truck
          size={18}
          className="text-blue-700"
        />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold text-blue-900">
            Add{" "}
            {currencySymbol}
            {remaining.toLocaleString(
              "en-IN"
            )}{" "}
            for free delivery
          </p>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width:
                  `${percentage}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BillSummary({
  currencySymbol,
  subtotal,
  deliveryFee,
  platformFee,
  taxAmount,
  taxPercentage,
  discount,
  grandTotal,
}: {
  currencySymbol: string;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  taxAmount: number;
  taxPercentage: number;
  discount: number;
  grandTotal: number;
}) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <ShoppingBag
          size={17}
          className="text-green-600"
        />

        <h2 className="text-sm font-extrabold text-gray-900">
          Bill details
        </h2>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        <BillRow
          label="Item total"
          value={`${currencySymbol}${subtotal.toLocaleString(
            "en-IN"
          )}`}
        />

        <BillRow
          label="Delivery fee"
          value={
            deliveryFee === 0
              ? "FREE"
              : `${currencySymbol}${deliveryFee.toLocaleString(
                  "en-IN"
                )}`
          }
          positive={
            deliveryFee === 0
          }
        />

        <BillRow
          label="Platform fee"
          value={`${currencySymbol}${platformFee.toLocaleString(
            "en-IN"
          )}`}
        />

        {taxAmount > 0 && (
          <BillRow
            label={`Tax (${taxPercentage}%)`}
            value={`${currencySymbol}${taxAmount.toLocaleString(
              "en-IN"
            )}`}
          />
        )}

        {discount > 0 && (
          <BillRow
            label="Coupon savings"
            value={`-${currencySymbol}${discount.toLocaleString(
              "en-IN"
            )}`}
            positive
          />
        )}

        <div className="border-t border-dashed border-gray-200 pt-3">
          <BillRow
            label="Grand total"
            value={`${currencySymbol}${grandTotal.toLocaleString(
              "en-IN"
            )}`}
            strong
          />
        </div>
      </div>
    </section>
  );
}

function BillRow({
  label,
  value,
  strong = false,
  positive = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "font-extrabold text-gray-900"
            : "font-medium text-gray-500"
        }
      >
        {label}
      </span>

      <span
        className={`${
          strong
            ? "text-base font-extrabold text-gray-950"
            : "font-bold text-gray-800"
        } ${
          positive
            ? "text-green-700"
            : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function getOrderButtonText({
  settingsLoading,
  placingOrder,
  paymentMethod,
}: {
  settingsLoading: boolean;
  placingOrder: boolean;
  paymentMethod:
    | "Cash on Delivery"
    | "Online";
}) {
  if (settingsLoading) {
    return "Loading Checkout...";
  }

  if (placingOrder) {
    return paymentMethod ===
      "Online"
      ? "Processing Payment..."
      : "Placing Order...";
  }

  return paymentMethod ===
    "Online"
    ? "Pay & Place Order"
    : "Place Order";
}