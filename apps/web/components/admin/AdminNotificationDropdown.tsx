"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCheck,
  CreditCard,
  Package,
  ShoppingBag,
  Trash2,
  UserPlus,
} from "lucide-react";

import {
  clearReadAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from "@/services/adminNotificationService";
import { useAdminNotificationStore } from "@/store/adminNotificationStore";
import type { AdminNotification } from "@/types/adminNotification";

type AdminNotificationDropdownProps = {
  onClose: () => void;
};

function getTimeAgo(dateString: string) {
  const timestamp = new Date(dateString).getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const difference = Math.max(0, Date.now() - timestamp);

  const minutes = Math.floor(difference / 60_000);
  const hours = Math.floor(difference / 3_600_000);
  const days = Math.floor(difference / 86_400_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "Yesterday";

  return `${days} days ago`;
}

function getIcon(notification: AdminNotification) {
  switch (notification.type) {
    case "order":
      return <ShoppingBag className="h-4 w-4" />;

    case "payment":
      return <CreditCard className="h-4 w-4" />;

    case "stock":
      return <AlertTriangle className="h-4 w-4" />;

    case "customer":
      return <UserPlus className="h-4 w-4" />;

    default:
      return <Package className="h-4 w-4" />;
  }
}

function getNavigationPath(notification: AdminNotification) {
  if (notification.type === "order" || notification.type === "payment") {
    return notification.reference_id
      ? `/admin/orders/${notification.reference_id}`
      : "/admin/orders";
  }

  if (notification.type === "stock") {
    return "/admin/products";
  }

  if (notification.type === "customer") {
    return "/admin/users";
  }

  return "/admin";
}

export default function AdminNotificationDropdown({
  onClose,
}: AdminNotificationDropdownProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = useAdminNotificationStore(
    (state) => state.notifications
  );

  const markReadLocal = useAdminNotificationStore(
    (state) => state.markReadLocal
  );

  const markAllReadLocal = useAdminNotificationStore(
    (state) => state.markAllReadLocal
  );

  const removeReadLocal = useAdminNotificationStore(
    (state) => state.removeReadLocal
  );

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  async function refreshNotifications() {
    await queryClient.invalidateQueries({
      queryKey: ["admin-notifications"],
    });

    await queryClient.refetchQueries({
      queryKey: ["admin-notifications"],
    });
  }

  async function handleNotificationClick(
    notification: AdminNotification
  ) {
    try {
      if (!notification.is_read) {
        await markAdminNotificationAsRead(notification.id);
        markReadLocal(notification.id);
        await refreshNotifications();
      }

      onClose();
      router.push(getNavigationPath(notification));
    } catch (error) {
      console.error(
        "Failed to open admin notification:",
        error
      );
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAdminNotificationsAsRead();
      markAllReadLocal();
      await refreshNotifications();
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  }

  async function handleClearRead() {
    try {
      await clearReadAdminNotifications();
      removeReadLocal();
      await refreshNotifications();
    } catch (error) {
      console.error(
        "Failed to clear read notifications:",
        error
      );
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Admin Notifications
          </h3>

          <p className="text-xs text-gray-500">
            Real-time store activity
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            title="Mark all as read"
            aria-label="Mark all notifications as read"
          >
            <CheckCheck className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleClearRead}
            disabled={
              !notifications.some(
                (notification) => notification.is_read
              )
            }
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            title="Clear read notifications"
            aria-label="Clear read notifications"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <Package className="mb-3 h-8 w-8 text-gray-300" />

          <p className="text-sm font-medium text-gray-700">
            No notifications yet
          </p>

          <p className="mt-1 text-xs text-gray-500">
            New orders, payments, and alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              onClick={() =>
                handleNotificationClick(notification)
              }
              className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-gray-50 ${
                notification.is_read
                  ? "bg-white"
                  : "bg-green-50/60"
              }`}
            >
              <div
                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  notification.is_read
                    ? "bg-gray-100 text-gray-500"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {getIcon(notification)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {notification.title}
                  </p>

                  {!notification.is_read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-600" />
                  )}
                </div>

                <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                  {notification.message}
                </p>

                <p className="mt-2 text-[11px] text-gray-400">
                  {getTimeAgo(notification.created_at)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
