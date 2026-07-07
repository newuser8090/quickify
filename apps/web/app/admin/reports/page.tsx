"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { TableSkeleton } from "@/components/common/Skeleton";
import {
  BarChart3,
  CreditCard,
  Download,
  FileText,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


import AdminLayout from "@/components/admin/AdminLayout";
import { getSalesReport } from "@/services/salesReportService";

const chartColors = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function AdminReportsPage() {
  const [fromDate, setFromDate] = useState(getDaysAgo(7));
  const [toDate, setToDate] = useState(getToday());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["sales-report", fromDate, toDate],
    queryFn: () => getSalesReport({ fromDate, toDate }),
  });

  const summary = data?.summary;

  const csvContent = useMemo(() => {
    if (!data) return "";

    const rows = [
      ["Date", "Orders", "Revenue"],
      ...data.dailySales.map((row) => [row.date, row.orders, row.revenue]),
    ];

    return rows.map((row) => row.join(",")).join("\n");
  }, [data]);

  function applyPreset(days: number) {
    setFromDate(getDaysAgo(days));
    setToDate(getToday());
  }

  function downloadCSV() {
    if (!csvContent) return;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `quickify-sales-report-${fromDate}-to-${toDate}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  async function downloadPDF() {
  if (!data) return;

  const { jsPDF } = await import("jspdf/dist/jspdf.umd.min");

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Quickify Sales Report", 14, 18);

  doc.setFontSize(10);
  doc.text(`Date Range: ${fromDate} to ${toDate}`, 14, 28);

  doc.setFontSize(12);
  doc.text(`Total Revenue: Rs. ${summary?.totalRevenue ?? 0}`, 14, 42);
  doc.text(`Total Orders: ${summary?.totalOrders ?? 0}`, 14, 50);
  doc.text(`Paid Orders: ${summary?.paidOrders ?? 0}`, 14, 58);
  doc.text(`COD Orders: ${summary?.codOrders ?? 0}`, 14, 66);
  doc.text(
    `Average Order Value: Rs. ${summary?.averageOrderValue ?? 0}`,
    14,
    74
  );

  let y = 92;

  doc.setFontSize(14);
  doc.text("Top Selling Products", 14, y);
  y += 10;

  doc.setFontSize(10);

  data.topProducts.slice(0, 10).forEach((product, index) => {
    doc.text(
      `${index + 1}. ${product.productName} - Qty: ${
        product.quantitySold
      }, Revenue: Rs. ${product.revenue}`,
      14,
      y
    );
    y += 8;
  });

  doc.save(`quickify-sales-report-${fromDate}-to-${toDate}.pdf`);
}

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sales Reports</h1>
            <p className="mt-2 text-gray-500">
              Analyze revenue, orders, payments, and best-selling products.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadCSV}
              disabled={!data}
              className="flex items-center gap-2 rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50 disabled:bg-gray-100"
            >
              <Download size={18} />
              CSV
            </button>

            <button
              onClick={downloadPDF}
              disabled={!data}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-300"
            >
              <FileText size={18} />
              PDF
            </button>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap gap-3">
            <button
              onClick={() => applyPreset(0)}
              className="rounded-xl border px-4 py-2 font-semibold hover:bg-green-50 hover:text-green-700"
            >
              Today
            </button>

            <button
              onClick={() => applyPreset(7)}
              className="rounded-xl border px-4 py-2 font-semibold hover:bg-green-50 hover:text-green-700"
            >
              Last 7 Days
            </button>

            <button
              onClick={() => applyPreset(30)}
              className="rounded-xl border px-4 py-2 font-semibold hover:bg-green-50 hover:text-green-700"
            >
              Last 30 Days
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="mb-2 block font-semibold">From Date</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
              />
            </label>

            <label>
              <span className="mb-2 block font-semibold">To Date</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
              />
            </label>

            <div className="flex items-end">
              <button
                onClick={() => refetch()}
                className="w-full rounded-xl border px-4 py-3 font-semibold hover:bg-gray-50"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              <ReportCard title="Total Revenue" value={`₹${summary?.totalRevenue ?? 0}`} icon={BarChart3} />
              <ReportCard title="Total Orders" value={summary?.totalOrders ?? 0} icon={ShoppingBag} />
              <ReportCard title="Paid Orders" value={summary?.paidOrders ?? 0} icon={CreditCard} />
              <ReportCard title="COD Orders" value={summary?.codOrders ?? 0} icon={Wallet} />
              <ReportCard title="Avg. Order Value" value={`₹${summary?.averageOrderValue ?? 0}`} icon={Package} />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Revenue Trend</h2>

                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.dailySales ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#16a34a"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Orders by Day</h2>

                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.dailySales ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#16a34a" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Payment Breakdown</h2>

                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.paymentMethods ?? []}
                        dataKey="revenue"
                        nameKey="method"
                        outerRadius={110}
                        label
                      >
                        {(data?.paymentMethods ?? []).map((_, index) => (
                          <Cell
                            key={index}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Top Selling Products</h2>

                <div className="mt-5 overflow-hidden rounded-2xl border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Revenue</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data?.topProducts.slice(0, 8).map((product) => (
                        <tr key={product.productId} className="border-t">
                          <td className="px-4 py-3 font-semibold">{product.productName}</td>
                          <td className="px-4 py-3">{product.quantitySold}</td>
                          <td className="px-4 py-3 font-bold">₹{product.revenue}</td>
                        </tr>
                      ))}

                      {data?.topProducts.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            No product sales found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function ReportCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon className="text-green-600" />
        <p className="text-sm font-semibold text-gray-600">{title}</p>
      </div>

      <p className="mt-4 text-2xl font-bold">{value}</p>
    </div>
  );
}