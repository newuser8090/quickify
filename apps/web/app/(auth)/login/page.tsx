"use client";

import {
  useState,
} from "react";
import Link from "next/link";
import {
  useRouter,
} from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  motion,
} from "motion/react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function handleLogin(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      const {
        data: { user },
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              email.trim(),
            password,
          }
        );

      if (error) {
        toast.error(
          error.message
        );
        return;
      }

      if (!user) {
        toast.error(
          "Unable to load account"
        );
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "Profile lookup error:",
          profileError
        );

        toast.error(
          "Account role unavailable"
        );
        return;
      }

      toast.success(
        "Logged in"
      );

      const hasAdminAccess =
        profile?.role ===
          "admin" ||
        profile?.role ===
          "creator";

      router.replace(
        hasAdminAccess
          ? "/admin"
          : "/"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      toast.error(
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      badge="Welcome back"
      title="Login to Quickify"
      description="Access your orders, saved addresses, wishlist and personalized offers."
    >
      <form
        onSubmit={
          handleLogin
        }
        className="space-y-4"
      >
        <AuthField
          label="Email"
          icon={<Mail size={17} />}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(
              event
            ) =>
              setEmail(
                event.target.value
              )
            }
            placeholder="you@example.com"
            autoComplete="email"
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </AuthField>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label className="text-xs font-extrabold text-gray-700 sm:text-sm">
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-[11px] font-extrabold text-green-700 transition hover:text-green-800 sm:text-xs"
            >
              Forgot password?
            </Link>
          </div>

          <AuthField
            icon={<Lock size={17} />}
            hideLabel
          >
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              required
              value={
                password
              }
              onChange={(
                event
              ) =>
                setPassword(
                  event.target
                    .value
                )
              }
              placeholder="Enter password"
              autoComplete="current-password"
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) =>
                    !current
                )
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-gray-700"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff
                  size={17}
                />
              ) : (
                <Eye
                  size={17}
                />
              )}
            </button>
          </AuthField>
        </div>

        <motion.button
          type="submit"
          whileTap={{
            scale: 0.98,
          }}
          disabled={loading}
          className="flex w-full items-center justify-center rounded-2xl bg-green-600 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(22,163,74,0.25)] transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </motion.button>
      </form>

      <p className="mt-5 text-center text-xs text-gray-500 sm:text-sm">
        New to Quickify?{" "}
        <Link
          href="/signup"
          className="font-extrabold text-green-700"
        >
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({
  badge,
  title,
  description,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  children:
    React.ReactNode;
}) {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 px-3 py-4 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-green-300/25 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-32px)] max-w-6xl items-center justify-center sm:min-h-[calc(100dvh-64px)]">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur-3xl md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-8 text-white md:block">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold backdrop-blur">
                  <Sparkles
                    size={14}
                  />
                  Quickify
                </div>

                <h2 className="mt-8 text-4xl font-black leading-tight">
                  Fresh groceries,
                  <span className="block text-green-100">
                    delivered fast.
                  </span>
                </h2>

                <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">
                  Shop essentials,
                  track orders and
                  manage everything
                  from one secure
                  account.
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                <ShieldCheck
                  size={26}
                />

                <p className="mt-3 font-extrabold">
                  Secure account access
                </p>

                <p className="mt-1 text-xs leading-5 text-white/75">
                  Your Quickify account
                  is protected through
                  Supabase authentication.
                </p>
              </div>
            </div>
          </div>

          <section className="p-4 sm:p-7 md:p-10">
            <Link
              href="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
              aria-label="Back to home"
            >
              <ArrowLeft
                size={18}
              />
            </Link>

            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-green-700">
                <Sparkles
                  size={12}
                />
                {badge}
              </span>

              <h1 className="mt-3 text-2xl font-black leading-tight text-gray-950 sm:text-3xl">
                {title}
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {description}
              </p>
            </div>

            <div className="mt-6">
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AuthField({
  label,
  icon,
  children,
  hideLabel = false,
}: {
  label?: string;
  icon: React.ReactNode;
  children:
    React.ReactNode;
  hideLabel?: boolean;
}) {
  return (
    <div>
      {!hideLabel &&
        label && (
          <label className="mb-2 block text-xs font-extrabold text-gray-700 sm:text-sm">
            {label}
          </label>
        )}

      <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/80 px-3.5 transition focus-within:border-green-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.08)]">
        <span className="shrink-0 text-gray-400">
          {icon}
        </span>

        {children}
      </div>
    </div>
  );
}