"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";

import ProductGrid from "@/components/product/ProductGrid";
import {
  getFlashSaleProducts,
  getProductsByCategory,
} from "@/services/productService";

type Props = {
  category?: string;
};

export default function FlashSale({ category }: Props) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: category ? ["flash-sale", category] : ["flash-sale"],
    queryFn: () =>
      category
        ? getProductsByCategory(category)
        : getFlashSaleProducts(),
  });

  const flashProducts = category
    ? products.filter((product) => product.discount >= 15)
    : products;

  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;

          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;

            if (hours > 0) {
              hours--;
            } else {
              hours = 4;
              minutes = 59;
              seconds = 59;
            }
          }
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading || flashProducts.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 px-6">
  <div className="flex flex-wrap items-center gap-4">
    <h2 className="text-3xl font-bold">
      ⚡ Flash Sale
    </h2>

    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2">
      <Clock className="text-red-600" size={18} />

      <span className="text-sm font-semibold text-red-600">
        Ends in
      </span>

      <span className="rounded-md bg-red-600 px-2 py-1 text-sm font-bold text-white">
        {String(timeLeft.hours).padStart(2, "0")}
      </span>

      <span className="font-bold">:</span>

      <span className="rounded-md bg-red-600 px-2 py-1 text-sm font-bold text-white">
        {String(timeLeft.minutes).padStart(2, "0")}
      </span>

      <span className="font-bold">:</span>

      <span className="rounded-md bg-red-600 px-2 py-1 text-sm font-bold text-white">
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  </div>

  <p className="text-gray-500">
    Limited-time deals with amazing discounts.
  </p>
</div>

      <ProductGrid
        products={flashProducts}
        showEmptyState={false}
      />
    </section>
  );
}