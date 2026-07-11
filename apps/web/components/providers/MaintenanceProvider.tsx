"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Construction, LogIn, ShoppingBag } from "lucide-react";

import { getStoreSettings } from "@/services/storeSettingsService";

export default function MaintenanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: getStoreSettings,
  });

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/login";

  const routeAllowedDuringMaintenance = isAdminRoute || isLoginRoute;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <ShoppingBag size={30} />
          </div>

          <p className="mt-4 font-semibold text-gray-600">
            Loading Quickify...
          </p>
        </div>
      </main>
    );
  }

  if (settings?.maintenance_mode && !routeAllowedDuringMaintenance) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-orange-600">
            <Construction size={40} />
          </div>

          <h1 className="mt-6 text-4xl font-extrabold">
            We’ll be back shortly
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-lg text-gray-500">
            {settings.store_name} is temporarily unavailable while we make a
            few improvements. Please check back soon.
          </p>

          {(settings.support_email || settings.support_phone) && (
            <div className="mt-8 rounded-2xl bg-gray-50 p-5">
              <p className="font-semibold text-gray-700">
                Need help?
              </p>

              {settings.support_email && (
                <p className="mt-2 text-sm text-gray-500">
                  Email: {settings.support_email}
                </p>
              )}

              {settings.support_phone && (
                <p className="mt-1 text-sm text-gray-500">
                  Phone: {settings.support_phone}
                </p>
              )}
            </div>
          )}

          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
          >
            <LogIn size={18} />
            Admin Login
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
