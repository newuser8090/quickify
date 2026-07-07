"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { isAdmin } from "@/services/adminService";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setAllowed(false);
        setChecking(false);
        return;
      }

      const result = await isAdmin(user.id);
      setAllowed(result);
      setChecking(false);
    }

    checkAdmin();
  }, [user]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl font-bold">Checking admin access...</p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow">
          <ShieldAlert className="mx-auto text-red-500" size={48} />

          <h1 className="mt-4 text-3xl font-bold">Access Denied</h1>

          <p className="mt-2 text-gray-500">
            You do not have permission to view the admin dashboard.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}