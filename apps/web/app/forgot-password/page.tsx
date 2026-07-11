"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] =
    useState(false);
  const [emailSent, setEmailSent] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error(
        "Please enter your email address"
      );
      return;
    }

    try {
      setSending(true);

      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo: redirectUrl,
          }
        );

      if (error) {
        throw error;
      }

      setEmailSent(true);

      toast.success(
        "Password reset email sent"
      );
    } catch (error) {
      console.error(
        "Password reset request failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Password reset email could not be sent"
      );
    } finally {
      setSending(false);
    }
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

        {emailSent ? (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Send size={28} />
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Check your email
            </h1>

            <p className="mt-3 text-gray-500">
              We sent a password recovery link
              to:
            </p>

            <p className="mt-2 break-all font-bold text-gray-900">
              {email.trim()}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Open the link in that email to
              create a new password. Also check
              your spam folder.
            </p>

            <button
              type="button"
              onClick={() =>
                setEmailSent(false)
              }
              className="mt-6 w-full rounded-xl border border-gray-200 px-5 py-3 font-semibold transition hover:bg-gray-50"
            >
              Use another email
            </button>

            <Link
              href="/login"
              className="mt-3 block w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold">
              Forgot Password?
            </h1>

            <p className="mt-3 text-gray-500">
              Enter the email connected to your
              Quickify account. We’ll send you a
              secure password recovery link.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <div>
                <label className="mb-2 block font-semibold">
                  Email
                </label>

                <div className="flex items-center gap-3 rounded-xl border px-4 py-3 focus-within:border-green-600">
                  <Mail
                    size={18}
                    className="shrink-0 text-gray-400"
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="min-w-0 flex-1 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Send size={18} />

                {sending
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
