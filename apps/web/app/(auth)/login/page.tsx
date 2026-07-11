"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);

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
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!user) {
        toast.error(
          "Unable to load your account"
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
          "Logged in, but account role could not be verified"
        );

        return;
      }

      toast.success(
        "Logged in successfully"
      );

      const hasAdminAccess =
        profile?.role === "admin" ||
        profile?.role === "creator";

      router.replace(
        hasAdminAccess ? "/admin" : "/"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      toast.error("Failed to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-green-700"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold">
          Login
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back to Quickify.
        </p>

        <form
          onSubmit={handleLogin}
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
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="font-semibold">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-green-700 transition hover:text-green-800 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

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
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="••••••••"
                autoComplete="current-password"
                className="min-w-0 flex-1 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          New to Quickify?{" "}
          <Link
            href="/signup"
            className="font-bold text-green-700"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
