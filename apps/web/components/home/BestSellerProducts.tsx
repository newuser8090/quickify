"use client";

import { useQuery } from "@tanstack/react-query";

import ProductGrid from "@/components/product/ProductGrid";
import { getBestSellerProducts } from "@/services/productService";

export default function BestSellerProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["best-seller-products"],
    queryFn: getBestSellerProducts,
  });

  if (isLoading || products.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mx-auto mb-6 max-w-7xl px-6">
        <h2 className="text-3xl font-bold">🔥 Best Sellers</h2>
        <p className="mt-2 text-gray-500">Most loved by our customers.</p>
      </div>

      <ProductGrid products={products} showEmptyState={false} />
    </section>
  );
}