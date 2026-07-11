"use client";

import { useState } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Edit,
  Percent,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import CouponFormDialog from "@/components/admin/CouponFormDialog";

import {
  type Coupon,
  type CouponFormValues,
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "@/services/couponService";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function getDiscountLabel(coupon: Coupon) {
  if (
    coupon.discount_type === "percentage"
  ) {
    return `${
      coupon.discount_percentage ?? 0
    }% off`;
  }

  return `${formatCurrency(
    coupon.discount
  )} off`;
}

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingCoupon, setEditingCoupon] =
    useState<Coupon | null>(null);

  const [deletingCoupon, setDeletingCoupon] =
    useState<Coupon | null>(null);

  const {
    data: coupons = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: getCoupons,
  });

  async function refreshCoupons() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["coupons"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["available-coupons"],
      }),
    ]);
  }

  async function handleSubmit(
    values: CouponFormValues
  ) {
    try {
      if (editingCoupon) {
        await updateCoupon(
          editingCoupon.id,
          values
        );

        toast.success("Coupon updated");
      } else {
        await createCoupon(values);
        toast.success("Coupon created");
      }

      await refreshCoupons();

      setDialogOpen(false);
      setEditingCoupon(null);
    } catch (error) {
      console.error(
        "Coupon save failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  }

  async function handleDelete() {
    if (!deletingCoupon) return;

    try {
      await deleteCoupon(
        deletingCoupon.id
      );

      toast.success("Coupon deleted");

      await refreshCoupons();

      setDeletingCoupon(null);
    } catch (error) {
      console.error(
        "Coupon deletion failed:",
        error
      );

      toast.error("Delete failed");
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Coupons
          </h1>

          <p className="mt-2 text-gray-500">
            Manage fixed and percentage
            discount coupons.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCoupon(null);
            setDialogOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          <Plus size={18} />
          Add Coupon
        </button>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
        <table className="w-full min-w-[820px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">
                Code
              </th>

              <th className="p-4 text-left">
                Type
              </th>

              <th className="p-4 text-left">
                Discount
              </th>

              <th className="p-4 text-left">
                Min Order
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Expiry
              </th>

              <th className="p-4 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-gray-500"
                >
                  Loading coupons...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center"
                >
                  <p className="font-semibold text-red-600">
                    Coupons could not be
                    loaded.
                  </p>

                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-3 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white"
                  >
                    Try Again
                  </button>
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-gray-500"
                >
                  No coupons found.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-t"
                >
                  <td className="p-4">
                    <span className="rounded-lg bg-gray-100 px-3 py-2 font-mono font-bold text-gray-800">
                      {coupon.code}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                        coupon.discount_type ===
                        "percentage"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {coupon.discount_type ===
                      "percentage" ? (
                        <Percent size={14} />
                      ) : (
                        <Wallet size={14} />
                      )}

                      {coupon.discount_type ===
                      "percentage"
                        ? "Percentage"
                        : "Fixed Amount"}
                    </span>
                  </td>

                  <td className="p-4 font-bold text-green-700">
                    {getDiscountLabel(coupon)}
                  </td>

                  <td className="p-4">
                    {formatCurrency(
                      coupon.min_order_value
                    )}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        coupon.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {coupon.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td className="p-4 text-sm text-gray-600">
                    {coupon.expires_at
                      ? new Date(
                          coupon.expires_at
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "No expiry"}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCoupon(
                            coupon
                          );

                          setDialogOpen(true);
                        }}
                        className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-50"
                        aria-label={`Edit coupon ${coupon.code}`}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeletingCoupon(
                            coupon
                          )
                        }
                        className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                        aria-label={`Delete coupon ${coupon.code}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CouponFormDialog
        open={dialogOpen}
        initialData={editingCoupon}
        onClose={() => {
          setDialogOpen(false);
          setEditingCoupon(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingCoupon)}
        title="Delete Coupon"
        message={`Delete coupon "${deletingCoupon?.code}"?`}
        confirmText="Delete"
        onCancel={() =>
          setDeletingCoupon(null)
        }
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
