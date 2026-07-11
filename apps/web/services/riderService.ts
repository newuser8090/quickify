import { supabase } from "@/lib/supabase";

export type RiderOrder = {
  id: number;
  status: string;
  delivery_partner_id: string | null;
  addresses: {
    address_line: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
};

export async function getAssignedOrdersForPartner(partnerId: string) {
  if (!partnerId) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      delivery_partner_id,
      addresses(
        address_line,
        city,
        state,
        pincode
      )
    `
    )
    .eq("delivery_partner_id", partnerId)
    .in("status", ["Out for Delivery", "Packed", "Processing"])
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((order) => ({
  ...order,
  addresses: Array.isArray(order.addresses)
    ? order.addresses[0] ?? null
    : order.addresses,
})) as RiderOrder[];
}