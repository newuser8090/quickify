"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  type CartItem as CartItemType,
  useCartStore,
} from "@/store/cartStore";

type Props = {
  item: CartItemType;
};

export default function CartItem({
  item,
}: Props) {
  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  );

  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  );

  const removeItem = useCartStore(
    (state) => state.removeItem
  );

  const itemTotal =
    Number(item.price ?? 0) *
    Number(item.quantity ?? 0);

  return (
    <div className="flex gap-4 rounded-xl bg-white">
      <Link
        href={`/product/${item.id}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="96px"
            className="object-contain p-1.5"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">
            📦
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/product/${item.id}`}
              className="line-clamp-2 font-semibold transition hover:text-green-700"
            >
              {item.name}
            </Link>

            {item.variantName && (
              <p className="mt-1 text-sm font-medium text-green-700">
                {item.variantName}
              </p>
            )}

            {item.unit && (
              <p className="mt-1 text-sm text-gray-500">
                {item.unit}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              removeItem(item.cartKey);
              toast.success(
                `${item.name} removed from cart`
              );
            }}
            className="shrink-0 rounded-lg p-2 text-red-500 transition hover:bg-red-50"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-bold text-green-700">
              ₹
              {itemTotal.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="text-xs text-gray-500">
              ₹
              {Number(
                item.price ?? 0
              ).toLocaleString("en-IN")}{" "}
              each
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-1">
            <button
              type="button"
              onClick={() =>
                decreaseQuantity(
                  item.cartKey
                )
              }
              className="rounded-lg bg-white p-1.5 text-green-700 shadow-sm transition hover:bg-green-100"
              aria-label={`Decrease ${item.name} quantity`}
            >
              <Minus size={15} />
            </button>

            <span className="min-w-5 text-center font-bold text-green-700">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => {
                const success =
                  increaseQuantity(
                    item.cartKey
                  );

                if (!success) {
                  toast.error(
                    "Maximum available stock reached"
                  );
                }
              }}
              className="rounded-lg bg-green-600 p-1.5 text-white transition hover:bg-green-700"
              aria-label={`Increase ${item.name} quantity`}
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
