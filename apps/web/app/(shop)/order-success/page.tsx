"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Clock3,
  PackageCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

const CONFETTI_COLORS = [
  "#16a34a",
  "#22c55e",
  "#facc15",
  "#fb923c",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

const CONFETTI_PIECES = Array.from(
  { length: 46 },
  (_, index) => {
    const angle =
      (index / 46) *
      Math.PI *
      2;

    const distance =
      130 +
      ((index * 37) % 150);

    return {
      id: index,

      x:
        Math.cos(angle) *
        distance,

      y:
        Math.sin(angle) *
          distance -
        40,

      rotate:
        ((index * 67) %
          540) -
        270,

      delay:
        (index % 8) *
        0.025,

      color:
        CONFETTI_COLORS[
          index %
            CONFETTI_COLORS.length
        ],

      width:
        index % 3 === 0
          ? 6
          : 8,

      height:
        index % 4 === 0
          ? 14
          : 9,

      rounded:
        index % 5 === 0,
    };
  }
);

export default function OrderSuccessPage() {
  const searchParams =
    useSearchParams();

  const orderId =
    searchParams.get(
      "orderId"
    );

  const deliveryTime =
    getEstimatedDeliveryTime(
      orderId
    );

  const trackOrderHref =
    orderId
      ? `/orders/${orderId}`
      : "/orders";

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 px-3 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-green-200/35 blur-3xl" />

        <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-yellow-100/40 blur-3xl" />
      </div>

      <ConfettiBurst />

      <motion.section
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 24,
          delay: 0.08,
        }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:rounded-[36px]"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 px-5 pb-16 pt-8 text-center text-white sm:px-10 sm:pb-20 sm:pt-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-yellow-300/15 blur-3xl" />

          <motion.div
            initial={{
              scale: 0,
              rotate: -30,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 16,
              delay: 0.15,
            }}
            className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/20 shadow-[0_18px_45px_rgba(0,0,0,0.16)] backdrop-blur sm:h-24 sm:w-24"
          >
            <motion.div
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: 0.34,
              }}
            >
              <Check
                size={42}
                strokeWidth={3}
                className="sm:h-12 sm:w-12"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="relative"
          >
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] backdrop-blur sm:text-xs">
              <Sparkles
                size={13}
              />
              Order confirmed
            </div>

            <h1 className="mx-auto mt-4 max-w-md text-3xl font-black leading-tight sm:text-4xl">
              Order Placed
              Successfully!
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/80 sm:text-base">
              Thank you for
              shopping with
              Quickify. Your order
              is being prepared.
            </p>
          </motion.div>
        </div>

        <div className="-mt-8 px-4 pb-5 sm:-mt-10 sm:px-7 sm:pb-7">
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.42,
            }}
            className="relative rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.1)] sm:p-5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <OrderDetail
                icon={
                  <PackageCheck
                    size={20}
                  />
                }
                label="Order ID"
                value={
                  orderId
                    ? `#${orderId}`
                    : "Order placed"
                }
              />

              <OrderDetail
                icon={
                  <Clock3
                    size={20}
                  />
                }
                label="Estimated delivery"
                value={`${deliveryTime} minutes`}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.52,
            }}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <Link
              href={
                trackOrderHref
              }
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-extrabold text-green-700 transition hover:border-green-300 hover:bg-green-100 active:scale-[0.98] sm:min-h-14"
            >
              <PackageCheck
                size={18}
              />
              Track Order
            </Link>

            <Link
              href="/"
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(22,163,74,0.28)] transition hover:bg-green-700 active:scale-[0.98] sm:min-h-14"
            >
              <ShoppingBag
                size={18}
              />
              Continue Shopping
            </Link>
          </motion.div>

          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.65,
            }}
            className="mt-5 text-center text-[10px] font-medium text-gray-400 sm:text-xs"
          >
            We’ll keep you updated
            as your order moves
            through each stage.
          </motion.p>
        </div>
      </motion.section>
    </main>
  );
}

function OrderDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 sm:p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:text-xs">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-black text-gray-900 sm:text-base">
          {value}
        </p>
      </div>
    </div>
  );
}

function ConfettiBurst() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[38%] z-20 h-1 w-1 -translate-x-1/2 -translate-y-1/2"
    >
      {CONFETTI_PIECES.map(
        (piece) => (
          <motion.span
            key={piece.id}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              x: piece.x,
              y: [
                0,
                piece.y,
                piece.y + 150,
              ],
              opacity: [
                1,
                1,
                0,
              ],
              scale: [
                0,
                1,
                0.85,
              ],
              rotate:
                piece.rotate,
            }}
            transition={{
              duration:
                1.45 +
                (piece.id % 5) *
                  0.08,
              delay:
                piece.delay,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
              times: [
                0,
                0.62,
                1,
              ],
            }}
            className="absolute block"
            style={{
              width:
                piece.width,
              height:
                piece.height,
              backgroundColor:
                piece.color,
              borderRadius:
                piece.rounded
                  ? "999px"
                  : "2px",
            }}
          />
        )
      )}
    </div>
  );
}

function getEstimatedDeliveryTime(
  orderId: string | null
) {
  if (!orderId) {
    return 12;
  }

  const numericSeed =
    Array.from(orderId).reduce(
      (total, character) =>
        total +
        character.charCodeAt(
          0
        ),
      0
    );

  return (
    10 +
    (numericSeed % 6)
  );
}