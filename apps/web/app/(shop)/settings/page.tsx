"use client";

import Link from "next/link";
import { ArrowLeft, Bell, Moon, ShieldCheck, User } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

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
          />

          <SettingCard
            icon={<Bell className="text-green-600" />}
            title="Notifications"
            text="Order alerts, offers, and delivery updates."
          />

          <SettingCard
            icon={<Moon className="text-green-600" />}
            title="Appearance"
            text="Theme settings coming soon."
          />

          <SettingCard
            icon={<ShieldCheck className="text-green-600" />}
            title="Privacy & Security"
            text="Manage security and privacy preferences."
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function SettingCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <div className="rounded-2xl bg-green-50 p-4">{icon}</div>

      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1 text-gray-500">{text}</p>
      </div>
    </div>
  );
}