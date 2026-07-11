"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminLayout from "@/components/admin/AdminLayout";
import { getDashboardStats } from "@/services/adminDashboardService";

const chartColors = ["#16a34a", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

export default function AdminDashboardPage() {
  const {
  data: stats,
  isLoading,
  isError,
  refetch,
} = useQuery({
  queryKey: ["admin-dashboard-stats"],
  queryFn: getDashboardStats,
});
if (isError) {
  return (
    <AdminLayout>
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
        <h1 className="text-xl font-bold text-red-700">
          Dashboard data could not be loaded
        </h1>

        <p className="mt-2 text-sm text-red-600">
          Please check your connection and try again.
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </AdminLayout>
  );
}

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Track Quickify sales, orders, payments, and inventory.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
  title="Total Revenue"
  value={
    isLoading
      ? "..."
      : formatCurrency(stats?.totalRevenue ?? 0)
  }
/>
        <StatCard
  title="Today Revenue"
  value={
    isLoading
      ? "..."
      : formatCurrency(stats?.todayRevenue ?? 0)
  }
/>
        <StatCard title="Today Orders" value={isLoading ? "..." : `${stats?.todayOrders ?? 0}`} />
        <StatCard
  title="Avg. Order Value"
  value={
    isLoading
      ? "..."
      : formatCurrency(stats?.averageOrderValue ?? 0)
  }
/>
        <StatCard title="Total Orders" value={isLoading ? "..." : `${stats?.totalOrders ?? 0}`} />
        <StatCard title="Products" value={isLoading ? "..." : `${stats?.totalProducts ?? 0}`} />
        <StatCard title="Customers" value={isLoading ? "..." : `${stats?.totalCustomers ?? 0}`} />
        <StatCard title="Paid Orders" value={isLoading ? "..." : `${stats?.paidOrders ?? 0}`} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-2xl font-bold">Revenue Overview</h2>

          <div className="mt-6 h-80">
            {(stats?.revenueByDay ?? []).length === 0 ? (
              <EmptyChart text="No revenue data yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.revenueByDay}>
                  <XAxis
  dataKey="date"
  tickFormatter={(value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    )
  }
/>
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Payment Methods</h2>

          <div className="mt-6 h-80">
            {(stats?.paymentMethodData ?? []).length === 0 ? (
              <EmptyChart text="No payment data yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.paymentMethodData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {stats?.paymentMethodData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Order Status</h2>

          <div className="mt-6 h-72">
            {(stats?.orderStatusData ?? []).length === 0 ? (
              <EmptyChart text="No orders yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.orderStatusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {stats?.orderStatusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Payment Summary</h2>

          <div className="mt-6 grid gap-4">
            <MiniStat label="Online Orders" value={`${stats?.onlineOrders ?? 0}`} />
            <MiniStat label="COD Orders" value={`${stats?.codOrders ?? 0}`} />
            <MiniStat label="Paid Orders" value={`${stats?.paidOrders ?? 0}`} />
            <MiniStat label="Pending Payments" value={`${stats?.pendingPayments ?? 0}`} />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Low Stock Products</h2>

          <div className="mt-6 space-y-4">
            {(stats?.lowStockProducts ?? []).length === 0 ? (
              <p className="text-gray-500">No low stock products.</p>
            ) : (
              stats?.lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-2xl bg-red-50 p-4">
                  <p className="font-bold">{product.name}</p>
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    Only {product.stock} left
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Best Selling Products</h2>

          <div className="mt-6 space-y-4">
            {(stats?.bestSellingProducts ?? []).length === 0 ? (
              <p className="text-gray-500">No sales yet.</p>
            ) : (
              stats?.bestSellingProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between rounded-2xl bg-green-50 p-4"
                >
                  <div>
                    <p className="font-bold">
                      #{index + 1} {product.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Sold {product.quantity} units
                    </p>
                  </div>

                  <p className="font-bold text-green-700">
  {formatCurrency(product.revenue)}
</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Recent Orders</h2>

          <div className="mt-6 space-y-4">
            {(stats?.recentOrders ?? []).length === 0 ? (
              <p className="text-gray-500">No recent orders yet.</p>
            ) : (
              stats?.recentOrders.map((order) => (
                <div key={order.id} className="rounded-2xl bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span className="font-bold">Order #{order.id}</span>
                    <span className="font-bold text-green-700">
  {formatCurrency(Number(order.total ?? 0))}
</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      {order.payment_method}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 ${
                        order.payment_status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.payment_status ?? "Pending"}
                    </span>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                      {order.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      <h3 className="mt-3 text-3xl font-bold">{value}</h3>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
      <span className="font-semibold text-gray-600">{label}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl bg-gray-50 text-gray-500">
      {text}
    </div>
  );
}