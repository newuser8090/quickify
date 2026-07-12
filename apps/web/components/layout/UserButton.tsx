"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Settings,
  Ticket,
  User,
  UserPlus,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";

type AccountRole =
  | "customer"
  | "admin"
  | "creator"
  | null;

export default function UserButton() {
  const [open, setOpen] = useState(false);
  const [role, setRole] =
    useState<AccountRole>(null);
  const [checkingRole, setCheckingRole] =
    useState(false);
  const [mounted, setMounted] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  const mobileDrawerRef =
    useRef<HTMLElement>(null);

  const user = useAuthStore(
    (state) => state.user
  );

  const setUser = useAuthStore(
    (state) => state.setUser
  );

  const clearAddresses = useAddressStore(
    (state) => state.clearAddresses
  );

  const hasAdminAccess =
    role === "admin" ||
    role === "creator";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      const clickedDesktopButtonOrMenu =
        containerRef.current?.contains(
          target
        );

      const clickedInsideMobileDrawer =
        mobileDrawerRef.current?.contains(
          target
        );

      if (
        !clickedDesktopButtonOrMenu &&
        !clickedInsideMobileDrawer
      ) {
        setOpen(false);
      }
    }

    window.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      window.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      if (!user) {
        setRole(null);
        setCheckingRole(false);
        return;
      }

      try {
        setCheckingRole(true);

        const { data, error } =
          await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setRole(
            data?.role === "creator"
              ? "creator"
              : data?.role === "admin"
                ? "admin"
                : "customer"
          );
        }
      } catch (error) {
        console.error(
          "Account role lookup failed:",
          error
        );

        if (!cancelled) {
          setRole("customer");
        }
      } finally {
        if (!cancelled) {
          setCheckingRole(false);
        }
      }
    }

    loadRole();

    return () => {
      cancelled = true;
    };
  }, [user]);

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

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style
        .overflow;

    const previousBodyTouchAction =
      document.body.style.touchAction;

    document.body.style.overflow =
      "hidden";

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.touchAction =
      "none";

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.touchAction =
        previousBodyTouchAction;
    };
  }, [open]);

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    setUser(null);
    setRole(null);
    clearAddresses();
    setOpen(false);

    toast.success(
      "Logged out successfully"
    );
  }

  const menuContent = user ? (
    <div className="py-2">
      {hasAdminAccess && (
        <>
          <MenuItem
            href="/admin"
            icon={
              <LayoutDashboard
                size={18}
              />
            }
            title="Admin Panel"
            highlighted
            onClick={() =>
              setOpen(false)
            }
          />

          <div className="my-2 border-t" />
        </>
      )}

      {checkingRole && (
        <p className="px-5 py-2 text-xs text-gray-400">
          Checking account access...
        </p>
      )}

      <MenuItem
        href="/orders"
        icon={<Package size={18} />}
        title="My Orders"
        onClick={() =>
          setOpen(false)
        }
      />

      <MenuItem
        href="/wishlist"
        icon={<Heart size={18} />}
        title="Wishlist"
        onClick={() =>
          setOpen(false)
        }
      />

      <MenuItem
        href="/coupons"
        icon={<Ticket size={18} />}
        title="Coupons"
        onClick={() =>
          setOpen(false)
        }
      />

      <MenuItem
        href="/addresses"
        icon={<MapPin size={18} />}
        title="Saved Addresses"
        onClick={() =>
          setOpen(false)
        }
      />

      <MenuItem
        href="/settings"
        icon={<Settings size={18} />}
        title="Settings"
        onClick={() =>
          setOpen(false)
        }
      />

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-5 py-4 text-left text-red-600 transition hover:bg-red-50"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  ) : (
    <div className="space-y-3 p-4">
      <Link
        href="/login"
        onClick={() =>
          setOpen(false)
        }
        className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
      >
        <LogIn size={18} />
        Login
      </Link>

      <Link
        href="/signup"
        onClick={() =>
          setOpen(false)
        }
        className="flex items-center justify-center gap-2 rounded-xl border py-3 font-semibold transition hover:bg-gray-50"
      >
        <UserPlus size={18} />
        Create Account
      </Link>
    </div>
  );

  const mobileDrawer = mounted
    ? createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.button
                key="account-overlay"
                type="button"
                aria-label="Close account menu"
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
                className="fixed inset-0 z-[9998] cursor-default bg-black/40 backdrop-blur-[6px] sm:hidden"
              />

              <motion.aside
                key="account-drawer"
                ref={mobileDrawerRef}
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
                className="fixed inset-y-0 right-0 z-[9999] flex h-[100dvh] w-[78%] max-w-[340px] flex-col bg-white shadow-2xl sm:hidden"
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
              >
                <div className="flex items-center gap-3 border-b px-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">
                      {user
                        ? "Signed in as"
                        : "Welcome"}
                    </p>

                    <h3 className="truncate font-bold">
                      {user?.email ??
                        "Guest User"}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setOpen(false)
                    }
                    className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
                    aria-label="Close account menu"
                  >
                    <ChevronRight
                      size={24}
                    />
                  </button>
                </div>

                {user &&
                  hasAdminAccess && (
                    <div className="px-4 pt-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          role ===
                          "creator"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {role ===
                        "creator"
                          ? "Creator"
                          : "Admin"}
                      </span>
                    </div>
                  )}

                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {menuContent}
                </div>

                <div
                  className="border-t p-4 text-center text-xs text-gray-500"
                  style={{
                    paddingBottom:
                      "max(16px, env(safe-area-inset-bottom))",
                  }}
                >
                  Quickify v1.1
                </div>
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
        className="flex items-center gap-2 rounded-xl bg-gray-100 p-2.5 font-semibold transition hover:bg-gray-200 sm:px-5 sm:py-3"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open account menu"
      >
        <User size={21} />

        <span className="hidden sm:inline">
          {user
            ? "My Account"
            : "Account"}
        </span>

        <ChevronDown
          size={16}
          className={`hidden transition sm:block ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
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
            className="absolute right-0 z-[80] mt-3 hidden w-72 overflow-hidden rounded-2xl border bg-white shadow-xl sm:block"
          >
            <div className="border-b p-5">
              <p className="text-sm text-gray-500">
                {user
                  ? "Signed in as"
                  : "Welcome"}
              </p>

              <h3 className="truncate text-lg font-bold">
                {user?.email ??
                  "Guest User"}
              </h3>

              {user &&
                hasAdminAccess && (
                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      role ===
                      "creator"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {role ===
                    "creator"
                      ? "Creator"
                      : "Admin"}
                  </span>
                )}
            </div>

            {menuContent}

            <div className="border-t p-4 text-center text-xs text-gray-500">
              Quickify v1.1
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mobileDrawer}
    </div>
  );
}

type MenuItemProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  highlighted?: boolean;
  onClick?: () => void;
};

function MenuItem({
  href,
  icon,
  title,
  highlighted = false,
  onClick,
}: MenuItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className={`flex items-center gap-3 px-5 py-4 font-medium transition ${
        highlighted
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
}
