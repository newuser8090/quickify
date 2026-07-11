"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bike, LocateFixed, PackageCheck } from "lucide-react";
import { toast } from "sonner";

import {
  getDeliveryPartners,
  type DeliveryPartner,
} from "@/services/deliveryPartnerService";
import { updateDeliveryLocation } from "@/services/deliveryTrackingService";
import { getAssignedOrdersForPartner } from "@/services/riderService";

export default function RiderDashboardPage() {
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const { data: partners = [] } = useQuery({
    queryKey: ["rider-partners"],
    queryFn: getDeliveryPartners,
  });

  const selectedPartner = partners.find(
    (partner: DeliveryPartner) => partner.id === selectedPartnerId
  );

  const { data: orders = [], refetch } = useQuery({
    queryKey: ["rider-orders", selectedPartnerId],
    queryFn: () => getAssignedOrdersForPartner(selectedPartnerId),
    enabled: !!selectedPartnerId,
  });

  useEffect(() => {
    if (!selectedPartnerId || orders.length === 0) return;

    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await Promise.all(
            orders.map((order) =>
              updateDeliveryLocation(order.id, {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              })
            )
          );
        } catch {
          console.warn("Automatic rider location update failed");
        }
      },
      () => {
        toast.error("Location permission denied");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [selectedPartnerId, orders]);

  function updateLocation(orderId: number) {
    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await updateDeliveryLocation(orderId, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        toast.success("Location updated");
        refetch();
      },
      () => toast.error("Location permission denied")
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-green-600 p-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <Bike size={32} />
            <div>
              <h1 className="text-2xl font-bold">Rider Dashboard</h1>
              <p className="text-sm text-green-50">
                Update delivery status and live location.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
          <label className="block">
            <span className="mb-2 block font-semibold">
              Select Delivery Partner
            </span>

            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600"
            >
              <option value="">Choose rider</option>

              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name} • {partner.status}
                </option>
              ))}
            </select>
          </label>

          {selectedPartner && (
            <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm">
              <p className="font-bold">{selectedPartner.name}</p>
              <p className="text-gray-600">{selectedPartner.phone}</p>
              <p className="text-gray-600">
                {selectedPartner.vehicle_type}
                {selectedPartner.vehicle_number
                  ? ` • ${selectedPartner.vehicle_number}`
                  : ""}
              </p>

              <p className="mt-3 text-xs font-semibold text-green-700">
                Live GPS sharing is active while this page stays open.
              </p>
            </div>
          )}
        </section>

        {selectedPartnerId && (
          <section className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
                <PackageCheck className="mx-auto text-gray-400" size={42} />
                <h2 className="mt-4 text-xl font-bold">No assigned orders</h2>
                <p className="mt-2 text-gray-500">
                  Assigned deliveries will appear here.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">Order #{order.id}</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {order.addresses?.address_line}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.addresses?.city}, {order.addresses?.state}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      {order.status}
                    </span>
                  </div>

                  <button
                    onClick={() => updateLocation(order.id)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
                  >
                    <LocateFixed size={18} />
                    Update Immediately
                  </button>
                </div>
              ))
            )}
          </section>
        )}
      </div>
    </main>
  );
}