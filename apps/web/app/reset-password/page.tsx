"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);
  const [hasRecoverySession, setHasRecoverySession] =
    useState(false);
  const [updating, setUpdating] =
    useState(false);
  const [updated, setUpdated] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const { data } =
        await supabase.auth.getSession();

      if (!mounted) return;

      setHasRecoverySession(
        Boolean(data.session)
      );

      setCheckingSession(false);
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;

          if (
            event ===
              "PASSWORD_RECOVERY" ||
            session
          ) {
            setHasRecoverySession(true);
            setCheckingSession(false);
          }
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (password.length < 6) {
      toast.error(
        "Password must contain at least 6 characters"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        "Passwords do not match"
      );
      return;
    }

    try {
      setUpdating(true);

      const { error } =
  await supabase.auth.updateUser({
    password,
  });

if (error) {
  const message = error.message.toLowerCase();

  if (
    message.includes(
      "new password should be different"
    )
  ) {
    toast.error(
      "Your new password must be different from your current password."
    );
    return;
  }

  throw error;
}
      setUpdated(true);

      toast.success(
        "Password updated successfully"
      );

      await supabase.auth.signOut();
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

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="font-semibold text-gray-600">
            Verifying recovery link...
          </p>
        </div>
      </main>
    );
  }

  if (updated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <CheckCircle2
            size={54}
            className="mx-auto text-green-600"
          />

          <h1 className="mt-5 text-3xl font-bold">
            Password Updated
          </h1>

          <p className="mt-3 text-gray-500">
            Your password was changed
            successfully. You can now log in
            using the new password.
          </p>

          <button
            type="button"
            onClick={() =>
              router.replace("/login")
            }
            className="mt-6 w-full rounded-xl bg-green-600 px-5 py-4 font-bold text-white transition hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  if (!hasRecoverySession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-3xl font-bold">
            Invalid or Expired Link
          </h1>

          <p className="mt-3 text-gray-500">
            This password recovery link is
            invalid or has expired. Request a
            new link and try again.
          </p>

          <Link
            href="/forgot-password"
            className="mt-6 block rounded-xl bg-green-600 px-5 py-4 font-bold text-white transition hover:bg-green-700"
          >
            Request New Link
          </Link>

          <Link
            href="/login"
            className="mt-3 inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"
          >
            <ArrowLeft size={17} />
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-green-700 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to login
        </Link>

        <h1 className="text-4xl font-bold">
          Create New Password
        </h1>

        <p className="mt-3 text-gray-500">
          Choose a secure password for your
          Quickify account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <PasswordInput
            label="New Password"
            value={password}
            showPassword={showPassword}
            onChange={setPassword}
            onToggle={() =>
              setShowPassword(
                (current) => !current
              )
            }
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            showPassword={
              showConfirmPassword
            }
            onChange={setConfirmPassword}
            onToggle={() =>
              setShowConfirmPassword(
                (current) => !current
              )
            }
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={updating}
            className="w-full rounded-xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {updating
              ? "Updating Password..."
              : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

function PasswordInput({
  label,
  value,
  showPassword,
  onChange,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  showPassword: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl border px-4 py-3 focus-within:border-green-600">
        <Lock
          size={18}
          className="shrink-0 text-gray-400"
        />

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          required
          minLength={6}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="Minimum 6 characters"
          autoComplete={autoComplete}
          className="min-w-0 flex-1 outline-none"
        />

        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>
    </div>
  );
}
