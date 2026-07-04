"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType, useCartStore } from "@/store/cartStore";

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
        <p className="text-sm text-gray-500">{item.unit}</p>
        <p className="mt-2 font-bold text-green-600">₹{item.price}</p>
      </div>

      <div className="flex flex-col items-end gap-3">
        <button onClick={() => removeItem(item.id)} className="text-red-500">
          <Trash2 size={18} />
        </button>

        <div className="flex items-center gap-3">
          <button onClick={() => decreaseQuantity(item.id)} className="rounded border p-1">
            <Minus size={15} />
          </button>

          <span>{item.quantity}</span>

          <button onClick={() => increaseQuantity(item.id)} className="rounded border p-1">
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}