"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bike,
  Boxes,
  FolderTree,
  Home,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Ticket,
  Users,
  Warehouse,
} from "lucide-react";

import AdminGuard from "./AdminGuard";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import AdminNotificationDropdown from "@/components/admin/AdminNotificationDropdown";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { FileBarChart } from "lucide-react";

const links = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Boxes,
  },
  {
  href: "/admin/inventory",
  label: "Inventory",
  icon: Warehouse,
},
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: Package,
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: Ticket,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
  href: "/admin/reports",
  label: "Reports",
  icon: FileBarChart,
},
{
  href: "/admin/delivery",
  label: "Delivery",
  icon: Bike,
},
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useAdminNotifications();

  return (
    <AdminGuard>
      <main className="min-h-screen bg-gray-50">
        <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r bg-white">
          <div className="border-b p-6">
            <Link href="/" className="flex items-center gap-3">
                        <div className="rounded-2xl bg-green-600 p-3 text-white">
                        <ShoppingBag size={24} />
                        </div>

                        <div>
                        <h1 className="text-xl font-bold">Quickify</h1>
                        <p className="text-sm text-gray-500">Admin Panel</p>
                        </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
  <nav className="space-y-2">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-gray-600 transition hover:bg-green-50 hover:text-green-700"
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          </div>

          <div className="border-t bg-white p-6">
  <Link
  href="/"
  className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md active:scale-[0.98]"
>
  <Home size={18} />
  Storefront
</Link>
        </div>

        </aside>

        <section className="ml-72 min-h-screen">
          <header className="sticky top-0 z-30 border-b bg-white/80 px-8 py-5 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <p className="text-sm text-gray-500">
                  Manage Quickify operations.
                </p>
              </div>

              <div className="relative">
                <AdminNotificationBell
                  onClick={() => setIsNotificationOpen((prev) => !prev)}
                />

                {isNotificationOpen && <AdminNotificationDropdown />}
              </div>
            </div>
          </header>

          <div className="p-8">{children}</div>
        </section>
      </main>
    </AdminGuard>
  );
}