"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, LogOut, Moon, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
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
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [notifications, setNotifications] =
    useState<NotificationSettings>(defaultNotifications);

  useEffect(() => {
    const savedNotifications = localStorage.getItem("quickify-notifications");

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  function updateNotification(key: keyof NotificationSettings) {
    const updated = {
      ...notifications,
      [key]: !notifications[key],
    };

    setNotifications(updated);
    localStorage.setItem("quickify-notifications", JSON.stringify(updated));
    toast.success("Notification preference updated");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Logged out successfully");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to shopping
        </Link>

        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="mt-2 text-gray-500">
          Manage your Quickify account preferences.
        </p>

        <div className="mt-10 space-y-5">
          <SettingCard
            icon={<User className="text-green-600" />}
            title="Account"
            text={user?.email ?? "Login to manage your account"}
          >
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/orders"
                className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
              >
                My Orders
              </Link>

              <Link
                href="/addresses"
                className="rounded-xl border px-4 py-2 font-semibold hover:bg-gray-50"
              >
                My Addresses
              </Link>
            </div>
          </SettingCard>

          <SettingCard
            icon={<Bell className="text-green-600" />}
            title="Notifications"
            text="Choose what updates you want to receive."
          >
            <div className="mt-4 space-y-3">
              <ToggleRow
                label="Order alerts"
                checked={notifications.orderAlerts}
                onChange={() => updateNotification("orderAlerts")}
              />

              <ToggleRow
                label="Offers and coupons"
                checked={notifications.offers}
                onChange={() => updateNotification("offers")}
              />

              <ToggleRow
                label="Delivery updates"
                checked={notifications.deliveryUpdates}
                onChange={() => updateNotification("deliveryUpdates")}
              />
            </div>
          </SettingCard>

          <SettingCard
            icon={<Moon className="text-green-600" />}
            title="Appearance"
            text="Quickify currently uses a clean light theme across the app."
          >
            <div className="mt-4 rounded-2xl border bg-gray-50 p-4 text-sm text-gray-600">
              Theme customization will be added later after global theme support
              is applied across the full app.
            </div>
          </SettingCard>

          <SettingCard
            icon={<ShieldCheck className="text-green-600" />}
            title="Privacy & Security"
            text="Manage login and security preferences."
          >
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
  href="/security"
  className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
>
  Open Security Center
</Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
              >
                <LogOut size={17} />
                Logout
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
  text,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-green-50 p-4">{icon}</div>

        <div className="flex-1">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-gray-500">{text}</p>

          {children}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl border p-4">
      <span className="font-semibold">{label}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 accent-green-600"
      />
    </label>
  );
}