"use client";

import { useEffect, useRef } from "react";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { fetchUserCart, upsertCartItem } from "@/services/cartService";

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const setItems = useCartStore((state) => state.setItems);

  const activeUserId = useRef<string | null>(null);

  useEffect(() => {
    async function loadCart() {
      if (!user) {
        activeUserId.current = null;
        setItems([]);
        return;
      }

      if (activeUserId.current === user.id) return;

      const localCart = useCartStore.getState().items;
      const cloudCart = await fetchUserCart(user.id);

      const mergedMap = new Map();

      cloudCart.forEach((item) => {
        mergedMap.set(item.id, item);
      });

      localCart.forEach((item) => {
        const existing = mergedMap.get(item.id);

        mergedMap.set(item.id, {
          ...item,
          quantity: existing
            ? existing.quantity + item.quantity
            : item.quantity,
        });
      });

      const mergedCart = Array.from(mergedMap.values());

      setItems(mergedCart);

      await Promise.all(
        mergedCart.map((item) =>
          upsertCartItem(user.id, item.id, item.quantity)
        )
      );

      activeUserId.current = user.id;
    }

    loadCart();
  }, [user, setItems]);

  return <>{children}</>;
}