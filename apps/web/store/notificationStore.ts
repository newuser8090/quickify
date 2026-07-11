import { create } from "zustand";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "order" | "coupon" | "system" | "stock";
  read: boolean;
  createdAt: string;
};

type NotificationStore = {
  notifications: Notification[];

  addNotification: (
    notification: Omit<Notification, "id" | "read" | "createdAt">
  ) => void;

  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  unreadCount: () => number;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),

  clearNotifications: () =>
    set({
      notifications: [],
    }),

  unreadCount: () =>
    get().notifications.filter((notification) => !notification.read).length,
}));