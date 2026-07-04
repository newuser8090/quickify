"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Truck, ShoppingCart } from "lucide-react";

import { products } from "@/constants/products";
import { useCartStore } from "@/store/cartStore";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function ProductPage({ params }: Props) {
  const { id } = use(params);

  const product = products.find(
    (p) => p.id === Number(id)
  );

  const addItem = useCartStore((state) => state.addItem);

  if (!product) {
    return (
      <div className="p-10">
        Product not found
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-7xl p-6">

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-green-700"
        >
          <ArrowLeft size={18} />

          Back
        </Link>

        <div className="grid gap-10 rounded-3xl bg-white p-8 shadow lg:grid-cols-2">

          {/* Product Image */}

          <div className="flex h-[500px] items-center justify-center rounded-3xl bg-green-50 text-9xl">

            📦

          </div>

          {/* Details */}

          <div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-green-700">

              {product.category}

            </span>

            <h1 className="mt-6 text-5xl font-bold">

              {product.name}

            </h1>

            <div className="mt-6 flex items-center gap-3">

              <Star
                size={20}
                className="fill-yellow-400 text-yellow-400"
              />

              <span>

                {product.rating}

              </span>

              <span className="text-gray-500">

                ({product.reviews} Reviews)

              </span>

            </div>

            <div className="mt-8 flex items-center gap-4">

              <span className="text-5xl font-bold">

                ₹{product.price}

              </span>

              <span className="text-3xl text-gray-400 line-through">

                ₹{product.mrp}

              </span>

            </div>

            <p className="mt-8 text-lg leading-8 text-gray-600">

              Fresh premium quality {product.name} delivered
              directly to your doorstep.

            </p>

            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-green-50 p-4">

              <Truck />

              Delivery in {product.deliveryTime}

            </div>

            <button
              onClick={() => addItem(product)}
              className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-5 text-lg font-bold text-white hover:bg-green-700"
            >
              <ShoppingCart />

              Add To Cart

            </button>

          </div>

        </div>

      </div>

    </main>
  );
}