"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Clock3,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { toast } from "sonner";

import CartItem from "./CartItem";
import EmptyState from "@/components/ui/EmptyState";
import useCart from "@/hooks/useCart";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";

const DELIVERY_FEE = 0;
const PLATFORM_FEE = 0;

export default function CartDrawer() {
  const router = useRouter();
  const [mounted, setMounted] =
    useState(false);

  const {
    items,
    totalItems,
    totalPrice,
  } = useCart();

  const savedItems = useCartStore(
    (state) => state.savedItems
  );

  const saveForLater = useCartStore(
    (state) => state.saveForLater
  );

  const moveToCart = useCartStore(
    (state) => state.moveToCart
  );

  const removeSavedItem =
    useCartStore(
      (state) =>
        state.removeSavedItem
    );

  const cartOpen = useUIStore(
    (state) => state.cartOpen
  );

  const closeCart = useUIStore(
    (state) => state.closeCart
  );

  const subtotal =
    Number(totalPrice);

  const finalTotal =
    subtotal +
    DELIVERY_FEE +
    PLATFORM_FEE;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!cartOpen) {
      return;
    }

    const scrollY =
      window.scrollY;

    const previousBodyPosition =
      document.body.style.position;

    const previousBodyTop =
      document.body.style.top;

    const previousBodyLeft =
      document.body.style.left;

    const previousBodyRight =
      document.body.style.right;

    const previousBodyWidth =
      document.body.style.width;

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style
        .overflow;

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.position =
      "fixed";

    document.body.style.top =
      `-${scrollY}px`;

    document.body.style.left =
      "0";

    document.body.style.right =
      "0";

    document.body.style.width =
      "100%";

    document.body.style.overflow =
      "hidden";

    return () => {
      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.position =
        previousBodyPosition;

      document.body.style.top =
        previousBodyTop;

      document.body.style.left =
        previousBodyLeft;

      document.body.style.right =
        previousBodyRight;

      document.body.style.width =
        previousBodyWidth;

      document.body.style.overflow =
        previousBodyOverflow;

      window.scrollTo({
        top: scrollY,
        left: 0,
        behavior: "instant",
      });
    };
  }, [cartOpen]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button
            key="cart-overlay"
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.22,
            }}
            className="fixed inset-0 z-[9996] cursor-default bg-black/45 backdrop-blur-[7px]"
          />

          <motion.aside
            key="cart-drawer"
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 32,
            }}
            className="fixed inset-y-0 right-0 z-[9997] flex h-[100dvh] w-[88%] max-w-[390px] flex-col overflow-hidden bg-gray-50 shadow-2xl sm:w-full sm:max-w-[440px]"
            onMouseDown={(
              event
            ) => {
              event.stopPropagation();
            }}
          >
            <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 px-4 pb-5 pt-4 text-white sm:px-5 sm:pb-6 sm:pt-5">
              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

              <div className="pointer-events-none absolute -bottom-16 left-12 h-36 w-36 rounded-full bg-emerald-300/20 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                    <ShoppingBag
                      size={22}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-green-100">
                      Your basket
                    </p>

                    <h2 className="text-2xl font-extrabold leading-tight">
                      My Cart
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCart}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 active:scale-95"
                  aria-label="Close cart"
                >
                  <ChevronRight
                    size={23}
                  />
                </button>
              </div>

              <div className="relative mt-4 grid grid-cols-2 gap-2">
                <CartHeaderStat
                  label="Items"
                  value={totalItems}
                />

                <CartHeaderStat
                  label="Basket total"
                  value={`₹${subtotal.toLocaleString(
                    "en-IN"
                  )}`}
                />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {items.length > 0 && (
                <div className="px-3 pt-3 sm:px-4 sm:pt-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-white p-3 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <Clock3
                        size={19}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-500">
                        Estimated delivery
                      </p>

                      <p className="mt-0.5 text-sm font-extrabold text-gray-900">
                        Arriving in 10–20 minutes
                      </p>
                    </div>

                    <Truck
                      size={19}
                      className="shrink-0 text-green-600"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-5 px-3 py-4 sm:px-4">
                {items.length === 0 &&
                  savedItems.length ===
                    0 && (
                    <EmptyCart
                      onClose={
                        closeCart
                      }
                    />
                  )}

                {items.length > 0 && (
                  <section>
                    <SectionTitle
                      title="Items in your cart"
                      count={
                        items.length
                      }
                    />

                    <div className="mt-3 space-y-3">
                      {items.map(
                        (item) => (
                          <motion.article
                            layout
                            key={
                              item.cartKey
                            }
                            initial={{
                              opacity: 0,
                              y: 12,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              x: 30,
                            }}
                            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                          >
                            <div className="p-3">
                              <CartItem
                                item={
                                  item
                                }
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                saveForLater(
                                  item.cartKey
                                );

                                toast.success(
                                  "Saved for later"
                                );
                              }}
                              className="flex w-full items-center justify-center gap-2 border-t border-gray-100 bg-gray-50 px-3 py-2.5 text-xs font-bold text-green-700 transition hover:bg-green-50"
                            >
                              <Sparkles
                                size={14}
                              />
                              Save for later
                            </button>
                          </motion.article>
                        )
                      )}
                    </div>
                  </section>
                )}

                {savedItems.length >
                  0 && (
                  <section className="border-t border-gray-200 pt-5">
                    <SectionTitle
                      title="Saved for later"
                      count={
                        savedItems.length
                      }
                    />

                    <div className="mt-3 space-y-3">
                      {savedItems.map(
                        (item) => (
                          <article
                            key={
                              item.cartKey
                            }
                            className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
                          >
                            <div className="flex gap-3">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                {item.image ? (
                                  <Image
                                    src={
                                      item.image
                                    }
                                    alt={
                                      item.name
                                    }
                                    fill
                                    sizes="64px"
                                    className="object-contain p-1.5"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xl">
                                    📦
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-extrabold leading-5 text-gray-900">
                                  {
                                    item.name
                                  }
                                </p>

                                {item.variantName && (
                                  <p className="mt-1 truncate text-[11px] font-bold text-green-700">
                                    {
                                      item.variantName
                                    }
                                  </p>
                                )}

                                <p className="mt-1 text-[11px] text-gray-500">
                                  {
                                    item.unit
                                  }{" "}
                                  • ₹
                                  {
                                    item.price
                                  }
                                </p>

                                <p className="mt-1 text-[11px] font-semibold text-gray-700">
                                  Quantity:{" "}
                                  {
                                    item.quantity
                                  }
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const success =
                                    moveToCart(
                                      item.cartKey
                                    );

                                  toast[
                                    success
                                      ? "success"
                                      : "error"
                                  ](
                                    success
                                      ? "Moved to cart"
                                      : "Item is out of stock"
                                  );
                                }}
                                className="rounded-xl bg-green-600 px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-green-700"
                              >
                                Move to Cart
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  removeSavedItem(
                                    item.cartKey
                                  );

                                  toast.success(
                                    "Removed from saved items"
                                  );
                                }}
                                aria-label={`Remove ${item.name}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  </section>
                )}

                {items.length > 0 && (
                  <>
                    <BenefitsStrip />

                    <BillDetails
                      subtotal={
                        subtotal
                      }
                      deliveryFee={
                        DELIVERY_FEE
                      }
                      platformFee={
                        PLATFORM_FEE
                      }
                      finalTotal={
                        finalTotal
                      }
                    />
                  </>
                )}
              </div>
            </div>

          <footer
            className="shrink-0 border-t border-gray-100 bg-white px-3 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] sm:px-4 sm:pt-4"
            style={{
              paddingBottom:
                "max(12px, env(safe-area-inset-bottom))",
            }}
          >
            {items.length > 0 ? (
              <SwipeToCheckout
                total={finalTotal}
                onComplete={() => {
                  closeCart();
                  router.push("/checkout");
                }}
              />
            ) : (
              <Link
                href="/"
                onClick={closeCart}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 font-extrabold text-white transition hover:bg-green-700"
              >
                Start Shopping
                <ArrowRight size={18} />
              </Link>
            )}
          </footer>

          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function CartHeaderStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/15 px-3 py-3 backdrop-blur">
      <p className="text-lg font-extrabold">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-semibold text-green-100">
        {label}
      </p>
    </div>
  );
}

function SectionTitle({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-extrabold text-gray-900">
        {title}
      </h3>

      <span className="rounded-full bg-gray-200 px-2.5 py-1 text-[10px] font-extrabold text-gray-600">
        {count}
      </span>
    </div>
  );
}

function EmptyCart({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white px-5 py-8 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <ShoppingCart
          size={36}
          className="text-green-600"
        />
      </div>

      <h3 className="mt-5 text-xl font-extrabold text-gray-900">
        Your cart is empty
      </h3>

      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
        Add fresh groceries and daily essentials to see them here.
      </p>

      <Link
        href="/"
        onClick={onClose}
        className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-2xl bg-green-600 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-green-700"
      >
        Explore Products
        <ArrowRight
          size={17}
        />
      </Link>
    </div>
  );
}

function BenefitsStrip() {
  return (
    <section className="grid grid-cols-3 gap-2">
      <MiniBenefit
        icon={<PackageCheck />}
        label="Quality checked"
      />

      <MiniBenefit
        icon={<Truck />}
        label="Fast delivery"
      />

      <MiniBenefit
        icon={<BadgeCheck />}
        label="Secure order"
      />
    </section>
  );
}

function MiniBenefit({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50 px-2 py-3 text-center">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>

      <p className="mt-2 text-[9px] font-extrabold leading-3 text-green-900">
        {label}
      </p>
    </div>
  );
}

function BillDetails({
  subtotal,
  deliveryFee,
  platformFee,
  finalTotal,
}: {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  finalTotal: number;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <ShoppingBag
          size={17}
          className="text-green-600"
        />

        <h3 className="text-sm font-extrabold text-gray-900">
          Bill details
        </h3>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        <BillRow
          label="Item total"
          value={`₹${subtotal.toLocaleString(
            "en-IN"
          )}`}
        />

        <BillRow
          label="Delivery fee"
          value={
            deliveryFee === 0
              ? "FREE"
              : `₹${deliveryFee}`
          }
          positive={
            deliveryFee === 0
          }
        />

        <BillRow
          label="Platform fee"
          value={
            platformFee === 0
              ? "₹0"
              : `₹${platformFee}`
          }
        />

        <div className="border-t border-dashed border-gray-200 pt-3">
          <BillRow
            label="Grand total"
            value={`₹${finalTotal.toLocaleString(
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

function SwipeToCheckout({
  total,
  onComplete,
}: {
  total: number;
  onComplete: () => void;
}) {
  const TRACK_PADDING = 6;
  const THUMB_SIZE = 54;
  const COMPLETION_RATIO = 0.82;

  const [trackWidth, setTrackWidth] =
    useState(0);

  const [dragging, setDragging] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const trackRef =
    useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);

  const maxDrag = Math.max(
    0,
    trackWidth -
      THUMB_SIZE -
      TRACK_PADDING * 2
  );

  const progress = useTransform(
    x,
    [0, Math.max(1, maxDrag)],
    [0, 1]
  );

  const backgroundOpacity =
    useTransform(
      progress,
      [0, 1],
      [0, 1]
    );

  const textOpacity = useTransform(
    progress,
    [0, 0.65, 1],
    [1, 0.45, 0]
  );

  useEffect(() => {
    function updateWidth() {
      setTrackWidth(
        trackRef.current
          ?.getBoundingClientRect()
          .width ?? 0
      );
    }

    updateWidth();

    const observer =
      new ResizeObserver(
        updateWidth
      );

    if (trackRef.current) {
      observer.observe(
        trackRef.current
      );
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  async function resetSlider() {
    await animate(
      x,
      0,
      {
        type: "spring",
        stiffness: 420,
        damping: 32,
      }
    );
  }

  async function handleDragEnd() {
    setDragging(false);

    if (
      completed ||
      maxDrag <= 0
    ) {
      return;
    }

    const currentX = x.get();

    if (
      currentX >=
      maxDrag *
        COMPLETION_RATIO
    ) {
      setCompleted(true);

      await animate(
        x,
        maxDrag,
        {
          duration: 0.16,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }
      );

      window.setTimeout(
        onComplete,
        160
      );

      return;
    }

    await resetSlider();
  }

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            To pay
          </p>

          <p className="mt-0.5 text-2xl font-extrabold text-gray-950">
            ₹
            {total.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-700">
          <ShieldCheck
            size={14}
          />
          Secure checkout
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative h-[66px] overflow-hidden rounded-[22px] bg-green-100 p-[6px] shadow-inner"
      >
        <motion.div
          style={{
            opacity:
              backgroundOpacity,
          }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600"
        />

        <motion.div
          style={{
            opacity:
              textOpacity,
          }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center pl-12 text-sm font-extrabold text-green-900"
        >
          Slide to Checkout
        </motion.div>

        <motion.div
          drag={
            completed
              ? false
              : "x"
          }
          dragConstraints={{
            left: 0,
            right: maxDrag,
          }}
          dragElastic={0}
          dragMomentum={false}
          style={{
            x,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
          }}
          onDragStart={() =>
            setDragging(true)
          }
          onDragEnd={
            handleDragEnd
          }
          whileTap={{
            scale: 0.96,
          }}
          className="relative z-10 flex cursor-grab items-center justify-center rounded-[18px] bg-white text-green-700 shadow-lg active:cursor-grabbing"
          aria-label="Slide to checkout"
          role="button"
          tabIndex={0}
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
                "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              if (!completed) {
                setCompleted(
                  true
                );

                animate(
                  x,
                  maxDrag,
                  {
                    duration: 0.2,
                  }
                ).then(() => {
                  onComplete();
                });
              }
            }
          }}
        >
          <ChevronRight
            size={25}
            className={`transition ${
              dragging
                ? "translate-x-0.5"
                : ""
            }`}
          />
        </motion.div>

        {completed && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center pr-14 text-sm font-extrabold text-white"
          >
            Opening checkout…
          </motion.div>
        )}
      </div>

      <p className="mt-2 text-center text-[10px] font-medium text-gray-400">
        Drag the arrow fully to continue
      </p>
    </div>
  );
}
