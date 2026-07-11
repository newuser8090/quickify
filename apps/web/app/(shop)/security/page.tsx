"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export default function SecurityPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!user?.email) {
      toast.error("Please login first");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setUpdating(true);

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        toast.error("Current password is incorrect");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password updated successfully");
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogoutAllDevices() {
    const { error } = await supabase.auth.signOut({
      scope: "global",
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setUser(null);
    toast.success("Logged out from all devices");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/settings"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to settings
        </Link>

        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-600" size={34} />
          <div>
            <h1 className="text-4xl font-bold">Privacy & Security</h1>
            <p className="mt-1 text-gray-500">
              Manage your login and account security.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Account Email</h2>

            <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
              <p className="font-semibold">{user?.email ?? "Not logged in"}</p>

              <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 size={16} />
                Email verified
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Lock className="text-green-600" />
              <h2 className="text-xl font-bold">Change Password</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
              <PasswordInput
                label="Current Password"
                value={currentPassword}
                show={showPasswords}
                onChange={setCurrentPassword}
              />

              <PasswordInput
                label="New Password"
                value={newPassword}
                show={showPasswords}
                onChange={setNewPassword}
              />

              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                show={showPasswords}
                onChange={setConfirmPassword}
              />

              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-700"
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPasswords ? "Hide passwords" : "Show passwords"}
              </button>

              <button
                type="submit"
                disabled={updating}
                className="block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-300"
              >
                {updating ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Session Security</h2>
            <p className="mt-1 text-gray-500">
              Sign out from all active sessions across your devices.
            </p>

            <button
              onClick={handleLogoutAllDevices}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600"
            >
              <LogOut size={17} />
              Logout From All Devices
            </button>
          </section>

          <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-red-600">
              <Trash2 size={20} />
              Delete Account
            </h2>

            <p className="mt-2 text-gray-500">
              Account deletion requires secure backend verification. This option
              will be added later.
            </p>

            <button
              disabled
              className="mt-5 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-300"
            >
              Delete Account
            </button>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function PasswordInput({
  label,
  value,
  show,
  onChange,
}: {
  label: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">{label}</span>

      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
      />
    </label>
  );
}