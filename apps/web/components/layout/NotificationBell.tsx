"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Package,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  type PanInfo,
} from "motion/react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import {
  clearReadNotifications,
  deleteUserNotification,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type UserNotification,
} from "@/services/notificationService";

const SWIPE_DELETE_DISTANCE = 90;
const SWIPE_DELETE_VELOCITY = 650;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] =
    useState(false);
  const [deletingIds, setDeletingIds] =
    useState<Set<number>>(
      new Set()
    );

  const containerRef =
    useRef<HTMLDivElement>(null);

  const router = useRouter();
  const queryClient =
    useQueryClient();

  const user = useAuthStore(
    (state) => state.user
  );

  const {
    data: notifications = [],
  } = useQuery({
    queryKey: [
      "user-notifications",
      user?.id,
    ],
    queryFn: () =>
      getUserNotifications(
        user!.id
      ),
    enabled: Boolean(user?.id),
  });

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.is_read
      ).length,
    [notifications]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const channel = supabase
      .channel(
        `user-notifications-${user.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "user-notifications",
              user.id,
            ],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    queryClient,
    user?.id,
  ]);

  useEffect(() => {
    function handleDesktopOutsideClick(
      event: MouseEvent
    ) {
      if (
        window.matchMedia(
          "(max-width: 639px)"
        ).matches
      ) {
        return;
      }

      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleDesktopOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleDesktopOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const isMobile =
      window.matchMedia(
        "(max-width: 639px)"
      ).matches;

    if (!isMobile) {
      return;
    }

    const scrollY =
      window.scrollY;

    const previousHtmlOverflow =
      document.documentElement.style
        .overflow;

    const previousBodyPosition =
      document.body.style.position;

    const previousBodyTop =
      document.body.style.top;

    const previousBodyLeft =
      document.body.style.left;

    const previousBodyRight =
      document.body.style.right;

    const previousBodyWidth =
      document.body.style.width;

    const previousBodyOverflow =
      document.body.style.overflow;

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.position =
      "fixed";

    document.body.style.top =
      `-${scrollY}px`;

    document.body.style.left =
      "0";

    document.body.style.right =
      "0";

    document.body.style.width =
      "100%";

    document.body.style.overflow =
      "hidden";

    return () => {
      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.position =
        previousBodyPosition;

      document.body.style.top =
        previousBodyTop;

      document.body.style.left =
        previousBodyLeft;

      document.body.style.right =
        previousBodyRight;

      document.body.style.width =
        previousBodyWidth;

      document.body.style.overflow =
        previousBodyOverflow;

      window.scrollTo({
        top: scrollY,
        left: 0,
        behavior: "instant",
      });
    };
  }, [open]);

  async function refreshNotifications() {
    if (!user?.id) {
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: [
        "user-notifications",
        user.id,
      ],
    });
  }

  async function handleNotificationClick(
    notification: UserNotification
  ) {
    if (
      deletingIds.has(
        notification.id
      )
    ) {
      return;
    }

    try {
      if (
        !notification.is_read
      ) {
        await markNotificationAsRead(
          notification.id
        );

        await refreshNotifications();
      }

      setOpen(false);

      if (notification.link) {
        router.push(
          notification.link
        );
      }
    } catch (error) {
      console.error(
        "Failed to open notification:",
        error
      );

      toast.error(
        "Notification could not be opened"
      );
    }
  }

  async function handleMarkAllAsRead() {
    if (!user?.id) {
      return;
    }

    try {
      await markAllNotificationsAsRead(
        user.id
      );

      await refreshNotifications();

      toast.success(
        "All notifications marked as read"
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      toast.error(
        "Notifications could not be updated"
      );
    }
  }

  async function handleClearRead() {
    if (!user?.id) {
      return;
    }

    try {
      await clearReadNotifications(
        user.id
      );

      await refreshNotifications();

      toast.success(
        "Read notifications cleared"
      );
    } catch (error) {
      console.error(
        "Failed to clear read notifications:",
        error
      );

      toast.error(
        "Notifications could not be cleared"
      );
    }
  }

  async function handleDeleteNotification(
    notificationId: number
  ) {
    if (
      deletingIds.has(
        notificationId
      )
    ) {
      return;
    }

    setDeletingIds(
      (current) =>
        new Set(current).add(
          notificationId
        )
    );

    try {
      await deleteUserNotification(
        notificationId
      );

      queryClient.setQueryData<
        UserNotification[]
      >(
        [
          "user-notifications",
          user?.id,
        ],
        (current = []) =>
          current.filter(
            (notification) =>
              notification.id !==
              notificationId
          )
      );

    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error
      );

      toast.error(
        "Notification could not be removed"
      );

      await refreshNotifications();
    } finally {
      setDeletingIds(
        (current) => {
          const next =
            new Set(current);

          next.delete(
            notificationId
          );

          return next;
        }
      );
    }
  }

  function handleSwipeEnd(
    notificationId: number,
    info: PanInfo
  ) {
    const swipedFarEnough =
      Math.abs(
        info.offset.x
      ) >=
      SWIPE_DELETE_DISTANCE;

    const swipedFastEnough =
      Math.abs(
        info.velocity.x
      ) >=
      SWIPE_DELETE_VELOCITY;

    if (
      swipedFarEnough ||
      swipedFastEnough
    ) {
      void handleDeleteNotification(
        notificationId
      );
    }
  }

  if (!user) {
    return null;
  }

  const notificationList = (
    <NotificationList
      notifications={
        notifications
      }
      deletingIds={
        deletingIds
      }
      onNotificationClick={
        handleNotificationClick
      }
      onDelete={
        handleDeleteNotification
      }
      onSwipeEnd={
        handleSwipeEnd
      }
    />
  );

  const mobileDrawer =
    mounted
      ? createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.button
                  key="notification-overlay"
                  type="button"
                  aria-label="Close notifications"
                  onClick={() =>
                    setOpen(false)
                  }
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.22,
                  }}
                  className="fixed inset-0 z-[9994] cursor-default bg-black/40 backdrop-blur-[6px] sm:hidden"
                />

                <motion.aside
                  key="notification-drawer"
                  initial={{
                    x: "100%",
                  }}
                  animate={{
                    x: 0,
                  }}
                  exit={{
                    x: "100%",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 32,
                  }}
                  className="fixed inset-y-0 right-0 z-[9995] flex h-[100dvh] w-[86%] max-w-[380px] flex-col bg-white shadow-2xl sm:hidden"
                >
                  <NotificationHeader
                    unreadCount={
                      unreadCount
                    }
                    hasNotifications={
                      notifications.length >
                      0
                    }
                    hasReadNotifications={notifications.some(
                      (
                        notification
                      ) =>
                        notification.is_read
                    )}
                    onClose={() =>
                      setOpen(false)
                    }
                    onMarkAllRead={
                      handleMarkAllAsRead
                    }
                    onClearRead={
                      handleClearRead
                    }
                    mobile
                  />

                  <div className="flex-1 overflow-y-auto overscroll-contain">
                    {notificationList}
                  </div>

                  {notifications.length >
                    0 && (
                    <div
                      className="border-t bg-gray-50 px-4 py-3 text-center text-[11px] text-gray-500"
                      style={{
                        paddingBottom:
                          "max(12px, env(safe-area-inset-bottom))",
                      }}
                    >
                      Swipe a notification left or right to remove it
                    </div>
                  )}
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current
          )
        }
        className="relative rounded-xl p-2.5 transition hover:bg-gray-100 sm:p-3"
        aria-label="Open notifications"
        aria-expanded={open}
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            transition={{
              duration: 0.18,
            }}
            className="absolute right-0 top-14 z-[80] hidden w-96 overflow-hidden rounded-3xl border bg-white shadow-xl sm:block"
          >
            <NotificationHeader
              unreadCount={
                unreadCount
              }
              hasNotifications={
                notifications.length >
                0
              }
              hasReadNotifications={notifications.some(
                (
                  notification
                ) =>
                  notification.is_read
              )}
              onMarkAllRead={
                handleMarkAllAsRead
              }
              onClearRead={
                handleClearRead
              }
            />

            <div className="max-h-[420px] overflow-y-auto overscroll-contain">
              {notificationList}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mobileDrawer}
    </div>
  );
}

function NotificationHeader({
  unreadCount,
  hasNotifications,
  hasReadNotifications,
  onClose,
  onMarkAllRead,
  onClearRead,
  mobile = false,
}: {
  unreadCount: number;
  hasNotifications: boolean;
  hasReadNotifications: boolean;
  onClose?: () => void;
  onMarkAllRead: () => void;
  onClearRead: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">
            Notifications
          </h3>

          {unreadCount > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
              {unreadCount} new
            </span>
          )}
        </div>

        <p className="mt-0.5 text-xs text-gray-500">
          Orders, offers, and stock alerts
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={
            onMarkAllRead
          }
          disabled={
            !hasNotifications ||
            unreadCount === 0
          }
          title="Mark all as read"
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <CheckCheck size={18} />
        </button>

        <button
          type="button"
          onClick={onClearRead}
          disabled={
            !hasReadNotifications
          }
          title="Clear read notifications"
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Trash2 size={18} />
        </button>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="ml-1 rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
          >
            <ChevronRight
              size={23}
            />
          </button>
        )}
      </div>
    </div>
  );
}

function NotificationList({
  notifications,
  deletingIds,
  onNotificationClick,
  onDelete,
  onSwipeEnd,
}: {
  notifications: UserNotification[];
  deletingIds: Set<number>;
  onNotificationClick: (
    notification: UserNotification
  ) => void;
  onDelete: (
    notificationId: number
  ) => void;
  onSwipeEnd: (
    notificationId: number,
    info: PanInfo
  ) => void;
}) {
  if (
    notifications.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
          <Package size={26} />
        </div>

        <p className="mt-4 font-semibold text-gray-800">
          No notifications yet
        </p>

        <p className="mt-1 max-w-xs text-sm text-gray-500">
          Order updates, offers, and stock alerts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <AnimatePresence
        initial={false}
        mode="popLayout"
      >
        {notifications.map(
          (notification) => (
            <SwipeableNotification
              key={
                notification.id
              }
              notification={
                notification
              }
              deleting={deletingIds.has(
                notification.id
              )}
              onOpen={() =>
                onNotificationClick(
                  notification
                )
              }
              onDelete={() =>
                onDelete(
                  notification.id
                )
              }
              onSwipeEnd={(
                info
              ) =>
                onSwipeEnd(
                  notification.id,
                  info
                )
              }
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
}

function SwipeableNotification({
  notification,
  deleting,
  onOpen,
  onDelete,
  onSwipeEnd,
}: {
  notification: UserNotification;
  deleting: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onSwipeEnd: (
    info: PanInfo
  ) => void;
}) {
  const draggedRef =
    useRef(false);

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
      }}
      exit={{
        opacity: 0,
        height: 0,
        x: 140,
      }}
      transition={{
        duration: 0.22,
      }}
      className="relative overflow-hidden border-b last:border-b-0"
    >
      <div className="absolute inset-0 flex items-center justify-between bg-red-500 px-5 text-white">
        <div className="flex items-center gap-2">
          <Trash2 size={18} />
          <span className="text-xs font-bold">
            Remove
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">
            Remove
          </span>
          <Trash2 size={18} />
        </div>
      </div>

      <motion.div
  role="button"
  tabIndex={0}
        drag={
          deleting
            ? false
            : "x"
        }
        dragConstraints={{
          left: -140,
          right: 140,
        }}
        dragElastic={0.2}
        onDragStart={() => {
          draggedRef.current =
            true;
        }}
        onDragEnd={(
          _event,
          info
        ) => {
          onSwipeEnd(info);

          window.setTimeout(
            () => {
              draggedRef.current =
                false;
            },
            80
          );
        }}
        
        onClick={() => {
          if (
            draggedRef.current ||
            deleting
          ) {
            return;
          }

          onOpen();
        }}
        onKeyDown={(event) => {
  if (
    event.key === "Enter" ||
    event.key === " "
  ) {
    event.preventDefault();

    if (
      draggedRef.current ||
      deleting
    ) {
      return;
    }

    onOpen();
  }
}}
        whileDrag={{
          scale: 0.985,
        }}
        className={`relative block w-full p-4 text-left transition hover:bg-gray-50 ${
          notification.is_read
            ? "bg-white"
            : "bg-green-50"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">
              {
                notification.title
              }
            </p>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              {
                notification.message
              }
            </p>

            <p className="mt-2 text-[11px] text-gray-400">
              {new Date(
                notification.created_at
              ).toLocaleString(
                "en-IN",
                {
                  dateStyle:
                    "medium",
                  timeStyle:
                    "short",
                }
              )}
            </p>
          </div>

          {!notification.is_read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-600" />
          )}
        </div>

        <button
          type="button"
          onClick={(
            event
          ) => {
            event.stopPropagation();
            onDelete();
          }}
          disabled={deleting}
          className="absolute bottom-3 right-3 hidden rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 sm:block"
          aria-label="Delete notification"
          title="Delete notification"
        >
          <Trash2 size={15} />
        </button>
      </motion.div>
    </motion.div>
  );
}
