"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  addProductVariant,
  deleteProductVariant,
  getProductVariants,
  ProductVariant,
  ProductVariantFormValues,
  updateProductVariant,
} from "@/services/productVariantService";

type Props = {
  productId: number;
};

const emptyForm: ProductVariantFormValues = {
  name: "",
  unit: "",
  price: 0,
  mrp: 0,
  stock: 0,
  is_default: false,
};

export default function ProductVariantsManager({ productId }: Props) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ProductVariantFormValues>(emptyForm);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: () => getProductVariants(productId),
  });

  function updateField<K extends keyof ProductVariantFormValues>(
    field: K,
    value: ProductVariantFormValues[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingVariant(null);
  }

  async function handleSubmit() {

    try {
      if (editingVariant) {
        await updateProductVariant(editingVariant.id, form);
        toast.success("Variant updated");
      } else {
        await addProductVariant(productId, form);
        toast.success("Variant added");
      }

      resetForm();

      queryClient.invalidateQueries({
        queryKey: ["product-variants", productId],
      });

      queryClient.invalidateQueries({
        queryKey: ["product", productId],
      });
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteProductVariant(id);
      toast.success("Variant deleted");

      queryClient.invalidateQueries({
        queryKey: ["product-variants", productId],
      });

      queryClient.invalidateQueries({
        queryKey: ["product", productId],
      });
    } catch {
      toast.error("Failed to delete variant");
    }
  }

  return (
    <div className="rounded-2xl border bg-gray-50 p-4">
      <div className="mb-4">
        <h3 className="font-bold">Product Variants</h3>
        <p className="text-sm text-gray-500">
          Add sizes like 500ml, 1L, 2kg, family pack, etc.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Variant name e.g. Small Pack"
            className="rounded-xl border p-3 outline-none focus:border-green-600"
            required
          />

          <input
            value={form.unit}
            onChange={(e) => updateField("unit", e.target.value)}
            placeholder="Unit e.g. 500ml"
            className="rounded-xl border p-3 outline-none focus:border-green-600"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => updateField("price", Number(e.target.value))}
            placeholder="Price"
            className="rounded-xl border p-3 outline-none focus:border-green-600"
            required
          />

          <input
            type="number"
            min={0}
            value={form.mrp}
            onChange={(e) => updateField("mrp", Number(e.target.value))}
            placeholder="MRP"
            className="rounded-xl border p-3 outline-none focus:border-green-600"
            required
          />

          <input
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => updateField("stock", Number(e.target.value))}
            placeholder="Stock"
            className="rounded-xl border p-3 outline-none focus:border-green-600"
            required
          />
        </div>

        <label className="flex items-center gap-3 font-semibold">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(e) => updateField("is_default", e.target.checked)}
          />
          Default variant
        </label>

        <div className="flex justify-end gap-3">
          {editingVariant && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border px-4 py-2 font-semibold"
            >
              Cancel
            </button>
          )}

          <button
  type="button"
  onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            <Plus size={16} />
            {editingVariant ? "Update Variant" : "Add Variant"}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading variants...</p>
        ) : variants.length === 0 ? (
          <p className="text-sm text-gray-500">No variants added yet.</p>
        ) : (
          variants.map((variant) => (
            <div
              key={variant.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">{variant.name}</p>

                  {variant.is_default && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Default
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {variant.unit} • ₹{variant.price}{" "}
                  <span className="line-through">₹{variant.mrp}</span> • Stock{" "}
                  {variant.stock}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingVariant(variant);
                    setForm({
                      name: variant.name,
                      unit: variant.unit,
                      price: variant.price,
                      mrp: variant.mrp,
                      stock: variant.stock,
                      is_default: variant.is_default,
                    });
                  }}
                  className="rounded-lg border p-2 hover:bg-gray-50"
                >
                  <Edit size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(variant.id)}
                  className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}