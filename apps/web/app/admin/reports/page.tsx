"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  Download,
  FileText,
  Info,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { TableSkeleton } from "@/components/common/Skeleton";
import { getSalesReport } from "@/services/salesReportService";

const chartColors = [
  "#16a34a",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return date.toISOString().slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatChartDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
}

export default function AdminReportsPage() {
  const [fromDate, setFromDate] = useState(getDaysAgo(7));
  const [toDate, setToDate] = useState(getToday());

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["sales-report", fromDate, toDate],
    queryFn: () =>
      getSalesReport({
        fromDate,
        toDate,
      }),
  });

  const summary = data?.summary;

  const csvContent = useMemo(() => {
    if (!data) return "";

    const rows = [
      ["Date", "Orders", "Revenue"],
      ...data.dailySales.map((row) => [
        row.date,
        row.orders,
        row.revenue,
      ]),
    ];

    return rows
      .map((row) => row.join(","))
      .join("\n");
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

    const { jsPDF } = await import(
      "jspdf/dist/jspdf.umd.min"
    );

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Quickify Sales Report", 14, 18);

    doc.setFontSize(10);
    doc.text(
      `Date Range: ${fromDate} to ${toDate}`,
      14,
      28
    );

    doc.text(
      "Revenue includes paid, non-cancelled orders only.",
      14,
      34
    );

    doc.setFontSize(12);
    doc.text(
      `Total Revenue: Rs. ${
        summary?.totalRevenue ?? 0
      }`,
      14,
      46
    );

    doc.text(
      `Total Orders: ${summary?.totalOrders ?? 0}`,
      14,
      54
    );

    doc.text(
      `Paid Orders: ${summary?.paidOrders ?? 0}`,
      14,
      62
    );

    doc.text(
      `COD Orders: ${summary?.codOrders ?? 0}`,
      14,
      70
    );

    doc.text(
      `Average Order Value: Rs. ${
        summary?.averageOrderValue ?? 0
      }`,
      14,
      78
    );

    let y = 96;

    doc.setFontSize(14);
    doc.text("Top Selling Products", 14, y);

    y += 10;

    doc.setFontSize(10);

    data.topProducts
      .slice(0, 10)
      .forEach((product, index) => {
        doc.text(
          `${index + 1}. ${
            product.productName
          } - Qty: ${
            product.quantitySold
          }, Revenue: Rs. ${product.revenue}`,
          14,
          y
        );

        y += 8;
      });

    doc.save(
      `quickify-sales-report-${fromDate}-to-${toDate}.pdf`
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Sales Reports
            </h1>

            <p className="mt-2 text-gray-500">
              Analyze revenue, orders, payments, and
              best-selling products.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadCSV}
              disabled={!data}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              <Download size={18} />
              CSV
            </button>

            <button
              type="button"
              onClick={downloadPDF}
              disabled={!data}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <FileText size={18} />
              PDF
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />

          <p>
            Revenue, average order value, payment
            breakdown, and product sales are calculated
            using paid, non-cancelled orders only. Pending
            COD payments are excluded until they are marked
            as received.
          </p>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => applyPreset(0)}
              className="rounded-xl border border-gray-200 px-4 py-2 font-semibold transition hover:bg-green-50 hover:text-green-700"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => applyPreset(7)}
              className="rounded-xl border border-gray-200 px-4 py-2 font-semibold transition hover:bg-green-50 hover:text-green-700"
            >
              Last 7 Days
            </button>

            <button
              type="button"
              onClick={() => applyPreset(30)}
              className="rounded-xl border border-gray-200 px-4 py-2 font-semibold transition hover:bg-green-50 hover:text-green-700"
            >
              Last 30 Days
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="mb-2 block font-semibold">
                From Date
              </span>

              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(event) =>
                  setFromDate(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600"
              />
            </label>

            <label>
              <span className="mb-2 block font-semibold">
                To Date
              </span>

              <input
                type="date"
                value={toDate}
                min={fromDate}
                max={getToday()}
                onChange={(event) =>
                  setToDate(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => refetch()}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold transition hover:bg-gray-50"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <section className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
            <h2 className="text-xl font-bold text-red-700">
              Report data could not be loaded
            </h2>

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
          </section>
        ) : (
          <>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              <ReportCard
                title="Total Revenue"
                value={formatCurrency(
                  summary?.totalRevenue ?? 0
                )}
                icon={BarChart3}
              />

              <ReportCard
                title="Total Orders"
                value={summary?.totalOrders ?? 0}
                icon={ShoppingBag}
              />

              <ReportCard
                title="Paid Orders"
                value={summary?.paidOrders ?? 0}
                icon={CreditCard}
              />

              <ReportCard
                title="COD Orders"
                value={summary?.codOrders ?? 0}
                icon={Wallet}
              />

              <ReportCard
                title="Avg. Order Value"
                value={formatCurrency(
                  summary?.averageOrderValue ?? 0
                )}
                icon={Package}
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  Revenue Trend
                </h2>

                <div className="mt-6 h-80">
                  {(data?.dailySales ?? []).length === 0 ? (
                    <EmptyChart text="No paid revenue found for this period." />
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart
                        data={data?.dailySales ?? []}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="date"
                          tickFormatter={formatChartDate}
                        />

                        <YAxis />

                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(Number(value))
                          }
                          labelFormatter={(label) =>
                            formatChartDate(String(label))
                          }
                        />

                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#16a34a"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  Paid Orders by Day
                </h2>

                <div className="mt-6 h-80">
                  {(data?.dailySales ?? []).length === 0 ? (
                    <EmptyChart text="No paid orders found for this period." />
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={data?.dailySales ?? []}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="date"
                          tickFormatter={formatChartDate}
                        />

                        <YAxis allowDecimals={false} />

                        <Tooltip
                          labelFormatter={(label) =>
                            formatChartDate(String(label))
                          }
                        />

                        <Bar
                          dataKey="orders"
                          fill="#16a34a"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  Payment Breakdown
                </h2>

                <div className="mt-6 h-80">
                  {(data?.paymentMethods ?? []).length ===
                  0 ? (
                    <EmptyChart text="No paid payment data found." />
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={
                            data?.paymentMethods ?? []
                          }
                          dataKey="revenue"
                          nameKey="method"
                          outerRadius={110}
                          label
                        >
                          {(
                            data?.paymentMethods ?? []
                          ).map((row, index) => (
                            <Cell
                              key={row.method}
                              fill={
                                chartColors[
                                  index %
                                    chartColors.length
                                ]
                              }
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(Number(value))
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  Top Selling Products
                </h2>

                <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="min-w-[560px] w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">
                          Product
                        </th>

                        <th className="px-4 py-3 font-semibold">
                          Qty
                        </th>

                        <th className="px-4 py-3 font-semibold">
                          Revenue
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data?.topProducts
                        .slice(0, 8)
                        .map((product) => (
                          <tr
                            key={product.productId}
                            className="border-t border-gray-100"
                          >
                            <td className="px-4 py-3 font-semibold">
                              {product.productName}
                            </td>

                            <td className="px-4 py-3">
                              {product.quantitySold}
                            </td>

                            <td className="px-4 py-3 font-bold">
                              {formatCurrency(
                                product.revenue
                              )}
                            </td>
                          </tr>
                        ))}

                      {data?.topProducts.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-10 text-center text-gray-500"
                          >
                            No paid product sales found.
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

        <p className="text-sm font-semibold text-gray-600">
          {title}
        </p>
      </div>

      <p className="mt-4 text-2xl font-bold">{value}</p>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl bg-gray-50 px-6 text-center text-gray-500">
      {text}
    </div>
  );
}
