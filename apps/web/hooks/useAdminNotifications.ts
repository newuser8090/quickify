"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { getAdminNotifications } from "@/services/adminNotificationService";
import { useAdminNotificationStore } from "@/store/adminNotificationStore";

export function useAdminNotifications() {
  const queryClient = useQueryClient();

  const setNotifications = useAdminNotificationStore(
    (state) => state.setNotifications
  );

  const query = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: getAdminNotifications,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
    }
  }, [query.data, setNotifications]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_notifications",
        },
        async () => {
          await queryClient.invalidateQueries({
            queryKey: ["admin-notifications"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}