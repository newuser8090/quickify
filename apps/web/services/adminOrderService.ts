import { supabase } from "@/lib/supabase";

export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*),
      addresses (*),
      delivery_partners (*)
      `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function updateOrderStatus(orderId: number, status: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
}