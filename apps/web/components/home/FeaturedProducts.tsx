"use client";

import { useQuery } from "@tanstack/react-query";

import ProductGrid from "@/components/product/ProductGrid";
import { getFeaturedProducts } from "@/services/productService";

export default function FeaturedProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: getFeaturedProducts,
  });

  if (isLoading || products.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mx-auto mb-6 max-w-7xl px-6">
        <h2 className="text-3xl font-bold">⭐ Featured Products</h2>
        <p className="mt-2 text-gray-500">
          Hand-picked products just for you.
        </p>
      </div>

      <ProductGrid products={products} showEmptyState={false} />
    </section>
  );
}