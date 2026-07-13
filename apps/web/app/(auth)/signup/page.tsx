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
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import {
  motion,
} from "motion/react";
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

  async function handleSignup(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      const {
        data: {
          user,
          session,
        },
        error,
      } =
        await supabase.auth.signUp(
          {
            email:
              email.trim(),
            password,
            options: {
              data: {
                full_name:
                  name.trim(),
                phone:
                  phone.trim(),
              },
            },
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
          "Signup failed"
        );
        return;
      }

      const {
        error: profileError,
      } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          email:
            user.email ??
            email.trim(),
          full_name:
            name.trim(),
          phone:
            phone.trim(),
          role: "customer",
        });

      if (profileError) {
        console.error(
          "Profile creation error:",
          profileError
        );

        toast.error(
          "Profile setup failed"
        );
        return;
      }

      if (session) {
        toast.success(
          "Account created"
        );

        router.replace("/");
        router.refresh();
        return;
      }

      toast.success(
        "Verify your email"
      );

      router.replace(
        "/login"
      );
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      toast.error(
        "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 px-3 py-4 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-green-300/25 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-32px)] max-w-6xl items-center justify-center sm:min-h-[calc(100dvh-64px)]">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur-3xl md:grid-cols-[0.85fr_1.15fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-8 text-white md:block">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold backdrop-blur">
                  <Sparkles
                    size={14}
                  />
                  Join Quickify
                </div>

                <h2 className="mt-8 text-4xl font-black leading-tight">
                  Your grocery run,
                  <span className="block text-green-100">
                    made effortless.
                  </span>
                </h2>

                <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">
                  Create an account
                  to save addresses,
                  track orders and
                  access personalized
                  deals.
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                <ShieldCheck
                  size={26}
                />

                <p className="mt-3 font-extrabold">
                  Safe and secure
                </p>

                <p className="mt-1 text-xs leading-5 text-white/75">
                  Your account details
                  are protected and used
                  only to improve your
                  Quickify experience.
                </p>
              </div>
            </div>
          </div>

          <section className="p-4 sm:p-7 md:p-9">
            <Link
              href="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
              aria-label="Back to home"
            >
              <ArrowLeft
                size={18}
              />
            </Link>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-green-700">
                <Sparkles
                  size={12}
                />
                Create account
              </span>

              <h1 className="mt-3 text-2xl font-black leading-tight text-gray-950 sm:text-3xl">
                Start shopping faster
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Create your Quickify
                account in just a few
                steps.
              </p>
            </div>

            <form
              onSubmit={
                handleSignup
              }
              className="mt-5 grid gap-3.5 sm:grid-cols-2"
            >
              <AuthInput
                label="Name"
                icon={<User size={17} />}
              >
                <input
                  required
                  value={name}
                  onChange={(
                    event
                  ) =>
                    setName(
                      event.target
                        .value
                    )
                  }
                  placeholder="Your name"
                  autoComplete="name"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </AuthInput>

              <AuthInput
                label="Phone"
                icon={<Phone size={17} />}
              >
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(
                    event
                  ) =>
                    setPhone(
                      event.target
                        .value
                    )
                  }
                  placeholder="Phone number"
                  autoComplete="tel"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </AuthInput>

              <div className="sm:col-span-2">
                <AuthInput
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
                        event.target
                          .value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </AuthInput>
              </div>

              <div className="sm:col-span-2">
                <AuthInput
                  label="Password"
                  icon={<Lock size={17} />}
                >
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    minLength={6}
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
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
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
                </AuthInput>
              </div>

              <motion.button
                type="submit"
                whileTap={{
                  scale: 0.98,
                }}
                disabled={
                  loading
                }
                className="sm:col-span-2 mt-1 flex w-full items-center justify-center rounded-2xl bg-green-600 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(22,163,74,0.25)] transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </motion.button>
            </form>

            <p className="mt-5 text-center text-xs text-gray-500 sm:text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-extrabold text-green-700"
              >
                Login
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

function AuthInput({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold text-gray-700 sm:text-sm">
        {label}
      </span>

      <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/80 px-3.5 transition focus-within:border-green-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.08)]">
        <span className="shrink-0 text-gray-400">
          {icon}
        </span>

        {children}
      </div>
    </label>
  );
}