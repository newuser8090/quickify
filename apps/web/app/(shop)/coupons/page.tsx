"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Sparkles,
  Ticket,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import EmptyState from "@/components/ui/EmptyState";
import { getCoupons } from "@/services/couponService";

export default function CouponsPage() {
  const {
    data: coupons = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["customer-coupons"],
    queryFn: getCoupons,
  });

  const activeCoupons = coupons.filter(
    (coupon) => coupon.is_active
  );

  const noExpiryCount = activeCoupons.filter(
    (coupon) => !coupon.expires_at
  ).length;

  async function copyCoupon(
    code: string
  ) {
    try {
      await navigator.clipboard.writeText(
        code
      );

      toast.success(
        `${code} copied`
      );
    } catch (error) {
      console.error(
        "Coupon copy failed:",
        error
      );

      toast.error(
        "Coupon code could not be copied"
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-5 text-white shadow-[0_20px_60px_rgba(245,158,11,0.3)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-yellow-200/20 blur-3xl" />

          <Link
            href="/"
            aria-label="Back to home"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30 active:scale-95 sm:right-6 sm:top-6"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="relative z-[1] pr-14 sm:pr-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
              <Sparkles size={14} />
              Exclusive savings
            </div>

            <h1 className="mt-4 text-2xl font-extrabold sm:text-4xl">
              Available Coupons
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-yellow-50 sm:text-base">
              Apply the best available offer and save more on your next Quickify order.
            </p>
          </div>

          <div className="relative z-[1] mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:max-w-md sm:gap-4">
            <CouponStat
              label="Active Coupons"
              value={
                activeCoupons.length
              }
            />

            <CouponStat
              label="No Expiry"
              value={noExpiryCount}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-3xl bg-white shadow-sm"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-5 rounded-3xl border border-red-100 bg-red-50 p-6 text-center sm:mt-8">
            <h2 className="font-bold text-red-700">
              Coupons could not be loaded
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={() =>
                refetch()
              }
              className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : activeCoupons.length ===
          0 ? (
          <div className="mt-5 sm:mt-8">
            <EmptyState
              icon={
                <Ticket size={44} />
              }
              title="No coupons available"
              description="There are no active coupons right now. Check again later for fresh offers."
              actionLabel="Start Shopping"
              actionHref="/"
            />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {activeCoupons.map(
              (coupon) => (
                <CouponCard
                  key={coupon.id}
                  code={coupon.code}
                  discount={
                    coupon.discount
                  }
                  minimumOrder={
                    coupon.min_order_value
                  }
                  expiresAt={
                    coupon.expires_at
                  }
                  onCopy={() =>
                    copyCoupon(
                      coupon.code
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function CouponStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/20 px-3 py-3 text-center backdrop-blur sm:px-5 sm:py-4">
      <p className="text-xl font-extrabold sm:text-3xl">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-semibold text-yellow-50 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function CouponCard({
  code,
  discount,
  minimumOrder,
  expiresAt,
  onCopy,
}: {
  code: string;
  discount: number;
  minimumOrder: number;
  expiresAt?: string | null;
  onCopy: () => void;
}) {
  const expiryText = expiresAt
    ? new Date(
        expiresAt
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "No expiry";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-3xl">
      <div className="absolute -left-3 top-[92px] h-6 w-6 rounded-full bg-gray-50 sm:top-[108px]" />

      <div className="absolute -right-3 top-[92px] h-6 w-6 rounded-full bg-gray-50 sm:top-[108px]" />

      <div className="border-b border-dashed border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 sm:text-xs">
              Coupon code
            </p>

            <h2 className="mt-1 truncate text-lg font-extrabold text-amber-800 sm:text-2xl">
              {code}
            </h2>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
            <Ticket size={20} />
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col p-3 sm:p-5">
        <p className="text-xl font-extrabold text-gray-900 sm:text-3xl">
          ₹{discount} OFF
        </p>

        <p className="mt-1 text-[11px] leading-5 text-gray-500 sm:text-sm">
          On orders above ₹
          {minimumOrder}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-[10px] text-gray-600 sm:mt-4 sm:text-sm">
          <Check
            size={14}
            className="shrink-0 text-green-600"
          />

          <span className="truncate">
            Expires:{" "}
            <strong className="text-gray-900">
              {expiryText}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-2 py-2.5 text-xs font-bold text-white transition hover:bg-amber-600 active:scale-[0.98] sm:mt-4 sm:gap-2 sm:py-3 sm:text-sm"
        >
          <Copy size={15} />
          Copy Code
        </button>
      </div>
    </article>
  );
}
