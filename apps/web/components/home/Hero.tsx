"use client";

import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Leaf,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  motion,
} from "motion/react";

type Props = {
  onStartShopping?: () => void;
};

export default function Hero({
  onStartShopping,
}: Props) {
  function handleStartShopping() {
    if (onStartShopping) {
      onStartShopping();
      return;
    }

    document
      .getElementById(
        "products-section"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
      <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 px-5 py-6 shadow-[0_20px_60px_rgba(22,163,74,0.12)] sm:px-10 sm:py-10 md:px-14 md:py-14">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-green-300/25 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-lime-300/20 blur-3xl" />

        <div className="pointer-events-none absolute right-8 top-12 hidden h-36 w-36 rounded-full border border-white/70 bg-white/50 shadow-xl backdrop-blur-2xl md:block" />

        <div className="relative z-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/70 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-green-700 shadow-sm backdrop-blur sm:text-xs">
              <Sparkles size={14} />
              Fresh groceries, faster
            </div>

            <h1 className="mt-4 text-3xl font-black leading-[1.05] tracking-tight text-gray-950 sm:mt-5 sm:text-5xl md:text-6xl">
              Groceries delivered
              <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 bg-clip-text text-transparent">
                in minutes
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600 sm:mt-5 sm:text-lg sm:leading-8">
              Fresh fruits, vegetables, dairy, snacks and daily essentials
              delivered quickly to your doorstep.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
              <HeroBadge
                icon={<Clock3 />}
                text="10–20 min delivery"
              />

              <HeroBadge
                icon={<Leaf />}
                text="Freshly picked"
              />

              <HeroBadge
                icon={<ShieldCheck />}
                text="Quality checked"
              />
            </div>

            <motion.button
              type="button"
              onClick={handleStartShopping}
              whileTap={{
                scale: 0.97,
              }}
              whileHover={{
                y: -2,
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(22,163,74,0.28)] transition hover:bg-green-700 sm:mt-8 sm:px-7 sm:py-4 sm:text-base"
            >
              Start Shopping
              <ArrowRight size={18} />
            </motion.button>
          </div>

          <div className="hidden md:block">
            <div className="relative mx-auto h-64 w-full max-w-[280px]">
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-0 top-4 rounded-3xl border border-white/70 bg-white/70 p-5 shadow-2xl backdrop-blur-2xl"
              >
                <Truck
                  size={34}
                  className="text-green-600"
                />

                <p className="mt-3 text-sm font-extrabold text-gray-900">
                  Lightning-fast delivery
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Freshness, right on time.
                </p>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 8, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-3 right-0 rounded-3xl border border-white/70 bg-white/70 p-5 shadow-2xl backdrop-blur-2xl"
              >
                <BadgeCheck
                  size={34}
                  className="text-emerald-600"
                />

                <p className="mt-3 text-sm font-extrabold text-gray-900">
                  Trusted quality
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Carefully checked products.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroBadge({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-white/75 px-3 py-2 text-[10px] font-bold text-gray-700 shadow-sm backdrop-blur sm:text-xs [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-green-600">
      {icon}
      {text}
    </div>
  );
}