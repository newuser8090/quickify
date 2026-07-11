"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { fetchUserCart, fetchUserSavedCart } from "@/services/cartService";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    async function syncUserCart(userId: string) {
      const [cartItems, savedItems] = await Promise.all([
        fetchUserCart(userId),
        fetchUserSavedCart(userId),
      ]);

      useCartStore.getState().setItems(cartItems);
      useCartStore.getState().setSavedItems(savedItems);
    }

    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);

      if (session?.user) {
        await syncUserCart(session.user.id);
      } else {
        useCartStore.getState().setItems([]);
        useCartStore.getState().setSavedItems([]);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        syncUserCart(session.user.id);
      } else {
        useCartStore.getState().setItems([]);
        useCartStore.getState().setSavedItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return <>{children}</>;
}