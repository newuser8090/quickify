"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { getAdminNotifications } from "@/services/adminNotificationService";
import { useAdminNotificationStore } from "@/store/adminNotificationStore";
import type { AdminNotification } from "@/types/adminNotification";

export function useAdminNotifications() {
  const setNotifications =
    useAdminNotificationStore((state) => state.setNotifications);

  const addNotification =
    useAdminNotificationStore((state) => state.addNotification);

  const query = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: getAdminNotifications,
  });

  useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
    }
  }, [query.data, setNotifications]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          addNotification(payload.new as AdminNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addNotification]);

  return query;
}