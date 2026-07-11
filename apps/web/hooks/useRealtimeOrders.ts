"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";


export default function useRealtimeOrders(userId?: string) {
  const queryClient = useQueryClient();


  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`orders-realtime-${userId}`)
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

          if (newOrder.id) {
            queryClient.invalidateQueries({
              queryKey: ["order", newOrder.id],
            });

            queryClient.invalidateQueries({
              queryKey: ["admin-order", newOrder.id],
            });
          }

          queryClient.invalidateQueries({
            queryKey: ["admin-orders"],
          });

          queryClient.invalidateQueries({
            queryKey: ["admin-dashboard-stats"],
          });

          if (newOrder.status) {
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}