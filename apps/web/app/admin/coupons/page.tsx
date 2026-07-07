"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit, Plus, Trash2 } from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import CouponFormDialog from "@/components/admin/CouponFormDialog";

import {
  Coupon,
  CouponFormValues,
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "@/services/couponService";

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: getCoupons,
  });

  async function handleSubmit(values: CouponFormValues) {
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, values);
        toast.success("Coupon updated");
      } else {
        await createCoupon(values);
        toast.success("Coupon created");
      }

      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
      });

      setDialogOpen(false);
      setEditingCoupon(null);
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete() {
    if (!deletingCoupon) return;

    try {
      await deleteCoupon(deletingCoupon.id);
      toast.success("Coupon deleted");

      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
      });

      setDeletingCoupon(null);
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="mt-2 text-gray-500">Manage discount coupons.</p>
        </div>

        <button
          onClick={() => {
            setEditingCoupon(null);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
        >
          <Plus size={18} />
          Add Coupon
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Discount</th>
              <th className="p-4 text-left">Min Order</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Expiry</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No coupons found.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t">
                  <td className="p-4 font-bold">{coupon.code}</td>

                  <td className="p-4">₹{coupon.discount}</td>

                  <td className="p-4">₹{coupon.min_order_value}</td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        coupon.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {coupon.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-4 text-sm text-gray-600">
                    {coupon.expires_at
                      ? new Date(coupon.expires_at).toLocaleDateString()
                      : "No expiry"}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setDialogOpen(true);
                        }}
                        className="rounded-lg border p-2"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => setDeletingCoupon(coupon)}
                        className="rounded-lg border border-red-200 p-2 text-red-600"
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
        open={!!deletingCoupon}
        title="Delete Coupon"
        message={`Delete coupon "${deletingCoupon?.code}"?`}
        confirmText="Delete"
        onCancel={() => setDeletingCoupon(null)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}