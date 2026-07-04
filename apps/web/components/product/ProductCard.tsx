"use client";

import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";

import { Product } from "@/types/product";

import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem);

  const toggle = useWishlistStore((state) => state.toggle);

  const liked = useWishlistStore((state) =>
    state.isWishlisted(product.id)
  );

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group overflow-hidden rounded-3xl border bg-white transition hover:-translate-y-1 hover:shadow-xl">

        <div className="relative flex h-56 items-center justify-center bg-green-50 text-8xl">

          📦

          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product);
            }}
            className="absolute right-4 top-4 rounded-full bg-white p-2 shadow"
          >
            <Heart
              size={20}
              className={
                liked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-500"
              }
            />
          </button>

        </div>

        <div className="p-5">

          <div className="flex items-center gap-2">

            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />

            {product.rating}

            <span className="text-gray-500">

              ({product.reviews})

            </span>

          </div>

          <h3 className="mt-3 text-xl font-bold">

            {product.name}

          </h3>

          <p className="text-gray-500">

            {product.unit}

          </p>

          <div className="mt-4 flex items-center gap-3">

            <span className="text-2xl font-bold">

              ₹{product.price}

            </span>

            <span className="text-gray-400 line-through">

              ₹{product.mrp}

            </span>

          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">

            <Truck size={15} />

            {product.deliveryTime}

          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white"
          >
            <ShoppingCart size={18} />

            Add to Cart

          </button>

        </div>

      </div>
    </Link>
  );
}