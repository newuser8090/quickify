"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
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

type Props = {
  compact?: boolean;
};

type AccountRole =
  | "customer"
  | "admin"
  | "creator"
  | null;

type MenuItemProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  highlighted?: boolean;
  onClick?: () => void;
};

export default function UserButton({
  compact = false,
}: Props) {
  const [open, setOpen] =
    useState(false);

  const [role, setRole] =
    useState<AccountRole>(
      null
    );

  const [
    checkingRole,
    setCheckingRole,
  ] = useState(false);

  const [mounted, setMounted] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(
      null
    );

  const mobileDrawerRef =
    useRef<HTMLElement>(null);

  const user = useAuthStore(
    (state) => state.user
  );

  const setUser =
    useAuthStore(
      (state) =>
        state.setUser
    );

  const clearAddresses =
    useAddressStore(
      (state) =>
        state.clearAddresses
    );

  const hasAdminAccess =
    role === "admin" ||
    role === "creator";

  const displayName =
    user?.user_metadata
      ?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Quickify User";

  const userInitial =
    displayName
      .charAt(0)
      .toUpperCase() || "Q";

  function closeMenu() {
    setOpen(false);
  }

  function toggleMenu() {
    setOpen(
      (current) => !current
    );
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      const clickedInsideDesktop =
        containerRef.current?.contains(
          target
        );

      const clickedInsideMobile =
        mobileDrawerRef.current?.contains(
          target
        );

      if (
        !clickedInsideDesktop &&
        !clickedInsideMobile
      ) {
        closeMenu();
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

        const {
          data,
          error,
        } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (cancelled) {
          return;
        }

        if (
          data?.role ===
          "creator"
        ) {
          setRole("creator");
          return;
        }

        if (
          data?.role ===
          "admin"
        ) {
          setRole("admin");
          return;
        }

        setRole("customer");
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

    const scrollY =
      window.scrollY;

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

    const previousHtmlOverflow =
      document.documentElement
        .style.overflow;

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

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      toast.error(
        error.message
      );
      return;
    }

    setUser(null);
    setRole(null);
    clearAddresses();
    closeMenu();

    toast.success(
      "Logged out successfully"
    );
  }

  const accountMenu = user ? (
    <SignedInMenu
      hasAdminAccess={
        hasAdminAccess
      }
      checkingRole={
        checkingRole
      }
      onClose={closeMenu}
      onLogout={
        handleLogout
      }
    />
  ) : (
    <GuestMenu
      onClose={closeMenu}
    />
  );

  const mobileDrawer =
    mounted
      ? createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.button
                  key="account-overlay"
                  type="button"
                  aria-label="Close account menu"
                  onClick={
                    closeMenu
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
                  className="fixed inset-0 z-[9998] cursor-default bg-slate-950/45 backdrop-blur-[8px] sm:hidden"
                />

                <motion.aside
                  key="account-drawer"
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
                  className="fixed inset-y-0 right-0 z-[9999] flex h-[100dvh] w-[86%] max-w-[360px] flex-col overflow-hidden border-l border-white/60 bg-white/95 shadow-[-22px_0_60px_rgba(15,23,42,0.22)] backdrop-blur-3xl sm:hidden"
                  onMouseDown={(
                    event
                  ) => {
                    event.stopPropagation();
                  }}
                >
                  <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-green-200/35 blur-3xl" />

                  <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-emerald-100/50 blur-3xl" />

                  <AccountHeader
                    name={
                      displayName
                    }
                    email={
                      user?.email ??
                      null
                    }
                    initial={
                      userInitial
                    }
                    role={role}
                    hasAdminAccess={
                      hasAdminAccess
                    }
                    onClose={
                      closeMenu
                    }
                  />

                  <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                    {
                      accountMenu
                    }
                  </div>

                  <AccountFooter />
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
        onClick={toggleMenu}
        className={
          compact
            ? "flex h-10 w-10 items-center justify-center rounded-full text-gray-800 transition hover:bg-white/50 active:scale-95 sm:h-12 sm:w-12"
            : "flex items-center gap-2 rounded-xl border border-gray-100 bg-white/80 p-2.5 font-semibold text-gray-800 shadow-sm transition hover:border-green-100 hover:bg-green-50 sm:px-4 sm:py-3"
        }
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open account menu"
      >
        {user &&
        !compact ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-xs font-black text-white shadow-sm">
            {userInitial}
          </span>
        ) : (
          <User
            size={
              compact
                ? 20
                : 21
            }
          />
        )}

        {!compact && (
          <>
            <span className="hidden max-w-[110px] truncate sm:inline">
              {user
                ? "My Account"
                : "Account"}
            </span>

            <ChevronDown
              size={15}
              className={`hidden text-gray-500 transition sm:block ${
                open
                  ? "rotate-180"
                  : ""
              }`}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
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
            className="absolute right-0 z-[80] mt-3 hidden w-[320px] overflow-hidden rounded-[26px] border border-white/70 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.2)] backdrop-blur-3xl sm:block"
          >
            <DesktopAccountHeader
              name={displayName}
              email={
                user?.email ??
                null
              }
              initial={
                userInitial
              }
              role={role}
              hasAdminAccess={
                hasAdminAccess
              }
            />

            <div className="px-3 py-3">
              {accountMenu}
            </div>

            <AccountFooter />
          </motion.div>
        )}
      </AnimatePresence>

      {mobileDrawer}
    </div>
  );
}

