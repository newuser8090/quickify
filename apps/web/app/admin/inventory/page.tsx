"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Package, RotateCcw, Search } from "lucide-react";

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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleStockUpdate(product: InventoryProduct) {
    const value = window.prompt(
      `Enter new stock for ${product.name}`,
      String(product.stock ?? 0)
    );

    if (value === null) return;

    const newStock = Number(value);

    if (Number.isNaN(newStock) || newStock < 0) {
      alert("Please enter a valid stock number.");
      return;
    }
    const currentStock = product.stock ?? 0;

    const changeType =
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
        currentStock: product.stock ?? 0,
        newStock,
        lowStockThreshold: product.low_stock_threshold ?? 5,
        changeType: changeType as InventoryChangeType,
        note: "Manual admin stock update",
      });

      await refetchProducts();
      await refetchLogs();
    } finally {
      setUpdatingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="mt-1 text-gray-500">
            Track stock levels, update inventory, and monitor stock history.
          </p>
        </div>

        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="mt-1 text-gray-500">
          Track stock levels, update inventory, and monitor stock history.
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Package className="text-green-600" />
            <p className="font-semibold text-gray-600">Total Products</p>
          </div>
          <p className="mt-4 text-3xl font-bold">{products.length}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <RotateCcw className="text-orange-600" />
            <p className="font-semibold text-gray-600">Low Stock</p>
          </div>
          <p className="mt-4 text-3xl font-bold">
            {
              products.filter(
                (product) =>
                  (product.stock ?? 0) <= (product.low_stock_threshold ?? 5)
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <History className="text-blue-600" />
            <p className="font-semibold text-gray-600">Inventory Logs</p>
          </div>
          <p className="mt-4 text-3xl font-bold">{logs.length}</p>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Product Stock</h2>
            <p className="text-sm text-gray-500">
              Update product stock manually.
            </p>
          </div>

          <div className="flex w-80 items-center gap-2 rounded-xl border px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full outline-none"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Low Stock Limit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const stock = product.stock ?? 0;
                const threshold = product.low_stock_threshold ?? 5;
                const isLow = stock <= threshold;
                const isOut = stock === 0;

                return (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-3 font-semibold">
                      {product.name}
                    </td>

                    <td className="px-4 py-3">{stock}</td>
                    <td className="px-4 py-3">{threshold}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isOut
                            ? "bg-red-100 text-red-700"
                            : isLow
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isOut ? "Out of Stock" : isLow ? "Low Stock" : "Good"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleStockUpdate(product)}
                        disabled={updatingId === product.id}
                        className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white disabled:bg-gray-300"
                      >
                        {updatingId === product.id ? "Updating..." : "Update"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Recent Inventory Logs</h2>

        <div className="mt-5 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Change</th>
                <th className="px-4 py-3">Previous</th>
                <th className="px-4 py-3">New</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">
                    {log.product_name}
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-semibold">
                      {log.quantity_change > 0 ? "+" : ""}
                      {log.quantity_change}
                    </span>{" "}
                    <span className="text-gray-500">({log.change_type})</span>
                  </td>

                  <td className="px-4 py-3">{log.previous_stock}</td>
                  <td className="px-4 py-3">{log.new_stock}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {log.note ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
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
  );
}