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
  Phone,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");
  const [phone, setPhone] =
    useState("");
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);

  async function handleSignup(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      const {
        data: { user, session },
        error,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!user) {
        toast.error(
          "Account creation failed"
        );
        return;
      }

      const { error: profileError } =
        await supabase
          .from("users")
          .upsert({
            id: user.id,
            email:
              user.email ??
              email.trim(),
            full_name: name.trim(),
            phone: phone.trim(),
            role: "customer",
          });

      if (profileError) {
        console.error(
          "Profile creation error:",
          profileError
        );

        toast.error(
          "Account created, but profile setup failed"
        );
        return;
      }

      if (session) {
        toast.success(
          "Account created successfully"
        );

        router.replace("/");
        router.refresh();
        return;
      }

      toast.success(
        "Account created. Please verify your email to continue."
      );

      router.replace("/login");
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      toast.error(
        "Failed to create account"
      );
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
          Create Account
        </h1>

        <p className="mt-2 text-gray-500">
          Join Quickify and start shopping
          faster.
        </p>

        <form
          onSubmit={handleSignup}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block font-semibold">
              Name
            </label>

            <div className="flex items-center gap-3 rounded-xl border px-4 py-3 focus-within:border-green-600">
              <User
                size={18}
                className="shrink-0 text-gray-400"
              />

              <input
                required
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your name"
                autoComplete="name"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Phone Number
            </label>

            <div className="flex items-center gap-3 rounded-xl border px-4 py-3 focus-within:border-green-600">
              <Phone
                size={18}
                className="shrink-0 text-gray-400"
              />

              <input
                type="tel"
                required
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                placeholder="Enter your phone number"
                autoComplete="tel"
                className="w-full outline-none"
              />
            </div>
          </div>

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
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Password
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
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
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
                title={
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
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-green-700"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
