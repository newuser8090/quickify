"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bike, Edit, Phone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import { AdminCardSkeleton } from "@/components/common/Skeleton";
import {
  createDeliveryPartner,
  deleteDeliveryPartner,
  getDeliveryPartners,
  type DeliveryPartner,
  type DeliveryPartnerForm,
} from "@/services/deliveryPartnerService";

const emptyForm: DeliveryPartnerForm = {
  name: "",
  phone: "",
  email: "",
  vehicle_type: "Bike",
  vehicle_number: "",
};

export default function AdminDeliveryPage() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] =
    useState<DeliveryPartner | null>(null);
  const [form, setForm] = useState<DeliveryPartnerForm>(emptyForm);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["delivery-partners"],
    queryFn: getDeliveryPartners,
  });

  function openCreateDialog() {
    setEditingPartner(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(partner: DeliveryPartner) {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      phone: partner.phone,
      email: partner.email ?? "",
      vehicle_type: partner.vehicle_type,
      vehicle_number: partner.vehicle_number ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingPartner) {
        const { updateDeliveryPartner } = await import(
          "@/services/deliveryPartnerService"
        );

        await updateDeliveryPartner(editingPartner.id, form);
        toast.success("Delivery partner updated");
      } else {
        await createDeliveryPartner(form);
        toast.success("Delivery partner added");
      }

      setDialogOpen(false);
      setEditingPartner(null);
      setForm(emptyForm);

      queryClient.invalidateQueries({ queryKey: ["delivery-partners"] });
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete(partner: DeliveryPartner) {
    const confirmed = window.confirm(
      `Delete delivery partner "${partner.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteDeliveryPartner(partner.id);
      toast.success("Delivery partner deleted");
      queryClient.invalidateQueries({ queryKey: ["delivery-partners"] });
    } catch {
      toast.error("Failed to delete delivery partner");
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Delivery Partners</h1>
            <p className="mt-2 text-gray-500">
              Manage riders and assign them to customer orders.
            </p>
          </div>

          <button
            onClick={openCreateDialog}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            <Plus size={18} />
            Add Partner
          </button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <AdminCardSkeleton key={index} />
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <Bike className="mx-auto text-gray-400" size={44} />
            <h2 className="mt-4 text-2xl font-bold">No delivery partners</h2>
            <p className="mt-2 text-gray-500">
              Add your first rider to start assigning deliveries.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                        <Bike size={24} />
                      </div>

                      <div>
                        <h2 className="text-xl font-bold">{partner.name}</h2>
                        <p className="text-sm text-gray-500">
                          {partner.vehicle_type}
                          {partner.vehicle_number
                            ? ` • ${partner.vehicle_number}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Phone size={16} />
                        {partner.phone}
                      </p>

                      {partner.email && <p>{partner.email}</p>}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      partner.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : partner.status === "Busy"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {partner.status}
                  </span>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => openEditDialog(partner)}
                    className="rounded-xl border p-2 hover:bg-gray-50"
                  >
                    <Edit size={17} />
                  </button>

                  <button
                    onClick={() => handleDelete(partner)}
                    className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-2xl font-bold">
                {editingPartner ? "Edit Partner" : "Add Delivery Partner"}
              </h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(value) => setForm({ ...form, name: value })}
                />

                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(value) => setForm({ ...form, phone: value })}
                />

                <Input
                  label="Email"
                  value={form.email ?? ""}
                  required={false}
                  onChange={(value) => setForm({ ...form, email: value })}
                />

                <Input
                  label="Vehicle Type"
                  value={form.vehicle_type}
                  onChange={(value) =>
                    setForm({ ...form, vehicle_type: value })
                  }
                />

                <Input
                  label="Vehicle Number"
                  value={form.vehicle_number ?? ""}
                  required={false}
                  onChange={(value) =>
                    setForm({ ...form, vehicle_number: value })
                  }
                />

                <div className="flex justify-end gap-3 border-t pt-5">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="rounded-xl border px-5 py-3"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    {editingPartner ? "Save Partner" : "Add Partner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
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
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
      />
    </label>
  );
}