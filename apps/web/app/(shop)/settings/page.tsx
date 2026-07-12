"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  LogOut,
  Moon,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

type NotificationSettings = {
  orderAlerts: boolean;
  offers: boolean;
  deliveryUpdates: boolean;
};

const defaultNotifications: NotificationSettings = {
  orderAlerts: true,
  offers: true,
  deliveryUpdates: true,
};

export default function SettingsPage() {
  const user = useAuthStore(
    (state) => state.user
  );

  const setUser = useAuthStore(
    (state) => state.setUser
  );

  const [
    notifications,
    setNotifications,
  ] = useState<NotificationSettings>(
    defaultNotifications
  );

  const [loggingOut, setLoggingOut] =
    useState(false);

  useEffect(() => {
    const savedNotifications =
      localStorage.getItem(
        "quickify-notifications"
      );

    if (!savedNotifications) {
      return;
    }

    try {
      const parsed =
        JSON.parse(
          savedNotifications
        ) as NotificationSettings;

      setNotifications({
        ...defaultNotifications,
        ...parsed,
      });
    } catch (error) {
      console.error(
        "Notification preferences could not be loaded:",
        error
      );
    }
  }, []);

  function updateNotification(
    key: keyof NotificationSettings
  ) {
    const updated = {
      ...notifications,
      [key]:
        !notifications[key],
    };

    setNotifications(updated);

    localStorage.setItem(
      "quickify-notifications",
      JSON.stringify(updated)
    );

    toast.success(
      "Notification preference updated"
    );
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);

      toast.success(
        "Logged out successfully"
      );
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Logout failed"
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-5 text-white shadow-[0_20px_60px_rgba(22,163,74,0.28)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />

          <Link
            href="/"
            aria-label="Back to home"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30 active:scale-95 sm:right-6 sm:top-6"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="relative z-[1] pr-14 sm:pr-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
              <User size={14} />
              Account preferences
            </div>

            <h1 className="mt-4 text-2xl font-extrabold sm:text-4xl">
              Settings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
              Manage your account, notifications, appearance and security preferences.
            </p>
          </div>

          <div className="relative z-[1] mt-5 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur sm:mt-7 sm:max-w-lg sm:px-5 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-green-100">
              Signed in as
            </p>

            <p className="mt-1 truncate text-sm font-bold sm:text-base">
              {user?.email ??
                "Guest user"}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4 sm:mt-8 sm:space-y-5">
          <SettingCard
            icon={<User size={21} />}
            title="Account"
            description="Access your orders and saved delivery addresses."
          >
            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <SettingsLink
                href="/orders"
                label="My Orders"
              />

              <SettingsLink
                href="/addresses"
                label="My Addresses"
                secondary
              />
            </div>
          </SettingCard>

          <SettingCard
            icon={<Bell size={21} />}
            title="Notifications"
            description="Choose which Quickify updates you want to receive."
          >
            <div className="mt-4 space-y-2.5">
              <ToggleRow
                label="Order alerts"
                description="Updates about order placement and status."
                checked={
                  notifications.orderAlerts
                }
                onChange={() =>
                  updateNotification(
                    "orderAlerts"
                  )
                }
              />

              <ToggleRow
                label="Offers and coupons"
                description="New discounts and promotional offers."
                checked={
                  notifications.offers
                }
                onChange={() =>
                  updateNotification(
                    "offers"
                  )
                }
              />

              <ToggleRow
                label="Delivery updates"
                description="Live delivery and rider progress updates."
                checked={
                  notifications.deliveryUpdates
                }
                onChange={() =>
                  updateNotification(
                    "deliveryUpdates"
                  )
                }
              />
            </div>
          </SettingCard>

          <SettingCard
            icon={<Moon size={21} />}
            title="Appearance"
            description="Control how Quickify looks on your device."
          >
            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm font-bold text-gray-800">
                Light theme
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                Quickify currently uses a consistent light theme. More appearance options can be added after global theme support is completed.
              </p>
            </div>
          </SettingCard>

          <SettingCard
            icon={
              <ShieldCheck
                size={21}
              />
            }
            title="Privacy & Security"
            description="Manage your password, sessions and account security."
          >
            <div className="mt-4 space-y-3">
              <Link
                href="/security"
                className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50 px-4 py-3.5 text-sm font-bold text-green-700 transition hover:bg-green-100"
              >
                <span>
                  Open Security Center
                </span>

                <ChevronRight
                  size={18}
                />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut size={17} />

                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </button>
            </div>
          </SettingCard>
        </div>
      </section>
    </main>
  );
}

function SettingCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600 sm:h-12 sm:w-12">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            {description}
          </p>

          {children}
        </div>
      </div>
    </section>
  );
}

function SettingsLink({
  href,
  label,
  secondary = false,
}: {
  href: string;
  label: string;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        secondary
          ? "border border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      {label}
    </Link>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-3.5 transition hover:bg-green-50 sm:p-4">
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-green-600"
            : "bg-gray-300"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </label>
  );
}
