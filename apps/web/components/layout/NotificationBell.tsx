"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import {
  clearReadNotifications,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notificationService";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: notifications = [] } = useQuery({
    queryKey: ["user-notifications", user?.id],
    queryFn: () => getUserNotifications(user!.id),
    enabled: !!user?.id,
  });

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
  

  queryClient.invalidateQueries({
    queryKey: ["user-notifications", user.id],
  });
}
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function refreshNotifications() {
    if (!user?.id) return;

    await queryClient.invalidateQueries({
      queryKey: ["user-notifications", user.id],
    });
  }

  async function handleNotificationClick(
    id: number,
    link: string | null
  ) {
    try {
      await markNotificationAsRead(id);
      await refreshNotifications();

      setOpen(false);

      if (link) {
        router.push(link);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  async function handleMarkAllAsRead() {
    if (!user?.id) return;

    try {
      await markAllNotificationsAsRead(user.id);
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }

  async function handleClearRead() {
    if (!user?.id) return;

    try {
      await clearReadNotifications(user.id);
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
    }
  }

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-xl p-3 transition hover:bg-gray-100"
        aria-label="Open notifications"
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-96 overflow-hidden rounded-3xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="font-bold">Notifications</h3>
              <p className="text-xs text-gray-500">
                Orders, offers, and stock alerts
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <CheckCheck size={18} />
              </button>

              <button
                type="button"
                onClick={handleClearRead}
                title="Clear read notifications"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.link
                    )
                  }
                  className={`block w-full border-b p-4 text-left transition hover:bg-gray-50 ${
                    notification.is_read ? "bg-white" : "bg-green-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{notification.title}</p>

                      <p className="mt-1 text-sm text-gray-500">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </p>
                    </div>

                    {!notification.is_read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-600" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
