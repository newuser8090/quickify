"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TrackingState = {
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  delivery_location_updated_at?: string | null;
  estimated_delivery_minutes?: number | null;
};

export function useRealtimeOrderTracking(
  orderId: number,
  initialState: TrackingState
) {
  const [tracking, setTracking] = useState<TrackingState>(() => initialState);

  useEffect(() => {
    setTracking({
      delivery_latitude: initialState.delivery_latitude,
      delivery_longitude: initialState.delivery_longitude,
      delivery_location_updated_at: initialState.delivery_location_updated_at,
      estimated_delivery_minutes: initialState.estimated_delivery_minutes,
    });
  }, [
    initialState.delivery_latitude,
    initialState.delivery_longitude,
    initialState.delivery_location_updated_at,
    initialState.estimated_delivery_minutes,
  ]);

  useEffect(() => {
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setTracking({
            delivery_latitude: payload.new.delivery_latitude as number | null,
            delivery_longitude: payload.new.delivery_longitude as number | null,
            delivery_location_updated_at:
              payload.new.delivery_location_updated_at as string | null,
            estimated_delivery_minutes:
              payload.new.estimated_delivery_minutes as number | null,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return tracking;
}