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
  BellRing,
  CheckCheck,
  ChevronRight,
  Package,
  Sparkles,
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
  const [open, setOpen] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [
    deletingIds,
    setDeletingIds,
  ] = useState<Set<number>>(
    new Set()
  );

  const containerRef =
    useRef<HTMLDivElement>(null);

  const mobileDrawerRef =
    useRef<HTMLElement>(null);

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

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.is_read
        ).length,
      [notifications]
    );

  const hasReadNotifications =
    useMemo(
      () =>
        notifications.some(
          (notification) =>
            notification.is_read
        ),
      [notifications]
    );

  function closeDrawer() {
    setOpen(false);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const channel =
      supabase
        .channel(
          `user-notifications-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "notifications",
            filter:
              `user_id=eq.${user.id}`,
          },
          () => {
            queryClient.invalidateQueries(
              {
                queryKey: [
                  "user-notifications",
                  user.id,
                ],
              }
            );
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
    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      const clickedDesktop =
        containerRef.current?.contains(
          target
        );

      const clickedMobile =
        mobileDrawerRef.current?.contains(
          target
        );

      if (
        !clickedDesktop &&
        !clickedMobile
      ) {
        closeDrawer();
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
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
        closeDrawer();
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
      document.documentElement
        .style.overflow;

    const previousBodyPosition =
      document.body.style
        .position;

    const previousBodyTop =
      document.body.style.top;

    const previousBodyLeft =
      document.body.style.left;

    const previousBodyRight =
      document.body.style.right;

    const previousBodyWidth =
      document.body.style.width;

    const previousBodyOverflow =
      document.body.style
        .overflow;

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

      closeDrawer();

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
        "Could not open notification"
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
        "All marked as read"
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      toast.error(
        "Could not update notifications"
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
        "Read alerts cleared"
      );
    } catch (error) {
      console.error(
        "Failed to clear read notifications:",
        error
      );

      toast.error(
        "Could not clear notifications"
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
        "Could not remove notification"
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
                  onClick={
                    closeDrawer
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
                    duration: 0.24,
                  }}
                  className="fixed inset-0 z-[9994] cursor-default bg-slate-950/45 backdrop-blur-[8px] sm:hidden"
                />

                <motion.aside
                  key="notification-drawer"
                  ref={
                    mobileDrawerRef
                  }
                  initial={{
                    x: "100%",
                    opacity: 0.92,
                  }}
                  animate={{
                    x: 0,
                    opacity: 1,
                  }}
                  exit={{
                    x: "100%",
                    opacity: 0.92,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 310,
                    damping: 32,
                    mass: 0.9,
                  }}
                  className="fixed inset-y-0 right-0 z-[9995] flex h-[100dvh] w-[88%] max-w-[380px] flex-col overflow-hidden border-l border-white/60 bg-white/95 shadow-[-22px_0_60px_rgba(15,23,42,0.22)] backdrop-blur-3xl sm:hidden"
                >
                  <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-green-200/35 blur-3xl" />

                  <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-emerald-100/50 blur-3xl" />

                  <NotificationHeader
                    unreadCount={
                      unreadCount
                    }
                    hasNotifications={
                      notifications.length >
                      0
                    }
                    hasReadNotifications={
                      hasReadNotifications
                    }
                    onClose={
                      closeDrawer
                    }
                    onMarkAllRead={
                      handleMarkAllAsRead
                    }
                    onClearRead={
                      handleClearRead
                    }
                    mobile
                  />

                  <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                    {notificationList}
                  </div>

                  <NotificationFooter
                    hasNotifications={
                      notifications.length >
                      0
                    }
                  />
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
            (current) =>
              !current
          )
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-gray-700 transition hover:border-green-100 hover:bg-green-50 hover:text-green-700 sm:h-11 sm:w-11"
        aria-label="Open notifications"
        aria-expanded={open}
      >
        <motion.div
          animate={
            unreadCount > 0
              ? {
                  rotate: [
                    0,
                    -8,
                    8,
                    -5,
                    5,
                    0,
                  ],
                }
              : {}
          }
          transition={{
            duration: 0.55,
          }}
        >
          <Bell size={21} />
        </motion.div>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-black text-white shadow-sm">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{
              opacity: 0,
              y: -10,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.97,
            }}
            transition={{
              duration: 0.18,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="absolute right-0 top-14 z-[80] hidden w-[390px] overflow-hidden rounded-[26px] border border-white/70 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.2)] backdrop-blur-3xl sm:block"
          >
            <NotificationHeader
              unreadCount={
                unreadCount
              }
              hasNotifications={
                notifications.length >
                0
              }
              hasReadNotifications={
                hasReadNotifications
              }
              onMarkAllRead={
                handleMarkAllAsRead
              }
              onClearRead={
                handleClearRead
              }
            />

            <div className="max-h-[460px] overflow-y-auto overscroll-contain px-3 py-3">
              {notificationList}
            </div>

            <NotificationFooter
              hasNotifications={
                notifications.length >
                0
              }
            />
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
    <header
      className={`relative z-20 shrink-0 overflow-hidden border-b border-white/60 bg-gradient-to-br from-green-50/95 via-white/95 to-emerald-50/90 px-4 pb-4 backdrop-blur-2xl ${
        mobile
          ? "pt-[max(18px,env(safe-area-inset-top))]"
          : "pt-4"
      }`}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-green-200/40 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_12px_28px_rgba(22,163,74,0.28)]">
            <BellRing size={22} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-gray-950">
                Notifications
              </h3>

              {unreadCount >
                0 && (
                <span className="rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-green-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-gray-500">
              Orders, offers and
              stock updates
            </p>
          </div>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/70 text-gray-600 shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
          >
            <ChevronRight
              size={21}
            />
          </button>
        )}
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={
            onMarkAllRead
          }
          disabled={
            !hasNotifications ||
            unreadCount === 0
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-green-100 bg-white/75 px-3 py-2.5 text-[11px] font-extrabold text-green-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:text-gray-300 disabled:shadow-none"
        >
          <CheckCheck size={15} />
          Mark all read
        </button>

        <button
          type="button"
          onClick={onClearRead}
          disabled={
            !hasReadNotifications
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white/75 px-3 py-2.5 text-[11px] font-extrabold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:shadow-none"
        >
          <Trash2 size={14} />
          Clear read
        </button>
      </div>
    </header>
  );
}

function NotificationList({
  notifications,
  deletingIds,
  onNotificationClick,
  onDelete,
  onSwipeEnd,
}: {
  notifications:
    UserNotification[];
  deletingIds: Set<number>;
  onNotificationClick: (
    notification:
      UserNotification
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
    notifications.length ===
    0
  ) {
    return (
      <div className="flex min-h-[330px] flex-col items-center justify-center rounded-3xl border border-dashed border-green-100 bg-gradient-to-br from-green-50/80 to-white px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-green-600 shadow-[0_12px_30px_rgba(22,163,74,0.13)]">
          <Package size={28} />
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wide text-green-700">
          <Sparkles size={12} />
          All caught up
        </span>

        <p className="mt-3 font-black text-gray-900">
          No notifications yet
        </p>

        <p className="mt-1 max-w-xs text-xs leading-5 text-gray-500">
          Order updates, offers and
          stock alerts will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
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
  notification:
    UserNotification;
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
      className="relative overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0 flex items-center justify-between rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 px-5 text-white">
        <div className="flex items-center gap-2">
          <Trash2 size={17} />

          <span className="text-xs font-black">
            Remove
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black">
            Remove
          </span>

          <Trash2 size={17} />
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
        dragElastic={0.18}
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
        onKeyDown={(
          event
        ) => {
          if (
            event.key ===
              "Enter" ||
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
        className={`group relative w-full cursor-pointer rounded-2xl border p-3.5 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-green-500 ${
          notification.is_read
            ? "border-gray-100 bg-white"
            : "border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50"
        } ${
          deleting
            ? "pointer-events-none opacity-50"
            : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              notification.is_read
                ? "bg-gray-100 text-gray-500"
                : "bg-white text-green-700 shadow-sm"
            }`}
          >
            <BellRing
              size={17}
            />

            {!notification.is_read && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-600" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2 pr-7">
              <p
                className={`line-clamp-1 text-sm text-gray-900 ${
                  notification.is_read
                    ? "font-bold"
                    : "font-black"
                }`}
              >
                {
                  notification.title
                }
              </p>
            </div>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
              {
                notification.message
              }
            </p>

            <p className="mt-2 text-[10px] font-semibold text-gray-400">
              {formatNotificationTime(
                notification.created_at
              )}
            </p>
          </div>
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
          className="absolute right-2.5 top-2.5 hidden h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-600 sm:flex"
          aria-label="Delete notification"
          title="Delete notification"
        >
          <Trash2 size={14} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function NotificationFooter({
  hasNotifications,
}: {
  hasNotifications: boolean;
}) {
  return (
    <footer
      className="relative z-20 shrink-0 border-t border-gray-100 bg-white/85 px-4 py-3 text-center backdrop-blur-xl"
      style={{
        paddingBottom:
          "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <p className="text-[10px] font-semibold text-gray-400">
        {hasNotifications
          ? "Swipe a notification to remove it"
          : "Quickify will keep you updated here"}
      </p>
    </footer>
  );
}

function formatNotificationTime(
  dateString: string
) {
  const timestamp =
    new Date(
      dateString
    ).getTime();

  if (
    Number.isNaN(timestamp)
  ) {
    return "";
  }

  const difference =
    Math.max(
      0,
      Date.now() -
        timestamp
    );

  const minutes =
    Math.floor(
      difference / 60_000
    );

  const hours =
    Math.floor(
      difference /
        3_600_000
    );

  const days =
    Math.floor(
      difference /
        86_400_000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return new Date(
    dateString
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  );
}