"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bike } from "lucide-react";
import { TableSkeleton } from "@/components/common/Skeleton";

import AdminLayout from "@/components/admin/AdminLayout";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { getAllOrders, updateOrderStatus } from "@/services/adminOrderService";
import {
  assignDeliveryPartner,
  getDeliveryPartners,
  releaseDeliveryPartner,
} from "@/services/deliveryPartnerService";

type AdminOrderItem = {
  id: number;
  name: string;
  unit: string | null;
  price: number;
  quantity: number;
  variant_name: string | null;
};

type AdminOrder = {
  id: number;
  created_at: string;
  total: number;
  payment_method: string;
  payment_status: string | null;
  status: string;
  delivery_partner_id: string | null;
  order_items?: AdminOrderItem[];
  addresses?: {
    full_name: string;
    phone: string;
    address_line: string;
    landmark: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  delivery_partners?: {
    name: string;
    phone: string;
    vehicle_type: string;
    vehicle_number: string | null;
  } | null;
};

const statuses = [
  "Placed",
  "Processing",
  "Packed",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [selectedPartners, setSelectedPartners] = useState<Record<number, string>>(
    {}
  );

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAllOrders,
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["delivery-partners"],
    queryFn: getDeliveryPartners,
  });

  const availablePartners = partners.filter(
    (partner) => partner.status === "Available"
  );

  async function handleStatusChange(order: AdminOrder, status: string) {
    try {
      setUpdatingId(order.id);

      await updateOrderStatus(order.id, status);

      if (
        (status === "Delivered" || status === "Cancelled") &&
        order.delivery_partner_id
      ) {
        await releaseDeliveryPartner(order.delivery_partner_id);
      }

      toast.success("Order status updated");

      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-partners"] });
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAssignPartner(orderId: number) {
    const partnerId = selectedPartners[orderId];

    if (!partnerId) {
      toast.error("Please select a delivery partner");
      return;
    }

    try {
      setAssigningId(orderId);

      await assignDeliveryPartner(orderId, partnerId);
      await updateOrderStatus(orderId, "Out for Delivery");

      toast.success("Delivery partner assigned");

      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-partners"] });
    } catch {
      toast.error("Failed to assign delivery partner");
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="mt-2 text-gray-500">View and manage customer orders.</p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : orders.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold">No orders yet</h2>
          <p className="mt-2 text-gray-500">
            Customer orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(orders as AdminOrder[]).map((order) => (
            <div key={order.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Order #{order.id}</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>

                  <p className="mt-2 font-bold text-green-700">
                    ₹{order.total}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {order.payment_method}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        order.payment_status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : order.payment_status === "Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.payment_status ?? "Pending"}
                    </span>
                  </div>
                </div>

                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) => handleStatusChange(order, e.target.value)}
                  className="rounded-xl border px-4 py-3 font-semibold outline-none focus:border-green-600"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6">
                <OrderTimeline status={order.status} />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <h3 className="font-bold">Items</h3>

                  <div className="mt-4 space-y-3">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between border-b pb-3 last:border-none"
                      >
                        <div>
                          <p className="font-semibold">{item.name}</p>

                          {item.variant_name && (
                            <p className="mt-1 text-sm font-medium text-green-700">
                              {item.variant_name}
                            </p>
                          )}

                          {item.unit && (
                            <p className="text-sm text-gray-500">
                              {item.unit}
                            </p>
                          )}

                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold">
                            ₹{item.price * item.quantity}
                          </p>

                          <p className="text-xs text-gray-500">
                            ₹{item.price} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <h3 className="font-bold">Delivery Address</h3>

                  {order.addresses ? (
                    <div className="mt-4 text-gray-600">
                      <p className="font-semibold text-gray-900">
                        {order.addresses.full_name}
                      </p>

                      <p>{order.addresses.phone}</p>
                      <p className="mt-2">{order.addresses.address_line}</p>

                      {order.addresses.landmark && (
                        <p>{order.addresses.landmark}</p>
                      )}

                      <p>
                        {order.addresses.city}, {order.addresses.state} -{" "}
                        {order.addresses.pincode}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-gray-500">
                      Address not available.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <div className="flex items-center gap-2">
                    <Bike className="text-green-600" size={20} />
                    <h3 className="font-bold">Delivery Partner</h3>
                  </div>

                  {order.delivery_partners ? (
                    <div className="mt-4 rounded-xl bg-white p-4">
                      <p className="font-bold">
                        {order.delivery_partners.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {order.delivery_partners.phone}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {order.delivery_partners.vehicle_type}
                        {order.delivery_partners.vehicle_number
                          ? ` • ${order.delivery_partners.vehicle_number}`
                          : ""}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <select
                        value={selectedPartners[order.id] ?? ""}
                        onChange={(e) =>
                          setSelectedPartners((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-600"
                      >
                        <option value="">Select available partner</option>

                        {availablePartners.map((partner) => (
                          <option key={partner.id} value={partner.id}>
                            {partner.name} • {partner.vehicle_type}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleAssignPartner(order.id)}
                        disabled={assigningId === order.id}
                        className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-300"
                      >
                        {assigningId === order.id
                          ? "Assigning..."
                          : "Assign Partner"}
                      </button>

                      {availablePartners.length === 0 && (
                        <p className="text-sm text-red-500">
                          No available partners right now.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}