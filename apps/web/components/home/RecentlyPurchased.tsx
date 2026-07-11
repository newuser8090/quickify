"use client";

import { useQuery } from "@tanstack/react-query";

import ProductGrid from "@/components/product/ProductGrid";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { Product } from "@/types/product";
import { SupabaseProduct } from "@/types/supabaseProduct";
import { mapProduct } from "@/utils/mapProduct";

type PurchasedRow = {
  product: SupabaseProduct | SupabaseProduct[] | null;
};

export default function RecentlyPurchased() {
  const user = useAuthStore((state) => state.user);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["recently-purchased", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
          product:products(*),
          orders!inner(user_id, created_at, status)
        `
        )
        .eq("orders.user_id", user.id)
        .order("created_at", {
          ascending: false,
          referencedTable: "orders",
        })
        .limit(20);

      if (error) throw error;

      const unique = new Map<number, Product>();

      ((data ?? []) as unknown as PurchasedRow[]).forEach((row) => {
        const product = Array.isArray(row.product)
          ? row.product[0]
          : row.product;

        if (!product) return;

        const mapped = mapProduct(product);

        if (!unique.has(mapped.id)) {
          unique.set(mapped.id, mapped);
        }
      });

      return Array.from(unique.values()).slice(0, 8);
    },
    enabled: !!user?.id,
  });

  if (!user || (!isLoading && products.length === 0)) return null;

  return (
    <section className="mt-12">
      <div className="mx-auto mb-6 max-w-7xl px-6">
        <h2 className="text-3xl font-bold">Buy Again</h2>
        <p className="mt-2 text-gray-500">
          Quickly reorder products you purchased before.
        </p>
      </div>

      <ProductGrid
        products={products}
        isLoading={isLoading}
        showEmptyState={false}
      />
    </section>
  );
}