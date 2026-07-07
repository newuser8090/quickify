"use client";

import Link from "next/link";
import { ArrowLeft, Ticket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCoupons } from "@/services/couponService";

export default function CouponsPage() {
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["customer-coupons"],
    queryFn: getCoupons,
  });

  const activeCoupons = coupons.filter((coupon) => coupon.is_active);

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

        <h1 className="text-4xl font-bold">Available Coupons</h1>
        <p className="mt-2 text-gray-500">
          Apply these coupons during checkout.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <p className="text-gray-500">Loading coupons...</p>
          ) : activeCoupons.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <Ticket className="mx-auto text-gray-400" size={48} />
              <h2 className="mt-4 text-2xl font-bold">No coupons available</h2>
              <p className="mt-2 text-gray-500">Check again later.</p>
            </div>
          ) : (
            activeCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                    <Ticket size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold text-green-700">
                      {coupon.code}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Coupon Code
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-green-50 p-4">
                  <p className="text-3xl font-bold">
                    ₹{coupon.discount} OFF
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    On orders above ₹{coupon.min_order_value}
                  </p>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Expires:{" "}
                  {coupon.expires_at
                    ? new Date(coupon.expires_at).toLocaleDateString()
                    : "No expiry"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}