"use client";

import { useState } from "react";
import { Clock, LocateFixed, MapPin } from "lucide-react";
import { toast } from "sonner";

import {
  updateDeliveryLocation,
  updateEstimatedDeliveryTime,
} from "@/services/deliveryTrackingService";

type Props = {
  orderId: number;
  latitude?: number | null;
  longitude?: number | null;
  estimatedMinutes?: number | null;
  updatedAt?: string | null;
};

export default function DeliveryTrackingPanel({
  orderId,
  latitude,
  longitude,
  estimatedMinutes,
  updatedAt,
}: Props) {
  const [minutes, setMinutes] = useState(estimatedMinutes ?? 15);
  const [updating, setUpdating] = useState(false);

  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setUpdating(true);

          await updateDeliveryLocation(orderId, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          toast.success("Delivery location updated");
        } catch {
          toast.error("Failed to update delivery location");
        } finally {
          setUpdating(false);
        }
      },
      () => {
        toast.error("Location permission denied");
      }
    );
  }

  async function handleUpdateEta() {
    try {
      setUpdating(true);
      await updateEstimatedDeliveryTime(orderId, minutes);
      window.location.reload();
      toast.success("Estimated delivery time updated");
    } catch {
      toast.error("Failed to update ETA");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <div className="flex items-center gap-2">
        <MapPin className="text-green-600" size={20} />
        <h3 className="font-bold">Live Delivery Tracking</h3>
      </div>

      <div className="mt-4 space-y-3 text-sm text-gray-600">
        <p>
          <strong>Latitude:</strong> {latitude ?? "Not updated"}
        </p>
        <p>
          <strong>Longitude:</strong> {longitude ?? "Not updated"}
        </p>
        <p>
          <strong>Last Updated:</strong>{" "}
          {updatedAt ? new Date(updatedAt).toLocaleString() : "Not yet"}
        </p>
      </div>

      <button
        onClick={handleUseCurrentLocation}
        disabled={updating}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-300"
      >
        <LocateFixed size={18} />
        {updating ? "Updating..." : "Use Current Location"}
      </button>

      <div className="mt-5 flex gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border bg-white px-3">
          <Clock size={18} className="text-gray-400" />
          <input
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full py-3 outline-none"
          />
        </div>

        <button
          onClick={handleUpdateEta}
          disabled={updating}
          className="rounded-xl border px-4 font-semibold hover:bg-gray-50 disabled:bg-gray-100"
        >
          Update ETA
        </button>
      </div>
    </div>
  );
}