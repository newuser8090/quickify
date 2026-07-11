import { supabase } from "@/lib/supabase";

export async function subscribeStockNotification(
  userId: string,
  productId: number
) {
  const { error } = await supabase.from("stock_notifications").upsert(
    {
      user_id: userId,
      product_id: productId,
    },
    {
      onConflict: "user_id,product_id",
    }
  );

  if (error) {
    console.error("Stock notification subscribe error:", error);
    throw error;
  }
}
export async function unsubscribeStockNotification(
  userId: string,
  productId: number
) {
  const { error } = await supabase
    .from("stock_notifications")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
}

export async function isSubscribedToStockNotification(
  userId: string,
  productId: number
) {
  const { data, error } = await supabase
    .from("stock_notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;

  return !!data;
}