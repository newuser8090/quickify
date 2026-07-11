import { supabase } from "@/lib/supabase";

export async function notifyUsersForRestockedProduct(
  productId: number,
  productName: string
) {
  const { error } = await supabase.rpc("notify_restocked_product", {
    p_product_id: productId,
    p_product_name: productName,
  });

  if (error) {
    console.error("Restock notification RPC failed:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      error.message || "Failed to notify users about the restocked product"
    );
  }
}