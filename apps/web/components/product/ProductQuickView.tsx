"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Star, Truck, ShoppingCart, Minus, Plus } from "lucide-react";

import ProductImage from "@/components/product/ProductImage";
import { useQuickViewStore } from "@/store/quickViewStore";
import { useCartStore } from "@/store/cartStore";
import { useRecentStore } from "@/store/recentStore";
import { toast } from "sonner";

export default function ProductQuickView() {
  const product = useQuickViewStore((state) => state.product);
  const close = useQuickViewStore((state) => state.close);

  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const addRecent = useRecentStore((state) => state.addRecent);

  useEffect(() => {
    if (product) {
      addRecent(product);
    }
  }, [product, addRecent]);

  if (!product) return null;

  const cartKey = `${product.id}-base`;
  const cartItem = items.find((item) => item.cartKey === cartKey);

  return (
    <>
      <div onClick={close} className="fixed inset-0 z-40 bg-black/40" />

      <div className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl">
        <button
          onClick={close}
          className="absolute right-5 top-5 z-10 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
        >
          <X size={20} />
        </button>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative h-72 rounded-2xl bg-green-50">
            <ProductImage src={product.image} alt={product.name} />
          </div>

          <div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              {product.category}
            </span>

            <h2 className="mt-4 text-3xl font-bold">{product.name}</h2>

            <div className="mt-4 flex items-center gap-2">
              <Star size={18} className="fill-yellow-400 text-yellow-400" />
              <span>{product.rating}</span>
              <span className="text-gray-500">({product.reviews} reviews)</span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-bold">₹{product.price}</span>
              <span className="text-gray-400 line-through">₹{product.mrp}</span>
            </div>

            <p className="mt-3 text-gray-500">{product.unit}</p>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-gray-700">
              <Truck size={18} />
              Delivery in {product.deliveryTime}
            </div>

            {cartItem ? (
              <div className="mt-6 flex items-center justify-between rounded-xl border border-green-600 bg-green-50 px-4 py-3">
                <button
                  onClick={() => decreaseQuantity(cartKey)}
                  className="rounded-lg bg-green-600 p-2 text-white"
                >
                  <Minus size={18} />
                </button>

                <span className="font-bold text-green-700">
                  {cartItem.quantity}
                </span>

                <button
                  onClick={() => {
  const success = increaseQuantity(cartKey);

  if (!success) {
    toast.error("Maximum available stock reached");
  }
}}
                  className="rounded-lg bg-green-600 p-2 text-white"
                >
                  <Plus size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addItem(product, null)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            )}

            <Link
              href={`/product/${product.id}`}
              onClick={close}
              className="mt-5 block text-center font-semibold text-green-700 hover:underline"
            >
              View Full Details →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}