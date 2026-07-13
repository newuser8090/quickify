"use client";

import {
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  motion,
} from "motion/react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    emailSent,
    setEmailSent,
  ] = useState(false);

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (!normalizedEmail) {
      toast.error(
        "Enter your email"
      );
      return;
    }

    try {
      setSending(true);

      const redirectUrl =
        typeof window !==
        "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo:
              redirectUrl,
          }
        );

      if (error) {
        throw error;
      }

      setEmailSent(true);

      toast.success(
        "Reset link sent"
      );
    } catch (error) {
      console.error(
        "Password reset request failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send link"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 px-3 py-4 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-green-300/25 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-32px)] max-w-6xl items-center justify-center sm:min-h-[calc(100dvh-64px)]">
        <section className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur-3xl sm:p-7">
          <Link
            href="/login"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
            aria-label="Back to login"
          >
            <ArrowLeft
              size={18}
            />
          </Link>

          {emailSent ? (
            <div className="pt-4 text-center">
              <motion.div
                initial={{
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_16px_34px_rgba(22,163,74,0.3)]"
              >
                <CheckCircle2
                  size={30}
                />
              </motion.div>

              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-green-700">
                <Sparkles
                  size={12}
                />
                Email sent
              </span>

              <h1 className="mt-3 text-2xl font-black text-gray-950 sm:text-3xl">
                Check your inbox
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                We sent a secure
                password recovery
                link to:
              </p>

              <p className="mt-2 break-all rounded-2xl bg-gray-50 px-3 py-2 text-sm font-extrabold text-gray-900">
                {email.trim()}
              </p>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50/70 p-3 text-left">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-xs leading-5 text-gray-600">
                  Open the link in
                  your email to create
                  a new password. Check
                  your spam folder too.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEmailSent(
                    false
                  )
                }
                className="mt-5 w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-extrabold text-gray-700 transition hover:bg-gray-50"
              >
                Use another email
              </button>

              <Link
                href="/login"
                className="mt-3 block w-full rounded-2xl bg-green-600 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(22,163,74,0.24)] transition hover:bg-green-700"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-green-700">
                  <Sparkles
                    size={12}
                  />
                  Account recovery
                </span>

                <h1 className="mt-3 text-2xl font-black leading-tight text-gray-950 sm:text-3xl">
                  Forgot your password?
                </h1>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Enter your account
                  email and we’ll send
                  you a secure reset
                  link.
                </p>
              </div>

              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-6 space-y-4"
              >
                <label className="block">
                  <span className="mb-2 block text-xs font-extrabold text-gray-700 sm:text-sm">
                    Email
                  </span>

                  <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/80 px-3.5 transition focus-within:border-green-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.08)]">
                    <Mail
                      size={17}
                      className="shrink-0 text-gray-400"
                    />

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event.target
                            .value
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                </label>

                <motion.button
                  type="submit"
                  whileTap={{
                    scale: 0.98,
                  }}
                  disabled={
                    sending
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(22,163,74,0.25)] transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                  <Send
                    size={17}
                  />

                  {sending
                    ? "Sending..."
                    : "Send Reset Link"}
                </motion.button>
              </form>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50/70 p-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-xs leading-5 text-gray-600">
                  For security, the
                  recovery link will
                  expire after a limited
                  time.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}