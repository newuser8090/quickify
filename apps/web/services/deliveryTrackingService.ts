import { supabase } from "@/lib/supabase";

export type DeliveryLocation = {
  latitude: number;
  longitude: number;
};

export async function updateDeliveryLocation(
  orderId: number,
  location: DeliveryLocation
) {
  const { error } = await supabase
    .from("orders")
    .update({
      delivery_latitude: location.latitude,
      delivery_longitude: location.longitude,
      delivery_location_updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw error;
}

export async function updateEstimatedDeliveryTime(
  orderId: number,
  minutes: number
) {
  const { error } = await supabase
    .from("orders")
    .update({
      estimated_delivery_minutes: minutes,
    })
    .eq("id", orderId);

  if (error) throw error;
}

export async function getOrderDeliveryTracking(orderId: number) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      delivery_latitude,
      delivery_longitude,
      delivery_location_updated_at,
      estimated_delivery_minutes,
      delivery_partners(
        name,
        phone,
        vehicle_type,
        vehicle_number
      )
    `
    )
    .eq("id", orderId)
    .single();

  if (error) throw error;

  return data;
}