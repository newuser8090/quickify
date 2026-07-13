"use client";

import {
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";
import { getProductsByCategory } from "@/services/productService";

type Props = {
  product: Product;
};

export default function RelatedProducts({
  product,
}: Props) {
  const {
    data: relatedProducts = [],
    isLoading,
  } = useQuery({
    queryKey: [
      "related-products",
      product.category,
    ],
    queryFn: () =>
      getProductsByCategory(
        product.category
      ),
  });

  const filteredProducts =
    relatedProducts
      .filter(
        (item) =>
          item.id !== product.id
      )
      .slice(0, 4);

  if (
    !isLoading &&
    filteredProducts.length === 0
  ) {
    return null;
  }

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm sm:mt-10">
      <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 via-emerald-50 to-white p-4 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-green-700 sm:text-xs">
              <Sparkles size={13} />
              Similar picks
            </div>

            <h2 className="mt-3 text-xl font-extrabold text-gray-900 sm:text-3xl">
              You May Also Like
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
              More products from{" "}
              <span className="font-semibold text-gray-700">
                {product.category}
              </span>{" "}
              that match what you’re viewing.
            </p>
          </div>

          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm sm:flex">
            <ArrowRight size={20} />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-7">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-2xl bg-gray-100 sm:h-80 sm:rounded-3xl"
                />
              )
            )}
          </div>
        ) : (
          <div className="hide-scrollbar flex gap-3 overflow-x-auto px-3 pb-4 pt-4 sm:gap-4 sm:px-6 sm:pb-6">
        {filteredProducts.map((item) => (
            <div
            key={item.id}
            className="w-[150px] shrink-0 min-[390px]:w-[165px] sm:w-[200px]"
            >
            <ProductCard product={item} />
            </div>
        ))}
        </div>
        )}
      </div>
    </section>
  );
}
