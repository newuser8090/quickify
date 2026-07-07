"use client";

import { Bell } from "lucide-react";

import { useAdminNotificationStore } from "@/store/adminNotificationStore";

type Props = {
  onClick: () => void;
};

export default function AdminNotificationBell({ onClick }: Props) {
  const unreadCount = useAdminNotificationStore((state) =>
    state.unreadCount()
  );

  return (
    <button
      onClick={onClick}
      className="relative rounded-full p-2 transition hover:bg-gray-100"
    >
      <Bell className="h-6 w-6" />

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}