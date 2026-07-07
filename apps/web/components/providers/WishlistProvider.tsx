"use client";

import { useEffect, useRef } from "react";

import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import {
  addWishlistItem,
  fetchUserWishlist,
} from "@/services/wishlistService";

export default function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const setItems = useWishlistStore((state) => state.setItems);

  const activeUserId = useRef<string | null>(null);

  useEffect(() => {
    async function loadWishlist() {
      if (!user) {
        activeUserId.current = null;
        setItems([]);
        return;
      }

      if (activeUserId.current === user.id) return;

      const localWishlist = useWishlistStore.getState().items;
      const cloudWishlist = await fetchUserWishlist(user.id);

      const mergedMap = new Map();

      cloudWishlist.forEach((item) => {
        mergedMap.set(item.id, item);
      });

      localWishlist.forEach((item) => {
        mergedMap.set(item.id, item);
      });

      const mergedWishlist = Array.from(mergedMap.values());

      setItems(mergedWishlist);

      await Promise.all(
        mergedWishlist.map((item) =>
          addWishlistItem(user.id, item.id)
        )
      );

      activeUserId.current = user.id;
    }

    loadWishlist();
  }, [user, setItems]);

  return <>{children}</>;
}