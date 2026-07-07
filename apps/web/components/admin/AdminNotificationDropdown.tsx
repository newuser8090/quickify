"use client";

import { useRouter } from "next/navigation";
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

function getTimeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

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
    return "/admin/customers";
  }

  return "/admin";
}

export default function AdminNotificationDropdown() {
  const router = useRouter();

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

  async function handleNotificationClick(notification: AdminNotification) {
    if (!notification.is_read) {
      markReadLocal(notification.id);
      await markAdminNotificationAsRead(notification.id);
    }

    router.push(getNavigationPath(notification));
  }

  async function handleMarkAllRead() {
    markAllReadLocal();
    await markAllAdminNotificationsAsRead();
  }

  async function handleClearRead() {
    removeReadLocal();
    await clearReadAdminNotifications();
  }

  return (
    <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-2xl border bg-white shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Admin Notifications
          </h3>
          <p className="text-xs text-gray-500">
            Real-time store activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            title="Mark all as read"
          >
            <CheckCheck className="h-4 w-4" />
          </button>

          <button
            onClick={handleClearRead}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-red-600"
            title="Clear read notifications"
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
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex w-full gap-3 border-b px-4 py-3 text-left transition hover:bg-gray-50 ${
                !notification.is_read ? "bg-green-50/60" : "bg-white"
              }`}
            >
              <div
                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  !notification.is_read
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
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