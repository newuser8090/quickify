"use client";

import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
//import Image from "next/image";

import { Product } from "@/types/product";
import { getProductsByCategory } from "@/services/productService";
import { useCartStore } from "@/store/cartStore";

type Props = {
  product: Product;
};

export default function FrequentlyBoughtTogether({
  product,
}: Props) {
  const addItem = useCartStore((state) => state.addItem);

  const { data: categoryProducts = [] } = useQuery({
    queryKey: ["fbt", product.category],
    queryFn: () => getProductsByCategory(product.category),
  });

  const suggestions = categoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  const total = suggestions.reduce(
    (sum, item) => sum + item.price,
    product.price
  );

  function handleAddAll() {
    addItem(product);

    suggestions.forEach((item) => addItem(item, null));

    toast.success("Added all products to cart");
  }

  return (
    <section className="mt-12 rounded-3xl bg-white p-8 shadow">
      <h2 className="text-3xl font-bold">
        Frequently Bought Together
      </h2>

      <p className="mt-2 text-gray-500">
        Customers often purchase these together.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-6">
        {[product, ...suggestions].map((item, index) => (
          <div key={item.id} className="flex items-center gap-6">
            <div className="w-36 rounded-2xl border bg-green-50 p-4 text-center">
              <div className="flex h-24 items-center justify-center text-5xl">
                📦
              </div>

              <h3 className="mt-3 font-bold">{item.name}</h3>

              <p className="font-semibold text-green-700">
                ₹{item.price}
              </p>
            </div>

            {index < suggestions.length && (
              <span className="text-3xl font-bold text-gray-400">
                +
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-green-50 p-6 md:flex-row md:items-center">
        <div>
          <p className="text-gray-500">Total Price</p>

          <h3 className="text-3xl font-bold">
            ₹{total}
          </h3>
        </div>

        <button
          onClick={handleAddAll}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700"
        >
          <ShoppingCart size={20} />
          Add All to Cart
        </button>
      </div>
    </section>
  );
}