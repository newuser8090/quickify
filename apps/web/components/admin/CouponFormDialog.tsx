"use client";

import { useEffect, useState } from "react";
import { Percent, Wallet, X } from "lucide-react";
import { toast } from "sonner";

import {
  type Coupon,
  type CouponDiscountType,
  type CouponFormValues,
} from "@/services/couponService";

type Props = {
  open: boolean;
  initialData?: Coupon | null;
  onClose: () => void;
  onSubmit: (values: CouponFormValues) => void;
};

const emptyForm: CouponFormValues = {
  code: "",
  discount_type: "fixed",
  discount: 0,
  discount_percentage: null,
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
        discount_type:
          initialData.discount_type ?? "fixed",
        discount: Number(
          initialData.discount ?? 0
        ),
        discount_percentage:
          initialData.discount_percentage === null ||
          initialData.discount_percentage === undefined
            ? null
            : Number(
                initialData.discount_percentage
              ),
        min_order_value: Number(
          initialData.min_order_value ?? 0
        ),
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

  function updateField<
    K extends keyof CouponFormValues,
  >(
    field: K,
    value: CouponFormValues[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleDiscountTypeChange(
    type: CouponDiscountType
  ) {
    setForm((current) => ({
      ...current,
      discount_type: type,
      discount:
        type === "fixed"
          ? current.discount
          : 0,
      discount_percentage:
        type === "percentage"
          ? current.discount_percentage ?? 0
          : null,
    }));
  }

  function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const code = form.code.trim();

    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (
      form.discount_type === "fixed" &&
      Number(form.discount) <= 0
    ) {
      toast.error(
        "Fixed discount must be greater than 0"
      );
      return;
    }

    if (
      form.discount_type === "percentage"
    ) {
      const percentage = Number(
        form.discount_percentage ?? 0
      );

      if (
        percentage <= 0 ||
        percentage > 100
      ) {
        toast.error(
          "Percentage discount must be between 1 and 100"
        );
        return;
      }
    }

    if (Number(form.min_order_value) < 0) {
      toast.error(
        "Minimum order cannot be negative"
      );
      return;
    }

    onSubmit({
      ...form,
      code: code.toUpperCase(),
      discount:
        form.discount_type === "fixed"
          ? Number(form.discount)
          : 0,
      discount_percentage:
        form.discount_type ===
        "percentage"
          ? Number(
              form.discount_percentage ?? 0
            )
          : null,
      min_order_value: Number(
        form.min_order_value
      ),
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[95%] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
          <div>
            <h2 className="text-2xl font-bold">
              {initialData
                ? "Edit Coupon"
                : "Add Coupon"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a fixed or percentage
              discount coupon.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-gray-100"
            aria-label="Close coupon form"
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
            onChange={(value) =>
              updateField(
                "code",
                value.toUpperCase()
              )
            }
            placeholder="SAVE50"
          />

          <div>
            <p className="mb-3 font-semibold">
              Discount Type
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <DiscountTypeButton
                active={
                  form.discount_type === "fixed"
                }
                icon={<Wallet size={18} />}
                title="Fixed Amount"
                description="Example: ₹100 off"
                onClick={() =>
                  handleDiscountTypeChange(
                    "fixed"
                  )
                }
              />

              <DiscountTypeButton
                active={
                  form.discount_type ===
                  "percentage"
                }
                icon={<Percent size={18} />}
                title="Percentage"
                description="Example: 50% off"
                onClick={() =>
                  handleDiscountTypeChange(
                    "percentage"
                  )
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {form.discount_type === "fixed" ? (
              <NumberInput
                label="Discount Amount"
                value={form.discount}
                prefix="₹"
                min={1}
                step={1}
                onChange={(value) =>
                  updateField(
                    "discount",
                    value
                  )
                }
              />
            ) : (
              <NumberInput
                label="Discount Percentage"
                value={
                  form.discount_percentage ?? 0
                }
                suffix="%"
                min={1}
                max={100}
                step={1}
                onChange={(value) =>
                  updateField(
                    "discount_percentage",
                    value
                  )
                }
              />
            )}

            <NumberInput
              label="Minimum Order"
              value={form.min_order_value}
              prefix="₹"
              min={0}
              step={1}
              onChange={(value) =>
                updateField(
                  "min_order_value",
                  value
                )
              }
            />
          </div>

          <div className="rounded-2xl bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">
              Coupon preview
            </p>

            <p className="mt-1 text-sm text-green-700">
              {form.code || "COUPON"}
              {" • "}
              {form.discount_type === "fixed"
                ? `₹${Number(
                    form.discount ?? 0
                  ).toLocaleString(
                    "en-IN"
                  )} off`
                : `${Number(
                    form.discount_percentage ?? 0
                  )}% off`}
              {" • "}
              Minimum order ₹
              {Number(
                form.min_order_value ?? 0
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block font-semibold">
              Expiry Date
            </span>

            <input
              type="date"
              value={form.expires_at ?? ""}
              onChange={(event) =>
                updateField(
                  "expires_at",
                  event.target.value || null
                )
              }
              className="w-full rounded-xl border p-3 outline-none transition focus:border-green-600"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border p-4 font-semibold">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                updateField(
                  "is_active",
                  event.target.checked
                )
              }
            />

            <div>
              <p>Active Coupon</p>

              <p className="mt-1 text-xs font-normal text-gray-500">
                Active coupons can be applied by
                customers during checkout.
              </p>
            </div>
          </label>

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-5 py-3 font-semibold transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Save Coupon
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function DiscountTypeButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-green-600 bg-green-50 text-green-800"
          : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50/50"
      }`}
    >
      <div className="flex items-center gap-2 font-bold">
        {icon}
        {title}
      </div>

      <p className="mt-1 text-sm font-normal text-gray-500">
        {description}
      </p>
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required
        className="w-full rounded-xl border p-3 outline-none transition focus:border-green-600"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">
        {label}
      </span>

      <div className="flex items-center rounded-xl border bg-white px-3 focus-within:border-green-600">
        {prefix && (
          <span className="mr-2 font-semibold text-gray-500">
            {prefix}
          </span>
        )}

        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) =>
            onChange(
              Number(event.target.value)
            )
          }
          required
          className="w-full py-3 outline-none"
        />

        {suffix && (
          <span className="ml-2 font-semibold text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
