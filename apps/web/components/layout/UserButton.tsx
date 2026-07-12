"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Ticket,
  User,
  UserPlus,
} from "lucide-react";
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

  const containerRef =
    useRef<HTMLDivElement>(null);

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
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
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
          const resolvedRole =
            data?.role === "creator"
              ? "creator"
              : data?.role === "admin"
                ? "admin"
                : "customer";

          setRole(resolvedRole);
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
        className="flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 font-semibold transition hover:bg-gray-200"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <User size={18} />

        {user
          ? "My Account"
          : "Account"}

        <ChevronDown
          size={16}
          className={`transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border bg-white shadow-xl"
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

            {user && hasAdminAccess && (
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  role === "creator"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {role === "creator"
                  ? "Creator"
                  : "Admin"}
              </span>
            )}
          </div>

          {user ? (
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
                icon={
                  <Package size={18} />
                }
                title="My Orders"
                onClick={() =>
                  setOpen(false)
                }
              />

              <MenuItem
                href="/wishlist"
                icon={
                  <Heart size={18} />
                }
                title="Wishlist"
                onClick={() =>
                  setOpen(false)
                }
              />

              <MenuItem
                href="/coupons"
                icon={
                  <Ticket size={18} />
                }
                title="Coupons"
                onClick={() =>
                  setOpen(false)
                }
              />

              <MenuItem
                href="/addresses"
                icon={
                  <MapPin size={18} />
                }
                title="Saved Addresses"
                onClick={() =>
                  setOpen(false)
                }
              />

              <MenuItem
                href="/settings"
                icon={
                  <Settings size={18} />
                }
                title="Settings"
                onClick={() =>
                  setOpen(false)
                }
              />

              <MenuItem
                href="/security"
                icon={
                  <ShieldCheck
                    size={18}
                  />
                }
                title="Security"
                onClick={() =>
                  setOpen(false)
                }
              />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-red-600 transition hover:bg-red-50"
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
          )}

          <div className="border-t p-4 text-center text-xs text-gray-500">
            Quickify v1.1
          </div>
        </div>
      )}
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
      className={`flex items-center gap-3 px-5 py-3 font-medium transition ${
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