function SignedInMenu({
  hasAdminAccess,
  checkingRole,
  onClose,
  onLogout,
}: {
  hasAdminAccess: boolean;
  checkingRole: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-1">
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
            description="Manage Quickify"
            highlighted
            onClick={onClose}
          />

          <div className="my-3 border-t border-gray-100" />
        </>
      )}

      {checkingRole && (
        <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Checking account access...
        </div>
      )}

      <MenuItem
        href="/orders"
        icon={
          <Package size={18} />
        }
        title="My Orders"
        description="Track current orders"
        onClick={onClose}
      />

      <MenuItem
        href="/wishlist"
        icon={
          <Heart size={18} />
        }
        title="Wishlist"
        description="Your saved products"
        onClick={onClose}
      />

      <MenuItem
        href="/coupons"
        icon={
          <Ticket size={18} />
        }
        title="Coupons"
        description="Offers and rewards"
        onClick={onClose}
      />

      <MenuItem
        href="/addresses"
        icon={
          <MapPin size={18} />
        }
        title="Saved Addresses"
        description="Manage delivery locations"
        onClick={onClose}
      />

      <MenuItem
        href="/settings"
        icon={
          <Settings size={18} />
        }
        title="Settings"
        description="Account preferences"
        onClick={onClose}
      />

      <div className="my-3 border-t border-gray-100" />

      <button
        type="button"
        onClick={onLogout}
        className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-red-600 transition hover:bg-red-50"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 transition group-hover:bg-red-100">
          <LogOut size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold">
            Logout
          </span>

          <span className="mt-0.5 block text-[11px] text-red-400">
            Sign out of this account
          </span>
        </span>

        <ChevronRight
          size={17}
          className="text-red-300"
        />
      </button>
    </div>
  );
}

function GuestMenu({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-green-700 shadow-sm">
          <Sparkles size={20} />
        </div>

        <h3 className="mt-3 text-lg font-black text-gray-950">
          Welcome to Quickify
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          Sign in to track orders,
          save addresses and access
          personalized offers.
        </p>
      </div>

      <Link
        href="/login"
        onClick={onClose}
        className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(22,163,74,0.24)] transition hover:bg-green-700 active:scale-[0.98]"
      >
        <LogIn size={18} />
        Login
      </Link>

      <Link
        href="/signup"
        onClick={onClose}
        className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-extrabold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
      >
        <UserPlus size={18} />
        Create Account
      </Link>
    </div>
  );
}

