"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useNotificationStore } from "@/store/notificationStore";

export default function useRealtimeOrders(userId?: string) {
  const queryClient = useQueryClient();

  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newOrder = payload.new as {
            id?: number;
            status?: string;
          };

          queryClient.invalidateQueries({
            queryKey: ["orders", userId],
          });

          queryClient.invalidateQueries({
            queryKey: ["admin-dashboard-stats"],
          });

          if (newOrder.status) {
            addNotification({
              type: "order",
              title: "Order Updated",
              message: `Order #${newOrder.id} is now ${newOrder.status}.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, addNotification]);
}