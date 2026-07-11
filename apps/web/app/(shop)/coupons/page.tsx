"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Sparkles, Ticket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/ui/EmptyState";
import { getCoupons } from "@/services/couponService";

export default function CouponsPage() {
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["customer-coupons"],
    queryFn: getCoupons,
  });

  const activeCoupons = coupons.filter((coupon) => coupon.is_active);

  async function copyCoupon(code: string) {
    await navigator.clipboard.writeText(code);
    toast.success(`${code} copied`);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to shopping
        </Link>

        <div className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-500 p-8 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <Sparkles size={28} />
            </div>

            <div>
              <h1 className="text-4xl font-extrabold">Available Coupons</h1>
              <p className="mt-2 text-green-50">
                Save more on your next Quickify order.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-gray-500 shadow-sm">
              Loading coupons...
            </div>
          ) : activeCoupons.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState
                icon={<Ticket size={44} />}
                title="No coupons available"
                description="There are no active coupons right now. Check again later for fresh offers."
                actionLabel="Start Shopping"
                actionHref="/"
              />
            </div>
          ) : (
            activeCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="border-b border-dashed border-green-200 bg-green-50 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        Coupon Code
                      </p>

                      <h2 className="mt-1 text-3xl font-extrabold text-green-700">
                        {coupon.code}
                      </h2>
                    </div>

                    <div className="rounded-2xl bg-white p-3 text-green-700 shadow-sm">
                      <Ticket size={28} />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-4xl font-extrabold">
                    ₹{coupon.discount} OFF
                  </p>

                  <p className="mt-2 text-gray-500">
                    On orders above ₹{coupon.min_order_value}
                  </p>

                  <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                    Expires:{" "}
                    <span className="font-bold text-gray-900">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString()
                        : "No expiry"}
                    </span>
                  </div>

                  <button
                    onClick={() => copyCoupon(coupon.code)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700"
                  >
                    <Copy size={18} />
                    Copy Code
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}