function AccountHeader({
  name,
  email,
  initial,
  role,
  hasAdminAccess,
  onClose,
}: {
  name: string;
  email: string | null;
  initial: string;
  role: AccountRole;
  hasAdminAccess: boolean;
  onClose: () => void;
}) {
  return (
    <div className="relative z-10 border-b border-white/60 bg-gradient-to-br from-green-50/90 via-white/90 to-emerald-50/80 px-4 pb-5 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-xl font-black text-white shadow-[0_12px_28px_rgba(22,163,74,0.3)]">
              {initial}
            </div>

            {email && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-600 text-white">
                <BadgeCheck size={11} />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-green-700">
              {email
                ? "Your account"
                : "Welcome"}
            </p>

            <h3 className="mt-1 truncate text-lg font-black text-gray-950">
              {email
                ? name
                : "Guest User"}
            </h3>

            <p className="mt-0.5 truncate text-xs text-gray-500">
              {email ??
                "Sign in to continue"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/70 text-gray-600 shadow-sm backdrop-blur transition hover:bg-white active:scale-95"
          aria-label="Close account menu"
        >
          <ChevronRight
            size={21}
          />
        </button>
      </div>

      {hasAdminAccess && (
        <RoleBadge
          role={role}
          className="mt-4"
        />
      )}

      {email && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2.5 shadow-sm backdrop-blur-xl">
          <ShieldCheck
            size={16}
            className="shrink-0 text-green-600"
          />

          <p className="text-[11px] font-semibold text-gray-600">
            Your account is securely
            connected to Quickify.
          </p>
        </div>
      )}
    </div>
  );
}

function DesktopAccountHeader({
  name,
  email,
  initial,
  role,
  hasAdminAccess,
}: {
  name: string;
  email: string | null;
  initial: string;
  role: AccountRole;
  hasAdminAccess: boolean;
}) {
  return (
    <div className="relative overflow-hidden border-b border-white/60 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-5">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-green-200/40 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <div className="relative">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-lg font-black text-white shadow-[0_10px_24px_rgba(22,163,74,0.28)]">
            {initial}
          </div>

          {email && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-600 text-white">
              <BadgeCheck size={11} />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-green-700">
            {email
              ? "Your account"
              : "Welcome"}
          </p>

          <h3 className="mt-1 truncate text-base font-black text-gray-950">
            {email
              ? name
              : "Guest User"}
          </h3>

          <p className="mt-0.5 truncate text-xs text-gray-500">
            {email ??
              "Sign in to continue"}
          </p>
        </div>
      </div>

      {hasAdminAccess && (
        <RoleBadge
          role={role}
          className="relative mt-3"
        />
      )}
    </div>
  );
}

function RoleBadge({
  role,
  className = "",
}: {
  role: AccountRole;
  className?: string;
}) {
  if (
    role !== "admin" &&
    role !== "creator"
  ) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${
        role === "creator"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-purple-200 bg-purple-50 text-purple-700"
      } ${className}`}
    >
      {role === "creator" ? (
        <Sparkles size={12} />
      ) : (
        <ShieldCheck size={12} />
      )}

      {role === "creator"
        ? "Creator Access"
        : "Admin Access"}
    </span>
  );
}

function AccountFooter() {
  return (
    <div
      className="relative z-10 border-t border-gray-100 bg-white/80 px-4 py-4 text-center backdrop-blur-xl"
      style={{
        paddingBottom:
          "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
        Quickify v1.1
      </p>

      <p className="mt-1 text-[10px] text-gray-400">
        Fresh groceries, delivered fast
      </p>
    </div>
  );
}

function MenuItem({
  href,
  icon,
  title,
  description,
  highlighted = false,
  onClick,
}: MenuItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
        highlighted
          ? "border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-sm hover:from-green-100 hover:to-emerald-50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
          highlighted
            ? "bg-white text-green-700 shadow-sm"
            : "bg-gray-100 text-gray-600 group-hover:bg-white group-hover:text-green-700 group-hover:shadow-sm"
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold">
          {title}
        </span>

        {description && (
          <span className="mt-0.5 block truncate text-[11px] font-medium text-gray-400">
            {description}
          </span>
        )}
      </span>

      <ChevronRight
        size={17}
        className={`shrink-0 transition group-hover:translate-x-0.5 ${
          highlighted
            ? "text-green-400"
            : "text-gray-300"
        }`}
      />
    </Link>
  );
}