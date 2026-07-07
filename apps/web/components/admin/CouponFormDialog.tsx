"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  Coupon,
  CouponFormValues,
} from "@/services/couponService";

type Props = {
  open: boolean;
  initialData?: Coupon | null;
  onClose: () => void;
  onSubmit: (values: CouponFormValues) => void;
};

const emptyForm: CouponFormValues = {
  code: "",
  discount: 0,
  min_order_value: 0,
  is_active: true,
  expires_at: null,
};

export default function CouponFormDialog({
  open,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<CouponFormValues>(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        code: initialData.code,
        discount: initialData.discount,
        min_order_value: initialData.min_order_value,
        is_active: initialData.is_active,
        expires_at: initialData.expires_at
          ? initialData.expires_at.slice(0, 10)
          : null,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  function updateField<K extends keyof CouponFormValues>(
    field: K,
    value: CouponFormValues[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      <div className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">
            {initialData
              ? "Edit Coupon"
              : "Add Coupon"}
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <Input
            label="Coupon Code"
            value={form.code}
            onChange={(v) =>
              updateField("code", v.toUpperCase())
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <NumberInput
              label="Discount Amount"
              value={form.discount}
              onChange={(v) =>
                updateField("discount", v)
              }
            />

            <NumberInput
              label="Minimum Order"
              value={form.min_order_value}
              onChange={(v) =>
                updateField("min_order_value", v)
              }
            />
          </div>

          <label className="block">
            <span className="mb-2 block font-semibold">
              Expiry Date
            </span>

            <input
              type="date"
              value={form.expires_at ?? ""}
              onChange={(e) =>
                updateField(
                  "expires_at",
                  e.target.value || null
                )
              }
              className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
            />
          </label>

          <label className="flex items-center gap-3 font-semibold">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                updateField(
                  "is_active",
                  e.target.checked
                )
              }
            />

            Active Coupon
          </label>

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
              className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Save Coupon
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">
        {label}
      </span>

      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        required
        className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
      />
    </label>
  );
}