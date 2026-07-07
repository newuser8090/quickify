"use client";

import { useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

import { useNotificationStore } from "@/store/notificationStore";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const notifications = useNotificationStore((s) => s.notifications);
  const unread = useNotificationStore((s) => s.unreadCount());
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearNotifications = useNotificationStore(
    (s) => s.clearNotifications
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-3 hover:bg-gray-100"
      >
        <Bell size={22} />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-96 overflow-hidden rounded-3xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-bold">Notifications</h3>

            <div className="flex gap-2">
              <button onClick={markAllAsRead}>
                <CheckCheck size={18} />
              </button>

              <button onClick={clearNotifications}>
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
                  onClick={() => markAsRead(notification.id)}
                  className={`block w-full border-b p-4 text-left ${
                    notification.read ? "" : "bg-green-50"
                  }`}
                >
                  <p className="font-semibold">{notification.title}</p>

                  <p className="text-sm text-gray-500">
                    {notification.message}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}