"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export default function SecurityPage() {
  const user = useAuthStore(
    (state) => state.user
  );

  const setUser = useAuthStore(
    (state) => state.setUser
  );

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPasswords,
    setShowPasswords,
  ] = useState(false);

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    loggingOutAll,
    setLoggingOutAll,
  ] = useState(false);

  async function handleUpdatePassword(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!user?.email) {
      toast.error(
        "Please login first"
      );
      return;
    }

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.error(
        "Please fill all password fields"
      );
      return;
    }

    if (
      newPassword.length < 6
    ) {
      toast.error(
        "New password must be at least 6 characters"
      );
      return;
    }

    if (
      newPassword ===
      currentPassword
    ) {
      toast.error(
        "New password must be different from your current password"
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "New password and confirmation do not match"
      );
      return;
    }

    try {
      setUpdating(true);

      const {
        error: verifyError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: user.email,
            password:
              currentPassword,
          }
        );

      if (verifyError) {
        toast.error(
          "Current password is incorrect"
        );
        return;
      }

      const { error } =
        await supabase.auth.updateUser(
          {
            password:
              newPassword,
          }
        );

      if (error) {
        throw error;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success(
        "Password updated successfully"
      );
    } catch (error) {
      console.error(
        "Password update failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Password could not be updated"
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogoutAllDevices() {
    const confirmed =
      window.confirm(
        "Log out from all devices? You will need to sign in again."
      );

    if (!confirmed) return;

    try {
      setLoggingOutAll(true);

      const { error } =
        await supabase.auth.signOut(
          {
            scope: "global",
          }
        );

      if (error) {
        throw error;
      }

      setUser(null);

      toast.success(
        "Logged out from all devices"
      );
    } catch (error) {
      console.error(
        "Global logout failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not log out from all devices"
      );
    } finally {
      setLoggingOutAll(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-5 text-white shadow-[0_20px_60px_rgba(22,163,74,0.28)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />

          <Link
            href="/settings"
            aria-label="Back to settings"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30 active:scale-95 sm:right-6 sm:top-6"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="relative z-[1] pr-14 sm:pr-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
              <ShieldCheck size={14} />
              Security Center
            </div>

            <h1 className="mt-4 text-2xl font-extrabold sm:text-4xl">
              Privacy & Security
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
              Protect your Quickify account, update your password and manage active sessions.
            </p>
          </div>

          <div className="relative z-[1] mt-5 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur sm:mt-7 sm:max-w-lg sm:px-5 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-green-100">
              Security status
            </p>

            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2
                size={18}
                className="shrink-0"
              />

              <p className="text-sm font-bold">
                Your account is protected
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4 sm:mt-8 sm:space-y-5">
          <SecurityCard
            icon={<Mail size={21} />}
            title="Account Email"
            description="The email address connected to your Quickify account."
          >
            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="break-all text-sm font-bold text-gray-900 sm:text-base">
                {user?.email ??
                  "Not logged in"}
              </p>

              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-green-700 sm:text-sm">
                <CheckCircle2
                  size={16}
                />
                Email verified
              </div>
            </div>
          </SecurityCard>

          <SecurityCard
            icon={
              <KeyRound size={21} />
            }
            title="Change Password"
            description="Use a strong password that you do not use on other websites."
          >
            <form
              onSubmit={
                handleUpdatePassword
              }
              className="mt-4 space-y-4"
            >
              <PasswordInput
                label="Current Password"
                value={
                  currentPassword
                }
                show={
                  showPasswords
                }
                autoComplete="current-password"
                onChange={
                  setCurrentPassword
                }
              />

              <PasswordInput
                label="New Password"
                value={
                  newPassword
                }
                show={
                  showPasswords
                }
                autoComplete="new-password"
                onChange={
                  setNewPassword
                }
              />

              <PasswordInput
                label="Confirm New Password"
                value={
                  confirmPassword
                }
                show={
                  showPasswords
                }
                autoComplete="new-password"
                onChange={
                  setConfirmPassword
                }
              />

              <div className="rounded-2xl bg-green-50 p-4 text-xs leading-5 text-green-800 sm:text-sm">
                Your new password must contain at least 6 characters and must be different from your current password.
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords(
                      (current) =>
                        !current
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  {showPasswords ? (
                    <EyeOff
                      size={17}
                    />
                  ) : (
                    <Eye
                      size={17}
                    />
                  )}

                  {showPasswords
                    ? "Hide Passwords"
                    : "Show Passwords"}
                </button>

                <button
                  type="submit"
                  disabled={
                    updating
                  }
                  className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {updating
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          </SecurityCard>

          <SecurityCard
            icon={<Lock size={21} />}
            title="Session Security"
            description="End all active Quickify sessions, including sessions on other devices."
          >
            <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-sm font-bold text-orange-800">
                Log out everywhere
              </p>

              <p className="mt-1 text-xs leading-5 text-orange-700 sm:text-sm">
                You will be signed out from this device and every other device currently using your account.
              </p>

              <button
                type="button"
                onClick={
                  handleLogoutAllDevices
                }
                disabled={
                  loggingOutAll
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto sm:px-5"
              >
                <LogOut size={17} />

                {loggingOutAll
                  ? "Logging out..."
                  : "Logout From All Devices"}
              </button>
            </div>
          </SecurityCard>

          <section className="rounded-3xl border border-red-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 sm:h-12 sm:w-12">
                <Trash2 size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-extrabold text-red-600 sm:text-xl">
                  Delete Account
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Permanently deleting an account requires additional secure backend verification.
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-4 w-full cursor-not-allowed rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-bold text-red-300 sm:w-auto"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function SecurityCard({
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

function PasswordInput({
  label,
  value,
  show,
  autoComplete,
  onChange,
}: {
  label: string;
  value: string;
  show: boolean;
  autoComplete:
    | "current-password"
    | "new-password";
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700 sm:text-sm">
        <Lock
          size={15}
          className="text-green-600"
        />

        {label}
      </span>

      <div className="relative">
        <input
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          autoComplete={
            autoComplete
          }
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 sm:text-base"
          required
        />

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </div>
      </div>
    </label>
  );
}
