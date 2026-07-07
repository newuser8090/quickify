"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Logged in successfully");
    router.push("/");
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

        <h1 className="text-4xl font-bold">Login</h1>

        <p className="mt-2 text-gray-500">
          Welcome back to Quickify.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block font-semibold">
              Email
            </label>

            <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
              <Mail size={18} className="text-gray-400" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
              <Lock size={18} className="text-gray-400" />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full outline-none"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-green-600 py-4 font-bold text-white hover:bg-green-700 disabled:bg-gray-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          New to Quickify?{" "}
          <Link href="/signup" className="font-bold text-green-700">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}