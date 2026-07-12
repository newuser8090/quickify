"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Package, RotateCcw, Search } from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import { TableSkeleton } from "@/components/common/Skeleton";
import {
  adjustProductStock,
  getInventoryLogs,
  type InventoryChangeType,
} from "@/services/inventoryService";
import { getProducts } from "@/services/productService";

type InventoryProduct = {
  id: number;
  name: string;
  stock: number | null;
  low_stock_threshold: number | null;
};

export default function AdminInventoryPage() {
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const {
    data: products = [],
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useQuery<InventoryProduct[]>({
    queryKey: ["admin-inventory-products"],
    queryFn: getProducts,
  });

  const {
    data: logs = [],
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["inventory-logs"],
    queryFn: getInventoryLogs,
  });

  const isLoading = productsLoading || logsLoading;

  const normalizedSearch = search.trim().toLowerCase();

const filteredProducts = useMemo(() => {
  const matchingProducts = products.filter((product) =>
    product.name.toLowerCase().includes(normalizedSearch)
  );

  return [...matchingProducts].sort((firstProduct, secondProduct) => {
    const firstStock = firstProduct.stock ?? 0;
    const secondStock = secondProduct.stock ?? 0;

    const firstThreshold =
      firstProduct.low_stock_threshold ?? 5;

    const secondThreshold =
      secondProduct.low_stock_threshold ?? 5;

    const firstIsLowStock =
      firstStock <= firstThreshold;

    const secondIsLowStock =
      secondStock <= secondThreshold;

    // Low-stock and out-of-stock products always appear first.
    if (firstIsLowStock && !secondIsLowStock) {
      return -1;
    }

    if (!firstIsLowStock && secondIsLowStock) {
      return 1;
    }

    // Within the low-stock group, lowest quantity appears first.
    if (
      firstIsLowStock &&
      secondIsLowStock &&
      firstStock !== secondStock
    ) {
      return firstStock - secondStock;
    }

    // Keep the remaining products alphabetically ordered.
    return firstProduct.name.localeCompare(secondProduct.name);
  });
}, [products, normalizedSearch]);

  const lowStockCount = products.filter((product) => {
    const stock = product.stock ?? 0;
    const threshold = product.low_stock_threshold ?? 5;

    return stock <= threshold;
  }).length;

  async function handleStockUpdate(product: InventoryProduct) {
    const currentStock = product.stock ?? 0;

    const value = window.prompt(
      `Enter new stock for ${product.name}`,
      String(currentStock)
    );

    if (value === null) return;

    const trimmedValue = value.trim();
    const newStock = Number(trimmedValue);

    if (
      trimmedValue === "" ||
      !Number.isInteger(newStock) ||
      newStock < 0
    ) {
      window.alert("Please enter a valid whole stock number.");
      return;
    }

    const changeType: InventoryChangeType =
      newStock > currentStock
        ? "restock"
        : newStock < currentStock
          ? "deduct"
          : "adjustment";

    try {
      setUpdatingId(product.id);

      await adjustProductStock({
        productId: product.id,
        productName: product.name,
        currentStock,
        newStock,
        lowStockThreshold: product.low_stock_threshold ?? 5,
        changeType,
        note: "Manual admin stock update",
      });

      await Promise.all([refetchProducts(), refetchLogs()]);
    } catch (error) {
      console.error("Failed to update product stock:", error);
      window.alert("Stock could not be updated. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <PageHeader />

          <TableSkeleton rows={6} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <PageHeader />

        <section className="grid gap-5 md:grid-cols-3">
          <SummaryCard
            icon={<Package className="text-green-600" />}
            label="Total Products"
            value={products.length}
          />

          <SummaryCard
            icon={<RotateCcw className="text-orange-600" />}
            label="Low Stock"
            value={lowStockCount}
          />

          <SummaryCard
            icon={<History className="text-blue-600" />}
            label="Inventory Logs"
            value={logs.length}
          />
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold">Product Stock</h2>
              <p className="mt-1 text-sm text-gray-500">
                Search products and update their stock manually.
              </p>
            </div>

            <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 lg:w-80">
              <Search size={18} className="shrink-0 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Current Stock</th>
                  <th className="px-4 py-3 font-semibold">Low Stock Limit</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stock = product.stock ?? 0;
                  const threshold = product.low_stock_threshold ?? 5;
                  const isOutOfStock = stock === 0;
                  const isLowStock = stock <= threshold;

                  return (
                    <tr
                      key={product.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-semibold">
                        {product.name}
                      </td>

                      <td className="px-4 py-3">{stock}</td>

                      <td className="px-4 py-3">{threshold}</td>

                      <td className="px-4 py-3">
                        <StockStatus
                          isOutOfStock={isOutOfStock}
                          isLowStock={isLowStock}
                        />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleStockUpdate(product)}
                          disabled={updatingId === product.id}
                          className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {updatingId === product.id
                            ? "Updating..."
                            : "Update"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      {normalizedSearch
                        ? "No products match your search."
                        : "No products found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-xl font-bold">Recent Inventory Logs</h2>
            <p className="mt-1 text-sm text-gray-500">
              Review recent stock additions, deductions, and adjustments.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Change</th>
                  <th className="px-4 py-3 font-semibold">Previous</th>
                  <th className="px-4 py-3 font-semibold">New</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-semibold">
                      {log.product_name}
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold">
                        {log.quantity_change > 0 ? "+" : ""}
                        {log.quantity_change}
                      </span>

                      <span className="ml-1 text-gray-500">
                        ({formatChangeType(log.change_type)})
                      </span>
                    </td>

                    <td className="px-4 py-3">{log.previous_stock}</td>

                    <td className="px-4 py-3">{log.new_stock}</td>

                    <td className="px-4 py-3 text-gray-500">
                      {log.note ?? "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {new Date(log.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No inventory logs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Inventory Management</h1>

      <p className="mt-2 text-gray-500">
        Track stock levels, update inventory, and monitor stock history.
      </p>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        {icon}
        <p className="font-semibold text-gray-600">{label}</p>
      </div>

      <p className="mt-4 text-3xl font-bold">{value}</p>
    </div>
  );
}

function StockStatus({
  isOutOfStock,
  isLowStock,
}: {
  isOutOfStock: boolean;
  isLowStock: boolean;
}) {
  const label = isOutOfStock
    ? "Out of Stock"
    : isLowStock
      ? "Low Stock"
      : "Good";

  const className = isOutOfStock
    ? "bg-red-100 text-red-700"
    : isLowStock
      ? "bg-orange-100 text-orange-700"
      : "bg-green-100 text-green-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function formatChangeType(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
