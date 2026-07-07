"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Settings,
  Ticket,
  User,
  UserPlus,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export default function UserButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("click", handleClick);

    return () =>
      window.removeEventListener("click", handleClick);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 font-semibold transition hover:bg-gray-200"
      >
        <User size={18} />

        {user ? "My Account" : "Account"}

        <ChevronDown
          size={16}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border bg-white shadow-xl">
          <div className="border-b p-5">
            <p className="text-sm text-gray-500">Welcome</p>

            <h3 className="truncate text-lg font-bold">
              {user ? user.email : "Guest User"}
            </h3>
          </div>

          {user ? (
            <>
              <div className="py-2">
                <MenuItem
                  href="/wishlist"
                  icon={<Heart size={18} />}
                  title="Wishlist"
                />

                <MenuItem
                  href="/orders"
                  icon={<Package size={18} />}
                  title="My Orders"
                />

                <MenuItem
                  href="/addresses"
                  icon={<MapPin size={18} />}
                  title="Saved Addresses"
                />

                <MenuItem
                  href="/coupons"
                  icon={<Ticket size={18} />}
                  title="Coupons"
                />

                <MenuItem
                  href="/settings"
                  icon={<Settings size={18} />}
                  title="Settings"
                />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-gray-100"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-3">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
              >
                <LogIn size={18} />
                Login
              </Link>

              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 rounded-xl border py-3 font-semibold hover:bg-gray-50"
              >
                <UserPlus size={18} />
                Create Account
              </Link>
            </div>
          )}

          <div className="border-t p-4 text-center text-xs text-gray-500">
            Quickify v1.0
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
};

function MenuItem({
  href,
  icon,
  title,
}: MenuItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-100"
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
}