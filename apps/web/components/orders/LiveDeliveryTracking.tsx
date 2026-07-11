"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
} from "lucide-react";

import {
  getDeliveryRoute,
  type RouteSummary,
} from "@/services/routeService";

type Props = {
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  estimatedMinutes?: number | null;
  updatedAt?: string | null;
  partner?: {
    name: string;
    phone: string;
    vehicle_type: string;
    vehicle_number: string | null;
  } | null;
  customerLatitude?: number | null;
  customerLongitude?: number | null;
};

export default function LiveDeliveryTracking({
  status,
  latitude,
  longitude,
  estimatedMinutes,
  updatedAt,
  partner,
  customerLatitude,
  customerLongitude,
}: Props) {
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const isOutForDelivery = status === "Out for Delivery";
  const hasRiderLocation =
    typeof latitude === "number" && typeof longitude === "number";

  const hasCustomerLocation =
    typeof customerLatitude === "number" &&
    typeof customerLongitude === "number";

  useEffect(() => {
    async function loadRoute() {
      if (!isOutForDelivery || !hasRiderLocation || !hasCustomerLocation) {
        setRoute(null);
        return;
      }

      try {
        setRouteLoading(true);

        const result = await getDeliveryRoute({
          riderLatitude: latitude,
          riderLongitude: longitude,
          customerLatitude,
          customerLongitude,
        });

        setRoute(result);
      } finally {
        setRouteLoading(false);
      }
    }

    loadRoute();
  }, [
    isOutForDelivery,
    hasRiderLocation,
    hasCustomerLocation,
    latitude,
    longitude,
    customerLatitude,
    customerLongitude,
  ]);

  const finalEta = route?.durationMinutes ?? estimatedMinutes ?? 15;

  const progress = useMemo(() => {
    const safeEta = Math.max(1, Math.min(finalEta, 30));
    return Math.max(15, Math.min(92, 100 - (safeEta / 30) * 100));
  }, [finalEta]);

  if (!isOutForDelivery) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20">
              <Bike size={32} />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold">
                Your order is on the way
              </h3>
              <p className="mt-1 text-green-50">
                Rider has picked up your order and is heading to you.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/20 px-5 py-3 text-center">
            <p className="text-sm text-green-50">Arriving in</p>
            <p className="text-3xl font-extrabold">
              {routeLoading ? "..." : `${finalEta} min`}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {partner && (
          <div className="rounded-3xl border bg-gray-50 p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-extrabold text-green-700">
                  {partner.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h4 className="text-xl font-bold">{partner.name}</h4>

                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <Star
                      size={15}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span>4.9 rated delivery partner</span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-gray-600">
                    {partner.vehicle_type}
                    {partner.vehicle_number
                      ? ` • ${partner.vehicle_number}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`tel:${partner.phone}`}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700"
                >
                  <Phone size={17} />
                  Call
                </a>

                <a
                  href={`sms:${partner.phone}`}
                  className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold text-green-700 hover:bg-green-50"
                >
                  <MessageCircle size={17} />
                  Message
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<Clock size={18} />}
            label="Estimated Arrival"
            value={routeLoading ? "..." : `${finalEta} mins`}
          />

          <InfoCard
            icon={<Navigation size={18} />}
            label="Distance"
            value={routeLoading ? "..." : route ? `${route.distanceKm} km` : "Demo"}
          />

          <InfoCard
            icon={<MapPin size={18} />}
            label="Rider Location"
            value={
              hasRiderLocation
                ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                : "Waiting..."
            }
          />
        </div>

        <div className="mt-5 rounded-2xl bg-green-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span className="text-green-700">Delivery progress</span>
            <span className="text-green-700">{Math.round(progress)}%</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-green-600 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {hasRiderLocation && (
          <div className="mt-5 space-y-3">
            <div className="overflow-hidden rounded-3xl border bg-white">
              <iframe
                title="Rider live location"
                src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                className="h-72 w-full"
                loading="lazy"
              />
            </div>

            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl bg-green-600 py-3 text-center font-bold text-white hover:bg-green-700"
            >
              Open Rider Location in Google Maps
            </a>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-500">
          Last updated:{" "}
          {updatedAt ? new Date(updatedAt).toLocaleString() : "Not yet"}
        </p>

        {!hasCustomerLocation && (
          <p className="mt-2 text-xs text-orange-600">
            Route-based ETA needs customer coordinates. Showing demo/manual ETA
            for now.
          </p>
        )}
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-green-700">
        {icon}
        <p className="text-sm font-semibold">{label}</p>
      </div>

      <p className="mt-2 text-xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}