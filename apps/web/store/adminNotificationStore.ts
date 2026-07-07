import { create } from "zustand";

import type { AdminNotification } from "@/types/adminNotification";

type AdminNotificationStore = {
  notifications: AdminNotification[];
  setNotifications: (notifications: AdminNotification[]) => void;
  addNotification: (notification: AdminNotification) => void;
  markReadLocal: (id: string) => void;
  markAllReadLocal: () => void;
  removeReadLocal: () => void;
  unreadCount: () => number;
};

export const useAdminNotificationStore = create<AdminNotificationStore>(
  (set, get) => ({
    notifications: [],

    setNotifications: (notifications) => set({ notifications }),

    addNotification: (notification) =>
      set({
        notifications: [
          notification,
          ...get().notifications.filter((item) => item.id !== notification.id),
        ],
      }),

    markReadLocal: (id) =>
      set({
        notifications: get().notifications.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        ),
      }),

    markAllReadLocal: () =>
      set({
        notifications: get().notifications.map((item) => ({
          ...item,
          is_read: true,
        })),
      }),

    removeReadLocal: () =>
      set({
        notifications: get().notifications.filter((item) => !item.is_read),
      }),

    unreadCount: () =>
      get().notifications.filter((item) => !item.is_read).length,
  })
);