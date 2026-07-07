"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType, useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

type Props = {
  item: CartItemType;
};

export default function CartItem({ item }: Props) {
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex justify-between rounded-xl border bg-white p-4">
      <div>
        <h3 className="font-semibold">{item.name}</h3>

        {item.variantName && (
          <p className="mt-1 text-sm font-medium text-green-700">
            {item.variantName}
          </p>
        )}

        <p className="text-sm text-gray-500">{item.unit}</p>

        <p className="mt-2 font-bold text-green-600">
          ₹{item.price}
        </p>
      </div>

      <div className="flex flex-col items-end gap-3">
        <button
          onClick={() => removeItem(item.cartKey)}
          className="text-red-500"
        >
          <Trash2 size={18} />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => decreaseQuantity(item.cartKey)}
            className="rounded border p-1"
          >
            <Minus size={15} />
          </button>

          <span>{item.quantity}</span>

          <button
            onClick={() => {
  const success = increaseQuantity(item.cartKey);

  if (!success) {
    toast.error("Maximum available stock reached");
  }
}}
            className="rounded border p-1"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}