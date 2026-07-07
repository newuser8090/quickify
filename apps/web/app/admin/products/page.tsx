"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit, Package, Search, Star, Trash2 } from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AdminCardSkeleton } from "@/components/common/Skeleton";
import Image from "next/image";

import { Product } from "@/types/product";
import { getAllProducts } from "@/services/productService";
import {
  createProduct,
  deleteProduct,
  ProductFormValues,
  updateProduct,
} from "@/services/adminProductService";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] =
    useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: getAllProducts,
  });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  async function handleSubmit(values: ProductFormValues) {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
        toast.success("Product updated");
      } else {
        await createProduct(values);
        toast.success("Product added");
      }

      setDialogOpen(false);
      setEditingProduct(null);

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteProductTarget) return;

    try {
      setDeleting(true);
      await deleteProduct(deleteProductTarget.id);

      toast.success("Product deleted");
      setDeleteProductTarget(null);

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-2 text-gray-500">
            Manage your Quickify product catalog.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setDialogOpen(true);
          }}
          className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
        >
          Add Product
        </button>
      </div>

      <div className="mb-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-green-600"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border px-4 py-3 outline-none focus:border-green-600"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-2">
  {Array.from({ length: 4 }).map((_, index) => (
    <AdminCardSkeleton key={index} />
  ))}
</div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto text-gray-400" size={42} />
          <h2 className="mt-4 text-2xl font-bold">No products found</h2>
          <p className="mt-2 text-gray-500">
            Try changing the search or category filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredProducts.map((product) => {
            const stockPercent = Math.min(100, (product.stock / 100) * 100);

            return (
              <div
                key={product.id}
                className="group rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex gap-5">
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-green-50">
                    {product.image ? (
                      <Image
  src={product.image}
  alt={product.name}
  width={128}
  height={128}
  className="h-full w-full object-contain p-3"
/>
                    ) : (
                      <span className="text-5xl">📦</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="line-clamp-1 text-xl font-bold">
                          {product.name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {product.category} • {product.unit}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setDialogOpen(true);
                          }}
                          className="rounded-xl border p-2 hover:bg-gray-50"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() => setDeleteProductTarget(product)}
                          className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <span className="text-2xl font-bold">
                        ₹{product.price}
                      </span>

                      <span className="text-gray-400 line-through">
                        ₹{product.mrp}
                      </span>

                      {product.discount > 0 && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.featured && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          ⭐ Featured
                        </span>
                      )}

                      {product.bestseller && (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          🔥 Bestseller
                        </span>
                      )}

                      <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                        <Star size={13} className="fill-yellow-500" />
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-semibold text-gray-600">
                          Stock
                        </span>
                        <span
                          className={
                            product.stock > 0
                              ? "font-bold text-green-700"
                              : "font-bold text-red-600"
                          }
                        >
                          {product.stock > 0
                            ? `${product.stock} left`
                            : "Out of stock"}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${
                            product.stock > 20 ? "bg-green-600" : "bg-red-500"
                          }`}
                          style={{ width: `${stockPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProductFormDialog
        open={dialogOpen}
        title={editingProduct ? "Edit Product" : "Add Product"}
        initialData={editingProduct}
        onClose={() => {
          setDialogOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteProductTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${
          deleteProductTarget?.name ?? "this product"
        }"? This action cannot be undone.`}
        confirmText="Delete Product"
        loading={deleting}
        onCancel={() => setDeleteProductTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}