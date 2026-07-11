"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export default function RealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const channel = supabase
      .channel("quickify-global-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const order = payload.new as {
            id?: number;
            user_id?: string;
          };

          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });

          if (order.id) {
            queryClient.invalidateQueries({
              queryKey: ["admin-order", order.id],
            });

            queryClient.invalidateQueries({
              queryKey: ["order", order.id],
            });
          }

          if (order.user_id) {
            queryClient.invalidateQueries({
              queryKey: ["orders", order.user_id],
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const notification = payload.new as {
            user_id?: string;
          };

          if (notification.user_id) {
            queryClient.invalidateQueries({
              queryKey: ["user-notifications", notification.user_id],
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_notifications",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["admin-notifications"],
          });
        }
      )
      .on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "categories",
  },
  () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["homepage-categories"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }
)
.on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "store_settings",
    filter: "id=eq.1",
  },
  () => {
    queryClient.invalidateQueries({
      queryKey: ["store-settings"],
    });
  }
)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!user?.id) return;

    queryClient.invalidateQueries({ queryKey: ["orders", user.id] });
    queryClient.invalidateQueries({
      queryKey: ["user-notifications", user.id],
    });
  }, [queryClient, user?.id]);

  return <>{children}</>;
}