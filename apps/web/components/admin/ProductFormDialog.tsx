"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Product } from "@/types/product";
import { ProductFormValues } from "@/services/adminProductService";
import { uploadProductImage } from "@/services/storageService";
import ProductImagesManager from "./ProductImagesManager";
import ProductVariantsManager from "./ProductVariantsManager";

type Props = {
  open: boolean;
  title: string;
  initialData?: Product | null;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
};

const emptyForm: ProductFormValues = {
  slug: "",
  name: "",
  category: "",
  description: "",
  image: "",
  price: 0,
  mrp: 0,
  discount: 0,
  rating: 4.5,
  reviews: 0,
  stock: 0,
  unit: "",
  deliveryTime: "10 mins",
  featured: false,
  bestseller: false,
};

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductFormDialog({
  open,
  title,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(initialData ? { ...emptyForm, ...initialData } : emptyForm);
  }, [initialData, open]);

  if (!open) return null;

  function updateField<K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadProductImage(file);
      updateField("image", imageUrl);
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[95%] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
          <h2 className="text-2xl font-bold">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Product Name"
              value={form.name}
              onChange={(v) => {
                updateField("name", v);

                if (!initialData) {
                  updateField("slug", generateSlug(v));
                }
              }}
            />

            <Input
              label="Slug"
              value={form.slug}
              onChange={(v) => updateField("slug", v)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Category"
              value={form.category}
              onChange={(v) => updateField("category", v)}
            />

            <Input
              label="Unit"
              value={form.unit}
              onChange={(v) => updateField("unit", v)}
            />
          </div>

          <div className="rounded-2xl border bg-gray-50 p-4">
            <label className="mb-3 block font-semibold">Product Image</label>

            {form.image && (
              <div className="mb-4 flex items-center gap-4">
                <Image
                  src={form.image}
                  alt="Product preview"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-xl border bg-white object-contain p-2"
                />

                <p className="line-clamp-2 text-sm text-gray-500">
                  {form.image}
                </p>
              </div>
            )}

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-white px-4 py-4 font-semibold hover:bg-gray-50">
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Uploading...
                </>
              ) : (
                <>
                  <ImagePlus size={18} />
                  Upload Image
                </>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <Input
            label="Image URL"
            value={form.image}
            onChange={(v) => updateField("image", v)}
            required={false}
          />

          <textarea
            className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <NumberInput
              label="Price"
              value={form.price}
              onChange={(v) => updateField("price", v)}
            />

            <NumberInput
              label="MRP"
              value={form.mrp}
              onChange={(v) => updateField("mrp", v)}
            />

            <NumberInput
              label="Discount %"
              value={form.discount}
              onChange={(v) => updateField("discount", v)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <NumberInput
              label="Stock"
              value={form.stock}
              onChange={(v) => updateField("stock", v)}
            />

            <NumberInput
              label="Rating"
              value={form.rating}
              step={0.1}
              onChange={(v) => updateField("rating", v)}
            />

            <NumberInput
              label="Reviews"
              value={form.reviews}
              onChange={(v) => updateField("reviews", v)}
            />
          </div>

          <Input
            label="Delivery Time"
            value={form.deliveryTime}
            onChange={(v) => updateField("deliveryTime", v)}
          />

          <div className="flex flex-wrap gap-6">
            <Checkbox
              label="Featured"
              checked={form.featured}
              onChange={(v) => updateField("featured", v)}
            />

            <Checkbox
              label="Bestseller"
              checked={form.bestseller}
              onChange={(v) => updateField("bestseller", v)}
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-5 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={uploading}
              className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-300"
            >
              Save Product
            </button>
          </div>
        </form>

        {initialData && (
          <div className="space-y-5 border-t p-6">
            <ProductImagesManager productId={initialData.id} />
            <ProductVariantsManager productId={initialData.id} />
          </div>
        )}
      </div>
    </>
  );
}

function Input({
  label,
  value,
  onChange,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">{label}</span>
      <input
        className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">{label}</span>
      <input
        type="number"
        min={0}
        step={step}
        className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        required
      />
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 font-semibold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}